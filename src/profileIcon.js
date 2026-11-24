// -------------------------------------------------------------
// src/profileIcon.js
// -------------------------------------------------------------
// Swaps the navbar's profile icon (#profileNav) for the player's
// chosen character, once they have picked one inside a level.
// The choice is read from the "character" field of users/{uid},
// which src/game.js saves when the character is picked.
// Needs src/characters.js loaded first (for characters + drawCharacter).
// -------------------------------------------------------------

import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";

const ICON_SIZE = 32; // CSS pixels, fits the 36px navbar button

export function showCharacterIcon(name) {
    const button = document.getElementById("profileNav");
    if (!button || typeof characters === "undefined") return;

    const character = characters.find(function (c) { return c.name === name; });
    if (!character) return; // nothing picked yet: keep the default icon

    // Draw at the screen's pixel density so the pixel art stays sharp
    const scale = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.className = "nav-character";
    canvas.width = ICON_SIZE * scale;
    canvas.height = ICON_SIZE * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    if (character.ninja) {
        drawCharacter(ctx, character, 5, 6, 20);   // ninja's headband tails stick out to the right
    } else {
        drawCharacter(ctx, character, 4, 4, 24);
    }

    button.replaceChildren(canvas);   // removes the default person icon
    button.setAttribute("aria-label", "Profile (" + character.name + ")");
    button.title = character.name;
}

// Navbar "Login" button (main menu): once signed in, show the player's
// character name instead. It still opens login.html, which shows
// "Signed in as ..." with a Sign Out button for signed-in players.
export function showSignedInName(name) {
    const loginButton = document.getElementById("loginNav");
    if (!loginButton || !name) return;
    loginButton.textContent = name;
    loginButton.href = "login.html";   // shows the account card with Sign Out
    loginButton.title = name;
    loginButton.setAttribute("aria-label", "Account (" + name + "): sign out");
}

onAuthReady(async function (user) {
    if (!user) return;   // signed out: keep the default icon and the "Login" button
    let characterName = null;
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().character) {
            characterName = snap.data().character;
            showCharacterIcon(characterName);
            const character = characters.find(function (c) { return c.name === characterName; });
            if (character) saveCharacter(character);   // this account's character, from Firebase
        } else {
            forgetSavedCharacter();   // this account has none: don't show a previous account's
        }
    } catch (err) {
        console.error("Could not load the player's character:", err);
    }
    // No character picked yet: fall back to the account's name
    showSignedInName(characterName || user.displayName || "Profile");
});
