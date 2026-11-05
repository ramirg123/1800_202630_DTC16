// ===== Characters: shared by level.html and streetview.html =====

// Each letter is one pixel: H hair, S skin, E eyes, T shirt, P pants, B shoes, R speedo, . empty
const PIXEL_TEMPLATE = [
    "..HHHHHH..",
    ".HHHHHHHH.",
    ".HSSSSSSH.",
    ".SSESSESS.",
    ".SSSSSSSS.",
    "..SSSSSS..",
    ".TTTTTTTT.",
    "STTTTTTTTS",
    "..PPPPPP..",
    "..BB..BB.."
];

const characters = [
    { name: "Ninja", ninja: true },
    { name: "Ember", colours: { H: "#e8562a", S: "#f6c9a0", E: "#1a1a1a", T: "#3b5bdb", P: "#2b2b2c", B: "#5c3a1e" } },
    { name: "Moss", colours: { H: "#3f7d33", S: "#e0ac80", E: "#1a1a1a", T: "#f2c230", P: "#4a4a4a", B: "#222222" } },
    { name: "Frost", colours: { H: "#e8eef5", S: "#c79a76", E: "#2563eb", T: "#7c3aed", P: "#1f2937", B: "#111111" } },
    { name: "Coal", colours: { H: "#151515", S: "#8d5a3b", E: "#ffffff", T: "#dc2626", P: "#1f2937", B: "#111111" } },
    {
        name: "Michael",
        // shirtless with a red speedo
        template: [
            "..HHHHHH..",
            ".HHHHHHHH.",
            ".HSSSSSSH.",
            ".SSESSESS.",
            ".SSSSSSSS.",
            "..SSSSSS..",
            ".SSSSSSSS.",
            "SSSSSSSSSS",
            "..RRRRRR..",
            "..SS..SS.."
        ],
        colours: { H: "#f5c518", S: "#f1c7a4", E: "#1a1a1a", R: "#d62828" }
    }
];

function drawNinja(ctx, x, y, size) {
    // body
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, size, size);

    // headband and tails
    ctx.fillStyle = "white";
    ctx.fillRect(x, y + size * 0.15, size, size * 0.15);
    ctx.fillRect(x + size, y + size * 0.15, size * 0.25, size * 0.06);
    ctx.fillRect(x + size, y + size * 0.24, size * 0.2, size * 0.06);

    // eyes
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y + size * 0.5, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.7, y + size * 0.5, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
}

function drawPixelChar(ctx, colours, x, y, size, template) {
    template = template || PIXEL_TEMPLATE;   // use the normal body unless the character has its own
    const cell = size / template.length;
    for (let row = 0; row < template.length; row++) {
        for (let col = 0; col < template[row].length; col++) {
            const key = template[row][col];
            if (key === ".") continue;
            ctx.fillStyle = colours[key];
            ctx.fillRect(x + col * cell, y + row * cell, cell, cell);
        }
    }
}

function drawCharacter(ctx, character, x, y, size) {
    if (character.ninja) {
        drawNinja(ctx, x, y, size);
    } else {
        drawPixelChar(ctx, character.colours, x, y, size, character.template);
    }
}

// ----- Remember the choice between pages -----
function saveCharacter(character) {
    try {
        localStorage.setItem("selectedCharacter", character.name);
    } catch (e) {
        // storage blocked (e.g. private mode): the choice just won't carry over
    }
}

function getSavedCharacter() {
    let name = null;
    try {
        name = localStorage.getItem("selectedCharacter");
    } catch (e) { }
    return characters.find(function (c) { return c.name === name; }) || characters[0];
}