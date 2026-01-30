class ProfileManager {
    constructor() {
        this.apiUrl = 'http://localhost:3000/users';
        this.currentUserId = localStorage.getItem("userId");
        this.currentUser = null;

        this.initializeElements();
        this.setupEventListeners();
        if (this.currentUserId) {
            this.loadCurrentUser();
        } else {
            this.showError('Please log in to view your profile.');
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 2000);
        }
    }

    initializeElements() {
        this.profileBtn = document.getElementById('profileBtn');
        this.modal = document.getElementById('profileModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.profileForm = document.getElementById('profileForm');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.passwordInput = document.getElementById('password');
        this.eyeIcon = document.getElementById('eyeIcon');

        this.inputs = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            password: document.getElementById('password')
        };
    }

    setupEventListeners() {
        this.profileBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', () => this.closeModal());
        this.saveBtn.addEventListener('click', () => this.saveChanges());
        this.togglePasswordBtn.addEventListener('click', () => this.togglePassword());
        Object.values(this.inputs).forEach(input => {
            input.addEventListener('input', () => this.validateForm());
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }

    async loadCurrentUser() {
        try {
            const response = await fetch(`${this.apiUrl}/${this.currentUserId}`);
            if (response.ok) {
                this.currentUser = await response.json();
                this.populateForm();
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            this.showError('Failed to load user data. Please try again.');
        }
    }

    openModal() {
        if (!this.currentUserId) {
            this.showError('Please log in to view your profile.');
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 2000);
            return;
        }
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.populateForm();
        this.hideMessages();

        setTimeout(() => {
            this.inputs.firstName.focus();
        }, 300);
    }

    closeModal() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.resetForm();
        this.hideMessages();
    }

    populateForm() {
        if (this.currentUser) {
            this.inputs.firstName.value = this.currentUser.firstName || '';
            this.inputs.lastName.value = this.currentUser.lastName || '';
            this.inputs.email.value = this.currentUser.email || '';
            this.inputs.phone.value = this.currentUser.phone || '';
            this.inputs.password.value = this.currentUser.password || '';
        }
    }

    resetForm() {
        this.profileForm.reset();
        this.validateForm();
    }

    validateForm() {
        const isValid = Object.values(this.inputs).every(input => {
            return input.value.trim() !== '' && input.checkValidity();
        });

        this.saveBtn.disabled = !isValid;
        return isValid;
    }

    async saveChanges() {
        if (!this.validateForm()) {
            this.showError('Please fill in all required fields correctly.');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const updatedUser = {
                firstName: this.inputs.firstName.value.trim(),
                lastName: this.inputs.lastName.value.trim(),
                email: this.inputs.email.value.trim(),
                phone: this.inputs.phone.value.trim(),
                password: this.inputs.password.value
            };

            if (!this.isValidEmail(updatedUser.email)) {
                throw new Error('Please enter a valid email address.');
            }

            if (!this.isValidPhone(updatedUser.phone)) {
                throw new Error('Please enter a valid phone number.');
            }

            const response = await fetch(`${this.apiUrl}/${this.currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...this.currentUser, ...updatedUser })
            });

            if (response.ok) {
                this.currentUser = await response.json();
                this.showSuccess();

                setTimeout(() => {
                    this.closeModal();
                }, 2000);
            } else {
                throw new Error('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    togglePassword() {
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';

        this.eyeIcon.innerHTML = isPassword
            ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>`
            : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    showLoading(show) {
        if (show) {
            this.loadingSpinner.classList.remove('hidden');
            this.saveBtn.disabled = true;
        } else {
            this.loadingSpinner.classList.add('hidden');
            this.saveBtn.disabled = !this.validateForm();
        }
    }

    showError(message) {
        this.errorMessage.querySelector('p').textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
    }

    showSuccess() {
        this.successMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
    }

    hideMessages() {
        this.errorMessage.classList.add('hidden');
        this.successMessage.classList.add('hidden');
    }
}

// Carousel Functionality
let currentIndex = 0;
const carouselItems = document.querySelectorAll('.carousel-item');
const totalItems = carouselItems.length;

function updateCarousel() {
    carouselItems.forEach((item, index) => {
        item.classList.remove('active');
        if (index === currentIndex) {
            item.classList.add('active');
        }
    });
    document.querySelector('.carousel').style.transform = `translateX(-${currentIndex * 100}%)`;
}

function moveCarousel(direction) {
    currentIndex = (currentIndex + direction + totalItems) % totalItems;
    updateCarousel();
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
    updateCarousel(); // Show first testimonial
    // Auto-advance carousel every 5 seconds
    setInterval(() => {
        moveCarousel(1);
    }, 5000);
});
function handleClickProfile() {
    this.openModal();
}

// Button ripple effect
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function (e) {
        if (this.textContent.includes('Start Booking') || this.textContent.includes('View Rooms')) {
            const ripple = document.createElement('span');
            ripple.className = 'absolute inset-0 rounded-full bg-white/30 scale-0 animate-ping';
            this.style.position = 'relative';
            this.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });
});