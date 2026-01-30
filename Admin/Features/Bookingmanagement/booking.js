let allBookings = [];
let filteredBookings = [];
let currentPage = 1;
const itemsPerPage = 7;
let currentFilters = {
    category: '',
    status: '',
    room: '',
    search: ''
};
let currentActionBookingId = null;

// API Base URL
const API_BASE = 'https://mpnt1qbp-3000.inc1.devtunnels.ms';

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    fetchBookings();
    setupEventListeners();
});

// Fetch bookings from JSON server
async function fetchBookings() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/bookings`);
        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        allBookings = await response.json();
        // Sort by ID in descending order for stack-based behavior (newest first)
        allBookings.sort((a, b) => b.id - a.id);

        filteredBookings = [...allBookings];
        renderBookings();
        showContent();

    } catch (error) {
        console.error('Error fetching bookings:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Show/hide loading state
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// Show/hide error state
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('content').classList.add('hidden');
}

// Show content
function showContent() {
    document.getElementById('error').classList.add('hidden');
    document.getElementById('content').classList.remove('hidden');
}

// Render bookings with pagination
function renderBookings() {
    const tbody = document.getElementById('bookingsTable');
    const noResults = document.getElementById('noResults');

    if (filteredBookings.length === 0) {
        tbody.innerHTML = '';
        noResults.classList.remove('hidden');
        updatePagination();
        return;
    }

    noResults.classList.add('hidden');

    // Calculate pagination
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageBookings = filteredBookings.slice(startIndex, endIndex);

    tbody.innerHTML = currentPageBookings.map(booking => {
        const fullName = `${booking.firstName} ${booking.lastName}`;
        const categoryName = getCategoryDisplayName(booking.venueCategory);
        const statusBadge = getStatusBadge(booking.status);

        return `
            <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">${fullName}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-md text-gray-900">${categoryName}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-md text-gray-900">${booking.roomId}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-md text-gray-900">${formatDate(booking.date)}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-md text-gray-900">${booking.checkInTime}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-md text-gray-900">${booking.checkOutTime}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-md text-gray-900">${booking.BookedOn}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-md text-gray-500 relative">
                    <button class="action-btn text-black hover:text-black font-medium p-1" data-booking-id="${booking.id}" data-booking-status="${booking.status}">⋮</button>
                </td>
            </tr>
        `;
    }).join('');

    // Add click listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleActionClick);
    });

    updatePagination();
}

// Handle action button click
function handleActionClick(e) {
    e.stopPropagation();
    const bookingId = parseInt(e.target.getAttribute('data-booking-id'));
    const bookingStatus = e.target.getAttribute('data-booking-status');
    currentActionBookingId = bookingId;

    const actionMenu = document.getElementById('actionMenu');
    const forceCancelBtn = document.getElementById('forceCancelBtn');

    // Show/hide Force Cancel based on status
    if (bookingStatus === 'booked') {
        forceCancelBtn.classList.remove('hidden');
    } else {
        forceCancelBtn.classList.add('hidden');
    }

    // Position the menu
    const rect = e.target.getBoundingClientRect();
    actionMenu.style.left = (rect.left - 180) + 'px';
    actionMenu.style.top = (rect.bottom + 5) + 'px';
    actionMenu.classList.remove('hidden');

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeActionMenu);
    }, 100);
}

// Close action menu
function closeActionMenu() {
    document.getElementById('actionMenu').classList.add('hidden');
    document.removeEventListener('click', closeActionMenu);
}

// Show booking details
function showBookingDetails(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const modalContent = document.getElementById('modalContent');
    const beveragesList = Object.entries(booking.beverages || {})
        .map(([item, qty]) => `${item}: ${qty}`)
        .join(', ') || 'None';

    modalContent.innerHTML = `
                <!-- Header Section -->
                <div class="bg-gradient-to-r from-primary-50 to-blue-50 -mx-6 -mt-2 px-6 pt-4 pb-6 mb-6 border-b border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-bold text-gray-900">${booking.firstName} ${booking.lastName}</h2>
                            <p class="text-sm text-gray-600 mt-1">Booking ID: #${booking.id}</p>
                        </div>
                        <div class="text-right">
                            ${getStatusBadge(booking.status)}
                            <p class="text-sm text-gray-500 mt-1">₹${booking.totalCost.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Personal Information Card -->
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div class="flex items-center mb-3">
                            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <h4 class="font-semibold text-gray-900">Personal Information</h4>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-500">Email:</span>
                                <span class="text-sm font-medium text-gray-900">${booking.email}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-500">Mobile:</span>
                                <span class="text-sm font-medium text-gray-900">${booking.mobileNumber}</span>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <span class="text-sm text-gray-500">Address:</span>
                                <p class="text-sm font-medium text-gray-900 mt-1 leading-relaxed">${booking.address}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Booking Information Card -->
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div class="flex items-center mb-3">
                            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h4 class="font-semibold text-gray-900">Booking Details</h4>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-500">Category:</span>
                                <span class="text-sm font-medium text-gray-900">${getCategoryDisplayName(booking.venueCategory)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-500">Room:</span>
                                <span class="text-sm font-medium text-primary-600">${booking.roomId}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-500">Date:</span>
                                <span class="text-sm font-medium text-gray-900">${formatDate(booking.date)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-500">Time:</span>
                                <span class="text-sm font-medium text-gray-900">${booking.checkInTime} - ${booking.checkOutTime}</span>
                            </div>
                            <div class="flex justify-between pt-2 border-t border-gray-200">
                                <span class="text-sm text-gray-500">Booked On:</span>
                                <span class="text-sm font-medium text-gray-900">${booking.BookedOn}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Purpose Section -->
                <div class="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div class="flex items-start">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-900 mb-2">Meeting Purpose</h4>
                            <p class="text-sm text-gray-700 leading-relaxed">${booking.purpose}</p>
                        </div>
                    </div>
                </div>

                <!-- Beverages Section -->
                <div class="mt-6 bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div class="flex items-start">
                        <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 0v1.5m0 0V20m-8-5a4 4 0 108 0 4 4 0 00-8 0z"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-900 mb-2">Beverages & Refreshments</h4>
                            ${Object.keys(booking.beverages || {}).length > 0 ? `
                                <div class="grid grid-cols-2 gap-2">
                                    ${Object.entries(booking.beverages).map(([item, qty]) => `
                                        <div class="flex justify-between bg-white rounded px-3 py-2 border border-orange-200">
                                            <span class="text-sm capitalize text-gray-700">${item}:</span>
                                            <span class="text-sm font-medium text-gray-900">${qty}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <p class="text-sm text-gray-600 italic">No beverages ordered</p>
                            `}
                        </div>
                    </div>
                </div>
            `;

    document.getElementById('detailsModal').classList.remove('hidden');
}

// Force cancel booking
async function forceCancelBooking(bookingId) {
    if (!confirm('Are you sure you want to force cancel this booking?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'cancelled'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to cancel booking');
        }

        // Update local data
        const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            allBookings[bookingIndex].status = 'cancelled';
        }

        // Refresh filtered data and re-render
        applyFilters();
        alert('Booking has been cancelled successfully');

    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
    }
}

// Get category display name
function getCategoryDisplayName(category) {
    const categoryMap = {
        'compact': 'Compact Hall',
        'classic': 'Classic Hall',
        'grand': 'Grand Hall'
    };
    return categoryMap[category] || category;
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusConfig = {
        'booked': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        'completed': { bg: 'bg-green-100', text: 'text-green-800' },
        'cancelled': { bg: 'bg-red-100', text: 'text-red-800' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}">
                • ${displayStatus}
            </span>`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

// Update pagination
function updatePagination() {
    const totalItems = filteredBookings.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    // Update showing text
    document.getElementById('showingFrom').textContent = totalItems > 0 ? (startIndex + 1).toString() : '0';
    document.getElementById('showingTo').textContent = endIndex.toString();
    document.getElementById('totalResults').textContent = totalItems.toString();

    // Update pagination buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageNumbers = document.getElementById('pageNumbers');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Generate page numbers
    pageNumbers.innerHTML = '';
    if (totalPages > 1) {
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = `px-3 py-1 text-sm border rounded-lg ${i === currentPage
                ? 'bg-primary-600 text-white border-primary-600'
                : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                }`;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderBookings();
            });
            pageNumbers.appendChild(pageBtn);
        }
    }
}

// Apply filters
function applyFilters() {
    filteredBookings = allBookings.filter(booking => {
        // Category filter
        if (currentFilters.category && booking.venueCategory !== currentFilters.category) {
            return false;
        }

        // Status filter
        if (currentFilters.status && booking.status !== currentFilters.status) {
            return false;
        }

        // Room filter
        if (currentFilters.room && !booking.roomId.toLowerCase().includes(currentFilters.room.toLowerCase())) {
            return false;
        }

        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const fullName = `${booking.firstName} ${booking.lastName}`.toLowerCase();
            const categoryName = getCategoryDisplayName(booking.venueCategory).toLowerCase();

            if (!fullName.includes(searchTerm) &&
                !categoryName.includes(searchTerm) &&
                !booking.roomId.toLowerCase().includes(searchTerm) &&
                !booking.status.toLowerCase().includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    // Reset to first page when filtering
    currentPage = 1;
    renderBookings();
}

// Export functionality
function exportToCSV() {
    if (filteredBookings.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['User Name', 'Category Type', 'Room Number', 'Date', 'Check In Time', 'Check Out Time', 'Status', 'Booked Date'];
    const csvContent = [
        headers.join(','),
        ...filteredBookings.map(booking => [
            `"${booking.firstName} ${booking.lastName}"`,
            `"${getCategoryDisplayName(booking.venueCategory)}"`,
            `"${booking.roomId}"`,
            `"${formatDate(booking.date)}"`,
            `"${booking.checkInTime}"`,
            `"${booking.checkOutTime}"`,
            `"${booking.status}"`,
            `"${booking.BookedOn}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
    });

    closeMobileMenu.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });

    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    });

    // Filter panel toggle
    const filterBtn = document.getElementById('filterBtn');
    const filterPanel = document.getElementById('filterPanel');

    filterBtn.addEventListener('click', () => {
        filterPanel.classList.toggle('hidden');
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        applyFilters();
    });

    // Filter controls
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const roomFilter = document.getElementById('roomFilter');

    categoryFilter.addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
    });

    statusFilter.addEventListener('change', (e) => {
        currentFilters.status = e.target.value;
    });

    roomFilter.addEventListener('input', (e) => {
        currentFilters.room = e.target.value;
    });

    // Apply filters button
    const applyFiltersBtn = document.getElementById('applyFilters');
    applyFiltersBtn.addEventListener('click', applyFilters);

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    clearFiltersBtn.addEventListener('click', () => {
        currentFilters = { category: '', status: '', room: '', search: '' };
        categoryFilter.value = '';
        statusFilter.value = '';
        roomFilter.value = '';
        searchInput.value = '';
        applyFilters();
    });

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', exportToCSV);

    // Pagination buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderBookings();
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderBookings();
        }
    });

    // Action menu buttons
    const viewDetailsBtn = document.getElementById('viewDetailsBtn');
    const forceCancelBtn = document.getElementById('forceCancelBtn');

    viewDetailsBtn.addEventListener('click', () => {
        closeActionMenu();
        showBookingDetails(currentActionBookingId);
    });

    forceCancelBtn.addEventListener('click', () => {
        closeActionMenu();
        forceCancelBooking(currentActionBookingId);
    });

    // Modal close buttons
    const closeDetailsModal = document.getElementById('closeDetailsModal');
    const detailsModal = document.getElementById('detailsModal');

    closeDetailsModal.addEventListener('click', () => {
        detailsModal.classList.add('hidden');
    });

    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.classList.add('hidden');
        }
    });
}