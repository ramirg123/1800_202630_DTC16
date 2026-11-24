// Import the file that has the authentication helper function we want to use.
// The function we want to use is called "onAuthReady" which returns the login state
import { onAuthReady } from "./authentication.js";
import { db } from "/src/firebaseConfig.js";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

// New players (no character saved yet) pick one after the tutorial,
// then carry on to the main menu
const CHARACTER_SETUP_URL = "profile.html?setup=1&next=index.html";

async function pointDoneButton(user) {
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const hasCharacter = snap.exists() && snap.data().character;
        if (!hasCharacter) {
            document.getElementById("doneBtn").href = CHARACTER_SETUP_URL;
        }
    } catch (err) {
        console.error("Could not check the saved character:", err);
    }
}


function showName() {
    // Pass a CALLBACK function to run when Firebase finishes checking login status
    onAuthReady(function (user) {  // Firebase passes the user object (or null)
        if (user) {
            // User is logged in
            const name = user.displayName || user.email;  // Use email if name is missing
            // document.getElementById("name-goes-here").textContent = name + "!";
            $("#signInText").text("Hello, " + name + "!");
            pointDoneButton(user);
        } else {
            // User is NOT logged in
            location.href = "index.html";  // Redirect to login page
        }
    });
}

$(document).ready(function () {
    showName();
})