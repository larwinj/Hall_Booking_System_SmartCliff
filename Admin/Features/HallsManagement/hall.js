const API_BASE_URL = 'http://localhost:3000';

// Global variables
let hallsData = [];
let isEditMode = false;
let currentEditHallId = null;
let currentEditRoomIndex = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadHallsData();
    initializeEventListeners();
});

// Load halls data from API
async function loadHallsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/halls`);
        if (!response.ok) throw new Error('Failed to fetch halls data');
        
        hallsData = await response.json();
        populateCategorySelect();
        renderHalls();
        hideLoadingSpinner();
    } catch (error) {
        console.error('Error loading halls data:', error);
        showToast('Error', 'Failed to load halls data. Please check your connection.', 'error');
        hideLoadingSpinner();
    }
}

// Populate category select options
function populateCategorySelect() {
    const select = document.getElementById('hallCategory');
    select.innerHTML = '<option value="">Select Hall Category</option>';
    hallsData.forEach(hall => {
        select.innerHTML += `<option value="${hall.id}">${hall.name} (${hall.capacity} people) - ₹${hall.pricePerHour}/hr</option>`;
    });
}

// Render halls on the page
function renderHalls() {
    const container = document.getElementById('hallsContainer');
    container.innerHTML = '';

    hallsData.forEach(hall => {
        const hallSection = document.createElement('div');
        hallSection.className = 'mb-8';
        
        hallSection.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold text-gray-800">${hall.name}</h2>
                <div class="text-base text-gray-600">
                    Capacity: ${hall.capacity} | Price: ₹${hall.pricePerHour}/hr
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                ${hall.rooms.map((room, index) => renderRoomCard(hall, room, index)).join('')}
            </div>
        `;
        
        container.appendChild(hallSection);
    });
}

// Render individual room card
function renderRoomCard(hall, room, roomIndex) {
    const gradients = [
        'from-blue-400 to-blue-600',
        'from-green-400 to-green-600',
        'from-purple-400 to-purple-600',
        'from-red-400 to-red-600',
        'from-indigo-400 to-indigo-600',
        'from-yellow-400 to-yellow-600',
        'from-pink-400 to-pink-600',
        'from-gray-400 to-gray-600',
        'from-teal-400 to-teal-600',
        'from-orange-400 to-orange-600',
        'from-cyan-400 to-cyan-600',
        'from-emerald-400 to-emerald-600'
    ];
    
    const gradientClass = gradients[roomIndex % gradients.length];
    const statusColor = room.status === 'active' ? 'text-green-600' : 'text-red-600';
    const statusText = room.status === 'active' ? 'Active' : 'Inactive';
    const statusToggleText = room.status === 'active' ? 'Deactivate' : 'Activate';

    return `
        <div class="bg-white rounded-xl shadow-xl hover:scale-105 hover:shadow-xl animate-fadeInUp animation-delay-100">
            <div class="h-32 bg-gradient-to-br ${gradientClass} flex items-center justify-center relative">
                ${room.image ? 
                    `<img src="${room.image}" alt="Room ${room.roomNumber}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center absolute" style="display:none;">
                        <span class="text-white font-semibold">Room Image</span>
                        </div>` :
                    `<span class="text-white font-semibold">Room Image</span>`
                }
            </div>
            <div class="p-4">
                <h3 class="text-lg font-medium text-gray-800 mb-2">Room: ${room.roomNumber}</h3>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-base ${statusColor} font-medium">${statusText}</span>
                    <div class="relative">
                        <button onclick="toggleDropdown('dropdown-${hall.id}-${roomIndex}')" 
                            class="text-gray-400 hover:text-gray-600 p-1">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                            </svg>
                        </button>
                        <div id="dropdown-${hall.id}-${roomIndex}" class="hidden absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border z-10">
                            <button onclick="editRoom(${hall.id}, ${roomIndex})" 
                                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md">
                                Edit
                            </button>
                            <button onclick="toggleRoomStatus(${hall.id}, ${roomIndex})" 
                                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                ${statusToggleText}
                            </button>
                            <button onclick="deleteRoom(${hall.id}, ${roomIndex})" 
                                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    <div>Capacity: ${hall.capacity}</div>
                    <div>₹${hall.pricePerHour}/hour</div>
                </div>
            </div>
        </div>
    `;
}

