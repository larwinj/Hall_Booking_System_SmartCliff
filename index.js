// Enhanced room availability search functionality
const categorySelect = document.getElementById("category");
const roomSelect = document.getElementById("room");
const searchButton = document.querySelector('.hero-section button');

// Create results container that will be shown after search
const searchForm = document.querySelector('.search-form');
const resultsContainer = document.createElement('div');
resultsContainer.id = 'search-results';
resultsContainer.className = 'hidden mt-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl glass-effect border border-white/30 p-4 sm:p-6';
searchForm.parentNode.insertBefore(resultsContainer, searchForm.nextSibling);

const rooms = {
    compact: ["#001", "#002", "#003", "#004"],
    classic: ["#005", "#006", "#007", "#008"],
    grand: ["#009", "#010", "#011", "#012"]
};

// Fetch halls data from API
let hallsData = [];
async function fetchHallsData() {
    try {
        const response = await fetch('https://mpnt1qbp-3000.inc1.devtunnels.ms/halls');
        hallsData = await response.json();
    } catch (error) {
        console.error('Error fetching halls data:', error);
        // Fallback data if API fails
        hallsData = [
            {
                "id": 1,
                "name": "Compact Hall",
                "capacity": "10-20",
                "pricePerHour": 1500,
                "image": "https://media.istockphoto.com/id/1077431262/photo/small-conference-room-with-whiteboard-on-blue-wall.jpg?s=612x612&w=0&k=20&c=SXlqI9JIh1UOyg3JcvbwsmrAHZRFwKLOThdSNvWoo-I=",
                "amenities": ["High Speed WiFi", "Power Backup", "Television", "Whiteboard", "AC"],
                "rooms": [
                    {"roomNumber": "#001", "status": "active", "image": "https://media.istockphoto.com/id/1077431262/photo/small-conference-room-with-whiteboard-on-blue-wall.jpg?s=612x612&w=0&k=20&c=SXlqI9JIh1UOyg3JcvbwsmrAHZRFwKLOThdSNvWoo-I="},
                    {"roomNumber": "#002", "status": "active", "image": "https://media.istockphoto.com/id/158587251/photo/multi-function-room-garden.jpg?s=612x612&w=0&k=20&c=V4LqcXmhAmY6crAAyjrQaOM05iz9Yt14Ie5YkaMkc7c="},
                    {"roomNumber": "#003", "status": "active", "image": "https://media.istockphoto.com/id/1414903724/photo/conference-round-table-and-chairs.jpg?s=612x612&w=0&k=20&c=07g8JfGsos8eCHwb_zvV2_aYOnHcxSDsek0_tjIsLyY="},
                    {"roomNumber": "#004", "status": "active", "image": "https://i.pinimg.com/1200x/08/c0/21/08c021a75b58decc3f6b3d591fbacb03.jpg"}
                ]
            },
            {
                "id": 2,
                "name": "Classic Hall",
                "capacity": "20-50",
                "pricePerHour": 2500,
                "image": "https://media.istockphoto.com/id/1479587535/photo/eco-friendly-open-plan-modern-office-interior-with-meeting-room-wooden-meeting-table-yellow.jpg?s=612x612&w=0&k=20&c=_ECheLlQXPrgvcffXv6hOehCxrrpBLkio-Y5x4TYnIE=",
                "amenities": ["High Speed WiFi", "Power Backup", "Television", "Whiteboard", "AC", "Audio System"],
                "rooms": [
                    {"roomNumber": "#005", "status": "active", "image": "https://media.istockphoto.com/id/1479587535/photo/eco-friendly-open-plan-modern-office-interior-with-meeting-room-wooden-meeting-table-yellow.jpg?s=612x612&w=0&k=20&c=_ECheLlQXPrgvcffXv6hOehCxrrpBLkio-Y5x4TYnIE="},
                    {"roomNumber": "#006", "status": "active", "image": "https://static.vecteezy.com/system/resources/thumbnails/047/802/045/small_2x/wooden-office-interior-with-meeting-table-and-chairs-tv-screen-and-window-photo.jpg"},
                    {"roomNumber": "#007", "status": "active", "image": "https://img.freepik.com/premium-photo/board-room-conference-room-meeting-room-white-board-corporate-office_57262-428.jpg"},
                    {"roomNumber": "#008", "status": "active", "image": "https://i.pinimg.com/736x/82/27/eb/8227eb4461f1d2eaf28996795457670f.jpg"}
                ]
            },
            {
                "id": 3,
                "name": "Grand Hall",
                "capacity": "50-80",
                "pricePerHour": 4000,
                "image": "https://www.bwpluswandagrand.com/wp-content/uploads/meetings-slide02-1.jpg",
                "amenities": ["High Speed WiFi", "Power Backup", "Television", "Whiteboard", "AC", "Audio System", "High powered Projector"],
                "rooms": [
                    {"roomNumber": "#009", "status": "active", "image": "https://www.bwpluswandagrand.com/wp-content/uploads/meetings-slide02-1.jpg"},
                    {"roomNumber": "#010", "status": "active", "image": "https://grandecentrepointsukhumvit55.com/upload/Meeting/04.jpg?v=76"},
                    {"roomNumber": "#011", "status": "active", "image": "https://www.grandmirage.com/assets/uploads/images/meetings-events/meeting-slide-kecak.jpg"},
                    {"roomNumber": "#012", "status": "active", "image": "https://i.pinimg.com/1200x/9e/4d/37/9e4d3767104e0ad9af160e661932ea6e.jpg"}
                ]
            }
        ];
    }
}

