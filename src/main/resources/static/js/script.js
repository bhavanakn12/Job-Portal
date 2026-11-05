
// Display messages on the page
function showMessage(message, type) {
    const messageBox = document.getElementById("message");

    if (!messageBox) return;

    messageBox.className = `alert alert-${type}`;
    messageBox.textContent = message;
}

// Registration
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const userData = {
            fullName: document.getElementById("fullName").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value,
            role: document.getElementById("role").value
        };

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    result?.message || result?.detail ||
                    "Registration failed. Please check your details."
                );
            }

            showMessage(
                "Registration successful! Redirecting to login...",
                "success"
            );

            registerForm.reset();

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);

        } catch (error) {
            showMessage(error.message, "danger");
        }
    });
}

// Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const loginData = {
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
        };

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    result?.message || result?.detail ||
                    "Invalid email or password."
                );
            }

            if (!result || !result.token || !result.role) {
                throw new Error("Invalid login response from server.");
            }

            // Store authentication details for this browser session
            sessionStorage.setItem("jwtToken", result.token);
            sessionStorage.setItem("userRole", result.role);
            sessionStorage.setItem("userEmail", loginData.email);

            showMessage("Login successful! Redirecting...", "success");

            if (result.role === "JOB_SEEKER") {
                window.location.href = "/seeker-dashboard";
            } else if (result.role === "RECRUITER") {
                window.location.href = "/recruiter-dashboard";
            } else if (result.role === "ADMIN") {
                window.location.href = "/admin-dashboard";
            } else {
                showMessage("Unknown user role.", "danger");
            }

        } catch (error) {
            showMessage(error.message, "danger");
        }
    });
}
function logout() {
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userEmail");

    window.location.href = "/login";
}
function togglePassword(inputId, button) {

    const input = document.getElementById(inputId);

    const icon = button.querySelector("i");

    if (input.type === "password") {

        input.type = "text";

        icon.classList.remove("bi-eye");

        icon.classList.add("bi-eye-slash");

        button.setAttribute("aria-label", "Hide password");

    } else {

        input.type = "password";

        icon.classList.remove("bi-eye-slash");

        icon.classList.add("bi-eye");

        button.setAttribute("aria-label", "Show password");

    }
}
