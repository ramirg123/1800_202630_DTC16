// ===== Where in the World? Guess the continent from a random Street View =====

const ROUNDS = 5;
const MAP_PAGE = "level.html";   // where "Back to map" goes
const JITTER_DEGREES = 0.5;      // how far (roughly ±55 km) to wander from a starting point
const SEARCH_RADIUS_M = 50000;   // how far Google may look for the nearest Street View
const MAX_TRIES = 10;            // attempts before giving up on a round

const CONTINENTS = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"];

// Starting points in places that have Street View coverage.
// Each round picks a continent first (so all six come up evenly),
// then a random starting point, then wanders a bit from it.
const SEEDS = {
    "Africa": [
        [-1.29, 36.82, "Nairobi, Kenya"], [0.35, 32.58, "Kampala, Uganda"],
        [-1.95, 30.06, "Kigali, Rwanda"], [5.60, -0.19, "Accra, Ghana"],
        [14.69, -17.44, "Dakar, Senegal"], [6.52, 3.38, "Lagos, Nigeria"],
        [-26.20, 28.04, "Johannesburg, South Africa"], [-33.92, 18.42, "Cape Town, South Africa"],
        [-29.86, 31.02, "Durban, South Africa"], [-24.65, 25.91, "Gaborone, Botswana"],
        [-29.31, 27.48, "Maseru, Lesotho"], [-26.31, 31.14, "Mbabane, Eswatini"],
        [-18.88, 47.51, "Antananarivo, Madagascar"],
    ],
    "Asia": [
        [35.68, 139.69, "Tokyo, Japan"], [34.69, 135.50, "Osaka, Japan"],
        [43.06, 141.35, "Sapporo, Japan"], [37.57, 126.98, "Seoul, South Korea"],
        [25.03, 121.57, "Taipei, Taiwan"], [13.76, 100.50, "Bangkok, Thailand"],
        [18.79, 98.98, "Chiang Mai, Thailand"], [3.14, 101.69, "Kuala Lumpur, Malaysia"],
        [-6.21, 106.85, "Jakarta, Indonesia"], [-8.65, 115.22, "Bali, Indonesia"],
        [14.60, 120.98, "Manila, Philippines"], [19.08, 72.88, "Mumbai, India"],
        [28.61, 77.21, "Delhi, India"], [12.97, 77.59, "Bengaluru, India"],
        [6.93, 79.86, "Colombo, Sri Lanka"], [47.92, 106.92, "Ulaanbaatar, Mongolia"],
        [43.24, 76.89, "Almaty, Kazakhstan"], [31.95, 35.93, "Amman, Jordan"],
        [1.35, 103.82, "Singapore"], [22.32, 114.17, "Hong Kong"],
    ],
    "Europe": [
        [51.51, -0.13, "London, UK"], [55.95, -3.19, "Edinburgh, UK"],
        [53.35, -6.26, "Dublin, Ireland"], [48.86, 2.35, "Paris, France"],
        [52.52, 13.40, "Berlin, Germany"], [52.37, 4.90, "Amsterdam, Netherlands"],
        [40.42, -3.70, "Madrid, Spain"], [38.72, -9.14, "Lisbon, Portugal"],
        [41.90, 12.50, "Rome, Italy"], [48.21, 16.37, "Vienna, Austria"],
        [50.08, 14.44, "Prague, Czechia"], [52.23, 21.01, "Warsaw, Poland"],
        [47.50, 19.04, "Budapest, Hungary"], [44.43, 26.10, "Bucharest, Romania"],
        [37.98, 23.73, "Athens, Greece"], [59.33, 18.07, "Stockholm, Sweden"],
        [59.91, 10.75, "Oslo, Norway"], [60.17, 24.94, "Helsinki, Finland"],
        [64.15, -21.94, "Reykjavik, Iceland"],
    ],
    "North America": [
        [49.28, -123.12, "Vancouver, Canada"], [43.65, -79.38, "Toronto, Canada"],
        [45.50, -73.57, "Montreal, Canada"], [44.65, -63.58, "Halifax, Canada"],
        [40.71, -74.01, "New York, USA"], [41.88, -87.63, "Chicago, USA"],
        [39.74, -104.99, "Denver, USA"], [33.45, -112.07, "Phoenix, USA"],
        [33.75, -84.39, "Atlanta, USA"], [61.22, -149.90, "Anchorage, USA"],
        [19.43, -99.13, "Mexico City, Mexico"], [20.67, -103.35, "Guadalajara, Mexico"],
        [14.63, -90.51, "Guatemala City, Guatemala"], [9.93, -84.08, "San José, Costa Rica"],
        [8.98, -79.52, "Panama City, Panama"], [18.47, -69.90, "Santo Domingo, Dominican Republic"],
        [18.47, -66.11, "San Juan, Puerto Rico"],
    ],
    "South America": [
        [4.71, -74.07, "Bogotá, Colombia"], [6.24, -75.58, "Medellín, Colombia"],
        [-0.18, -78.47, "Quito, Ecuador"], [-12.05, -77.04, "Lima, Peru"],
        [-16.50, -68.15, "La Paz, Bolivia"], [-33.45, -70.67, "Santiago, Chile"],
        [-34.60, -58.38, "Buenos Aires, Argentina"], [-31.42, -64.18, "Córdoba, Argentina"],
        [-34.90, -56.16, "Montevideo, Uruguay"], [-25.26, -57.58, "Asunción, Paraguay"],
        [-23.55, -46.63, "São Paulo, Brazil"], [-22.91, -43.17, "Rio de Janeiro, Brazil"],
        [-15.79, -47.88, "Brasília, Brazil"], [-3.73, -38.52, "Fortaleza, Brazil"],
    ],
    "Oceania": [
        [-33.87, 151.21, "Sydney, Australia"], [-37.81, 144.96, "Melbourne, Australia"],
        [-27.47, 153.03, "Brisbane, Australia"], [-31.95, 115.86, "Perth, Australia"],
        [-34.93, 138.60, "Adelaide, Australia"], [-42.88, 147.33, "Hobart, Australia"],
        [-23.70, 133.88, "Alice Springs, Australia"], [-36.85, 174.76, "Auckland, New Zealand"],
        [-41.29, 174.78, "Wellington, New Zealand"], [-43.53, 172.64, "Christchurch, New Zealand"],
        [-45.03, 168.66, "Queenstown, New Zealand"],
    ],
};