// Initialize event listeners
function initializeEventListeners() {
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');

    mobileMenuBtn?.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
    });

    closeMobileMenu?.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });

    mobileMenu?.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    });

    // Room Dialog functionality
    const addHallBtn = document.getElementById('addHallBtn');
    const hallDialog = document.getElementById('hallDialog');
    const closeDialog = document.getElementById('closeDialog');
    const hallForm = document.getElementById('hallForm');
    const hallCategory = document.getElementById('hallCategory');

    // Add room button
    addHallBtn.addEventListener('click', () => {
        openDialog(false);
    });

    // Close dialog
    closeDialog.addEventListener('click', closeHallDialog);

    // Close dialog on backdrop click
    hallDialog.addEventListener('click', (e) => {
        if (e.target === hallDialog) {
            closeHallDialog();
        }
    });

    // Hall category change
    hallCategory.addEventListener('change', (e) => {
        updateHallDetails(e.target.value);
    });

    // Form submission
    hallForm.addEventListener('submit', handleFormSubmission);

    // Price Dialog functionality
    const updatePriceBtn = document.getElementById('updatePriceBtn');
    const priceDialog = document.getElementById('priceDialog');
    const closePriceDialogBtn = document.getElementById('closePriceDialog');
    const priceForm = document.getElementById('priceForm');

    updatePriceBtn.addEventListener('click', openPriceDialog);

    closePriceDialogBtn.addEventListener('click', closePriceDialog);

    priceDialog.addEventListener('click', (e) => {
        if (e.target === priceDialog) {
            closePriceDialog();
        }
    });

    priceForm.addEventListener('submit', handlePriceSubmission);
}

// Open room dialog for add/edit
function openDialog(editMode, hallId = null, roomIndex = null) {
    isEditMode = editMode;
    currentEditHallId = hallId;
    currentEditRoomIndex = roomIndex;
    
    const dialog = document.getElementById('hallDialog');
    const title = document.getElementById('dialogTitle');
    const submitButton = document.getElementById('submitButtonText');
    
    if (editMode) {
        title.textContent = 'Edit Room';
        submitButton.textContent = 'Update Room';
        populateEditForm();
    } else {
        title.textContent = 'Add New Room';
        submitButton.textContent = 'Add Room';
        document.getElementById('hallForm').reset();
        document.getElementById('hallDetails').classList.add('hidden');
    }
    
    dialog.classList.remove('hidden');
}

// Close room dialog
function closeHallDialog() {
    const dialog = document.getElementById('hallDialog');
    dialog.classList.add('hidden');
    document.getElementById('hallForm').reset();
    document.getElementById('hallDetails').classList.add('hidden');
    isEditMode = false;
    currentEditHallId = null;
    currentEditRoomIndex = null;
}

// Open price dialog
function openPriceDialog() {
    document.getElementById('price1').value = hallsData[0].pricePerHour;
    document.getElementById('price2').value = hallsData[1].pricePerHour;
    document.getElementById('price3').value = hallsData[2].pricePerHour;
    document.getElementById('priceDialog').classList.remove('hidden');
}

// Close price dialog
function closePriceDialog() {
    document.getElementById('priceDialog').classList.add('hidden');
}

// Edit room function (called from rendered cards)
function editRoom(hallId, roomIndex) {
    openDialog(true, hallId, roomIndex);
}

// Populate form for editing
function populateEditForm() {
    if (!isEditMode || currentEditHallId === null || currentEditRoomIndex === null) return;
    
    const hall = hallsData.find(h => h.id === currentEditHallId);
    const room = hall.rooms[currentEditRoomIndex];
    
    document.getElementById('hallCategory').value = hall.id;
    document.getElementById('roomNumber').value = room.roomNumber;
    document.getElementById('roomImage').value = room.image || '';
    
    // Set status
    const statusRadio = document.querySelector(`input[name="roomStatus"][value="${room.status}"]`);
    if (statusRadio) statusRadio.checked = true;
    
    updateHallDetails(hall.id);
}

// Update hall details display
function updateHallDetails(hallId) {
    const detailsDiv = document.getElementById('hallDetails');
    
    if (!hallId) {
        detailsDiv.classList.add('hidden');
        return;
    }
    
    const hall = hallsData.find(h => h.id == hallId);
    if (!hall) return;
    
    document.getElementById('hallCapacityDisplay').textContent = hall.capacity;
    document.getElementById('hallPriceDisplay').textContent = `₹${hall.pricePerHour}/hour`;
    
    const amenitiesDiv = document.getElementById('hallAmenitiesDisplay');
    amenitiesDiv.innerHTML = hall.amenities.map(amenity => 
        `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${amenity}</span>`
    ).join(' ');
    
    detailsDiv.classList.remove('hidden');
}

