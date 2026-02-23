document.addEventListener("DOMContentLoaded", () => {

    const BASE_URL = ""; // Keep empty for now. Add backend URL later.

    // ================= COMMON AUTH FUNCTION =================
    async function handleAuth(endpoint, payload, errorContainer) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                errorContainer.innerText = data.message || "Something went wrong.";
                return;
            }

            localStorage.setItem("token", data.token);
            window.location.href = "dashboard.html";

        } catch (error) {
            errorContainer.innerText = "Server not available.";
        }
    }

    // ================= LOGIN =================
    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");
    const loginButton = document.getElementById("loginButton");
    const loginError = document.getElementById("loginError");

    if (loginButton) {
        loginButton.addEventListener("click", () => {

            const username = loginUsername.value.trim();
            const password = loginPassword.value.trim();

            if (!username || !password) {
                loginError.innerText = "Please enter username and password.";
                return;
            }

            handleAuth("/api/login", { username, password }, loginError);
        });
    }

    // ================= SIGNUP =================
    const signupUsername = document.getElementById("signupUsername");
    const signupPassword = document.getElementById("signupPassword");
    const signupConfirmPassword = document.getElementById("signupConfirmPassword");
    const signupButton = document.getElementById("signupButton");
    const signupError = document.getElementById("signupError");

    if (signupButton) {
        signupButton.addEventListener("click", () => {

            const username = signupUsername.value.trim();
            const password = signupPassword.value.trim();
            const confirmPassword = signupConfirmPassword.value.trim();

            if (!username || !password || !confirmPassword) {
                signupError.innerText = "Please fill all fields.";
                return;
            }

            if (password !== confirmPassword) {
                signupError.innerText = "Passwords do not match.";
                return;
            }

            handleAuth("/api/signup", { username, password }, signupError);
        });
    }

});