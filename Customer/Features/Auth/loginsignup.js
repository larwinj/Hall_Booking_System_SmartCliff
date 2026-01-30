// Base URL for JSON Server
const API_URL = 'https://mpnt1qbp-3000.inc1.devtunnels.ms';

// EmailJS Configuration - Replace with your actual EmailJS credentials
emailjs.init("wP4KJ3AjpXVJsiadA"); // Replace with your EmailJS User ID

let currentOTP = null;
let emailVerified = false;
let forgotPasswordEmail = null;

// Utility functions for error/success display
function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    const inputEl = document.querySelector(`#${elementId.replace('-error', '')}`);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    inputEl.classList.add('error-border');
}

function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    const inputEl = document.querySelector(`#${elementId.replace('-error', '')}`);
    errorEl.style.display = 'none';
    inputEl.classList.remove('error-border');
}

function showGlobalMessage(message, isSuccess = false) {
    const msgEl = document.getElementById('global-message');
    msgEl.textContent = message;
    msgEl.className = `mb-4 text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`;
    msgEl.classList.remove('hidden');
    setTimeout(() => msgEl.classList.add('hidden'), 5000);
}

function showSuccess(elementId, message) {
    const successEl = document.getElementById(elementId);
    successEl.textContent = message;
    successEl.style.display = 'block';
}

function hideSuccess(elementId) {
    const successEl = document.getElementById(elementId);
    successEl.style.display = 'none';
}

// Form navigation functions
function showLogin() {
    hideAllForms();
    document.getElementById('login-form').classList.remove('hidden');
    resetAllForms();
}

function showForgotPassword() {
    hideAllForms();
    document.getElementById('forgot-password-form').classList.remove('hidden');
    // Copy email from login form if available
    const loginEmail = document.getElementById('login-email').value;
    if (loginEmail) {
        document.getElementById('forgot-email').value = loginEmail;
    }
}

function showChangePassword(email) {
    hideAllForms();
    document.getElementById('change-password-form').classList.remove('hidden');
    document.getElementById('change-email').value = email;
    forgotPasswordEmail = email;
}

function showOTPVerification() {
    hideAllForms();
    document.getElementById('otp-verification-form').classList.remove('hidden');
}

function hideAllForms() {
    const forms = ['login-form', 'signup-form', 'forgot-password-form', 'change-password-form', 'otp-verification-form'];
    forms.forEach(formId => {
        document.getElementById(formId).classList.add('hidden');
    });
}

function resetAllForms() {
    // Reset login form
    document.getElementById('login-form-element').reset();
    ['login-email-error', 'login-password-error'].forEach(hideError);

    // Reset signup form
    document.getElementById('signup-form-element').reset();
    ['signup-firstname-error', 'signup-lastname-error', 'signup-email-error', 'signup-phone-error',
        'signup-password-error', 'signup-confirm-password-error', 'terms-error', 'otp-error'].forEach(hideError);
    hideSuccess('otp-success');
    document.getElementById('otp-section').style.display = 'none';
    emailVerified = false;
    currentOTP = null;

    // Reset forgot password forms
    document.getElementById('forgot-password-element').reset();
    document.getElementById('change-password-element').reset();
    document.getElementById('otp-verification-element').reset();
    ['forgot-email-error', 'new-password-error', 'confirm-new-password-error', 'verify-otp-error'].forEach(hideError);
    forgotPasswordEmail = null;

    // Hide global message
    document.getElementById('global-message').classList.add('hidden');
}

// Generate random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via EmailJS
async function sendOTP() {
    const email = document.getElementById('signup-email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError('signup-email-error', 'Email is required.');
        return;
    }
    if (!emailRegex.test(email)) {
        showError('signup-email-error', 'Please enter a valid email address.');
        return;
    }
    hideError('signup-email-error');

    currentOTP = generateOTP();
    const templateParams = {
        email: email,
        otp: currentOTP,
        message: `Your OTP for verification is: ${currentOTP}. It expires in 15 minutes.`
    };

    try {
        await emailjs.send("service_nd9ymyl", "template_kmlm14f", templateParams); // Replace with your Service ID and Template ID
        document.getElementById('otp-section').style.display = 'block';
        Toastify({
            text: "OTP sent to your email. Please check your inbox.",
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #2af71b, #15a80a)",
            close: true
        }).showToast();

    } catch (error) {
        console.error('Error sending OTP:', error);
        Toastify({
            text: "Failed to send OTP. Please try again.",
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            close: true
        }).showToast();
    }
}

