// Global variables
let allQueries = [];
let allReports = [];
let allUsers = [];
let filteredItems = [];
let currentItem = null;
let currentView = 'queries'; // Track current view (queries or reports)
const API_BASE = 'http://localhost:3000';

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    fetchData();
    updateLastUpdated();
    updateToggleBackground();
});

// Setup event listeners
function setupEventListeners() {
    // Mobile menu functionality
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

    // Toggle button functionality
    const queryToggle = document.getElementById('queryToggle');
    const reportToggle = document.getElementById('reportToggle');
    queryToggle.addEventListener('click', () => switchView('queries'));
    reportToggle.addEventListener('click', () => switchView('reports'));

    // Search and filter functionality
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('subjectFilter').addEventListener('change', applyFilters);
    document.getElementById('userFilter').addEventListener('change', applyFilters);

    // Modal functionality
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('itemModal').addEventListener('click', (e) => {
        if (e.target.id === 'itemModal') closeModal();
    });

    // Reply functionality (for queries only)
    document.getElementById('sendReplyBtn').addEventListener('click', sendReply);
    document.getElementById('cancelReplyBtn').addEventListener('click', hideReplySection);
}

// Update toggle background position
function updateToggleBackground() {
    const queryToggle = document.getElementById('queryToggle');
    const reportToggle = document.getElementById('reportToggle');
    const toggleBackground = document.getElementById('toggleBackground');
    const activeBtn = currentView === 'queries' ? queryToggle : reportToggle;
    toggleBackground.style.width = `${activeBtn.offsetWidth}px`;
    toggleBackground.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
}

// Switch between queries and reports view
function switchView(view) {
    currentView = view;
    const queryToggle = document.getElementById('queryToggle');
    const reportToggle = document.getElementById('reportToggle');
    queryToggle.classList.toggle('active', view === 'queries');
    reportToggle.classList.toggle('active', view === 'reports');
    document.getElementById('modalTitle').textContent = view === 'queries' ? 'Query Details' : 'Report Details';
    applyFilters();
    updateToggleBackground();
}

