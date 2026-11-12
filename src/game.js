
import { LEVELS } from "./levels.js";

// ---------- Firestore ----------

import { db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";

let sprite

const STAR = 5;
const OPEN_DOOR = 6;

const starImage = new Image();
starImage.src = "images/star.png"

let collected = [];
let starsCollected = 0;
let userId = null;
let userRef = null;
let startX, startY;
let lastSave = Promise.resolve();

onAuthReady(async function (user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    userId = user.uid;

    userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    let run = snap.exists() ? snap.data().run : null;

    if (!resuming || !run || run.level != levelNumber) {
        run = { level: levelNumber, startedAt: Date.now(), stars: [], openDoors: [] };
        await updateDoc(userRef, { run: run });
    }

    for (let i = 0; i < run.stars.length; i++) {
        let parts = run.stars[i].split(",");
        room[Number(parts[0])][Number(parts[1])] = 0;
    }
    for (let i = 0; i < run.openDoors.length; i++) {
        let parts = run.openDoors[i].split(",");
        room[Number(parts[0])][Number(parts[1])] = OPEN_DOOR;
    }
    starsCollected = run.stars.length;

    startX = level.start.x;
    startY = level.start.y;
    if (resuming && run.returnX != undefined) {
        startX = run.returnX;
        startY = run.returnY;
    }

    startGame();
})

// ---------- Level ----------

const TILE = 24;
const params = new URLSearchParams(window.location.search);
const levelNumber = params.get("level");
const resuming = params.get("resume") == "1";
const level = LEVELS[levelNumber];

if (!level) {
    window.location.href = "level-select.html";
    throw new Error("No level " + levelNumber)
}

const room = level.room;

const STAR_FIELD = "level" + levelNumber + "Stars";

// ---------- Game Start ----------

function startGame() {
    sprite = new component(16, 16, "red", startX, startY);
    gameArea.start();
    openCharSelect(); // show the character picker when the level starts
    document.getElementById("star-count").textContent = starsCollected;
}

// ---------- Canvas ----------

const gameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 360;
        this.canvas.height = 600;
        this.context = this.canvas.getContext("2d");
        document.getElementById("game-container").appendChild(this.canvas);
        this.interval = setInterval(updateGameArea, 20);
        // Movement
        window.addEventListener('keydown', function (e) {
            gameArea.keys = (gameArea.keys || []);
            gameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
            gameArea.keys[e.keyCode] = false;
        })

    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// ---------- Tiles ----------

function drawRoom() {
    let ctx = gameArea.context;
    for (let row = 0; row < room.length; row++) {
        for (let col = 0; col < room[row].length; col++) {
            let x = col * TILE;
            let y = row * TILE;

            // ---------- Walls ----------
            if (room[row][col] == 1) {
                ctx.fillStyle = "gray";
                ctx.fillRect(x, y, TILE, TILE);

                // ---------- Stars ----------
            } else if (room[row][col] == 5) {
                ctx.drawImage(starImage, x + 4, y + 4, TILE - 8, TILE - 8)

                // ---------- Closed Doors ----------
            } else if (room[row][col] == OPEN_DOOR) {
                ctx.fillStyle = "#5c3a1e";
                ctx.fillRect(x, y, TILE, TILE);
                ctx.fillStyle = "#2b2b2c";
                ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 4);

                // ---------- Open Doors ----------
            } else if (room[row][col] >= 2) {
                ctx.fillStyle = "#5c3a1e";
                ctx.fillRect(x, y, TILE, TILE);
                ctx.fillStyle = "#8b5a2b";
                ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 4);
                ctx.fillStyle = "#6b4423";
                ctx.fillRect(x + TILE / 2 - 1, y + 4, 2, TILE - 4);
                ctx.fillStyle = "#f2c230";
                ctx.fillRect(x + TILE - 12, y + TILE / 2, 4, 4);
            }
        }
    }
}

// ---------- Movement ----------

function setTouchPos(e) {
    let rect = gameArea.canvas.getBoundingClientRect();
    let scaleX = gameArea.canvas.width / rect.width;
    let scaleY = gameArea.canvas.height / rect.height;
    gameArea.x = (e.touches[0].clientX - rect.left) * scaleX;
    gameArea.y = (e.touches[0].clientY - rect.top) * scaleY;
}

gameArea.canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    setTouchPos(e);
}, { passive: false });

gameArea.canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    setTouchPos(e);
}, { passive: false });