// Handle room form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const hallCategoryId = parseInt(formData.get('hallCategory'));
    const roomNumber = formData.get('roomNumber').trim();
    const roomImage = formData.get('roomImage').trim();
    const roomStatus = formData.get('roomStatus');
    
    // Validation
    if (!hallCategoryId || !roomNumber || !roomStatus) {
        showToast('Error', 'Please fill in all required fields.', 'error');
        return;
    }

    const hall = hallsData.find(h => h.id === hallCategoryId);
    if (!hall) {
        showToast('Error', 'Invalid hall category selected.', 'error');
        return;
    }

    // Check for duplicate room numbers (except when editing the same room)
    const duplicateCheck = hall.rooms.find((room, index) => {
        if (isEditMode && currentEditHallId === hallCategoryId && currentEditRoomIndex === index) {
            return false; // Skip current room when editing
        }
        return room.roomNumber === roomNumber;
    });

    if (duplicateCheck) {
        showToast('Error', `Room number ${roomNumber} already exists in this hall category.`, 'error');
        return;
    }

    try {
        if (isEditMode) {
            await updateRoom(hallCategoryId, roomNumber, roomImage, roomStatus);
        } else {
            await addNewRoom(hallCategoryId, roomNumber, roomImage, roomStatus);
        }
    } catch (error) {
        console.error('Error saving room:', error);
        showToast('Error', 'Failed to save room. Please try again.', 'error');
    }
}

// Add new room
async function addNewRoom(hallCategoryId, roomNumber, roomImage, roomStatus) {
    const hall = hallsData.find(h => h.id === hallCategoryId);
    
    const newRoom = {
        roomNumber: roomNumber,
        status: roomStatus,
        image: roomImage || `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=200&fit=crop`
    };
    
    hall.rooms.push(newRoom);
    
    // Update database
    const response = await fetch(`${API_BASE_URL}/halls/${hallCategoryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(hall)
    });
    
    if (!response.ok) throw new Error('Failed to add room');
    
    renderHalls();
    closeHallDialog();
    showToast('Success', `Room ${roomNumber} added successfully!`, 'success');
}

// Update existing room
async function updateRoom(hallCategoryId, roomNumber, roomImage, roomStatus) {
    const hall = hallsData.find(h => h.id === hallCategoryId);
    
    // If editing room in different hall category, move it
    if (currentEditHallId !== hallCategoryId) {
        // Remove from old hall
        const oldHall = hallsData.find(h => h.id === currentEditHallId);
        const roomToMove = oldHall.rooms[currentEditRoomIndex];
        oldHall.rooms.splice(currentEditRoomIndex, 1);
        
        // Update old hall in database
        await fetch(`${API_BASE_URL}/halls/${currentEditHallId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(oldHall)
        });
        
        // Add to new hall
        const newRoom = {
            roomNumber: roomNumber,
            status: roomStatus,
            image: roomImage || roomToMove.image || `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=200&fit=crop`
        };
        hall.rooms.push(newRoom);
    } else {
        // Update in same hall
        hall.rooms[currentEditRoomIndex] = {
            roomNumber: roomNumber,
            status: roomStatus,
            image: roomImage || hall.rooms[currentEditRoomIndex].image || `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=200&fit=crop`
        };
    }
    
    // Update database
    const response = await fetch(`${API_BASE_URL}/halls/${hallCategoryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(hall)
    });
    
    if (!response.ok) throw new Error('Failed to update room');
    
    renderHalls();
    closeHallDialog();
    showToast('Success', `Room ${roomNumber} updated successfully!`, 'success');
}

// Handle price form submission
async function handlePriceSubmission(e) {
    e.preventDefault();
    
    const price1 = parseInt(document.getElementById('price1').value);
    const price2 = parseInt(document.getElementById('price2').value);
    const price3 = parseInt(document.getElementById('price3').value);
    
    if (isNaN(price1) || isNaN(price2) || isNaN(price3) || price1 <= 0 || price2 <= 0 || price3 <= 0) {
        showToast('Error', 'Please enter valid positive prices for all categories.', 'error');
        return;
    }

    hallsData[0].pricePerHour = price1;
    hallsData[1].pricePerHour = price2;
    hallsData[2].pricePerHour = price3;

    try {
        for (const hall of hallsData) {
            const response = await fetch(`${API_BASE_URL}/halls/${hall.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(hall)
            });
            if (!response.ok) throw new Error('Failed to update hall price');
        }
        
        populateCategorySelect();
        renderHalls();
        closePriceDialog();
        showToast('Success', 'Prices updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating prices:', error);
        showToast('Error', 'Failed to update prices. Please try again.', 'error');
    }
}