// Fetch data from API
async function fetchData() {
    try {
        showLoading(true);

        // Fetch queries, reports, and users concurrently
        const [queriesResponse, reportsResponse, usersResponse] = await Promise.all([
            fetch(`${API_BASE}/queries`),
            fetch(`${API_BASE}/reports`),
            fetch(`${API_BASE}/users`)
        ]);

        if (!queriesResponse.ok || !reportsResponse.ok || !usersResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        allQueries = await queriesResponse.json();
        allReports = await reportsResponse.json();
        allUsers = await usersResponse.json();

        // Match queries with user data
        allQueries = allQueries.map(query => {
            const registeredUser = allUsers.find(user => user.id === Number(query.UserId));
            return {
                ...query,
                registeredUser: registeredUser || null,
                isRegisteredUser: !!registeredUser
            };
        });

        // Match reports with user data
        allReports = allReports.map(report => {
            const registeredUser = allUsers.find(user => user.id === report.userId);
            return {
                ...report,
                registeredUser: registeredUser || null,
                isRegisteredUser: !!registeredUser
            };
        });

        filteredItems = currentView === 'queries' ? [...allQueries] : [...allReports];
        updateStatistics();
        renderItems();
        showContent();
        updateLastUpdated();

    } catch (error) {
        console.error('Error fetching data:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Show/hide loading state
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// Show error state
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('itemsGrid').classList.add('hidden');
}

// Show content
function showContent() {
    document.getElementById('error').classList.add('hidden');
    document.getElementById('itemsGrid').classList.remove('hidden');
}

// Update statistics
function updateStatistics() {
    const totalQueries = allQueries.length;
    const pendingQueries = allQueries.filter(q => q.status === 'pending').length;
    const respondedQueries = allQueries.filter(q => q.status === 'responded').length;
    const totalReports = allReports.length;
    const totalItems = currentView === 'queries' ? totalQueries : totalReports;

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('pendingQueries').textContent = pendingQueries;
    document.getElementById('respondedQueries').textContent = respondedQueries;
    document.getElementById('totalReports').textContent = totalReports;
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Apply search and filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const subjectFilter = document.getElementById('subjectFilter').value;
    const userFilter = document.getElementById('userFilter').value;

    filteredItems = (currentView === 'queries' ? allQueries : allReports).filter(item => {
        const name = currentView === 'queries' ? item.name : item.firstName;
        const email = currentView === 'queries' ? item.email : item.email;
        const registeredUser = item.registeredUser;

        const matchesSearch = name.toLowerCase().includes(searchTerm) ||
            email.toLowerCase().includes(searchTerm) ||
            (registeredUser &&
                (registeredUser.firstName.toLowerCase().includes(searchTerm) ||
                    registeredUser.lastName.toLowerCase().includes(searchTerm) ||
                    registeredUser.email.toLowerCase().includes(searchTerm)));

        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesSubject = currentView === 'queries' ?
            (subjectFilter === 'all' || item.subject === subjectFilter) : true;
        const matchesUserType = userFilter === 'all' ||
            (userFilter === 'registered' && item.isRegisteredUser) ||
            (userFilter === 'guest' && !item.isRegisteredUser);

        return matchesSearch && matchesStatus && matchesSubject && matchesUserType;
    });

    renderItems();
}

// Render items (queries or reports)
function renderItems() {
    const grid = document.getElementById('itemsGrid');
    const emptyState = document.getElementById('emptyState');

    if (filteredItems.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');

    grid.innerHTML = filteredItems.map(item => {
        const userInfo = item.isRegisteredUser ? item.registeredUser : null;
        const priorityClass = currentView === 'queries' ? getPriorityClass(item.status, item.timestamp) : '';

        if (currentView === 'queries') {
            return `
            <div class="query-card rounded-xl shadow-lg p-4 sm:p-6 card-hover cursor-pointer relative ${priorityClass}" onclick="openItemModal(${item.id}, 'query')">
                <!-- Delete Button -->
                <button onclick="event.stopPropagation(); deleteItem(${item.id}, 'query')" 
                        class="absolute top-3 sm:top-4 right-3 sm:right-4 text-red-500 hover:text-red-700 transition-colors z-10">
                    <i class="fas fa-trash-alt text-sm sm:text-base"></i>
                </button>

                <!-- User Type Indicator -->
                <div class="flex items-center justify-between mb-3 sm:mb-4">
                    <div class="flex items-center space-x-2">
                        ${item.isRegisteredUser ?
                    `<span class="user-badge text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full flex items-center">
                                <i class="fas fa-user-check mr-1"></i>Registered User
                            </span>` :
                    `<span class="bg-gray-100 text-gray-800 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full flex items-center border">
                                <i class="fas fa-user-friends mr-1"></i>Guest User
                            </span>`
                }
                    </div>
                    <span class="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border status-${item.status}">
                        ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                </div>

                <!-- Query Header -->
                <div class="mb-3 sm:mb-4">
                    <div class="flex items-start justify-between mb-2">
                        <span class="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ${formatDate(item.timestamp)}
                        </span>
                    </div>
                    
                    <!-- Subject Badge -->
                    <div class="mb-2 sm:mb-3">
                        <span class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                            <i class="fas fa-tag mr-1"></i>
                            ${formatSubject(item.subject)}
                        </span>
                    </div>
                </div>

                <!-- Contact Info Section -->
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <i class="fas fa-address-card mr-2"></i>Contact Information
                    </h4>
                    <div class="space-y-1 sm:space-y-2">
                        <div class="flex items-center text-xs sm:text-sm">
                            <i class="fas fa-user w-4 text-gray-500 mr-2"></i>
                            <span class="font-medium text-gray-900">${item.name}</span>
                            ${item.isRegisteredUser ?
                    `<span class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    ${userInfo.firstName} ${userInfo.lastName}
                                </span>` : ''
                }
                        </div>
                        <div class="flex items-center text-xs sm:text-sm text-gray-600">
                            <i class="fas fa-envelope w-4 text-gray-500 mr-2"></i>
                            <span>${item.email}</span>
                        </div>
                        <div class="flex items-center text-xs sm:text-sm text-gray-600">
                            <i class="fas fa-phone w-4 text-gray-500 mr-2"></i>
                            <span>${item.phone}</span>
                        </div>
                    </div>
                </div>

                <!-- Description Preview -->
                <div class="mb-3 sm:mb-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <i class="fas fa-comment-alt mr-2"></i>Description
                    </h4>
                    <p class="text-gray-700 text-xs sm:text-sm line-clamp-3 bg-white p-3 rounded-lg border">
                        ${item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description}
                    </p>
                </div>

                <!-- Priority Indicator -->
                <div class="flex items-center justify-between text-xs sm:text-sm">
                    <div class="flex items-center text-gray-500">
                        <i class="fas fa-clock mr-1"></i>
                        <span>${getTimeAgo(item.timestamp)}</span>
                    </div>
                    <div class="flex items-center text-primary-600 font-medium">
                        <span>Click for details</span>
                        <i class="fas fa-chevron-right ml-1"></i>
                    </div>
                </div>
            </div>`;
        } else {
            return `
            <div class="query-card rounded-xl shadow-lg p-4 sm:p-6 card-hover cursor-pointer relative" onclick="openItemModal(${item.id}, 'report')">
                <!-- Delete Button -->
                <button onclick="event.stopPropagation(); deleteItem(${item.id}, 'report')" 
                        class="absolute top-3 sm:top-4 right-3 sm:right-4 text-red-500 hover:text-red-700 transition-colors z-10">
                    <i class="fas fa-trash-alt text-sm sm:text-base"></i>
                </button>

                <!-- User Type Indicator -->
                <div class="flex items-center justify-between mb-3 sm:mb-4">
                    <div class="flex items-center space-x-2">
                        ${item.isRegisteredUser ?
                    `<span class="user-badge text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full flex items-center">
                                <i class="fas fa-user-check mr-1"></i>Registered User
                            </span>` :
                    `<span class="bg-gray-100 text-gray-800 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full flex items-center border">
                                <i class="fas fa-user-friends mr-1"></i>Guest User
                            </span>`
                }
                    </div>
                    <span class="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border status-${item.status}">
                        ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                </div>

                <!-- Report Header -->
                <div class="mb-3 sm:mb-4">
                    <div class="flex items-start justify-between mb-2">
                        <span class="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ${formatDate(item.reportDate)}
                        </span>
                    </div>
                    
                    <!-- Booking Info -->
                    <div class="mb-2 sm:mb-3">
                        <span class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                            <i class="fas fa-calendar-alt mr-1"></i>
                            Booking ID: ${item.id}
                        </span>
                    </div>
                </div>

                <!-- Contact Info Section -->
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <i class="fas fa-address-card mr-2"></i>Contact Information
                    </h4>
                    <div class="space-y-1 sm:space-y-2">
                        <div class="flex items-center text-xs sm:text-sm">
                            <i class="fas fa-user w-4 text-gray-500 mr-2"></i>
                            <span class="font-medium text-gray-900">${item.firstName} ${item.lastName}</span>
                            ${item.isRegisteredUser ?
                    `<span class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    ${userInfo.firstName} ${userInfo.lastName}
                                </span>` : ''
                }
                        </div>
                        <div class="flex items-center text-xs sm:text-sm text-gray-600">
                            <i class="fas fa-envelope w-4 text-gray-500 mr-2"></i>
                            <span>${item.email}</span>
                        </div>
                        <div class="flex items-center text-xs sm:text-sm text-gray-600">
                            <i class="fas fa-phone w-4 text-gray-500 mr-2"></i>
                            <span>${item.mobileNumber}</span>
                        </div>
                    </div>
                </div>

                <!-- Description Preview -->
                <div class="mb-3 sm:mb-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <i class="fas fa-comment-alt mr-2"></i>Report Description
                    </h4>
                    <p class="text-gray-700 text-xs sm:text-sm line-clamp-3 bg-white p-3 rounded-lg border">
                        ${item.reportDescription.length > 120 ? item.reportDescription.substring(0, 120) + '...' : item.reportDescription}
                    </p>
                </div>

                <!-- Booking Info -->
                <div class="flex items-center justify-between text-xs sm:text-sm">
                    <div class="flex items-center text-gray-500">
                        <i class="fas fa-clock mr-1"></i>
                        <span>${getTimeAgo(item.reportDate)}</span>
                    </div>
                    <div class="flex items-center text-primary-600 font-medium">
                        <span>Click for details</span>
                        <i class="fas fa-chevron-right ml-1"></i>
                    </div>
                </div>
            </div>`;
        }
    }).join('');
}

// Get priority class based on status and timestamp (for queries only)
function getPriorityClass(status, timestamp) {
    if (status === 'pending') {
        const hoursSinceCreated = (new Date() - new Date(timestamp)) / (1000 * 60 * 60);
        if (hoursSinceCreated > 24) return 'priority-high';
        if (hoursSinceCreated > 12) return 'priority-medium';
        return 'priority-low';
    }
    return '';
}

// Get time ago string
function getTimeAgo(timestamp) {
    const now = new Date();
    const created = new Date(timestamp);
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
}

// Open item modal (query or report)
function openItemModal(itemId, type) {
    currentItem = (type === 'query' ? allQueries : allReports).find(item => item.id === itemId);
    if (!currentItem) return;

    const modal = document.getElementById('itemModal');
    const content = document.getElementById('modalContent');
    const userInfo = currentItem.isRegisteredUser ? currentItem.registeredUser : null;

    if (type === 'query') {
        document.getElementById('modalTitle').textContent = 'Query Details';
        document.getElementById('replySection').classList.remove('hidden');
        content.innerHTML = `
            <div class="space-y-4 sm:space-y-6">
                <!-- User Information -->
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6">
                    <div class="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 class="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                            <i class="fas fa-user-circle mr-2 sm:mr-3 text-primary-600"></i>
                            User Information
                        </h3>
                        ${currentItem.isRegisteredUser ?
                `<span class="user-badge text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full flex items-center">
                                <i class="fas fa-user-check mr-1 sm:mr-2"></i>Registered User
                            </span>` :
                `<span class="bg-gray-200 text-gray-800 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full flex items-center">
                                <i class="fas fa-user-friends mr-1 sm:mr-2"></i>Guest User
                            </span>`
            }
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div class="space-y-3 sm:space-y-4">
                            <div class="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Query Contact Name</label>
                                <p class="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                    <i class="fas fa-user mr-2 text-primary-500"></i>
                                    ${currentItem.name}
                                </p>
                            </div>
                            <div class="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                <p class="text-gray-900 text-sm sm:text-base flex items-center">
                                    <i class="fas fa-envelope mr-2 text-primary-500"></i>
                                    ${currentItem.email}
                                </p>
                            </div>
                            <div class="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <p class="text-gray-900 text-sm sm:text-base flex items-center">
                                    <i class="fas fa-phone mr-2 text-primary-500"></i>
                                    ${currentItem.phone}
                                </p>
                            </div>
                        </div>
                        
                        ${currentItem.isRegisteredUser ? `
                            <div class="space-y-3 sm:space-y-4">
                                <div class="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                                    <label class="block text-xs sm:text-sm font-medium text-primary-700 mb-2">
                                        <i class="fas fa-id-badge mr-1"></i>Registered User Details
                                    </label>
                                    <div class="space-y-2">
                                        <p class="text-primary-900 font-semibold text-sm sm:text-base">
                                            ${userInfo.firstName} ${userInfo.lastName}
                                        </p>
                                        <p class="text-xs sm:text-sm text-primary-700">
                                            <i class="fas fa-envelope mr-1"></i>
                                            Registered Email: ${userInfo.email}
                                        </p>
                                        <p class="text-xs sm:text-sm text-primary-700">
                                            <i class="fas fa-phone mr-1"></i>
                                            Registered Phone: ${userInfo.phone}
                                        </p>
                                        <p class="text-xs sm:text-sm text-primary-700">
                                            <i class="fas fa-user-tag mr-1"></i>
                                            User ID: #${userInfo.id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="flex items-center justify-center h-full">
                                <div class="text-center bg-gray-100 p-4 sm:p-6 rounded-lg">
                                    <i class="fas fa-user-friends text-3xl sm:text-4xl text-gray-400 mb-2 sm:mb-3"></i>
                                    <p class="text-gray-600 font-medium text-sm sm:text-base">Guest User</p>
                                    <p class="text-xs sm:text-sm text-gray-500 mt-1">
                                        No registered account found
                                    </p>
                                </div>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Query Details -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                        <i class="fas fa-question-circle mr-2 sm:mr-3 text-primary-600"></i>
                        Query Details
                    </h3>
                    <div class="space-y-3 sm:space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Status</label>
                                <span class="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium status-${currentItem.status}">
                                    <i class="fas fa-circle mr-2 text-xs"></i>
                                    ${currentItem.status.charAt(0).toUpperCase() + currentItem.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Subject Category</label>
                            <span class="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                <i class="fas fa-tag mr-2"></i>
                                ${formatSubject(currentItem.subject)}
                            </span>
                        </div>
                        
                        <div>
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description</label>
                            <div class="bg-gray-50 p-3 sm:p-4 rounded-lg border">
                                <p class="text-gray-900 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">${currentItem.description}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Submitted On</label>
                                <p class="text-gray-900 text-sm sm:text-base flex items-center">
                                    <i class="fas fa-calendar-alt mr-2 text-primary-500"></i>
                                    ${formatDateTime(currentItem.timestamp)}
                                </p>
                            </div>
                            <div>
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Time Elapsed</label>
                                <p class="text-gray-900 text-sm sm:text-base flex items-center">
                                    <i class="fas fa-clock mr-2 text-primary-500"></i>
                                    ${getTimeAgo(currentItem.timestamp)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Response History -->
                ${currentItem.response ? `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                        <h3 class="text-base sm:text-lg font-bold text-green-800 mb-3 flex items-center">
                            <i class="fas fa-reply mr-2"></i>
                            Admin Response
                        </h3>
                        <div class="bg-white p-3 sm:p-4 rounded-lg border">
                            <p class="text-gray-900 text-sm sm:text-base whitespace-pre-wrap">${currentItem.response}</p>
                        </div>
                        <p class="text-xs sm:text-sm text-green-700 mt-2 flex items-center">
                            <i class="fas fa-clock mr-1"></i>
                            Responded: ${formatDateTime(currentItem.responseTimestamp)}
                        </p>
                    </div>
                ` : ''}

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                    ${currentItem.status === 'pending' ? `
                        <button onclick="showReplySection()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center text-sm sm:text-base">
                            <i class="fas fa-reply mr-2"></i>Reply to Query
                        </button>
                    ` : ''}
                    ${currentItem.status === 'responded' ? `
                        <button onclick="markAsResolved()" class="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center text-sm sm:text-base">
                            <i class="fas fa-check-circle mr-2"></i>Mark as Resolved
                        </button>
                    ` : ''}
                    <button onclick="deleteItem(${currentItem.id}, 'query'); closeModal();" class="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center text-sm sm:text-base">
                        <i class="fas fa-trash-alt mr-2"></i>Delete Query
                    </button>
                    <button onclick="closeModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center text-sm sm:text-base">
                        <i class="fas fa-times mr-2"></i>Close
                    </button>
                </div>
            </div>`;
    } else {
        document.getElementById('modalTitle').textContent = 'Report Details';
        document.getElementById('replySection').classList.add('hidden');
        content.innerHTML = `
            <div class="space-y-4 sm:space-y-6">
                <!-- User Information -->
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6">
                    <div class="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 class="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                            <i class="fas fa-user-circle mr-2 sm:mr-3 text-primary-600"></i>
                            User Information
                        </h3>
                        ${currentItem.isRegisteredUser ?
                `<span class="user-badge text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full flex items-center">
                                <i class="fas fa-user-check mr-1 sm:mr-2"></i>Registered User
                            </span>` :
                `<span class="bg-gray-200 text-gray-800 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full flex items-center">
                                <i class="fas fa-user-friends mr-1 sm:mr-2"></i>Guest User
                            </span>`
            }
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div class="space-y-3 sm:space-y-4">
                            <div class="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                                <p class="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                    <i class="fas fa-user mr-2 text-primary-500"></i>
                                    ${currentItem.firstName} ${currentItem.lastName}
                                </p>
                            </div>
                            <div class="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                <p class="text-gray-900 text-sm sm:text-base flex items-center">
                                    <i class="fas fa-envelope mr-2 text-primary-500"></i>
                                    ${currentItem.email}
                                </p>
                            </div>
                            <div class="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <p class="text-gray-900 text-sm sm:text-base flex items-center">
                                    <i class="fas fa-phone mr-2 text-primary-500"></i>
                                    ${currentItem.mobileNumber}
                                </p>
                            </div>
                        </div>
                        
                        ${currentItem.isRegisteredUser ? `
                            <div class="space-y-3 sm:space-y-4">
                                <div class="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                                    <label class="block text-xs sm:text-sm font-medium text-primary-700 mb-2">
                                        <i class="fas fa-id-badge mr-1"></i>Registered User Details
                                    </label>
                                    <div class="space-y-2">
                                        <p class="text-primary-900 font-semibold text-sm sm:text-base">
                                            ${userInfo.firstName} ${userInfo.lastName}
                                        </p>
                                        <p class="text-xs sm:text-sm text-primary-700">
                                            <i class="fas fa-envelope mr-1"></i>
                                            Registered Email: ${userInfo.email}
                                        </p>
                                        <p class="text-xs sm:text-sm text-primary-700">
                                            <i class="fas fa-phone mr-1"></i>
                                            Registered Phone: ${userInfo.phone}
                                        </p>
                                        <p class="text-xs sm:text-sm text-primary-700">
                                            <i class="fas fa-user-tag mr-1"></i>
                                            User ID: #${userInfo.id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="flex items-center justify-center h-full">
                                <div class="text-center bg-gray-100 p-4 sm:p-6 rounded-lg">
                                    <i class="fas fa-user-friends text-3xl sm:text-4xl text-gray-400 mb-2 sm:mb-3"></i>
                                    <p class="text-gray-600 font-medium text-sm sm:text-base">Guest User</p>
                                    <p class="text-xs sm:text-sm text-gray-500 mt-1">
                                        No registered account found
                                    </p>
                                </div>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Report Details -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                        <i class="fas fa-exclamation-circle mr-2 sm:mr-3 text-primary-600"></i>
                        Report Details
                    </h3>
                    <div class="space-y-3 sm:space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Status</label>
                                <span class="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium status-${currentItem.status}">
                                    <i class="fas fa-circle mr-2 text-xs"></i>
                                    ${currentItem.status.charAt(0).toUpperCase() + currentItem.status.slice(1)}
                                </span>
                            </div>
                            <div>
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Booking ID</label>
                                <span class="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    <i class="fas fa-calendar-alt mr-2"></i>
                                    ${currentItem.id}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Report Description</label>
                            <div class="bg-gray-50 p-3 sm:p-4 rounded-lg border">
                                <p class="text-gray-900 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">${currentItem.reportDescription}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Reported On</label>
                                <p class="text-gray-900 text-sm sm:text-base flex items-center">
                                    <i class="fas fa-calendar-alt mr-2 text-primary-500"></i>
                                    ${formatDateTime(currentItem.reportDate)}
                                </p>
                            </div>
                            <div>
                                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Time Elapsed</label>
                                <p class="text-gray-900 text-sm sm:text-base flex items-center">
                                    <i class="fas fa-clock mr-2 text-primary-500"></i>
                                    ${getTimeAgo(currentItem.reportDate)}
                                </p>
                            </div>
                        </div>

                        <!-- Booking Details -->
                        <div>
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Booking Details</label>
                            <div class="bg-gray-50 p-3 sm:p-4 rounded-lg border">
                                <p class="text-gray-900 text-sm sm:text-base"><strong>Venue:</strong> ${currentItem.venueCategory.charAt(0).toUpperCase() + currentItem.venueCategory.slice(1)}</p>
                                <p class="text-gray-900 text-sm sm:text-base"><strong>Room:</strong> ${currentItem.roomId}</p>
                                <p class="text-gray-900 text-sm sm:text-base"><strong>Date:</strong> ${formatDate(currentItem.date)}</p>
                                <p class="text-gray-900 text-sm sm:text-base"><strong>Time:</strong> ${currentItem.checkInTime} - ${currentItem.checkOutTime}</p>
                                <p class="text-gray-900 text-sm sm:text-base"><strong>Purpose:</strong> ${currentItem.purpose}</p>
                                <p class="text-gray-900 text-sm sm:text-base"><strong>Total Cost:</strong> $${currentItem.totalCost}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                    <button onclick="deleteItem(${currentItem.id}, 'report'); closeModal();" class="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center text-sm sm:text-base">
                        <i class="fas fa-trash-alt mr-2"></i>Delete Report
                    </button>
                    <button onclick="closeModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center text-sm sm:text-base">
                        <i class="fas fa-times mr-2"></i>Close
                    </button>
                </div>
            </div>`;
    }

    modal.classList.remove('hidden');
}

// Show reply section (for queries only)
function showReplySection() {
    document.getElementById('replySection').classList.remove('hidden');
    document.getElementById('replyMessage').focus();
}

// Hide reply section
function hideReplySection() {
    document.getElementById('replySection').classList.add('hidden');
    document.getElementById('replyMessage').value = '';
}

// Send reply (for queries only)
async function sendReply() {
    if (currentView !== 'queries' || !currentItem) return;

    const message = document.getElementById('replyMessage').value.trim();

    if (!message) {
        showToast('Please enter a reply message', 'error');
        return;
    }

    const sendBtn = document.getElementById('sendReplyBtn');
    const originalHtml = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
    sendBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/queries/${currentItem.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'responded',
                response: message,
                responseTimestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send reply');
        }

        // Update local data
        const queryIndex = allQueries.findIndex(q => q.id === currentItem.id);
        if (queryIndex !== -1) {
            allQueries[queryIndex].status = 'responded';
            allQueries[queryIndex].response = message;
            allQueries[queryIndex].responseTimestamp = new Date().toISOString();
        }

        showToast('Response sent successfully!', 'success');
        closeModal();
        updateStatistics();
        applyFilters();

    } catch (error) {
        console.error('Error sending reply:', error);
        showToast('Failed to send response. Please try again.', 'error');
    } finally {
        sendBtn.innerHTML = originalHtml;
        sendBtn.disabled = false;
    }
}

// Mark as resolved (for queries only)
async function markAsResolved() {
    if (currentView !== 'queries' || !currentItem) return;

    if (!confirm('Are you sure you want to mark this query as resolved?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/queries/${currentItem.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'resolved',
                resolvedTimestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to mark as resolved');
        }

        // Update local data
        const queryIndex = allQueries.findIndex(q => q.id === currentItem.id);
        if (queryIndex !== -1) {
            allQueries[queryIndex].status = 'resolved';
            allQueries[queryIndex].resolvedTimestamp = new Date().toISOString();
        }

        showToast('Query marked as resolved!', 'success');
        closeModal();
        updateStatistics();
        applyFilters();

    } catch (error) {
        console.error('Error marking as resolved:', error);
        showToast('Failed to mark as resolved. Please try again.', 'error');
    }
}

// Delete item (query or report)
async function deleteItem(itemId, type) {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${type}s/${itemId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete ${type}`);
        }

        // Update local data
        if (type === 'query') {
            allQueries = allQueries.filter(q => q.id !== itemId);
            filteredItems = filteredItems.filter(q => q.id !== itemId);
        } else {
            allReports = allReports.filter(r => r.id !== itemId);
            filteredItems = filteredItems.filter(r => r.id !== itemId);
        }

        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, 'success');
        updateStatistics();
        renderItems();

    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        showToast(`Failed to delete ${type}. Please try again.`, 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('itemModal').classList.add('hidden');
    hideReplySection();
    currentItem = null;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB') + ' at ' + date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format subject
function formatSubject(subject) {
    return subject.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Show toast notification
function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        className: type === 'success' ? 'toast-success' : 'toast-error',
        stopOnFocus: true,
        style: {
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500"
        }
    }).showToast();
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Auto-refresh data every 30 seconds
setInterval(() => {
    if (document.visibilityState === 'visible') {
        fetchData();
    }
}, 30000);