function component(width, height, colour, x, y, type) {
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = colour;
    }
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;

    this.update = function () {
        let ctx = gameArea.context;
        if (this.type == "image") {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = colour;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    this.newPos = function () {
        this.x += this.speedX;
        if (hitsAnyWall(this)) { this.x -= this.speedX; }

        this.y += this.speedY;
        if (hitsAnyWall(this)) { this.y -= this.speedY; }
    }
}

function updateGameArea() {
    gameArea.clear();
    drawRoom();
    sprite.speedX = 0;
    sprite.speedY = 0;
    if (gameArea.keys && gameArea.keys[37]) { sprite.speedX = -4; }
    if (gameArea.keys && gameArea.keys[39]) { sprite.speedX = 4; }
    if (gameArea.keys && gameArea.keys[38]) { sprite.speedY = -4; }
    if (gameArea.keys && gameArea.keys[40]) { sprite.speedY = 4; }

    let prevX = sprite.x;
    let prevY = sprite.y;

    sprite.newPos();

    collectStar(sprite);

    sprite.update();

    let door = underDoor(sprite);
    let page = level.doors[door];

    if (page) {
        clearInterval(gameArea.interval);
        let col = Math.floor((sprite.x + sprite.width / 2) / TILE);
        let row = Math.floor((sprite.y + sprite.height / 2) / TILE);

        lastSave = updateDoc(userRef, { "run.returnX": prevX, "run.returnY": prevY });
        lastSave.finally(function () {
            window.location.href = page + "?level=" + levelNumber + "&door=" + row + "," + col;
        });
    }
}

// ---------- Wall Collision ----------

function isWallAt(x, y) {
    let col = Math.floor(x / TILE);
    let row = Math.floor(y / TILE);
    if (row < 0) return true;                   // top door: blocked (that's the entrance)
    if (row >= room.length) return false;   // bottom door: open, leads out of the maze
    return room[row][col] == 1;
}

function hitsAnyWall(sprite) {
    let left = sprite.x;
    let right = sprite.x + sprite.width - 1;
    let top = sprite.y;
    let bottom = sprite.y + sprite.height - 1;

    return isWallAt(left, top) || isWallAt(right, top) ||
        isWallAt(left, bottom) || isWallAt(right, bottom);
}

// ---------- Doors ----------

function tileAt(x, y) {
    let col = Math.floor(x / TILE);
    let row = Math.floor(y / TILE);
    return room[row][col];
}

function underDoor(sprite) {
    let centerX = sprite.x + sprite.width / 2;
    let centerY = sprite.y + sprite.height / 2;
    return tileAt(centerX, centerY);
}

// ---------- Stars ----------

function collectStar(sprite) {
    let centerX = sprite.x + sprite.width / 2;
    let centerY = sprite.y + sprite.height / 2;
    let col = Math.floor(centerX / TILE);
    let row = Math.floor(centerY / TILE);

    if (room[row][col] == STAR) {
        room[row][col] = 0;
        starsCollected++;
        document.getElementById("star-count").textContent = starsCollected;

        let key = row + "," + col;
        collected.push(key);
        lastSave = updateDoc(userRef, { "run.stars": arrayUnion(key) });
    }
}

// ---------- Characters ---------- (drawing code is in src/characters.js)
let selectedCharacter = getSavedCharacter();

// ---------- Character select popup ----------
const charSelect = document.getElementById("char-select");
const charGrid = document.getElementById("char-grid");

characters.forEach(function (character) {
    const option = document.createElement("button");
    option.className = "char-option";
    if (character === selectedCharacter) option.classList.add("selected");

    const preview = document.createElement("canvas");
    preview.width = 64;
    preview.height = 50;
    drawCharacter(preview.getContext("2d"), character, 0, 0, 50);

    const label = document.createElement("span");
    label.textContent = character.name;

    option.appendChild(preview);
    option.appendChild(label);

    option.addEventListener("click", function () {
        selectedCharacter = character;
        saveCharacter(character);
        document.querySelectorAll(".char-option").forEach(function (o) {
            o.classList.remove("selected");
        });
        option.classList.add("selected");
        closeCharSelect();
    });

    charGrid.appendChild(option);
});

function openCharSelect() {
    if (!charSelect.hidden) return;
    charSelect.hidden = false;
    clearInterval(gameArea.interval);   // pause the game
    gameArea.keys = [];               // stop any held movement
}

function closeCharSelect() {
    if (charSelect.hidden) return;
    charSelect.hidden = true;
    gameArea.interval = setInterval(updateGameArea, 20); // resume
}

document.getElementById("char-btn").addEventListener("click", openCharSelect);
document.getElementById("close-char").addEventListener("click", closeCharSelect);

window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeCharSelect();
    }
});
