// ===== Characters: shared by level.html, streetview.html and memory.html =====

// Each letter is one pixel: H hair, S skin, E eyes, T shirt, P pants, B shoes, R speedo,
// K turban, F turban fold, L lipstick, C cap, D cap brim, Y goatee,
// G jersey number/trim, . empty
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

// Shirtless body with a speedo (R), used by Shuhan
const SPEEDO_TEMPLATE = [
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
];

// Long hair past the shoulders and lipstick (L), used by Elika
const LONG_HAIR_TEMPLATE = [
    "..HHHHHH..",
    ".HHHHHHHH.",
    "HHSSSSSSHH",
    "HSSESSESSH",
    "HSSSSSSSSH",
    "HHSSLLSSHH",
    "HTTTTTTTTH",
    "STTTTTTTTS",
    "..PPPPPP..",
    "..BB..BB.."
];

// Turban instead of hair, used by Birjot
const TURBAN_TEMPLATE = [
    "..KKKKKK..",
    ".KFKKKKFK.",
    ".KKFKKFKK.",
    ".SSESSESS.",
    ".SSSSSSSS.",
    "..SSSSSS..",
    ".TTTTTTTT.",
    "STTTTTTTTS",
    "..PPPPPP..",
    "..BB..BB.."
];

// Football player: cap, goatee, jersey with "11" on the front, used by JSN
const FOOTBALL_TEMPLATE = [
    "..CCCCCC..",
    ".CCCCCCCC.",
    ".DDDDDDDD.",
    ".SSESSESS.",
    ".SSSSSSSS.",
    "..SSYYSS..",
    ".TTGTTGTT.",
    "STTGTTGTTS",
    "..PPPPPP..",
    "..BB..BB.."
];

const characters = [
    { name: "Ninja", ninja: true },
    { name: "Jon", colours: { H: "#e8562a", S: "#f6c9a0", E: "#1a1a1a", T: "#3b5bdb", P: "#2b2b2c", B: "#5c3a1e" } },
    { name: "Ramir", colours: { H: "#151515", S: "#c99a6e", E: "#1a1a1a", T: "#f2c230", P: "#4a4a4a", B: "#222222" } },
    { name: "Shuhan", template: SPEEDO_TEMPLATE, colours: { H: "#151515", S: "#e6b88f", E: "#1a1a1a", R: "#2563eb" } },
    { name: "Elika", template: LONG_HAIR_TEMPLATE, colours: { H: "#151515", S: "#f3cfae", E: "#1a1a1a", L: "#d6204a", T: "#262626", P: "#151515", B: "#c81e3a" } },
    { name: "Michael", colours: { H: "#f5c518", S: "#f1c7a4", E: "#1a1a1a", T: "#7c3aed", P: "#151515", B: "#5c3a1e" } },
    { name: "Birjot", template: TURBAN_TEMPLATE, colours: { K: "#151515", F: "#3a3a3a", S: "#c99a6e", E: "#1a1a1a", T: "#9ca3af", P: "#151515", B: "#e5e5e5" } },
    { name: "JSN", template: FOOTBALL_TEMPLATE, colours: { C: "#2b2b2b", D: "#1a1a1a", S: "#c68f63", E: "#1a1a1a", Y: "#1a1a1a", T: "#1b2a4a", G: "#7bd321", P: "#1b2a4a", B: "#111111" } }
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