// ----- State -----
let svService, panorama;
let round = 0;
let score = 0;
let currentAnswer = null;   // { continent, place }
let canGuess = false;

const statusEl = document.getElementById("pano-status");
const messageEl = document.getElementById("message");
const roundInfoEl = document.getElementById("round-info");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("next");
document.getElementById("back-to-map").href = MAP_PAGE;

// Called by Google if the API key is missing, wrong, or not allowed for this site.
window.gm_authFailure = () => {
    showStatus("Street View couldn't load. Check the API key in streetview.html.");
};

// Called by the Google Maps script once it has loaded (see callback=initGame).
async function initGame() {
    const { StreetViewPanorama, StreetViewService } = await google.maps.importLibrary("streetView");
    svService = new StreetViewService();
    panorama = new StreetViewPanorama(document.getElementById("pano"), {
        addressControl: false,   // hides the street/city name
        showRoadLabels: false,   // hides road names painted on the view
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
    });

    buildChoices();
    nextBtn.addEventListener("click", () => (round >= ROUNDS ? newGame() : nextRound()));
    newGame();
}
window.initGame = initGame;

function buildChoices() {
    choicesEl.innerHTML = "";
    for (const name of CONTINENTS) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice";
        btn.textContent = name;
        btn.dataset.continent = name;
        btn.addEventListener("click", () => guess(name));
        choicesEl.appendChild(btn);
    }
}

function newGame() {
    round = 0;
    score = 0;
    nextRound();
}

