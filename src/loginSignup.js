// -------------------------------------------------------------
// src/loginSignup.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the login/signup form behaviour and redirects.
// -------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import {
    loginUser,
    signupUser,
    authErrorMessage,
} from './authentication.js';
import { db } from './firebaseConfig.js';
import { doc, getDoc } from 'firebase/firestore';

// Character select page (the profile page in "setup" mode)
const CHARACTER_SETUP_URL = 'profile.html?setup=1';

// Keep this browser's copy of the character in step with the account
// (so a previous account's character never shows up)
function rememberCharacterLocally(name) {
    try {
        if (name) localStorage.setItem('selectedCharacter', name);
        else localStorage.removeItem('selectedCharacter');
    } catch (e) { }
}

// After login: accounts with a saved character carry on as normal,
// accounts without one pick a character first
async function pageAfterLogin(user, normalPage) {
    try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const character = snap.exists() ? snap.data().character : null;
        rememberCharacterLocally(character);
        return character ? normalPage : CHARACTER_SETUP_URL;
    } catch (err) {
        console.error('Could not load the saved character:', err);
        return normalPage;
    }
}


// --- Login and Signup Page ---
// Handles toggling between Login/Signup views and form submits
// using plain DOM APIs for simplicity and maintainability.


function initAuthUI() {
    // --- DOM Elements ---
    const alertEl = document.getElementById('authAlert');
    const loginView = document.getElementById('loginView');
    const signupView = document.getElementById('signupView');
    const toSignupBtn = document.getElementById('toSignup');
    const toLoginBtn = document.getElementById('toLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const redirectUrl = 'main.html';

    // --- Helper Functions ---
    // Toggle element visibility
    function setVisible(el, visible) {
        el.classList.toggle('d-none', !visible);
    }

    // Show error message with accessibility and auto-hide
    let errorTimeout;
    function showError(msg) {
        alertEl.textContent = msg || '';
        alertEl.classList.remove('d-none');
        clearTimeout(errorTimeout);
        errorTimeout = setTimeout(hideError, 5000); // Auto-hide after 5s
    }

    // Hide error message
    function hideError() {
        alertEl.classList.add('d-none');
        alertEl.textContent = '';
        clearTimeout(errorTimeout);
    }

    // Enable/disable submit button for forms
    function setSubmitDisabled(form, disabled) {
        const submitBtn = form?.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = disabled;
    }

    // --- Event Listeners ---
    // Toggle buttons
    toSignupBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        hideError();
        setVisible(loginView, false);
        setVisible(signupView, true);
        signupView?.querySelector('input')?.focus();
    });

    toLoginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        hideError();
        setVisible(signupView, false);
        setVisible(loginView, true);
        loginView?.querySelector('input')?.focus();
    });

    // Login form submit
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        const email = document.querySelector('#loginEmail')?.value?.trim() ?? '';
        const password = document.querySelector('#loginPassword')?.value ?? '';
        if (!email || !password) {
            showError('Please enter your email and password.');
            return;
        }
        setSubmitDisabled(loginForm, true);
        try {
            const credential = await loginUser(email, password);
            location.href = await pageAfterLogin(credential.user, redirectUrl);
        } catch (err) {
            showError(authErrorMessage(err));
            console.error(err);
        } finally {
            setSubmitDisabled(loginForm, false);
        }
    });

    // Signup form submit
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        const name = document.querySelector('#signupName')?.value?.trim() ?? '';
        const email = document.querySelector('#signupEmail')?.value?.trim() ?? '';
        const password = document.querySelector('#signupPassword')?.value ?? '';
        if (!name || !email || !password) {
            showError('Please fill in name, email, and password.');
            return;
        }
        setSubmitDisabled(signupForm, true);
        try {
            await signupUser(name, email, password);
            rememberCharacterLocally(null);   // new account: no character yet
            location.href = redirectUrl;      // tutorial first; its Done button leads to character select
        } catch (err) {
            showError(authErrorMessage(err));
            console.error(err);
        } finally {
            setSubmitDisabled(signupForm, false);
        }
    });
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', initAuthUI);
