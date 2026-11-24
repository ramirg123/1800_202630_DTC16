// -------------------------------------------------------------
// src/tutorial.js  (main.html)
// -------------------------------------------------------------
// Draws the little game pictures on the tutorial page using the
// same tiles as the real game (src/game.js): grey walls, star
// image, brown doors, and the player's character.
// Needs src/characters.js loaded first.
// -------------------------------------------------------------

(function () {
    const TILE = 24;

    // Same letters as the level maps: 1 wall, 0 floor, 5 star, 2 door, P player
    const SCENES = {
        move: [
            "1111111111",
            "1000000001",
            "1000P00001",
            "1111111111"
        ],
        stars: [
            "1111111111",
            "10P0050501",
            "1111111111"
        ],
        door: [
            "1111111",
            "10P0021",
            "1111111"
        ]
    };

    const starImage = new Image();
    starImage.src = "images/star.png";

    // Use the character the player picked, or the default one
    const player = (typeof getSavedCharacter === "function") ? getSavedCharacter() : null;

    function drawDoor(ctx, x, y) {
        // Same colours as the closed doors in src/game.js
        ctx.fillStyle = "#5c3a1e";
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 4);
        ctx.fillStyle = "#6b4423";
        ctx.fillRect(x + TILE / 2 - 1, y + 4, 2, TILE - 4);
        ctx.fillStyle = "#f2c230";
        ctx.fillRect(x + TILE - 12, y + TILE / 2, 4, 4);
    }

    function drawPlayer(ctx, x, y) {
        if (player && typeof drawCharacter === "function") {
            if (player.ninja) {
                drawCharacter(ctx, player, x + 3, y + 4, 16);
            } else {
                drawCharacter(ctx, player, x + 2, y + 2, 20);
            }
        } else {
            ctx.fillStyle = "red";   // same as the in-game sprite
            ctx.fillRect(x + 4, y + 4, 16, 16);
        }
    }

    function drawScene(canvas) {
        const rows = SCENES[canvas.dataset.scene];
        if (!rows) return;

        const width = rows[0].length * TILE;
        const height = rows.length * TILE;
        const scale = window.devicePixelRatio || 1;
        canvas.width = width * scale;
        canvas.height = height * scale;
        canvas.style.aspectRatio = width + " / " + height;

        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);

        // floor: same chess board pattern as the levels (src/game.js)
        for (let row = 0; row < rows.length; row++) {
            for (let col = 0; col < rows[row].length; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? "#32124b" : "#1c0828";
                ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
            }
        }

        for (let row = 0; row < rows.length; row++) {
            for (let col = 0; col < rows[row].length; col++) {
                const x = col * TILE;
                const y = row * TILE;
                const tile = rows[row][col];

                if (tile === "1") {
                    ctx.fillStyle = "#000000";   // same plain black walls as the levels (src/game.js)
                    ctx.fillRect(x, y, TILE, TILE);
                } else if (tile === "5") {
                    if (starImage.complete && starImage.naturalWidth) {
                        ctx.drawImage(starImage, x + 4, y + 4, TILE - 8, TILE - 8);
                    }
                } else if (tile === "2") {
                    drawDoor(ctx, x, y);
                } else if (tile === "P") {
                    drawPlayer(ctx, x, y);
                }
            }
        }
    }

    function drawAll() {
        document.querySelectorAll("canvas[data-scene]").forEach(drawScene);
    }

    drawAll();
    starImage.addEventListener("load", drawAll);   // redraw once the star image arrives
})();