// Verify OTP for signup
function verifyOTP() {
    const otpInput = document.getElementById('otp-input').value;
    console.log('Current OTP:', otpInput, currentOTP);
    if (!otpInput) {
        showError('otp-error', 'Please enter the OTP.');
        return;
    }
    if (otpInput !== currentOTP) {
        showError('otp-error', 'Invalid OTP. Please try again.');
        return;
    }
    emailVerified = true;
    showSuccess('otp-success', 'Email verified successfully!');
    document.getElementById('otp-input').disabled = true;
}

// Form toggle functionality
function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm.classList.contains('hidden')) {
        showLogin();
    } else {
        hideAllForms();
        signupForm.classList.remove('hidden');
        resetAllForms();
    }
}

// Forgot Password form submission
document.getElementById('forgot-password-element').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('forgot-email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        showError('forgot-email-error', 'Email is required.');
        return;
    }
    if (!emailRegex.test(email)) {
        showError('forgot-email-error', 'Please enter a valid email address.');
        return;
    }

    try {
        // Check if email exists in database
        const response = await fetch(`${API_URL}/users?email=${email}`);
        const users = await response.json();

        if (users.length === 0) {
            showError('forgot-email-error', 'No account found with this email address.');
            return;
        }

        hideError('forgot-email-error');
        showChangePassword(email);

        Toastify({
            text: "Email verified. Please set your new password.",
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #2af71b, #15a80a)",
            close: true
        }).showToast();

    } catch (error) {
        console.error('Error checking email:', error);
        Toastify({
            text: "An error occurred. Please try again later.",
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            close: true
        }).showToast();
    }
});

// Change Password form submission
document.getElementById('change-password-element').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    let hasErrors = false;

    if (!newPassword) {
        showError('new-password-error', 'New password is required.');
        hasErrors = true;
    } else if (newPassword.length < 8) {
        showError('new-password-error', 'Password must be at least 8 characters long.');
        hasErrors = true;
    } else if (!/\d/.test(newPassword)) {
        showError('new-password-error', 'Password must contain at least one number.');
        hasErrors = true;
    } else if (!/[!@#$%^&*]/.test(newPassword)) {
        showError('new-password-error', 'Password must contain at least one special character.');
        hasErrors = true;
    } else if (!/[A-Z]/.test(newPassword)) {
        showError('new-password-error', 'Password must contain at least one uppercase letter.');
        hasErrors = true;
    } else if (!/[a-z]/.test(newPassword)) {
        showError('new-password-error', 'Password must contain at least one lowercase letter.');
        hasErrors = true;
    } else {
        hideError('new-password-error');
    }

    if (!confirmPassword) {
        showError('confirm-new-password-error', 'Please confirm your password.');
        hasErrors = true;
    } else if (newPassword !== confirmPassword) {
        showError('confirm-new-password-error', 'Passwords do not match.');
        hasErrors = true;
    } else {
        hideError('confirm-new-password-error');
    }

    if (hasErrors) return;

    // Show OTP verification form
    showOTPVerification();

    Toastify({
        text: "Please enter OTP (1234) to complete password reset.",
        duration: 4000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #2af71b, #15a80a)",
        close: true
    }).showToast();
});