// Load halls data on page load
document.addEventListener('DOMContentLoaded', fetchHallsData);

categorySelect.addEventListener("change", function () {
    const selected = this.value;
    roomSelect.innerHTML = '<option value="">Select a room</option>';

    if (rooms[selected]) {
        rooms[selected].forEach(room => {
            const option = document.createElement("option");
            option.value = room;
            option.textContent = `Room ${room}`;
            roomSelect.appendChild(option);
        });
    }
});

// Check room availability
async function checkRoomAvailability(date, checkIn, checkOut, category, specificRoom = null) {
    try {
        const response = await fetch('https://mpnt1qbp-3000.inc1.devtunnels.ms/bookings');
        const bookings = await response.json();
        
        const requestedDate = new Date(date).toDateString();
        const requestedCheckIn = convertTimeToMinutes(checkIn);
        const requestedCheckOut = convertTimeToMinutes(checkOut);
        
        // Filter bookings for the requested date and category
        const conflictingBookings = bookings.filter(booking => {
            if (booking.status === 'cancelled') return false;
            
            const bookingDate = new Date(booking.date).toDateString();
            const bookingCheckIn = convertTimeToMinutes(booking.checkInTime);
            const bookingCheckOut = convertTimeToMinutes(booking.checkOutTime);
            
            // Check if same date and category
            if (bookingDate !== requestedDate || booking.venueCategory !== category) {
                return false;
            }
            
            // Check for time overlap
            return (requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn);
        });
        
        // Get booked room IDs
        const bookedRooms = conflictingBookings.map(booking => booking.roomId);
        
        // Find the hall data for this category
        const hallData = hallsData.find(hall => {
            if (category === 'compact') return hall.name === 'Compact Hall';
            if (category === 'classic') return hall.name === 'Classic Hall';
            if (category === 'grand') return hall.name === 'Grand Hall';
            return false;
        });
        
        if (!hallData) return [];
        
        // Filter available rooms
        let availableRooms = hallData.rooms.filter(room => 
            room.status === 'active' && !bookedRooms.includes(room.roomNumber)
        );
        
        // If specific room is requested, filter further
        if (specificRoom) {
            availableRooms = availableRooms.filter(room => room.roomNumber === specificRoom);
        }
        
        return availableRooms.map(room => ({
            ...room,
            hallData: hallData
        }));
        
    } catch (error) {
        console.error('Error checking availability:', error);
        return [];
    }
}

function convertTimeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Search button functionality
searchButton.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const date = document.querySelector('input[type="date"]').value;
    const checkIn = document.querySelector('input[type="time"]').value;
    const checkOut = document.querySelectorAll('input[type="time"]')[1].value;
    const category = categorySelect.value;
    const specificRoom = roomSelect.value;
    
    // Validation
    if (!date || !checkIn || !checkOut || !category) {
        alert('Please fill in all required fields: Date, Check In, Check Out, and Category');
        return;
    }
    
    // Validate check-in and check-out times
    if (checkIn >= checkOut) {
        alert('Check-out time must be after check-in time');
        return;
    }
    
    // Show loading
    resultsContainer.innerHTML = `
        <div class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p class="text-white mt-4">Searching available rooms...</p>
        </div>
    `;
    resultsContainer.classList.remove('hidden');
    
    try {
        const availableRooms = await checkRoomAvailability(date, checkIn, checkOut, category, specificRoom);
        displaySearchResults(availableRooms, date, checkIn, checkOut, category);
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-300 text-lg">Error searching for rooms. Please try again.</p>
            </div>
        `;
    }
});

function displaySearchResults(availableRooms, date, checkIn, checkOut, category) {
    if (availableRooms.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">No Available Rooms</h3>
                <p class="text-gray-200">Sorry, no rooms are available for the selected date and time.</p>
                <button onclick="document.getElementById('search-results').classList.add('hidden')" 
                        class="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300">
                    Search Again
                </button>
            </div>
        `;
        return;
    }
    
    const hallData = availableRooms[0].hallData;
    const duration = calculateDuration(checkIn, checkOut);
    const totalCost = hallData.pricePerHour * duration;
    
    resultsContainer.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">Available Rooms Found!</h3>
                <div class="text-gray-200 space-y-1">
                    <p><span class="font-medium">Date:</span> ${new Date(date).toLocaleDateString()}</p>
                    <p><span class="font-medium">Time:</span> ${checkIn} - ${checkOut} (${duration}h)</p>
                    <p><span class="font-medium">Category:</span> ${hallData.name}</p>
                </div>
            </div>
            
            <!-- Hall Info -->
            <div class="bg-white/10 rounded-xl p-4 border border-white/20">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="sm:w-1/3">
                        <img src="${hallData.image}" alt="${hallData.name}" 
                             class="w-full h-32 sm:h-24 object-cover rounded-lg">
                    </div>
                    <div class="sm:w-2/3">
                        <h4 class="text-lg font-bold text-white mb-2">${hallData.name}</h4>
                        <p class="text-gray-200 text-sm mb-2">Capacity: ${hallData.capacity} guests</p>
                        <div class="flex flex-wrap gap-2 mb-3">
                            ${hallData.amenities.slice(0, 3).map(amenity => 
                                `<span class="text-xs bg-white/20 text-white px-2 py-1 rounded">${amenity}</span>`
                            ).join('')}
                            ${hallData.amenities.length > 3 ? `<span class="text-xs text-gray-300">+${hallData.amenities.length - 3} more</span>` : ''}
                        </div>
                        <p class="text-xl font-bold text-accent">₹${hallData.pricePerHour}/hr • Total: ₹${totalCost}</p>
                    </div>
                </div>
            </div>
            
            <!-- Available Rooms Grid -->
            <div class="space-y-3">
                <h4 class="text-lg font-bold text-white">Choose Your Room (${availableRooms.length} available)</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${availableRooms.map(room => `
                        <div class="bg-white/10 rounded-xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
                             onclick="selectRoom('${room.roomNumber}', '${date}', '${checkIn}', '${checkOut}', '${category}')">
                            <div class="h-32 relative overflow-hidden">
                                <img src="${room.image}" alt="Room ${room.roomNumber}" 
                                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                <div class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    Available
                                </div>
                            </div>
                            <div class="p-3">
                                <h5 class="font-bold text-white mb-1">Room ${room.roomNumber}</h5>
                                <p class="text-xs text-gray-300 mb-2">${hallData.name}</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium text-accent">₹${totalCost}</span>
                                    <span class="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                                        Select Room
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/20">
                <button onclick="document.getElementById('search-results').classList.add('hidden')" 
                        class="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium">
                    Search Again
                </button>
                <button onclick="showAllAmenities('${category}')"
                        class="flex-1 bg-accent/20 hover:bg-accent/30 text-accent px-4 py-3 rounded-lg transition-all duration-300 font-medium">
                    View All Amenities
                </button>
            </div>
        </div>
    `;
}

function calculateDuration(checkIn, checkOut) {
    const checkInMinutes = convertTimeToMinutes(checkIn);
    const checkOutMinutes = convertTimeToMinutes(checkOut);
    return Math.round((checkOutMinutes - checkInMinutes) / 60 * 100) / 100;
}

function selectRoom(roomNumber, date, checkIn, checkOut, category) {
    // Store booking details in sessionStorage for the login page
    const bookingDetails = {
        roomNumber,
        date,
        checkIn,
        checkOut,
        category,
        timestamp: Date.now()
    };
    
    // Store in localStorage (temporarily, as sessionStorage would be better but we can't use it in artifacts)
    try {
        const existingData = JSON.parse(localStorage.getItem('tempBookingData') || '[]');
        existingData.push(bookingDetails);
        localStorage.setItem('tempBookingData', JSON.stringify(existingData));
    } catch (e) {
        // Fallback if localStorage isn't available
        console.log('Booking details:', bookingDetails);
    }
    
    // Navigate to login page
    window.location.href = './Customer/Features/Auth/LoginSignUp.html';
}

function showAllAmenities(category) {
    const hallData = hallsData.find(hall => {
        if (category === 'compact') return hall.name === 'Compact Hall';
        if (category === 'classic') return hall.name === 'Classic Hall';
        if (category === 'grand') return hall.name === 'Grand Hall';
        return false;
    });
    
    if (!hallData) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${hallData.name} - Amenities</h3>
                    <button onclick="document.body.removeChild(this.closest('.fixed'))" 
                            class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <div class="space-y-3">
                    ${hallData.amenities.map(amenity => `
                        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <span class="text-gray-700 font-medium">${amenity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">
                        <span class="font-medium">Capacity:</span> ${hallData.capacity} guests<br>
                        <span class="font-medium">Rate:</span> ₹${hallData.pricePerHour} per hour
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 100) {
            nav.classList.add('bg-white/95', 'backdrop-blur-sm', 'shadow-md');
        } else {
            nav.classList.remove('bg-white/95', 'backdrop-blur-sm', 'shadow-md');
        }
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.animate-fade-in, .animate-slide-up').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-600', 'ease-out');
    observer.observe(el);
});

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!contactForm.checkValidity()) {
            alert("⚠ Please fill all required fields before submitting.");
            return;
        }
        alert("✅ Thank you for your message! We will get back to you soon.");
        contactForm.reset();
    });
}