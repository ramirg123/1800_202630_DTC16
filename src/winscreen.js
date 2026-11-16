const time = new URLSearchParams(window.location.search).get("time");
document.getElementById("timeDisplay").textContent = time;