// OTP Verification form submission
document.getElementById('otp-verification-element').addEventListener('submit', async (e) => {
    e.preventDefault();

    const otpInput = document.getElementById('verify-otp-input').value;

    if (!otpInput) {
        showError('verify-otp-error', 'Please enter the OTP.');
        return;
    }

    if (otpInput !== "1234") {
        showError('verify-otp-error', 'Invalid OTP. Please try again.');
        return;
    }

    hideError('verify-otp-error');

    try {
        // Get the new password from the change password form
        const newPassword = document.getElementById('new-password').value;

        // Find the user and update password
        const response = await fetch(`${API_URL}/users?email=${forgotPasswordEmail}`);
        const users = await response.json();

        if (users.length > 0) {
            const user = users[0];
            const updateResponse = await fetch(`${API_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...user,
                    password: newPassword
                })
            });

            if (updateResponse.ok) {
                Toastify({
                    text: "Password updated successfully! Redirecting to login...",
                    duration: 4000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "linear-gradient(to right, #1deb0e, #0d6606)",
                    close: true
                }).showToast();

                setTimeout(() => {
                    showLogin();
                }, 2000);
            } else {
                throw new Error('Failed to update password');
            }
        } else {
            throw new Error('User not found');
        }

    } catch (error) {
        console.error('Error updating password:', error);
        Toastify({
            text: "Failed to update password. Please try again.",
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            close: true
        }).showToast();
    }
});

// Input event listeners for real-time validation
document.getElementById('signup-firstname').addEventListener('blur', (e) => {
    if (!e.target.value.trim()) showError('signup-firstname-error', 'First name is required.');
    else hideError('signup-firstname-error');
});

document.getElementById('signup-lastname').addEventListener('blur', (e) => {
    if (!e.target.value.trim()) showError('signup-lastname-error', 'Last name is required.');
    else hideError('signup-lastname-error');
});

document.getElementById('signup-email').addEventListener('blur', (e) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!e.target.value) {
        showError('signup-email-error', 'Email is required.');
    } else if (!emailRegex.test(e.target.value)) {
        showError('signup-email-error', 'Please enter a valid email address.');
    } else {
        hideError('signup-email-error');
    }
});

document.getElementById('signup-phone').addEventListener('blur', (e) => {
    const phoneRegex = /^\d{10}$/;
    if (!e.target.value) {
        showError('signup-phone-error', 'Phone number is required.');
    } else if (!phoneRegex.test(e.target.value)) {
        showError('signup-phone-error', 'Phone number must be exactly 10 digits.');
    } else {
        hideError('signup-phone-error');
    }
});

document.getElementById('signup-password').addEventListener('blur', (e) => {
    const password = e.target.value;
    if (!password) {
        showError('signup-password-error', 'Password is required.');
    } else if (password.length < 8) {
        showError('signup-password-error', 'Password must be at least 8 characters long.');
    } else if (!/\d/.test(password)) {
        showError('signup-password-error', 'Password must contain at least one number.');
    } else if (!/[!@#$%^&*]/.test(password)) {
        showError('signup-password-error', 'Password must contain at least one special character.');
    } else if (!/[A-Z]/.test(password)) {
        showError('signup-password-error', 'Password must contain at least one uppercase letter.');
    } else if (!/[a-z]/.test(password)) {
        showError('signup-password-error', 'Password must contain at least one lowercase letter.');
    } else {
        hideError('signup-password-error');
    }
});

document.getElementById('signup-confirm-password').addEventListener('blur', (e) => {
    const confirmPassword = e.target.value;
    const password = document.getElementById('signup-password').value;
    if (!confirmPassword) {
        showError('signup-confirm-password-error', 'Please confirm your password.');
    } else if (confirmPassword !== password) {
        showError('signup-confirm-password-error', 'Passwords do not match.');
    } else {
        hideError('signup-confirm-password-error');
    }
});

document.getElementById('login-email').addEventListener('blur', (e) => {
    if (!e.target.value) showError('login-email-error', 'Email is required.');
    else hideError('login-email-error');
});

document.getElementById('login-password').addEventListener('blur', (e) => {
    if (!e.target.value) showError('login-password-error', 'Password is required.');
    else hideError('login-password-error');
});

// Password validation for change password form
document.getElementById('new-password').addEventListener('blur', (e) => {
    const password = e.target.value;
    if (!password) {
        showError('new-password-error', 'New password is required.');
    } else if (password.length < 8) {
        showError('new-password-error', 'Password must be at least 8 characters long.');
    } else if (!/\d/.test(password)) {
        showError('new-password-error', 'Password must contain at least one number.');
    } else if (!/[!@#$%^&*]/.test(password)) {
        showError('new-password-error', 'Password must contain at least one special character.');
    } else if (!/[A-Z]/.test(password)) {
        showError('new-password-error', 'Password must contain at least one uppercase letter.');
    } else if (!/[a-z]/.test(password)) {
        showError('new-password-error', 'Password must contain at least one lowercase letter.');
    } else {
        hideError('new-password-error');
    }
});

document.getElementById('confirm-new-password').addEventListener('blur', (e) => {
    const confirmPassword = e.target.value;
    const password = document.getElementById('new-password').value;
    if (!confirmPassword) {
        showError('confirm-new-password-error', 'Please confirm your password.');
    } else if (confirmPassword !== password) {
        showError('confirm-new-password-error', 'Passwords do not match.');
    } else {
        hideError('confirm-new-password-error');
    }
});

// Email verification button click
document.getElementById('verify-email-btn').addEventListener('click', sendOTP);

// Signup form submission
document.getElementById('signup-form-element').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('signup-firstname').value.trim();
    const lastName = document.getElementById('signup-lastname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const termsChecked = document.getElementById('terms-checkbox').checked;

    let hasErrors = false;

    if (!firstName) {
        showError('signup-firstname-error', 'First name is required.');
        hasErrors = true;
    }
    if (!lastName) {
        showError('signup-lastname-error', 'Last name is required.');
        hasErrors = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showError('signup-email-error', 'Valid email is required.');
        hasErrors = true;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
        showError('signup-phone-error', 'Phone number must be exactly 10 digits.');
        hasErrors = true;
    }
    if (!password || password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
        showError('signup-password-error', 'Password must be at least 8 characters with a number and special character.');
        hasErrors = true;
    }
    if (password !== confirmPassword) {
        showError('signup-confirm-password-error', 'Passwords do not match.');
        hasErrors = true;
    }
    if (!termsChecked) {
        showError('terms-error', 'You must agree to the terms.');
        hasErrors = true;
    }
    if (!emailVerified) {
        Toastify({
            text: "Please verify your email first.",
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #e82c3f, #a10817)",
            close: true
        }).showToast();
        hasErrors = true;
    }

    if (hasErrors) return;

    try {
        const response = await fetch(`${API_URL}/users?email=${email}`);
        const existingUsers = await response.json();
        if (existingUsers.length > 0) {
            Toastify({
                text: "Email already registered. Please use a different email.",
                duration: 4000,
                gravity: "top",
                position: "right",
                backgroundColor: "linear-gradient(to right, #e82c3f, #a10817)",
                close: true
            }).showToast();
            return;
        }

        // Create new user
        const user = {
            firstName,
            lastName,
            email,
            phone,
            password
        };

        const createResponse = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (createResponse.ok) {
            Toastify({
                text: "Account created successfully! Please login.",
                duration: 4000,
                gravity: "top",
                position: "right",
                backgroundColor: "linear-gradient(to right, #1deb0e, #0d6606)",
                close: true
            }).showToast();
            setTimeout(() => showLogin(), 2000);
        } else {
            Toastify({
                text: "Error creating account. Please try again.",
                duration: 4000,
                gravity: "top",
                position: "right",
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                close: true
            }).showToast();
        }
    } catch (error) {
        console.error('Error during signup:', error);
        Toastify({
            text: "An error occurred. Please try again later.",
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            close: true
        }).showToast();
    }
});

// Login form submission
document.getElementById('login-form-element').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let hasErrors = false;

    if (!email) {
        showError('login-email-error', 'Email is required.');
        hasErrors = true;
    }
    if (!password) {
        showError('login-password-error', 'Password is required.');
        hasErrors = true;
    }

    if (hasErrors) return;

    try {
        const response = await fetch(`${API_URL}/users?email=${email}`);
        const users = await response.json();

        if (users.length === 0) {
            showError('login-email-error', 'No account found with this email.');
            return;
        }

        const user = users[0];
        if (user.password !== password) {
            showError('login-password-error', 'Incorrect password.');
            return;
        }

        // Store user ID in sessionStorage for booking association
        sessionStorage.setItem('userId', user.id);
        localStorage.setItem('userId', user.id);
        console.log(user);

        Toastify({
            text: "Login successful! Redirecting to dashboard...",
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #16e307, #118209)",
            close: true
        }).showToast();

        setTimeout(() => {
            if (user.role === 'admin') {
                console.log('Admin user detected, redirecting to admin dashboard');
                window.location.href = '../../../Admin/Features/DashBoard/dashboard.html';
                return;
            }

            window.location.href = '../Dashboard/home.html'; // Adjust path to your dashboard
        }, 1000);
    } catch (error) {
        console.error('Error during login:', error);
        Toastify({
            text: "An error occurred. Please try again later.",
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            close: true
        }).showToast();
    }
});

// Check URL parameters for initial form display
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
if (mode === 'signup') {
    toggleForm();
}