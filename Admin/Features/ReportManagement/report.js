let allBookings = [];
let filteredBookings = [];
let reportChart;
const API_BASE = 'https://mpnt1qbp-3000.inc1.devtunnels.ms';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
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
        filteredBookings = [...allBookings];
        applyFilters();
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

// Process data for charts
function processChartData(reportType) {
    // Initialize data structures
    let labels = [];
    let data = [];
    let title = '';
    let yAxis = '';
    let xAxis = '';

    if (reportType === 'date') {
        const bookingsByDate = {};
        filteredBookings.forEach(booking => {
            const date = formatDate(booking.date);
            bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
        });
        labels = Object.keys(bookingsByDate).sort((a, b) => new Date(a) - new Date(b));
        data = labels.map(date => bookingsByDate[date]);
        title = 'Bookings by Date';
        yAxis = 'Number of Bookings';
        xAxis = 'Date';
    } else if (reportType === 'month') {
        const bookingsByMonth = {};
        filteredBookings.forEach(booking => {
            const date = new Date(booking.date);
            const month = date.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
            bookingsByMonth[month] = (bookingsByMonth[month] || 0) + 1;
        });
        labels = Object.keys(bookingsByMonth).sort((a, b) => new Date(a) - new Date(b));
        data = labels.map(month => bookingsByMonth[month]);
        title = 'Bookings by Month';
        yAxis = 'Number of Bookings';
        xAxis = 'Month';
    } else if (reportType === 'category') {
        const bookingsByCategory = { compact: 0, classic: 0, grand: 0 };
        filteredBookings.forEach(booking => {
            if (bookingsByCategory[booking.venueCategory] !== undefined) {
                bookingsByCategory[booking.venueCategory] += 1;
            }
        });
        labels = ['Compact Hall', 'Classic Hall', 'Grand Hall'];
        data = [bookingsByCategory.compact, bookingsByCategory.classic, bookingsByCategory.grand];
        title = 'Bookings by Category';
        yAxis = 'Number of Bookings';
        xAxis = 'Category';
    } else if (reportType === 'status') {
        const bookingsByStatus = { booked: 0, completed: 0, cancelled: 0 };
        filteredBookings.forEach(booking => {
            if (bookingsByStatus[booking.status] !== undefined) {
                bookingsByStatus[booking.status] += 1;
            }
        });
        labels = ['Booked', 'Completed', 'Cancelled'];
        data = [bookingsByStatus.booked, bookingsByStatus.completed, bookingsByStatus.cancelled];
        title = 'Bookings by Status';
        yAxis = 'Number of Bookings';
        xAxis = 'Status';
    } else if (reportType === 'revenue') {
        const revenueByDate = {};
        filteredBookings.forEach(booking => {
            const date = formatDate(booking.date);
            revenueByDate[date] = (revenueByDate[date] || 0) + (booking.totalCost || 0);
        });
        labels = Object.keys(revenueByDate).sort((a, b) => new Date(a) - new Date(b));
        data = labels.map(date => revenueByDate[date]);
        title = 'Revenue by Date';
        yAxis = 'Revenue ($)';
        xAxis = 'Date';
    }

    return { labels, data, title, yAxis, xAxis };
}

// Render chart
function renderChart() {
    const reportType = document.getElementById('reportType').value;
    const { labels, data, title, yAxis, xAxis } = processChartData(reportType);

    // Update chart title
    document.getElementById('chartTitle').textContent = title;

    // Destroy existing chart if it exists
    if (reportChart) reportChart.destroy();

    // Render new chart
    reportChart = new Chart(document.getElementById('reportChart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: yAxis,
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuad'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxis
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: xAxis
                    }
                }
            }
        }
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Apply filters
function applyFilters() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const category = document.getElementById('categoryFilter').value;

    filteredBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        if (startDate && bookingDate < new Date(startDate)) return false;
        if (endDate && bookingDate > new Date(endDate)) return false;
        if (category && booking.venueCategory !== category) return false;
        return true;
    });

    renderChart();
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

    // Filter controls
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('reportType').addEventListener('change', renderChart);
}