// Import the file that has the authentication helper function we want to use.
// The function we want to use is called "onAuthReady" which returns the login state
import { onAuthReady } from "./authentication.js";
import { db } from "/src/firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";


function showName() {
    // Pass a CALLBACK function to run when Firebase finishes checking login status
    onAuthReady(function (user) {  // Firebase passes the user object (or null)
        if (user) {
            // User is logged in
            const name = user.displayName || user.email;  // Use email if name is missing
            // document.getElementById("name-goes-here").textContent = name + "!";
            $("#signInText").html("You have signed in, " + name + "!");
        } else {
            // User is NOT logged in
            location.href = "index.html";  // Redirect to login page
        }
    });
}

$(document).ready(function () {
    $(".bi-person-circle").on("click", function () {
        $("#profileMenu").removeClass("hidden")
    });

    $("#profileBackButton").on("click", function () {
        $("#profileMenu").addClass("hidden")
    });

    showName();
})