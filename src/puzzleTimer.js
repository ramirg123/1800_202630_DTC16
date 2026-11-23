const puzzleStart = Date.now();   // runs when the puzzle page loads

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = ms % 1000;
    return minutes + ":" + String(seconds).padStart(2, "0");
}

const timerElement = document.getElementById("puzzleTimer");

setInterval(function () {
    timerElement.textContent = formatTime(Date.now() - puzzleStart);
}, 10);