// Show toast notification
function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set icon based on type
    if (type === 'success') {
        toastIcon.innerHTML = '<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>';
    } else if (type === 'error') {
        toastIcon.innerHTML = '<div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>';
    } else {
        toastIcon.innerHTML = '<div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';
    }
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    toast.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}

// Hide loading spinner
function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    spinner.classList.add('hidden');
}

// Delete room function
async function deleteRoom(hallId, roomIndex) {
    const hall = hallsData.find(h => h.id === hallId);
    const room = hall.rooms[roomIndex];
    
    if (!confirm(`Are you sure you want to delete room ${room.roomNumber}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        // Remove room from array
        hall.rooms.splice(roomIndex, 1);
        
        // Update database
        const response = await fetch(`${API_BASE_URL}/halls/${hallId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(hall)
        });
        
        if (!response.ok) throw new Error('Failed to delete room');
        
        renderHalls();
        showToast('Success', `Room ${room.roomNumber} deleted successfully!`, 'success');
    } catch (error) {
        console.error('Error deleting room:', error);
        showToast('Error', 'Failed to delete room. Please try again.', 'error');
    }
}

// Toggle room status
async function toggleRoomStatus(hallId, roomIndex) {
    const hall = hallsData.find(h => h.id === hallId);
    const room = hall.rooms[roomIndex];
    
    try {
        // Toggle status
        room.status = room.status === 'active' ? 'inactive' : 'active';
        
        // Update database
        const response = await fetch(`${API_BASE_URL}/halls/${hallId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(hall)
        });
        
        if (!response.ok) throw new Error('Failed to update room status');
        
        renderHalls();
        showToast('Success', `Room ${room.roomNumber} status updated to ${room.status}!`, 'success');
    } catch (error) {
        console.error('Error updating room status:', error);
        showToast('Error', 'Failed to update room status. Please try again.', 'error');
    }
}

// Toggle dropdown menu
function toggleDropdown(dropdownId) {
    // Close all other dropdowns
    document.querySelectorAll('[id^="dropdown-"]').forEach(dropdown => {
        if (dropdown.id !== dropdownId) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Toggle current dropdown
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('[id^="dropdown-"]') && !e.target.closest('button[onclick*="toggleDropdown"]')) {
        document.querySelectorAll('[id^="dropdown-"]').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    }
});

// Refresh data function
async function refreshHallsData() {
    showToast('Info', 'Refreshing halls data...', 'info');
    await loadHallsData();
}

// Search functionality
function searchRooms(query) {
    const searchTerm = query.toLowerCase().trim();
    const container = document.getElementById('hallsContainer');
    
    if (!searchTerm) {
        renderHalls();
        return;
    }
    
    container.innerHTML = '';
    
    hallsData.forEach(hall => {
        const filteredRooms = hall.rooms.filter(room => 
            room.roomNumber.toLowerCase().includes(searchTerm) ||
            room.status.toLowerCase().includes(searchTerm)
        );
        
        if (filteredRooms.length > 0) {
            const hallSection = document.createElement('div');
            hallSection.className = 'mb-8';
            
            hallSection.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-semibold text-gray-800">${hall.name}</h2>
                    <div class="text-base text-gray-600">
                        Capacity: ${hall.capacity} | Price: ₹${hall.pricePerHour}/hr
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${filteredRooms.map((room, index) => {
                        const originalIndex = hall.rooms.findIndex(r => r.roomNumber === room.roomNumber);
                        return renderRoomCard(hall, room, originalIndex);
                    }).join('')}
                </div>
            `;
            
            container.appendChild(hallSection);
        }
    });
    
    if (container.children.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-gray-400 text-lg mb-2">No rooms found</div>
                <div class="text-gray-500 text-base">Try adjusting your search terms</div>
            </div>
        `;
    }
}

// Make functions globally accessible
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;
window.toggleRoomStatus = toggleRoomStatus;
window.toggleDropdown = toggleDropdown;
window.refreshHallsData = refreshHallsData;
window.searchRooms = searchRooms;