async function nextRound() {
    round++;
    canGuess = false;
    nextBtn.hidden = true;
    showMessage("");
    roundInfoEl.textContent = `Round ${round} of ${ROUNDS}. Score: ${score}`;
    setChoicesEnabled(false);
    resetChoiceColors();
    showStatus("Finding a spot…");

    const found = await findRandomPanorama();
    if (!found) {
        showStatus("Couldn't find a Street View spot. Check your connection and try again.");
        nextBtn.textContent = "Try again";
        nextBtn.hidden = false;
        round--; // don't count the failed round
        return;
    }

    currentAnswer = { continent: found.continent, place: found.place };
    panorama.setPano(found.panoId);
    panorama.setPov({ heading: Math.random() * 360, pitch: 0 });
    panorama.setZoom(0);
    hideStatus();
    setChoicesEnabled(true);
    canGuess = true;
}

async function findRandomPanorama() {
    const { StreetViewSource, StreetViewPreference } = await google.maps.importLibrary("streetView");

    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
        const continent = pick(CONTINENTS);
        const [lat, lng, place] = pick(SEEDS[continent]);
        const location = {
            lat: lat + randomBetween(-JITTER_DEGREES, JITTER_DEGREES),
            lng: lng + randomBetween(-JITTER_DEGREES, JITTER_DEGREES),
        };

        try {
            const { data } = await svService.getPanorama({
                location,
                radius: SEARCH_RADIUS_M,
                sources: [StreetViewSource.GOOGLE],      // official Google imagery only, no indoor photos
                preference: StreetViewPreference.BEST,
            });
            return { panoId: data.location.pano, continent, place };
        } catch (err) {
            // No coverage near that point (ZERO_RESULTS). Try another spot.
        }
    }
    return null;
}

function guess(name) {
    if (!canGuess) return;
    canGuess = false;
    setChoicesEnabled(false);

    const right = name === currentAnswer.continent;
    if (right) score++;

    choicesEl.querySelector(`[data-continent="${currentAnswer.continent}"]`).classList.add("correct");
    if (!right) choicesEl.querySelector(`[data-continent="${name}"]`).classList.add("wrong");

    showMessage(
        `${right ? "Correct!" : "Not quite."} It was ${currentAnswer.continent}, around ${currentAnswer.place}.`
    );
    roundInfoEl.textContent = `Round ${round} of ${ROUNDS}. Score: ${score}`;

    if (round >= ROUNDS) {
        endGame();
    } else {
        nextBtn.textContent = "Next round";
        nextBtn.hidden = false;
        nextBtn.focus();
    }
}

function endGame() {
    showMessage(`${messageEl.textContent} Final score: ${score} out of ${ROUNDS}.`);
    nextBtn.textContent = "Play again";
    nextBtn.hidden = false;
    nextBtn.focus();

    // Hook for the rest of the game (e.g. save to Firebase). Remove if not needed.
    sessionStorage.setItem("continentResult", JSON.stringify({ score, rounds: ROUNDS }));
}

// ----- Helpers -----
function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
function randomBetween(min, max) { return min + Math.random() * (max - min); }

function setChoicesEnabled(on) {
    choicesEl.querySelectorAll(".choice").forEach((b) => (b.disabled = !on));
}
function resetChoiceColors() {
    choicesEl.querySelectorAll(".choice").forEach((b) => b.classList.remove("correct", "wrong"));
}
function showStatus(text) { statusEl.textContent = text; statusEl.hidden = false; }
function hideStatus() { statusEl.hidden = true; }
function showMessage(text, isError = false) {
    messageEl.textContent = text;
    messageEl.classList.toggle("error", isError);
}

// ----- Show the player's chosen character on top of Street View -----
function showPlayerSprite() {
    const canvas = document.getElementById("player-sprite");
    const ctx = canvas.getContext("2d");
    drawCharacter(ctx, getSavedCharacter(), 15, 0, 100);
}
showPlayerSprite(); 
