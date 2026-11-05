// ===== 3D (voxel) version of the player's character on top of Street View =====
// Every pixel of the character's art becomes a little cube, a few cubes deep.
// The character turns as you drag Street View around, sways a little while
// standing, hops each time you walk to a new spot, dolphin-dives into the
// ground when you make a guess, and pops back up at the start of each round.
//
// Needs, loaded BEFORE this file: three.js (r128), characters.js, streetview.js.
// If three.js or WebGL isn't available, the flat character stays as it is.

(function () {
    if (typeof THREE === "undefined") return;

    const DISPLAY_W = 96;      // drawing size in pixels; the CSS width scales it on screen
    const DISPLAY_H = 150;   // tall enough for the dive jump
    const DEPTH = 4;           // how many cubes thick the character is
    const TURN_SMOOTHING = 0.15;
    const HOP_MS = 350;
    const HOP_HEIGHT = 1.5;
    const DIVE_MS = 900;       // jump up, flip head-first, into the ground
    const EMERGE_MS = 500;     // pop back up at the start of a round
    const GROUND_Y = -5;       // where his feet stand

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The flat version already drew on the old canvas, so swap in a fresh one for 3D.
    const oldCanvas = document.getElementById("player-sprite");
    if (!oldCanvas) return;
    const canvas = oldCanvas.cloneNode(false);
    canvas.width = DISPLAY_W;
    canvas.height = DISPLAY_H;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) {
        return; // no WebGL on this device: keep the flat character
    }
    oldCanvas.replaceWith(canvas);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(DISPLAY_W, DISPLAY_H, false); // false = let the CSS decide the on-screen size

    // Anything below this plane is hidden, so he looks like he goes INTO the ground.
    // It's only switched on while diving or popping up.
    renderer.localClippingEnabled = true;
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1000);
    function groundOn(on) { ground.constant = on ? -GROUND_Y : 1000; }

    // ----- Scene, camera, lights -----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, DISPLAY_W / DISPLAY_H, 0.1, 100);
    camera.position.set(0, 4, 26);
    camera.lookAt(0, 1.5, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(5, 10, 8);
    scene.add(sun);

    // ----- Build the character out of cubes -----
    const NINJA = {
        rows: [
            "RRRRRRRRRR",
            "RRRRRRRRRR",
            "WWWWWWWWWW",   // headband wraps all the way round
            "RRRRRRRRRR",
            "RREERREERR",
            "RREERREERR",
            "RRRRRRRRRR",
            "RRRRRRRRRR",
            "RRRRRRRRRR",
            "RRRRRRRRRR"
        ],
        colours: { R: "#ff0000", W: "#ffffff", E: "#000000" }
    };

    // What colour a cube is, depending on how deep into the body it is.
    // Only the front layer has eyes; the back of the head is hair.
    function voxelKey(key, row, layer, isNinja) {
        if (layer === 0) return key;
        if (isNinja) return key === "E" ? "R" : key;
        if (layer === DEPTH - 1 && row <= 5 && (key === "S" || key === "E")) return "H";
        if (key === "E") return "S";
        return key;
    }

    function buildCharacter(character) {
        const isNinja = !!character.ninja;
        const rows = isNinja ? NINJA.rows : (character.template || PIXEL_TEMPLATE);
        const colours = isNinja ? NINJA.colours : character.colours;

        const group = new THREE.Group();
        const cube = new THREE.BoxGeometry(1, 1, 1);
        const materials = {};
        const height = rows.length;
        const width = rows[0].length;

        function addCube(colour, x, y, z) {
            if (!materials[colour]) materials[colour] = new THREE.MeshLambertMaterial({ color: colour, clippingPlanes: [ground] });
            const mesh = new THREE.Mesh(cube, materials[colour]);
            mesh.position.set(x, y, z);
            group.add(mesh);
        }

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                if (rows[row][col] === ".") continue;
                for (let layer = 0; layer < DEPTH; layer++) {
                    const key = voxelKey(rows[row][col], row, layer, isNinja);
                    addCube(
                        colours[key],
                        col - (width - 1) / 2,           // centre left/right
                        (height - 1) / 2 - row,          // centre up/down (row 0 is the top)
                        (DEPTH - 1) / 2 - layer          // layer 0 is the front
                    );
                }
            }
        }

        // Ninja headband tails flapping out the back
        if (isNinja) {
            const back = (DEPTH - 1) / 2 - DEPTH;
            addCube("#ffffff", 2.5, (height - 1) / 2 - 2, back);
            addCube("#ffffff", 3.5, (height - 1) / 2 - 3, back - 1);
        }
        return group;
    }

    const model = buildCharacter(getSavedCharacter());
    scene.add(model);

    // ----- Dirt that sprays up when he hits the ground -----
    const dirt = [];
    const dirtCube = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const dirtColours = ["#7a5230", "#5c3a1e", "#9c6b3f"];
    for (let i = 0; i < 10; i++) {
        const bit = new THREE.Mesh(dirtCube, new THREE.MeshLambertMaterial({ color: dirtColours[i % 3] }));
        bit.visible = false;
        scene.add(bit);
        dirt.push({ mesh: bit, vx: 0, vy: 0, vz: 0 });
    }

    function sprayDirt() {
        dirt.forEach(function (d) {
            d.mesh.position.set((Math.random() - 0.5) * 3, GROUND_Y, (Math.random() - 0.5) * 2);
            d.vx = (Math.random() - 0.5) * 0.35;
            d.vy = 0.25 + Math.random() * 0.25;
            d.vz = (Math.random() - 0.5) * 0.2;
            d.mesh.visible = true;
        });
    }

    function updateDirt() {
        dirt.forEach(function (d) {
            if (!d.mesh.visible) return;
            d.vy -= 0.025;                       // gravity
            d.mesh.position.x += d.vx;
            d.mesh.position.y += d.vy;
            d.mesh.position.z += d.vz;
            d.mesh.rotation.x += 0.2;
            if (d.mesh.position.y < GROUND_Y - 1) d.mesh.visible = false;
        });
    }

    // ----- Animation -----
    let facingHeading = null;   // Street View heading when the round started
    let lastAnswer = null;
    let lastPano = null;
    let hopStart = -1;
    let turn = 0;
    let lastCanGuess = false;
    let mode = "under";        // "idle", "dive", "under" (hidden in the ground), "emerge"
    let modeStart = 0;
    let sprayed = false;

    function setMode(newMode, time) {
        mode = newMode;
        modeStart = time;
        sprayed = false;
    }

    function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    // Shortest way round between two angles, in degrees (-180 to 180)
    function angleDiff(a, b) {
        return ((a - b + 540) % 360) - 180;
    }

    function frame(time) {
        // `panorama` and `currentAnswer` come from streetview.js
        if (typeof panorama !== "undefined" && panorama && panorama.getPov) {
            const heading = panorama.getPov().heading || 0;
            const pano = panorama.getPano();

            if (currentAnswer !== lastAnswer) {
                // New round: face the player again and pop up out of the ground
                lastAnswer = currentAnswer;
                facingHeading = heading;
                lastPano = pano;
                if (currentAnswer) setMode(reducedMotion ? "idle" : "emerge", time);
            } else if (pano && pano !== lastPano) {
                // Walked to a new spot in the same round: hop
                lastPano = pano;
                if (!reducedMotion) hopStart = time;
            }

            if (facingHeading !== null) {
                const target = THREE.MathUtils.degToRad(angleDiff(heading, facingHeading));
                const diff = THREE.MathUtils.degToRad(angleDiff(THREE.MathUtils.radToDeg(target), THREE.MathUtils.radToDeg(turn)));
                turn += diff * TURN_SMOOTHING;
            }
        }
        // `canGuess` (from streetview.js) going from true to false means a guess was just made
        if (typeof canGuess !== "undefined") {
            if (lastCanGuess && !canGuess && mode === "idle" && !reducedMotion) setMode("dive", time);
            lastCanGuess = canGuess;
        }

        model.rotation.y = turn;

        model.rotation.z = (!reducedMotion && mode === "idle") ? Math.sin(time / 600) * 0.04 : 0;   // gentle sway

        let y = 0;
        let flip = 0;

        if (mode === "idle") {
            groundOn(false);
            if (hopStart >= 0) {
                const t = (time - hopStart) / HOP_MS;
                if (t >= 1) hopStart = -1;
                else y = Math.sin(t * Math.PI) * HOP_HEIGHT;
            }
        } else if (mode === "dive") {
            // Spring up, flip forward head-first, plunge into the ground
            groundOn(true);
            const t = Math.min((time - modeStart) / DIVE_MS, 1);
            if (t < 0.4) {
                y = Math.sin((t / 0.4) * Math.PI / 2) * 3;          // up to the top of the jump
            } else {
                const fall = (t - 0.4) / 0.6;
                y = 3 - fall * fall * 22;                            // speed up on the way down
            }
            flip = easeInOut(t) * Math.PI * 0.95;                    // head points at the ground
            if (!sprayed && y < GROUND_Y + 3) { sprayDirt(); sprayed = true; }
            if (t >= 1) setMode("under", time);
        } else if (mode === "under") {
            groundOn(true);
            y = -20;                                                 // out of sight
        } else if (mode === "emerge") {
            // Pop up out of the ground with a little bounce
            groundOn(true);
            const t = Math.min((time - modeStart) / EMERGE_MS, 1);
            if (!sprayed) { sprayDirt(); sprayed = true; }
            const ease = 1 - Math.pow(1 - t, 3);
            y = -11 + ease * 11 + Math.sin(t * Math.PI) * 1.5;
            if (t >= 1) setMode("idle", time);
        }

        model.position.y = y;
        model.rotation.x = flip;
        updateDirt();

        renderer.render(scene, camera);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
})();