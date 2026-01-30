const API_URL = 'https://mpnt1qbp-3000.inc1.devtunnels.ms';

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
        // Debounce to prevent rapid clicks
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
        if (!this.currentUserId) {
            this.showError('Please log in to view your profile.');
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 2000);
            return;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${this.apiUrl}/${this.currentUserId}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error('User not found');
            }
            this.currentUser = await response.json();
            this.populateForm();
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
                throw new Error('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showError(error.message || 'An error occurred. Please try again.');
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

// Hall data
const hallData = {
    compact: {
        title: 'Compact Hall',
        capacity: 'Up to 10-20 members',
        cost: '₹1500',
        amenities: [
            { icon: '📶', name: 'High Speed WiFi' },
            { icon: '🔌', name: 'Power Backup' },
            { icon: '📺', name: 'Television' },
            { icon: '📝', name: 'Whiteboard' },
            { icon: '❄️', name: 'AC' }
        ],
        rooms: [
            { id: '#001', image: 'https://media.istockphoto.com/id/1077431262/photo/small-conference-room-with-whiteboard-on-blue-wall.jpg?s=612x612&w=0&k=20&c=SXlqI9JIh1UOyg3JcvbwsmrAHZRFwKLOThdSNvWoo-I=' },
            { id: '#002', image: 'https://media.istockphoto.com/id/158587251/photo/multi-function-room-garden.jpg?s=612x612&w=0&k=20&c=V4LqcXmhAmY6crAAyjrQaOM05iz9Yt14Ie5YkaMkc7c=' },
            { id: '#003', image: 'https://media.istockphoto.com/id/1414903724/photo/conference-round-table-and-chairs.jpg?s=612x612&w=0&k=20&c=07g8JfGsos8eCHwb_zvV2_aYOnHcxSDsek0_tjIsLyY=' },
            { id: '#004', image: 'https://media.istockphoto.com/id/1479587535/photo/eco-friendly-open-plan-modern-office-interior-with-meeting-room-wooden-meeting-table-yellow.jpg?s=612x612&w=0&k=20&c=_ECheLlQXPrgvcffXv6hOehCxrrpBLkio-Y5x4TYnIE=' }
        ]
    },
    classic: {
        title: 'Classic Hall',
        capacity: 'Up to 20-50 members',
        cost: '₹2500',
        amenities: [
            { icon: '📶', name: 'High Speed WiFi' },
            { icon: '🔌', name: 'Power Backup' },
            { icon: '📺', name: 'Television' },
            { icon: '📝', name: 'Whiteboard' },
            { icon: '❄️', name: 'AC' },
            { icon: '🎤', name: 'Audio System' }
        ],
        rooms: [
            { id: '#005', image: 'https://media.istockphoto.com/id/1479587535/photo/eco-friendly-open-plan-modern-office-interior-with-meeting-room-wooden-meeting-table-yellow.jpg?s=612x612&w=0&k=20&c=_ECheLlQXPrgvcffXv6hOehCxrrpBLkio-Y5x4TYnIE=' },
            { id: '#006', image: 'https://static.vecteezy.com/system/resources/thumbnails/047/802/045/small_2x/wooden-office-interior-with-meeting-table-and-chairs-tv-screen-and-window-photo.jpg' },
            { id: '#007', image: 'https://img.freepik.com/premium-photo/board-room-conference-room-meeting-room-white-board-corporate-office_57262-428.jpg' },
            { id: '#008', image: 'https://media.istockphoto.com/id/1414903724/photo/conference-round-table-and-chairs.jpg?s=612x612&w=0&k=20&c=07g8JfGsos8eCHwb_zvV2_aYOnHcxSDsek0_tjIsLyY=' }
        ]
    },
    grand: {
        title: 'Grand Hall',
        capacity: 'Up to 50-80 members',
        cost: '₹4000',
        amenities: [
            { icon: '📶', name: 'High Speed WiFi' },
            { icon: '🔌', name: 'Power Backup' },
            { icon: '📺', name: 'Television' },
            { icon: '📝', name: 'Whiteboard' },
            { icon: '❄️', name: 'AC' },
            { icon: '🎤', name: 'Audio System' },
            { icon: '🎥', name: 'Projector' },
            { icon: '🍽️', name: 'Catering Area' }
        ],
        rooms: [
            { id: '#009', image: 'https://www.bwpluswandagrand.com/wp-content/uploads/meetings-slide02-1.jpg' },
            { id: '#010', image: 'https://grandecentrepointsukhumvit55.com/upload/Meeting/04.jpg?v=76' },
            { id: '#011', image: 'https://www.grandmirage.com/assets/uploads/images/meetings-events/meeting-slide-kecak.jpg' },
            { id: '#012', image: 'https://media.istockphoto.com/id/1479587535/photo/eco-friendly-open-plan-modern-office-interior-with-meeting-room-wooden-meeting-table-yellow.jpg?s=612x612&w=0&k=20&c=_ECheLlQXPrgvcffXv6hOehCxrrpBLkio-Y5x4TYnIE=' }
        ]
    }
};

// Page navigation
function showPage(page) {
    if (page === 'rooms') {
        document.getElementById('roomsOverview').classList.remove('hidden');
        document.getElementById('hallDetails').classList.add('hidden');
    }
}

function showHallDetails(hallType) {
    const hall = hallData[hallType];

    // Update hall information
    document.getElementById('hallTitle').textContent = hall.title;
    document.getElementById('hallCapacity').textContent = hall.capacity;
    document.getElementById('costInfo').textContent = `Cost per Hour: ${hall.cost}`;

    // Populate amenities
    const amenitiesContainer = document.getElementById('amenitiesList');
    amenitiesContainer.innerHTML = '';

    hall.amenities.forEach(amenity => {
        const amenityDiv = document.createElement('div');
        amenityDiv.className = 'flex items-center space-x-3';
        amenityDiv.innerHTML = `
            <div class="amenity-icon w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white text-lg">
                ${amenity.icon}
            </div>
            <span class="text-sm font-medium text-gray-700">${amenity.name}</span>
        `;
        amenitiesContainer.appendChild(amenityDiv);
    });

    // Populate rooms grid with images
    const roomsContainer = document.getElementById('roomsGrid');
    roomsContainer.innerHTML = '';

    hall.rooms.forEach(room => {
        const roomDiv = document.createElement('div');
        roomDiv.className = 'room-card rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl';
        roomDiv.innerHTML = `
            <div class="h-32 relative overflow-hidden group">
                <img src="${room.image}" alt="Room ${room.id}" class="w-full h-full object-cover transform transition duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div class="p-4 text-center">
                <span class="text-gray-800 font-medium">Room: ${room.id}</span>
            </div>
        `;
        roomsContainer.appendChild(roomDiv);
    });

    // Show hall details page
    document.getElementById('roomsOverview').classList.add('hidden');
    document.getElementById('hallDetails').classList.remove('hidden');
}

// Mobile menu toggle and profile initialization
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Button ripple effect
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function (e) {
            if (this.textContent.includes('Back to Rooms') || this.textContent.includes('Start Booking')) {
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
});