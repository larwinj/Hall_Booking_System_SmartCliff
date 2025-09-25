// Initialize dashboard with real data
let mockDB = { users: [], bookings: [], queries: [] };

function loadMockDB() {
    console.log("Loading mockDB...");
    return Promise.all([
        fetch("https://wgmmpvw9-3000.inc1.devtunnels.ms/users"),
        fetch("https://wgmmpvw9-3000.inc1.devtunnels.ms/bookings"),
        fetch("https://wgmmpvw9-3000.inc1.devtunnels.ms/queries")
    ])
        .then(async ([usersRes, bookingsRes, queriesRes]) => {
            if (!usersRes.ok || !bookingsRes.ok || !queriesRes.ok) {
                throw new Error("Failed to fetch from JSON server");
            }
            const users = await usersRes.json();
            const bookings = await bookingsRes.json();
            const queries = await queriesRes.json();
            mockDB = { users, bookings, queries };
            console.log("Mock DB Loaded:", mockDB);
            return mockDB;
        })
        .catch((error) => console.error("Error loading mockDB:", error));
}

let currentData = null;
let selectedCalendarDate = null;
let currentViewYear = new Date().getFullYear();
let currentViewMonth = new Date().getMonth();

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayString() {
    return formatDate(new Date());
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calculate analytics
function calculateAnalytics() {
    const bookings = currentData.bookings;
    const users = currentData.users;
    const queries = currentData.queries;
    const today = getTodayString();

    // Today's data
    const todayBookings = bookings.filter(b => b.date === today);
    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

    // Overall data
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
    const avgBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    // Update UI
    document.getElementById('todayBookings').textContent = todayBookings.length;
    document.getElementById('todayRevenue').textContent = todayRevenue.toLocaleString();
    document.getElementById('activeUsers').textContent = users.length;
    document.getElementById('pendingActions').textContent = queries.length;
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('completedBookings').textContent = completedBookings;
    document.getElementById('pendingBookings').textContent = pendingBookings;
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString();
    document.getElementById('avgBooking').textContent = avgBooking.toLocaleString();
}

// Generate calendar
function generateCalendar(year = currentViewYear, month = currentViewMonth) {
    currentViewYear = year;
    currentViewMonth = month;

    const monthDate = new Date(year, month, 1);
    document.getElementById('monthYear').textContent = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHTML = `
        <div class="grid grid-cols-7 gap-2 mb-2">
            <div class="text-center text-sm font-medium text-gray-500 py-2">Sun</div>
            <div class="text-center text-sm font-medium text-gray-500 py-2">Mon</div>
            <div class="text-center text-sm font-medium text-gray-500 py-2">Tue</div>
            <div class="text-center text-sm font-medium text-gray-500 py-2">Wed</div>
            <div class="text-center text-sm font-medium text-gray-500 py-2">Thu</div>
            <div class="text-center text-sm font-medium text-gray-500 py-2">Fri</div>
            <div class="text-center text-sm font-medium text-gray-500 py-2">Sat</div>
        </div>
        <div class="grid grid-cols-7 gap-2">
    `;

    // Start from the first day of the week
    let dateCounter = 1 - firstDayOfWeek;

    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(year, month, dateCounter);
        const dateString = formatDate(currentDate);
        const dayBookings = currentData.bookings.filter(b => b.date === dateString);
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = dateString === getTodayString();
        const dayNum = currentDate.getDate();

        let dayClass = 'p-3 text-center text-sm cursor-pointer rounded-lg transition-all duration-200 ';
        if (!isCurrentMonth) {
            dayClass += 'text-gray-400 hover:bg-gray-100 ';
        } else if (isToday) {
            dayClass += 'bg-primary-500 text-white font-bold shadow-md ';
        } else {
            dayClass += 'text-gray-900 hover:bg-gray-100 ';
        }

        if (dayBookings.length > 0) {
            dayClass += 'border-2 border-green-400 ';
        }

        const dayContent = `<div>${dayNum}</div>`;

        calendarHTML += `
            <div class="${dayClass}" onclick="selectDate('${dateString}')">
                ${dayContent}
                ${dayBookings.length > 0 ? `<div class="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>` : ''}
            </div>
        `;

        dateCounter++;
    }

    calendarHTML += '</div>';
    document.getElementById('calendar').innerHTML = calendarHTML;
}

function prevMonth() {
    currentViewMonth--;
    if (currentViewMonth < 0) {
        currentViewMonth = 11;
        currentViewYear--;
    }
    generateCalendar(currentViewYear, currentViewMonth);
}

function nextMonth() {
    currentViewMonth++;
    if (currentViewMonth > 11) {
        currentViewMonth = 0;
        currentViewYear++;
    }
    generateCalendar(currentViewYear, currentViewMonth);
}

// Select date on calendar
function selectDate(dateString) {
    selectedCalendarDate = dateString;
    const dayBookings = currentData.bookings.filter(b => b.date === dateString);
    const selectedDateEl = document.getElementById('selectedDate');
    const dateBookingsEl = document.getElementById('dateBookings');
    const infoEl = document.getElementById('selectedDateInfo');

    selectedDateEl.textContent = new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    console.log(selectedDateEl.textContent);

    if (dayBookings.length > 0) {
        let bookingsHTML = '';
        dayBookings.forEach(booking => {
            bookingsHTML += `
                <div class="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold text-gray-800">${booking.firstName} ${booking.lastName}</p>
                            <p class="text-sm text-gray-600">${booking.checkInTime} - ${booking.checkOutTime}</p>
                            <p class="text-sm text-gray-600">Room: ${booking.roomId}</p>
                        </div>
                        <span class="px-2 py-1 text-xs rounded-full ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                }">${booking.status}</span>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">₹${booking.totalCost.toLocaleString()}</p>
                </div>
            `;
        });
        dateBookingsEl.innerHTML = bookingsHTML;
    } else {
        dateBookingsEl.innerHTML = '<p class="text-gray-500 text-center py-4">No bookings for this date</p>';
    }

    infoEl.classList.remove('hidden');
}

// Generate recent activities
function generateRecentActivities() {
    const activities = [];

    // Generate activities from bookings
    currentData.bookings.forEach(booking => {
        activities.push({
            icon: 'fas fa-calendar-plus',
            color: 'text-blue-500',
            text: `New booking by ${booking.firstName} ${booking.lastName}`,
            time: booking.BookedOn,
            type: 'booking'
        });
    });

    // Generate activities from users
    currentData.users.forEach(user => {
        activities.push({
            icon: 'fas fa-user-plus',
            color: 'text-green-500',
            text: `New user registered: ${user.firstName} ${user.lastName}`,
            time: 'Today',
            type: 'user'
        });
    });

    // Sort and limit activities
    const recentActivities = activities.slice(-5).reverse();

    let activitiesHTML = '';
    recentActivities.forEach(activity => {
        activitiesHTML += `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <i class="${activity.icon} ${activity.color}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">${activity.text}</p>
                    <p class="text-xs text-gray-500">${activity.time}</p>
                </div>
            </div>
        `;
    });

    document.getElementById('recentActivities').innerHTML = activitiesHTML;
}

// Generate revenue breakdown
function generateRevenueBreakdown() {
    const venueRevenue = {};
    currentData.bookings.forEach(booking => {
        const category = booking.venueCategory;
        if (!venueRevenue[category]) {
            venueRevenue[category] = 0;
        }
        venueRevenue[category] += booking.totalCost || 0;
    });

    const totalRevText = document.getElementById('totalRevenue').textContent;
    const totalRevNum = parseFloat(totalRevText.replace(/,/g, '')) || 0;

    let revenueHTML = '';
    Object.entries(venueRevenue).forEach(([category, revenue]) => {
        const percentage = totalRevNum > 0 ? Math.round((revenue / totalRevNum) * 100) : 0;
        revenueHTML += `
            <div class="flex items-center justify-between py-2">
                <div class="flex items-center space-x-3">
                    <div class="w-4 h-4 rounded-full bg-primary-500"></div>
                    <span class="text-sm font-medium text-gray-700 capitalize">${category}</span>
                </div>
                <div class="text-right">
                    <div class="text-sm font-semibold text-gray-900">₹${revenue.toLocaleString()}</div>
                    <div class="text-xs text-gray-500">${percentage}%</div>
                </div>
            </div>
        `;
    });

    document.getElementById('revenueByVenue').innerHTML = revenueHTML;
}

// Create charts
function createCharts() {
    // Venue usage pie chart
    const venueCtx = document.getElementById('venueChart').getContext('2d');
    const venueData = {};
    currentData.bookings.forEach(booking => {
        const category = booking.venueCategory;
        venueData[category] = (venueData[category] || 0) + 1;
    });

    new Chart(venueCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(venueData).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
            datasets: [{
                data: Object.values(venueData),
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });

    // Booking trend line chart
    const bookingCtx = document.getElementById('bookingChart').getContext('2d');
    const last7Days = [];
    const bookingCounts = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = formatDate(date);
        const dayBookings = currentData.bookings.filter(b => b.date === dateString).length;

        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        bookingCounts.push(dayBookings);
    }

    new Chart(bookingCtx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Bookings',
                data: bookingCounts,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    updateDateTime();
    setInterval(updateDateTime, 60000);

    loadMockDB().then((data) => {
        currentData = data;
        console.log("Current Data:", currentData);
        calculateAnalytics();
        generateCalendar();
        generateRecentActivities();
        generateRevenueBreakdown();
        createCharts();
    });
});