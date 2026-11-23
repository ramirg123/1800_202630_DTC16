// -------------------------------------------------------------
// src/profile.js  (profile.html)
// -------------------------------------------------------------
// Lets the player change their character at any time.
// Also the character select shown right after sign up / login:
//   profile.html?setup=1             -> Continue goes to the tutorial (main.html)
//   profile.html?setup=1&next=...    -> Continue goes back to that page (e.g. a level)
// Uses the same "character" field on users/{uid} as the level's
// first-time picker (src/game.js), so a change here also updates
// the navbar icon and the level won't ask again.
// Needs src/characters.js loaded first (characters, drawCharacter, saveCharacter).
// -------------------------------------------------------------

import { db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";
import { showCharacterIcon } from "./profileIcon.js";

const grid = document.getElementById("char-grid");
const greeting = document.getElementById("greeting");
const currentPreview = document.getElementById("current-preview");
const currentName = document.getElementById("current-name");
const status = document.getElementById("save-status");

let userRef = null;
let saving = false;

// ---------- Character select mode (after sign up / login) ----------

const params = new URLSearchParams(window.location.search);
const setupMode = params.get("setup") === "1";
const continueBtn = document.getElementById("continueBtn");

// Only allow going on to one of our own pages (e.g. "level.html?level=2")
function safeNextPage(value) {
    return value && /^[a-z0-9-]+\.html(\?[a-z0-9=&%.-]*)?$/i.test(value) ? value : "main.html";
}

if (setupMode) {
    document.title = "Choose Your Character";
    document.getElementById("profile-title").textContent = "Choose Your Character";
    document.getElementById("char-heading").textContent = "Tap a character";
    document.getElementById("topNav").hidden = true;   // no navbar: pick a character before going anywhere
    document.body.classList.add("setup-mode");
    continueBtn.href = safeNextPage(params.get("next"));
    continueBtn.hidden = false;
}

function setContinueEnabled(enabled) {
    continueBtn.setAttribute("aria-disabled", enabled ? "false" : "true");
}

// ---------- Back: return to whichever page opened the profile ----------

document.getElementById("backBtn").addEventListener("click", function (e) {
    let cameFromThisSite = false;
    try {
        cameFromThisSite = document.referrer && new URL(document.referrer).origin === location.origin;
    } catch (err) { }
    if (cameFromThisSite && history.length > 1) {
        e.preventDefault();
        history.back();
    }
});

// ---------- Drawing ----------

// Draws a character into a canvas at the screen's pixel density (keeps pixel art sharp)
function drawInto(canvas, character, cssSize) {
    const scale = window.devicePixelRatio || 1;
    canvas.width = cssSize * scale;
    canvas.height = cssSize * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, cssSize, cssSize);

    if (character.ninja) {
        // the ninja's headband tails stick out past its body, so draw it a bit smaller
        const size = cssSize * 0.62;
        drawCharacter(ctx, character, (cssSize - size * 1.25) / 2, (cssSize - size) / 2, size);
    } else {
        const size = cssSize * 0.76;
        drawCharacter(ctx, character, (cssSize - size) / 2, (cssSize - size) / 2, size);
    }
}

function showCurrent(character) {
    if (character) {
        drawInto(currentPreview, character, 96);
        currentName.textContent = character.name;
    } else {
        currentPreview.getContext("2d").clearRect(0, 0, currentPreview.width, currentPreview.height);
        currentName.textContent = "No character yet";
    }
}

// ---------- Character grid ----------

characters.forEach(function (character) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "char-option";
    option.dataset.name = character.name;
    option.disabled = true;   // enabled once we know who is signed in
    option.setAttribute("aria-pressed", "false");

    const preview = document.createElement("canvas");
    drawInto(preview, character, 48);

    const label = document.createElement("span");
    label.textContent = character.name;

    option.appendChild(preview);
    option.appendChild(label);
    option.addEventListener("click", function () { chooseCharacter(character); });

    grid.appendChild(option);
});

function markSelected(name) {
    grid.querySelectorAll(".char-option").forEach(function (o) {
        const isSelected = o.dataset.name === name;
        o.classList.toggle("selected", isSelected);
        o.setAttribute("aria-pressed", String(isSelected));
    });
}

function setGridEnabled(enabled) {
    grid.querySelectorAll(".char-option").forEach(function (o) { o.disabled = !enabled; });
}

function showStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("error", !!isError);
}

// ---------- Saving ----------

async function chooseCharacter(character) {
    if (!userRef || saving) return;
    saving = true;
    setGridEnabled(false);
    showStatus("Saving…");

    try {
        await setDoc(userRef, { character: character.name }, { merge: true });
        saveCharacter(character);            // localStorage copy used by other pages
        markSelected(character.name);
        showCurrent(character);
        showCharacterIcon(character.name);   // update the navbar icon right away
        showStatus("Saved! You'll play as " + character.name + ".");
        setContinueEnabled(true);
    } catch (err) {
        console.error("Could not save character:", err);
        showStatus("Couldn't save. Check your connection and try again.", true);
    } finally {
        saving = false;
        setGridEnabled(true);
    }
}

// ---------- Load the signed-in player ----------

onAuthReady(async function (user) {
    if (!user) {
        window.location.href = "login.html";   // profile needs an account
        return;
    }

    userRef = doc(db, "users", user.uid);
    const name = user.displayName || user.email;
    greeting.textContent = setupMode
        ? "Welcome, " + name + "! Pick a character to start playing."
        : "Hi, " + name + "!";

    try {
        const snap = await getDoc(userRef);
        const savedName = snap.exists() ? snap.data().character : null;
        const saved = characters.find(function (c) { return c.name === savedName; });
        markSelected(saved ? saved.name : null);
        showCurrent(saved || null);
        // This account's character from Firebase (or none), never a previous account's
        if (saved) saveCharacter(saved);
        else forgetSavedCharacter();
        setContinueEnabled(!!saved);
    } catch (err) {
        console.error("Could not load profile:", err);
        showStatus("Couldn't load your character.", true);
    }

    setGridEnabled(true);
});
