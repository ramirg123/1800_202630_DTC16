const params = new URLSearchParams(window.location.search);

// Time
document.getElementById("timeDisplay").textContent = params.get("time");

// Badges
const earned = Number(params.get("badges")) || 0;

const badgeImgs = document.querySelectorAll("#badges .badge");
for (let i = 0; i < badgeImgs.length; i++) {
    if (i < earned) {
        badgeImgs[i].classList.remove("grayscale", "opacity-35");
    }
}