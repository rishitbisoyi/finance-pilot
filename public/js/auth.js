// auth.js
document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = ""; // backend URL, leave empty for localStorage testing

    // DOM elements
    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");
    const loginButton = document.getElementById("loginButton");
    const loginError = document.getElementById("loginError");

    const signupUsername = document.getElementById("signupUsername");
    const signupPassword = document.getElementById("signupPassword");
    const signupConfirmPassword = document.getElementById("signupConfirmPassword");
    const signupButton = document.getElementById("signupButton");
    const signupError = document.getElementById("signupError");

    // ================= COMMON FUNCTION =================
    async function handleAuth(endpoint, payload, errorContainer, usernameField) {
        try {
            if(BASE_URL){ // If backend exists
                const response = await fetch(`${BASE_URL}${endpoint}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                errorContainer.style.color = response.ok ? "#34D399" : "#F87171";
                errorContainer.innerText = data.message || (response.ok ? "Success!" : "Something went wrong.");

                if(response.ok){
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("currentUser", usernameField);
                    window.location.href = "index.html";
                }

            } else { 
                // LocalStorage demo mode (no backend)
                if(endpoint === "/api/signup"){
                    if(localStorage.getItem("user_" + usernameField)){
                        errorContainer.style.color = "#F87171";
                        errorContainer.innerText = "Username already exists!";
                        return;
                    }
                    localStorage.setItem("user_" + usernameField, payload.password);
                    errorContainer.style.color = "#34D399";
                    errorContainer.innerText = "Signup successful! Switch to login.";
                    signupUsername.value = "";
                    signupPassword.value = "";
                    signupConfirmPassword.value = "";
                } else if(endpoint === "/api/login"){
                    const storedPassword = localStorage.getItem("user_" + usernameField);
                    if(storedPassword && storedPassword === payload.password){
                        localStorage.setItem("currentUser", usernameField);
                        errorContainer.style.color = "#34D399";
                        errorContainer.innerText = "Login successful!";
                        window.location.href = "index.html";
                    } else {
                        errorContainer.style.color = "#F87171";
                        errorContainer.innerText = "Invalid credentials!";
                    }
                }
            }
        } catch (error) {
            errorContainer.style.color = "#F87171";
            errorContainer.innerText = "Server not available.";
        }
    }

    // ================= LOGIN =================
    loginButton.addEventListener("click", () => {
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        if(!username || !password){
            loginError.style.color = "#F87171";
            loginError.innerText = "Please enter username and password.";
            return;
        }

        handleAuth("/api/login", {username, password}, loginError, username);
    });

    // ================= SIGNUP =================
    signupButton.addEventListener("click", () => {
        const username = signupUsername.value.trim();
        const password = signupPassword.value.trim();
        const confirmPassword = signupConfirmPassword.value.trim();

        if(!username || !password || !confirmPassword){
            signupError.style.color = "#F87171";
            signupError.innerText = "Please fill all fields.";
            return;
        }

        if(password !== confirmPassword){
            signupError.style.color = "#F87171";
            signupError.innerText = "Passwords do not match.";
            return;
        }

        handleAuth("/api/signup", {username, password}, signupError, username);
    });

});