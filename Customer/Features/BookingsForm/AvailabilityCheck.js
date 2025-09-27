document.addEventListener('DOMContentLoaded', function () {
    // Get current date
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];

    // Set min date to today
    document.getElementById('booking-date').min = today;

    // Hall costs per hour
    const hallCosts = {
        compact: 1500,
        classic: 2500,
        grand: 4000
    };

    // Beverage prices
    const beveragePrices = {
        tea: 15,
        coffee: 25,
        juice: 35,
        snacks: 45,
        water: 10
    };

    // Room data with images
    const roomData = {
        compact: [
            {
                id: '#001',
                name: 'Room #001',
                tables: 1,
                chairs: 25,
                image: 'https://i.pinimg.com/1200x/4f/33/db/4f33db3e033a8f5d2ed3f87ba753e221.jpg'
            },
            {
                id: '#002',
                name: 'Room #002',
                tables: 1,
                chairs: 25,
                image: 'https://media.istockphoto.com/id/158587251/photo/multi-function-room-garden.jpg?s=612x612&w=0&k=20&c=V4LqcXmhAmY6crAAyjrQaOM05iz9Yt14Ie5YkaMkc7c='
            },
            {
                id: '#003',
                name: 'Room #003',
                tables: 1,
                chairs: 25,
                image: 'https://media.istockphoto.com/id/1414903724/photo/conference-round-table-and-chairs.jpg?s=612x612&w=0&k=20&c=07g8JfGsos8eCHwb_zvV2_aYOnHcxSDsek0_tjIsLyY='
            },
            {
                id: '#004',
                name: 'Room #004',
                tables: 1,
                chairs: 25,
                image: 'https://i.pinimg.com/736x/2b/93/8d/2b938d18466bc7f95cc10cc87dea0678.jpg'
            }
        ],
        classic: [
            {
                id: '#005',
                name: 'Hall #005',
                tables: 1,
                chairs: 45,
                image: 'https://media.istockphoto.com/id/1479587535/photo/eco-friendly-open-plan-modern-office-interior-with-meeting-room-wooden-meeting-table-yellow.jpg?s=612x612&w=0&k=20&c=_ECheLlQXPrgvcffXv6hOehCxrrpBLkio-Y5x4TYnIE='
            },
            {
                id: '#006',
                name: 'Hall #006',
                tables: 1,
                chairs: 45,
                image: 'https://media.istockphoto.com/id/1479587535/photo/eco-friendly-open-plan-modern-office-interior-with-meeting-room-wooden-meeting-table-yellow.jpg?s=612x612&w=0&k=20&c=_ECheLlQXPrgvcffXv6hOehCxrrpBLkio-Y5x4TYnIE='
            },
            {
                id: '#007',
                name: 'Hall #007',
                tables: 1,
                chairs: 45,
                image: 'https://static.vecteezy.com/system/resources/thumbnails/047/802/045/small_2x/wooden-office-interior-with-meeting-table-and-chairs-tv-screen-and-window-photo.jpg'
            },
            {
                id: '#008',
                name: 'Hall #008',
                tables: 1,
                chairs: 45,
                image: 'https://img.freepik.com/premium-photo/board-room-conference-room-meeting-room-white-board-corporate-office_57262-428.jpg'
            }
        ],
        grand: [
            {
                id: '#009',
                name: 'Grand #009',
                tables: 1,
                chairs: 80,
                image: 'https://www.bwpluswandagrand.com/wp-content/uploads/meetings-slide02-1.jpg'
            },
            {
                id: '#010',
                name: 'Grand #010',
                tables: 1,
                chairs: 80,
                image: 'https://www.bwpluswandagrand.com/wp-content/uploads/meetings-slide02-1.jpg'
            },
            {
                id: '#011',
                name: 'Grand #011',
                tables: 1,
                chairs: 80,
                image: 'https://grandecentrepointsukhumvit55.com/upload/Meeting/04.jpg?v=76'
            },
            {
                id: '#012',
                name: 'Grand #012',
                tables: 1,
                chairs: 80,
                image: 'https://www.grandmirage.com/assets/uploads/images/meetings-events/meeting-slide-kecak.jpg'
            }
        ]
    };

    // API URL for JSON Server
    const API_URL = 'http://localhost:3000';

    // Validation functions
    function validateField(fieldId, errorId, validationFn, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(errorId);

        if (validationFn(field.value)) {
            field.classList.remove('error-border');
            field.classList.add('success-border');
            errorElement.style.display = 'none';
            return true;
        } else {
            field.classList.remove('success-border');
            field.classList.add('error-border');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            return false;
        }
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateMobile(mobile) {
        const mobileRegex = /^[0-9]{10}$/;
        return mobileRegex.test(mobile);
    }

    // Real-time validation
    document.getElementById('first-name').addEventListener('input', function () {
        validateField('first-name', 'first-name-error',
            (value) => value.trim().length > 0,
            'First name is required');
    });

    document.getElementById('last-name').addEventListener('input', function () {
        validateField('last-name', 'last-name-error',
            (value) => value.trim().length > 0,
            'Last name is required');
    });

    document.getElementById('email').addEventListener('input', function () {
        validateField('email', 'email-error',
            validateEmail,
            'Please enter a valid email address');
    });

    document.getElementById('mobile-number').addEventListener('input', function () {
        validateField('mobile-number', 'mobile-number-error',
            validateMobile,
            'Mobile number must be exactly 10 digits');
    });

    document.getElementById('address').addEventListener('input', function () {
        validateField('address', 'address-error',
            (value) => value.trim().length >= 10,
            'Address must be at least 10 characters long');
    });

    document.getElementById('purpose').addEventListener('input', function () {
        validateField('purpose', 'purpose-error',
            (value) => value.trim().length >= 10,
            'Purpose must be at least 10 characters long');
    });

    // Date and time validation
    document.getElementById('booking-date').addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        validateField('booking-date', 'booking-date-error',
            () => selectedDate >= today,
            'Booking date must be today or in the future');
    });

    document.getElementById('check-in-time').addEventListener('change', function () {
        validateTimeFields();
    });

    document.getElementById('check-out-time').addEventListener('change', function () {
        validateTimeFields();
    });

    function validateTimeFields() {
        const checkInTime = document.getElementById('check-in-time').value;
        const checkOutTime = document.getElementById('check-out-time').value;
        const bookingDate = document.getElementById('booking-date').value;

        if (checkInTime && checkOutTime) {
            const isValid = checkOutTime > checkInTime;
            const errorMessage = 'Check-out time must be after check-in time';

            validateField('check-out-time', 'check-out-time-error',
                () => isValid, errorMessage);

            // Additional validation for today's bookings
            if (bookingDate === today) {
                const now = new Date();
                const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

                validateField('check-in-time', 'check-in-time-error',
                    () => checkInTime > currentTime,
                    'Check-in time must be in the future for today\'s bookings');
            }
        }
    }

    // Update step indicators
    function updateSteps(activeStep) {
        const steps = ['step1', 'step2', 'step3', 'step4'];
        steps.forEach((step, index) => {
            const element = document.getElementById(step);
            if (index < activeStep - 1) {
                element.className = 'step-indicator completed';
                element.innerHTML = '✓';
            } else if (index === activeStep - 1) {
                element.className = 'step-indicator active';
                element.innerHTML = activeStep;
            } else {
                element.className = 'step-indicator';
                element.innerHTML = index + 1;
            }
        });
    }

    // Function to check room availability dynamically
    async function checkRoomAvailability(category, date, checkInTime, checkOutTime) {
        try {
            const response = await fetch(`${API_URL}/bookings`);
            const bookings = await response.json();

            const availabilityStatus = {};

            // Initialize all rooms as available
            roomData[category].forEach(room => {
                availabilityStatus[room.id] = true;
            });

            // Check for conflicts
            bookings.forEach(booking => {
                if (booking.date === date && booking.venueCategory === category) {
                    const bookingCheckIn = booking.checkInTime;
                    const bookingCheckOut = booking.checkOutTime;

                    // Check for time overlap
                    const hasOverlap = (
                        (checkInTime >= bookingCheckIn && checkInTime < bookingCheckOut) ||
                        (checkOutTime > bookingCheckIn && checkOutTime <= bookingCheckOut) ||
                        (checkInTime <= bookingCheckIn && checkOutTime >= bookingCheckOut)
                    );

                    if (hasOverlap) {
                        availabilityStatus[booking.roomId] = false;
                    }
                }
            });

            return availabilityStatus;
        } catch (error) {
            console.error('Error checking availability:', error);
            // Return all rooms as available if there's an error
            const availabilityStatus = {};
            roomData[category].forEach(room => {
                availabilityStatus[room.id] = true;
            });
            return availabilityStatus;
        }
    }

    // Function to create room card HTML
    function createRoomCard(room, isAvailable, category) {
        const buttonText = category === 'grand' ? 'Select Grand Hall' :
            category === 'classic' ? 'Select Hall' : 'Select Room';

        return `
            <div class="room-card ${category} card-hover ${isAvailable ? 'bg-white' : 'bg-gray-100 opacity-60'} rounded-2xl p-6 cursor-${isAvailable ? 'pointer' : 'not-allowed'} border-2 border-${isAvailable ? 'transparent hover:border-primary-blue/30' : 'gray-200'}"
                data-room="${room.id}" data-available="${isAvailable}">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold ${isAvailable ? 'text-gray-900' : 'text-gray-500'} text-lg">${room.name}</h3>
                    <div class="w-3 h-3 ${isAvailable ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500'} rounded-full"></div>
                </div>
                <div class="h-32 ${isAvailable ? 'bg-gradient-to-br from-light-blue to-blue-100' : 'bg-gray-200'} rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <img src="${room.image}" alt="${room.name}" class="h-full w-full object-cover rounded-xl ${isAvailable ? '' : 'opacity-50'}">
                </div>
                <div class="space-y-2 mb-4">
                    <p class="text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-500'} flex items-center">
                        <span class="w-2 h-2 ${isAvailable ? 'bg-primary-blue' : 'bg-gray-400'} rounded-full mr-2"></span>
                        ${room.tables} master table
                    </p>
                    <p class="text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-500'} flex items-center">
                        <span class="w-2 h-2 ${isAvailable ? 'bg-primary-blue' : 'bg-gray-400'} rounded-full mr-2"></span>
                        ${room.chairs} chairs
                    </p>
                </div>
                <button class="w-full ${isAvailable ? 'bg-gradient-to-r from-primary-blue to-dark-blue hover:shadow-lg select-btn' : 'bg-gray-400 cursor-not-allowed not-available-btn'} text-white py-3 px-4 rounded-xl font-medium transition-all duration-300">
                    ${isAvailable ? buttonText : 'Not Available'}
                </button>
            </div>
        `;
    }

    // Function to update room cards with dynamic availability
    async function updateRoomCards(category) {
        if (!category) return;

        const date = document.getElementById('booking-date').value;
        const checkInTime = document.getElementById('check-in-time').value;
        const checkOutTime = document.getElementById('check-out-time').value;

        if (!date || !checkInTime || !checkOutTime) {
            showNotification('Please select date and time first', 'error');
            return;
        }

        const roomCardsContainer = document.getElementById('room-cards-container');
        const roomCardsSection = document.getElementById('room-cards');

        // Show loading state
        roomCardsContainer.innerHTML = '<div class="col-span-full text-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div><p class="mt-4 text-gray-600">Checking availability...</p></div>';
        roomCardsSection.classList.remove('hidden');

        try {
            const availabilityStatus = await checkRoomAvailability(category, date, checkInTime, checkOutTime);

            // Generate room cards HTML
            const roomCardsHTML = roomData[category].map(room =>
                createRoomCard(room, availabilityStatus[room.id], category)
            ).join('');

            roomCardsContainer.innerHTML = roomCardsHTML;

            // Add staggered animation
            const cards = roomCardsContainer.querySelectorAll('.room-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });

        } catch (error) {
            console.error('Error updating room cards:', error);
            roomCardsContainer.innerHTML = '<div class="col-span-full text-center py-8 text-red-600"><p>Error loading rooms. Please try again.</p></div>';
        }
    }

    // Category change event
    document.getElementById('venue-category').addEventListener('change', (e) => {
        const category = e.target.value;
        const roomInput = document.getElementById('select-room');
        roomInput.value = '';

        if (category) {
            updateRoomCards(category);
        } else {
            document.getElementById('room-cards').classList.add('hidden');
        }
        updateCostSummary();
    });

    // Room card selection
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button && button.classList.contains('select-btn')) {
            const card = button.closest('.room-card');
            const roomId = card.dataset.room;
            const isAvailable = card.dataset.available === 'true';

            if (!isAvailable) return;

            // Clear previous selections
            document.querySelectorAll('.select-btn').forEach(btn => {
                const originalText = btn.textContent.includes('Grand') ? 'Select Grand Hall' :
                    btn.textContent.includes('Hall') ? 'Select Hall' : 'Select Room';
                btn.textContent = originalText;
                btn.classList.remove('bg-green-600', 'cursor-default');
                btn.classList.add('hover:shadow-lg', 'cursor-pointer');
                btn.closest('.room-card').classList.remove('border-green-400');
            });

            // Set current as selected
            button.textContent = '✓ Selected';
            button.classList.remove('hover:shadow-lg', 'cursor-pointer');
            button.classList.add('bg-green-900', 'cursor-default');
            card.classList.add('border-green-400');
            document.getElementById('select-room').value = roomId;

            // Animation
            card.style.transform = 'scale(1.05)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 200);

            updateCostSummary();
        }
    });

    // Enhanced Check Availability button
    document.getElementById('check-availability').addEventListener('click', () => {
        const requiredFields = ['booking-date', 'check-in-time', 'check-out-time', 'venue-category', 'select-room'];
        let isValid = true;

        // Validate each field
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const errorElement = document.getElementById(fieldId + '-error');

            if (!field.value.trim()) {
                field.classList.add('error-border');
                errorElement.style.display = 'block';
                isValid = false;
            }
        });

        // Additional time validation
        const checkInTime = document.getElementById('check-in-time').value;
        const checkOutTime = document.getElementById('check-out-time').value;
        const bookingDate = document.getElementById('booking-date').value;

        if (checkInTime && checkOutTime && checkInTime >= checkOutTime) {
            showNotification('Check-out time must be after check-in time', 'error');
            isValid = false;
        }

        if (bookingDate === today) {
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            if (checkInTime <= currentTime) {
                showNotification('Check-in time must be in the future for today\'s bookings', 'error');
                isValid = false;
            }
        }

        if (isValid) {
            // Animated transition to next step
            const bookingDetails = document.getElementById('booking-details');
            const contactSection = document.getElementById('contact-section');

            bookingDetails.style.transform = 'translateX(-50px)';
            bookingDetails.style.opacity = '0';

            setTimeout(() => {
                bookingDetails.classList.add('hidden');
                contactSection.classList.remove('hidden');
                contactSection.style.transform = 'translateX(50px)';
                contactSection.style.opacity = '0';

                setTimeout(() => {
                    contactSection.style.transform = 'translateX(0)';
                    contactSection.style.opacity = '1';
                }, 50);

                updateSteps(2);
                updateCostSummary();
            }, 300);

            showNotification('Great! Now let\'s get your details.', 'success');
        } else {
            showNotification('Please fill all required fields correctly.', 'error');
        }
    });

    // Back to Venue Details button
    document.getElementById('back-to-venue').addEventListener('click', () => {
        const contactSection = document.getElementById('contact-section');
        const bookingDetails = document.getElementById('booking-details');

        contactSection.style.transform = 'translateX(50px)';
        contactSection.style.opacity = '0';

        setTimeout(() => {
            contactSection.classList.add('hidden');
            bookingDetails.classList.remove('hidden');
            bookingDetails.style.transform = 'translateX(-50px)';
            bookingDetails.style.opacity = '0';

            setTimeout(() => {
                bookingDetails.style.transform = 'translateX(0)';
                bookingDetails.style.opacity = '1';
                bookingDetails.classList.add('active');
            }, 50);

            updateSteps(1);
        }, 300);
    });

    // Beverage options handling
    document.getElementById('beverage-yes').addEventListener('change', () => {
        const options = document.getElementById('beverage-options');
        options.classList.remove('hidden');
        options.style.opacity = '0';
        options.style.transform = 'translateY(20px)';
        setTimeout(() => {
            options.style.opacity = '1';
            options.style.transform = 'translateY(0)';
        }, 100);
        updateCostSummary();
    });

    document.getElementById('beverage-no').addEventListener('change', () => {
        const options = document.getElementById('beverage-options');
        options.style.opacity = '0';
        options.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            options.classList.add('hidden');
        }, 200);

        // Reset all quantities to 0
        document.querySelectorAll('.quantity').forEach(qty => {
            qty.textContent = '0';
        });
        updateCostSummary();
    });

    // Beverage quantity buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('increment-btn')) {
            const item = e.target.dataset.item;
            const quantity = document.querySelector(`[data-item="${item}"].quantity`);
            let current = parseInt(quantity.textContent);
            quantity.textContent = current + 1;

            e.target.style.transform = 'scale(0.9)';
            setTimeout(() => {
                e.target.style.transform = 'scale(1)';
            }, 150);

            updateCostSummary();
        } else if (e.target.classList.contains('decrement-btn')) {
            const item = e.target.dataset.item;
            const quantity = document.querySelector(`[data-item="${item}"].quantity`);
            let current = parseInt(quantity.textContent);
            if (current > 0) {
                quantity.textContent = current - 1;

                e.target.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    e.target.style.transform = 'scale(1)';
                }, 150);

                updateCostSummary();
            }
        }
    });

    // Continue to Preview button
    document.getElementById('continue-to-preview').addEventListener('click', () => {
        const personalFields = ['first-name', 'last-name', 'email', 'mobile-number', 'address', 'purpose'];
        const beverageSelected = document.querySelector('input[name="beverage"]:checked');
        const termsAccepted = document.getElementById('terms').checked;

        let isValid = true;

        // Validate personal information fields
        isValid &= validateField('first-name', 'first-name-error',
            (value) => value.trim().length > 0, 'First name is required');

        isValid &= validateField('last-name', 'last-name-error',
            (value) => value.trim().length > 0, 'Last name is required');

        isValid &= validateField('email', 'email-error',
            validateEmail, 'Please enter a valid email address');

        isValid &= validateField('mobile-number', 'mobile-number-error',
            validateMobile, 'Mobile number must be exactly 10 digits');

        isValid &= validateField('address', 'address-error',
            (value) => value.trim().length >= 10, 'Address must be at least 10 characters long');

        isValid &= validateField('purpose', 'purpose-error',
            (value) => value.trim().length >= 10, 'Purpose must be at least 10 characters long');

        // Validate beverage selection
        if (!beverageSelected) {
            document.getElementById('beverage-error').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('beverage-error').style.display = 'none';
        }

        // Validate terms acceptance
        if (!termsAccepted) {
            document.getElementById('terms-error').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('terms-error').style.display = 'none';
        }

        if (isValid) {
            showPreview();
        } else {
            showNotification('Please fill all required fields correctly.', 'error');
        }
    });

    // Function to show preview
    function showPreview() {
        const contactSection = document.getElementById('contact-section');
        const previewSection = document.getElementById('preview-section');
        const previewContent = document.getElementById('preview-content');

        // Get all form data
        const bookingData = {
            date: document.getElementById('booking-date').value,
            checkInTime: document.getElementById('check-in-time').value,
            checkOutTime: document.getElementById('check-out-time').value,
            venueCategory: document.getElementById('venue-category').value,
            roomId: document.getElementById('select-room').value,
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            mobileNumber: document.getElementById('mobile-number').value,
            address: document.getElementById('address').value,
            purpose: document.getElementById('purpose').value,
            beverage: document.querySelector('input[name="beverage"]:checked').value
        };

        // Get beverage quantities
        const beverages = {};
        let beverageTotal = 0;
        Object.keys(beveragePrices).forEach(item => {
            const qty = parseInt(document.querySelector(`[data-item="${item}"].quantity`)?.textContent || '0');
            if (qty > 0) {
                beverages[item] = qty;
                beverageTotal += qty * beveragePrices[item];
            }
        });

        // Calculate costs using updateCostSummary logic
        const totalCost = calculateTotalCost(bookingData.venueCategory, bookingData.checkInTime, bookingData.checkOutTime);

        // Format date
        const formattedDate = new Date(bookingData.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Generate beverages HTML
        let beveragesHTML = '';
        if (bookingData.beverage === 'yes' && Object.keys(beverages).length > 0) {
            beveragesHTML = `
                <div class="bg-orange-50 rounded-xl p-4">
                    <h5 class="font-semibold text-gray-900 mb-3 flex items-center">
                        <span class="text-orange-500 mr-2">🍽️</span>
                        Refreshments
                    </h5>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        ${Object.entries(beverages).map(([item, qty]) => `
                            <div class="flex justify-between">
                                <span>${qty}x ${item.charAt(0).toUpperCase() + item.slice(1)}</span>
                                <span class="font-medium">₹${qty * beveragePrices[item]}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="border-t border-orange-200 mt-2 pt-2 flex justify-between font-semibold">
                        <span>Refreshments Total:</span>
                        <span class="text-orange-600">₹${beverageTotal}</span>
                    </div>
                </div>
            `;
        } else {
            beveragesHTML = `
                <div class="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                    <span class="text-2xl mb-2 block">🚫</span>
                    No refreshments selected
                </div>
            `;
        }

        // Generate preview HTML
        previewContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Venue Details -->
                <div class="space-y-6">
                    <div class="bg-blue-50 rounded-xl p-6">
                        <h4 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span class="text-blue-500 mr-2">🏢</span>
                            Venue Details
                        </h4>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Date:</span>
                                <span class="font-medium">${formattedDate}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Time:</span>
                                <span class="font-medium">${bookingData.checkInTime} - ${bookingData.checkOutTime}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Category:</span>
                                <span class="font-medium capitalize">${bookingData.venueCategory}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Room:</span>
                                <span class="font-medium">${bookingData.roomId}</span>
                            </div>
                            <div class="border-t border-blue-200 pt-3 flex justify-between font-semibold text-lg">
                                <span>Venue Cost:</span>
                                <span class="text-blue-600">₹${totalCost - beverageTotal}</span>
                            </div>
                        </div>
                    </div>

                    ${beveragesHTML}
                </div>

                <!-- Personal Information -->
                <div class="space-y-6">
                    <div class="bg-green-50 rounded-xl p-6">
                        <h4 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span class="text-green-500 mr-2">👤</span>
                            Personal Information
                        </h4>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Name:</span>
                                <span class="font-medium">${bookingData.firstName} ${bookingData.lastName}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Email:</span>
                                <span class="font-medium">${bookingData.email}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Mobile:</span>
                                <span class="font-medium">${bookingData.mobileNumber}</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-purple-50 rounded-xl p-6">
                        <h5 class="font-semibold text-gray-900 mb-3 flex items-center">
                            <span class="text-purple-500 mr-2">📍</span>
                            Address
                        </h5>
                        <p class="text-gray-700">${bookingData.address}</p>
                    </div>

                    <div class="bg-yellow-50 rounded-xl p-6">
                        <h5 class="font-semibold text-gray-900 mb-3 flex items-center">
                            <span class="text-yellow-500 mr-2">🎯</span>
                            Purpose
                        </h5>
                        <p class="text-gray-700">${bookingData.purpose}</p>
                    </div>
                </div>
            </div>

            <!-- Total Cost -->
            <div class="mt-8 bg-gradient-to-r from-primary-blue to-dark-blue rounded-xl p-6 text-white text-center">
                <h4 class="text-2xl font-bold mb-2">Total Booking Cost</h4>
                <p class="text-4xl font-bold">₹${totalCost}</p>
                <p class="mt-2 opacity-90">All inclusive</p>
            </div>
        `;

        // Animate transition to preview
        contactSection.style.transform = 'translateX(-50px)';
        contactSection.style.opacity = '0';

        setTimeout(() => {
            contactSection.classList.add('hidden');
            previewSection.classList.remove('hidden');
            previewSection.style.transform = 'translateX(50px)';
            previewSection.style.opacity = '0';

            setTimeout(() => {
                previewSection.style.transform = 'translateX(0)';
                previewSection.style.opacity = '1';
            }, 50);

            updateSteps(3);
        }, 300);

        showNotification('Please review your booking details', 'success');
    }

    // Back to edit button
    document.getElementById('back-to-edit').addEventListener('click', () => {
        const previewSection = document.getElementById('preview-section');
        const contactSection = document.getElementById('contact-section');

        previewSection.style.transform = 'translateX(50px)';
        previewSection.style.opacity = '0';

        setTimeout(() => {
            previewSection.classList.add('hidden');
            contactSection.classList.remove('hidden');
            contactSection.style.transform = 'translateX(-50px)';
            contactSection.style.opacity = '0';

            setTimeout(() => {
                contactSection.style.transform = 'translateX(0)';
                contactSection.style.opacity = '1';
            }, 50);

            updateSteps(2);
        }, 300);
    });

    // Proceed to payment button
    document.getElementById('proceed-to-payment').addEventListener('click', async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        if (!userId) {
            showNotification('Please log in to book a venue.', 'error');
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 2000);
            return;
        }

        // Show loading state
        const paymentBtn = document.getElementById('proceed-to-payment');
        const originalText = paymentBtn.innerHTML;
        paymentBtn.innerHTML = `
            <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 1 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </span>
        `;
        paymentBtn.disabled = true;

        const bookingDate = document.getElementById('booking-date').value;
        const checkInTime = document.getElementById('check-in-time').value;
        const checkOutTime = document.getElementById('check-out-time').value;
        const venueCategory = document.getElementById('venue-category').value;
        const roomId = document.getElementById('select-room').value;
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const mobileNumber = document.getElementById('mobile-number').value;
        const address = document.getElementById('address').value;
        const purpose = document.getElementById('purpose').value;
        const beverage = document.querySelector('input[name="beverage"]:checked').value;

        const beverages = {};
        Object.keys(beveragePrices).forEach(item => {
            const qty = parseInt(document.querySelector(`[data-item="${item}"].quantity`)?.textContent || '0');
            if (qty > 0) {
                beverages[item] = qty;
            }
        });

        const today = new Date();
        let day = today.getDate();
        let month = today.getMonth() + 1;
        let year = today.getFullYear();

        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;

        const BookedOn = `${day}/${month}/${year}`;

        // Use the same cost calculation logic as updateCostSummary
        const totalCost = calculateTotalCost(venueCategory, checkInTime, checkOutTime);

        const bookingData = {
            userId: parseInt(userId),
            date: bookingDate,
            checkInTime,
            checkOutTime,
            venueCategory,
            roomId,
            firstName,
            lastName,
            email,
            mobileNumber,
            address,
            purpose,
            beverage,
            beverages,
            BookedOn,
            totalCost,
            status: 'booked'
        };

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                updateSteps(4);
                showConfirmation(bookingData);
            } else {
                showNotification('Error creating booking. Please try again.', 'error');
                paymentBtn.innerHTML = originalText;
                paymentBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error during booking:', error);
            showNotification('An error occurred. Please try again later.', 'error');
            paymentBtn.innerHTML = originalText;
            paymentBtn.disabled = false;
        }
    });

    // Function to create confetti
    function createConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#facc15', '#0284c7', '#10b981', '#ef4444', '#8b5cf6'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.animationDuration = `${Math.random() * 2 + 3}s`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(confetti);

            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // Function to show confirmation modal (Updated to stay until user dismisses)
    function showConfirmation(bookingData) {
        alert("Booking Sucessfull!,Invoice will be generated soon.")
        const modal = document.getElementById('confirmation-modal');
        const confirmationDetails = document.getElementById('confirmation-details');

        // Format date
        const formattedDate = new Date(bookingData.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Generate beverages list
        let beveragesList = '';
        if (bookingData.beverage === 'yes' && Object.keys(bookingData.beverages).length > 0) {
            beveragesList = Object.entries(bookingData.beverages).map(([item, qty]) =>
                `<div class="flex justify-between"><span>${qty}x ${item.charAt(0).toUpperCase() + item.slice(1)}</span><span>₹${qty * beveragePrices[item]}</span></div>`
            ).join('');
        } else {
            beveragesList = '<div class="text-gray-500 text-center">No refreshments</div>';
        }

        confirmationDetails.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-semibold text-gray-600">Booking ID:</span>
                        <div class="font-mono text-primary-blue">#${Date.now().toString().slice(-6)}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Date:</span>
                        <div>${formattedDate}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Time:</span>
                        <div>${bookingData.checkInTime} - ${bookingData.checkOutTime}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Room:</span>
                        <div>${bookingData.roomId}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Category:</span>
                        <div class="capitalize">${bookingData.venueCategory}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Purpose:</span>
                        <div>${bookingData.purpose}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Customer:</span>
                        <div>${bookingData.firstName} ${bookingData.lastName}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Email:</span>
                        <div>${bookingData.email}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Mobile:</span>
                        <div>${bookingData.mobileNumber}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Address:</span>
                        <div>${bookingData.address}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Booked On:</span>
                        <div>${bookingData.BookedOn}</div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-600">Total Cost:</span>
                        <div class="text-xl font-bold text-green-600">₹${bookingData.totalCost}</div>
                    </div>
                </div>

                <div class="border-t pt-4">
                    <span class="font-semibold text-gray-600 block mb-2">Refreshments:</span>
                    <div class="space-y-1 text-sm">
                        ${beveragesList}
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        setTimeout(() => {
            modal.querySelector('div').style.transform = 'scale(1)';
            createConfetti();
        }, 100);

        // Add event listeners for modal buttons
        document.getElementById('view-bookings-btn').onclick = () => {
            window.location.href = '../MyBookings/mybookings.html';
        };

        document.getElementById('close-confirmation').onclick = () => {
            modal.classList.add('hidden');
            modal.querySelector('div').style.transform = 'scale(0)';
        };

        // Close modal when clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.querySelector('div').style.transform = 'scale(0)';
            }
        };
    }

    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-24 right-6 z-50 p-4 rounded-xl shadow-lg transform translate-x-full transition-all duration-300 ${type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
            }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Function to calculate total cost (Same logic as updateCostSummary)
    function calculateTotalCost(venueCategory, checkInTime, checkOutTime) {
        if (!venueCategory || !checkInTime || !checkOutTime) return 0;

        // Convert times into minutes
        const [inHour, inMin] = checkInTime.split(':').map(Number);
        const [outHour, outMin] = checkOutTime.split(':').map(Number);

        let durationMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);

        if (durationMinutes <= 0) {
            console.warn("Check-out time must be after check-in time");
            return 0;
        }

        // Apply billing rules
        let hours;
        if (durationMinutes <= 60) {
            hours = 1; // Minimum 1 hour
        } else {
            const fullHours = Math.floor(durationMinutes / 60);
            const remainingMinutes = durationMinutes % 60;

            if (remainingMinutes <= 15) {
                hours = fullHours; // don't round up
            } else {
                hours = fullHours + 1; // round up
            }
        }

        const hallCost = hallCosts[venueCategory] * hours;

        let beverageCost = 0;
        Object.keys(beveragePrices).forEach(item => {
            const qty = parseInt(document.querySelector(`[data-item="${item}"].quantity`)?.textContent || '0');
            beverageCost += qty * beveragePrices[item];
        });

        return hallCost + beverageCost;
    }

    // Function to update cost summary (Corrected logic)
    function updateCostSummary() {
        const venueCategory = document.getElementById('venue-category').value;
        const checkInTime = document.getElementById('check-in-time').value;
        const checkOutTime = document.getElementById('check-out-time').value;
        const roomId = document.getElementById('select-room').value;

        if (venueCategory && checkInTime && checkOutTime && roomId) {
            const costSummary = document.getElementById('cost-summary');
            const summaryDetails = document.getElementById('summary-details');
            const totalCostElement = document.getElementById('total-cost');

            costSummary.classList.remove('hidden');

            // Convert times into minutes
            const [inHour, inMin] = checkInTime.split(':').map(Number);
            const [outHour, outMin] = checkOutTime.split(':').map(Number);

            let durationMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);

            if (durationMinutes <= 0) {
                showNotification("Check-out time must be after check-in time", "error");
                return;
            }

            // Apply billing rules
            let hours;
            if (durationMinutes <= 60) {
                hours = 1; // Minimum 1 hour
            } else {
                const fullHours = Math.floor(durationMinutes / 60);
                const remainingMinutes = durationMinutes % 60;

                if (remainingMinutes <= 15) {
                    hours = fullHours; // don't round up
                } else {
                    hours = fullHours + 1; // round up
                }
            }

            const hallCost = hallCosts[venueCategory] * hours;

            let beverageCost = 0;
            let beverageDetails = '';

            Object.keys(beveragePrices).forEach(item => {
                const qty = parseInt(document.querySelector(`[data-item="${item}"].quantity`)?.textContent || '0');
                if (qty > 0) {
                    beverageCost += qty * beveragePrices[item];
                    beverageDetails += `
            <div class="flex justify-between">
                <span>${qty}x ${item.charAt(0).toUpperCase() + item.slice(1)}</span>
                <span>₹${qty * beveragePrices[item]}</span>
            </div>`;
                }
            });

            const totalCost = hallCost + beverageCost;

            summaryDetails.innerHTML = `
                        <div class="flex justify-between">
                            <span>Room ${roomId}</span>
                            <span>${venueCategory.charAt(0).toUpperCase() + venueCategory.slice(1)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>${hours} hour(s)</span>
                            <span>₹${hallCost}</span>
                        </div>
                        ${beverageDetails}
                    `;

            totalCostElement.textContent = `₹${totalCost}`;
        } else {
            document.getElementById('cost-summary').classList.add('hidden');
        }
    }

    // Event listeners for cost summary updates
    ['booking-date', 'check-in-time', 'check-out-time', 'venue-category'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateCostSummary);
    });

    // Initialize cost summary
    updateCostSummary();
});