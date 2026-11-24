// -------------------------------------------------------------
// src/winscreen.js  (winscreen.html)
// -------------------------------------------------------------
// Victory page shown after collecting every star in a level.
// src/game.js sends the result in the address:
//   winscreen.html?time=0:42:123&level=2&stars=3&total=3&best=1
// The best time is read from Firestore: users/{uid}/levels/{level}
// Needs src/characters.js loaded first (getSavedCharacter, drawCharacter).
// -------------------------------------------------------------

import { LEVELS } from "./levels.js";
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";

const params = new URLSearchParams(window.location.search);
const time = params.get("time");
const level = Number(params.get("level"));
const stars = Number(params.get("stars"));
const total = Number(params.get("total")) || stars;
const isNewBest = params.get("best") === "1";
const hasLevel = Number.isInteger(level) && level > 0 && LEVELS[level];

// ---------- Result ----------

document.getElementById("timeDisplay").textContent = time || "–";

if (hasLevel) {
    document.getElementById("level-label").textContent = "Level " + level + " complete";
}

// One star image per star in the level (they pop in one after another)
const starsRow = document.getElementById("stars-row");
const starCount = Math.min(total || 3, 10);
for (let i = 0; i < starCount; i++) {
    const img = document.createElement("img");
    img.src = "images/star.png";
    img.alt = "";
    img.style.animationDelay = (0.25 + i * 0.12) + "s";
    starsRow.appendChild(img);
}
if (total) {
    document.getElementById("stars-text").textContent = stars + " / " + total + " stars collected";
}

// ---------- Badges ----------

const earned = Number(params.get("badges")) || 0;

const badgeImgs = document.querySelectorAll("#badges .badge");
for (let i = 0; i < badgeImgs.length; i++) {
    if (i < earned) {
        badgeImgs[i].classList.remove("grayscale", "opacity-35");
    }
}

// ---------- Best time ----------

if (isNewBest) {
    document.getElementById("bestDisplay").textContent = time || "–";
    document.getElementById("new-best").hidden = false;
} else if (hasLevel) {
    onAuthReady(async function (user) {
        if (!user) return;
        try {
            const snap = await getDoc(doc(db, "users", user.uid, "levels", String(level)));
            if (snap.exists() && snap.data().timeText) {
                document.getElementById("bestDisplay").textContent = snap.data().timeText;
            }
        } catch (err) {
            console.error("Could not load best time:", err);
        }
    });
}

// ---------- Buttons ----------

if (hasLevel) {
    const replay = document.getElementById("replay-btn");
    replay.href = "level.html?level=" + level;   // a fresh run of the same level
    replay.hidden = false;

    if (LEVELS[level + 1]) {
        const next = document.getElementById("next-btn");
        next.href = "level.html?level=" + (level + 1);
        next.hidden = false;
    } else {
        // last level: Level Select becomes the main button
        document.getElementById("select-btn").classList.add("primary");
    }
} else {
    document.getElementById("select-btn").classList.add("primary");
}

// ---------- The player's character ----------

const heroCanvas = document.getElementById("hero-character");
const character = (typeof getSavedCharacter === "function") ? getSavedCharacter() : null;
if (character && typeof drawCharacter === "function") {
    const cssSize = 112;
    const scale = window.devicePixelRatio || 1;
    heroCanvas.width = cssSize * scale;
    heroCanvas.height = cssSize * scale;
    const ctx = heroCanvas.getContext("2d");
    ctx.scale(scale, scale);
    if (character.ninja) {
        const size = 64;   // headband tails stick out to the right
        drawCharacter(ctx, character, (cssSize - size * 1.25) / 2, (cssSize - size) / 2, size);
    } else {
        const size = 84;
        drawCharacter(ctx, character, (cssSize - size) / 2, (cssSize - size) / 2, size);
    }
}
