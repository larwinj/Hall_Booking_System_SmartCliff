const API_URL = 'http://localhost:3000';

class ProfileManager {
    constructor() {
        this.apiUrl = `${API_URL}/users`;
        this.currentUserId = localStorage.getItem('userId');
        this.currentUser = null;

        this.initializeElements();
        this.setupEventListeners();
        if (this.currentUserId) {
            this.loadCurrentUser();
        }
    }

    initializeElements() {
        this.profileBtn = document.getElementById('profileBtn');
        this.modal = document.getElementById('profileModal');
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
        let openModalTimeout;
        this.profileBtn.addEventListener('click', () => {
            clearTimeout(openModalTimeout);
            openModalTimeout = setTimeout(() => this.openModal(), 100);
        });

        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
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
    }

    async loadCurrentUser() {
        if (!this.currentUserId) return;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${this.apiUrl}/${this.currentUserId}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error('User not found');
            this.currentUser = await response.json();
            this.populateForm();
        } catch (error) {
            console.error('Error loading user:', error);
        }
    }

    openModal() {
        if (!this.currentUserId) {
            alert('Please log in to view your profile.');
            return;
        }
        this.modal.classList.remove('hidden');
        requestAnimationFrame(() => this.modal.classList.add('show'));
        document.body.style.overflow = 'hidden';
        this.populateForm();
        this.hideMessages();
        this.inputs.firstName.focus();
    }

    closeModal() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            this.resetForm();
            this.hideMessages();
        }, 300);
    }

    populateForm() {
        if (this.currentUser) {
            this.inputs.firstName.value = this.currentUser.firstName || '';
            this.inputs.lastName.value = this.currentUser.lastName || '';
            this.inputs.email.value = this.currentUser.email || '';
            this.inputs.phone.value = this.currentUser.phone || '';
            this.inputs.password.value = this.currentUser.password || '';
            this.validateForm();
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
        if (!this.validateForm()) return;

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

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${this.apiUrl}/${this.currentUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                this.currentUser = await response.json();
                this.showSuccess();
                setTimeout(() => this.closeModal(), 2000);
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showError('An error occurred. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    togglePassword() {
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
    }

    showLoading(show) {
        this.loadingSpinner.classList.toggle('hidden', !show);
        this.saveBtn.disabled = show || !this.validateForm();
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

class ContactManager {
    constructor() {
        this.apiUrl = `${API_URL}/queries`;
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.contactForm = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.formLoading = document.getElementById('formLoading');
        this.formSuccess = document.getElementById('formSuccess');
        this.formError = document.getElementById('formError');
        this.formErrorMessage = document.getElementById('formErrorMessage');
        this.formHeader = document.getElementById('formHeader');
        this.formFields = document.getElementById('formFields');

        this.inputs = {
            name: document.getElementById('contactName'),
            email: document.getElementById('contactEmail'),
            phone: document.getElementById('contactPhone'),
            subject: document.getElementById('subject'),
            description: document.getElementById('description')
        };

        this.errorElements = {
            name: document.getElementById('nameError'),
            email: document.getElementById('emailError'),
            phone: document.getElementById('phoneError'),
            description: document.getElementById('descriptionError')
        };

        this.charCounter = this.inputs.description.parentNode.querySelector('.text-gray-500');
    }

    setupEventListeners() {
        this.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        this.inputs.name.addEventListener('blur', () => this.validateName());
        this.inputs.email.addEventListener('blur', () => this.validateEmail());
        this.inputs.phone.addEventListener('blur', () => this.validatePhone());
        this.inputs.description.addEventListener('blur', () => this.validateDescription());
        this.inputs.description.addEventListener('input', () => this.updateCharacterCount());

        // Clear errors on input
        Object.keys(this.inputs).forEach(key => {
            this.inputs[key].addEventListener('input', () => {
                if (this.errorElements[key]) {
                    this.hideError(key);
                }
            });
        });
    }

    validateName() {
        const name = this.inputs.name.value.trim();
        if (name.length < 2) {
            this.showError('name', 'Name must be at least 2 characters long');
            return false;
        }
        this.hideError('name');
        return true;
    }

    validateEmail() {
        const email = this.inputs.email.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('email', 'Please enter a valid email address');
            return false;
        }
        this.hideError('email');
        return true;
    }

    validatePhone() {
        let phone = this.inputs.phone.value.trim();
        phone = phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
        if (phone.startsWith('+91')) {
            phone = phone.slice(3);
        }
        if (!/^[6-9]\d{9}$/.test(phone)) {
            this.showError('phone', 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
            return false;
        }
        this.hideError('phone');
        return true;
    }

    validateDescription() {
        const description = this.inputs.description.value.trim();
        if (description.length < 10) {
            this.showError('description', 'Message must be at least 10 characters long');
            return false;
        }
        if (description.length > 500) {
            this.showError('description', 'Message must not exceed 500 characters');
            return false;
        }
        this.hideError('description');
        return true;
    }

    updateCharacterCount() {
        const description = this.inputs.description.value;
        const remaining = 500 - description.length;
        if (this.charCounter) {
            this.charCounter.textContent = `${remaining} characters remaining`;
            this.charCounter.classList.toggle('text-red-500', remaining < 0);
            this.charCounter.classList.toggle('text-gray-500', remaining >= 0);
        }
    }

    showError(field, message) {
        if (this.errorElements[field]) {
            this.errorElements[field].textContent = message;
            this.errorElements[field].classList.remove('hidden');
            this.inputs[field].classList.add('border-red-500');
        }
    }

    hideError(field) {
        if (this.errorElements[field]) {
            this.errorElements[field].classList.add('hidden');
            this.inputs[field].classList.remove('border-red-500');
        }
    }

    validateForm() {
        let isValid = true;
        isValid = this.validateName() && isValid;
        isValid = this.validateEmail() && isValid;
        isValid = this.validatePhone() && isValid;
        isValid = this.validateDescription() && isValid;
        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const formData = {
                UserId: localStorage.getItem('userId') || 'guest',
                name: this.inputs.name.value.trim(),
                email: this.inputs.email.value.trim(),
                phone: this.inputs.phone.value.trim(),
                subject: this.inputs.subject.value || 'General Inquiry',
                description: this.inputs.description.value.trim(),
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            console.log(formData);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                this.showSuccess();
                this.resetForm();
            } else {
                throw new Error(`Failed to submit form: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            this.showFormError(error.name === 'AbortError' ?
                'Request timed out. Please try again.' :
                'Unable to send message. Please try again later.');
        } finally {
            this.showLoading(false);
        }
    }

    resetForm() {
        this.contactForm.reset();
        Object.keys(this.errorElements).forEach(key => this.hideError(key));
        this.updateCharacterCount();
    }

    showLoading(show) {
        this.formLoading.classList.toggle('hidden', !show);
        this.submitBtn.disabled = show;
    }

    showSuccess() {
        this.formSuccess.classList.remove('hidden');
        this.formError.classList.add('hidden');
        this.formFields.classList.add('hidden');
        this.submitBtn.classList.add('hidden');
        this.formHeader.querySelector('h2').textContent = 'Message Sent Successfully!';
        this.formHeader.querySelector('p').classList.add('hidden');
        setTimeout(() => {
            this.formSuccess.classList.add('hidden');
            this.formFields.classList.remove('hidden');
            this.submitBtn.classList.remove('hidden');
            this.formHeader.querySelector('h2').textContent = 'Send us a Message';
            this.formHeader.querySelector('p').classList.remove('hidden');
        }, 5000);
    }

    showFormError(message) {
        this.formErrorMessage.textContent = message;
        this.formError.classList.remove('hidden');
        this.formSuccess.classList.add('hidden');
    }

    hideMessages() {
        this.formSuccess.classList.add('hidden');
        this.formError.classList.add('hidden');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
    new ContactManager();

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // FAQ toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const arrow = question.querySelector('svg');
            answer.classList.toggle('hidden');
            arrow.classList.toggle('rotate-90');
        });
    });
});