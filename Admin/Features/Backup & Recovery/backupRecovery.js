// Global variables
const API_BASE = 'http://localhost:3000';
let currentOperation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadStatistics();
    loadBackupHistory();
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

    // Backup and restore buttons
    document.getElementById('startBackupBtn').addEventListener('click', handleBackup);
    document.getElementById('startRestoreBtn').addEventListener('click', handleRestore);
    document.getElementById('closeProgressBtn').addEventListener('click', closeProgressModal);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearBackupHistory);
}

// Load database statistics
async function loadStatistics() {
    try {
        const [users, bookings, reviews, halls] = await Promise.all([
            fetch(`${API_BASE}/users`).then(r => r.json()),
            fetch(`${API_BASE}/bookings`).then(r => r.json()),
            fetch(`${API_BASE}/reviews`).then(r => r.json()),
            fetch(`${API_BASE}/halls`).then(r => r.json())
        ]);

        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('totalReviews').textContent = reviews.length;
        document.getElementById('totalHalls').textContent = halls.length;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Handle backup process
async function handleBackup() {
    const selectedTables = [];
    const checkboxes = ['backup_users', 'backup_bookings', 'backup_reviews', 'backup_halls'];
    
    checkboxes.forEach(id => {
        if (document.getElementById(id).checked) {
            selectedTables.push(id.replace('backup_', ''));
        }
    });

    if (selectedTables.length === 0) {
        alert('Please select at least one table to backup.');
        return;
    }

    currentOperation = 'backup';
    showProgressModal('Backup', 'Preparing to backup selected tables...', 'bg-primary-600');

    try {
        for (let i = 0; i < selectedTables.length; i++) {
            const table = selectedTables[i];
            const progress = ((i + 1) / selectedTables.length) * 100;
            
            updateProgress(progress, `Backing up ${table}...`);
            
            await backupTable(table);
            await delay(1000); // Visual delay for better UX
        }

        updateProgress(100, 'Backup completed successfully!');
        
        // Save backup history
        saveBackupHistory('backup', selectedTables, `${selectedTables.length} tables backed up successfully`);
        loadBackupHistory(); // Refresh history display
        
        document.getElementById('closeProgressBtn').classList.remove('hidden');
        
    } catch (error) {
        console.error('Backup error:', error);
        updateProgress(0, 'Backup failed. Please try again.');
        document.getElementById('closeProgressBtn').classList.remove('hidden');
    }
}

// Backup individual table
async function backupTable(tableName) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}`);
        const data = await response.json();
        
        if (data.length === 0) {
            console.warn(`No data found for table: ${tableName}`);
            return;
        }

        const csv = convertToCSV(data);
        downloadCSV(csv, `${tableName}_backup_${getCurrentTimestamp()}.csv`);
        
    } catch (error) {
        throw new Error(`Failed to backup ${tableName}: ${error.message}`);
    }
}

// Handle restore process
async function handleRestore() {
    const tableSelect = document.getElementById('restoreTableSelect');
    const fileInput = document.getElementById('csvFileInput');
    
    if (!tableSelect.value) {
        alert('Please select a table to restore.');
        return;
    }
    
    if (!fileInput.files.length) {
        alert('Please select a CSV file to upload.');
        return;
    }

    const file = fileInput.files[0];
    const tableName = tableSelect.value;

    currentOperation = 'restore';
    showProgressModal('Restore', `Preparing to restore ${tableName} data...`, 'bg-green-600');

    try {
        updateProgress(25, 'Reading CSV file...');
        const csvData = await readCSVFile(file);
        
        updateProgress(50, 'Validating data...');
        await delay(500);
        
        updateProgress(75, `Uploading to ${tableName} table...`);
        await restoreTableData(tableName, csvData);
        
        updateProgress(100, 'Restore completed successfully!');
        
        // Save restore history
        saveBackupHistory('restore', [tableName], `${tableName} table restored with ${csvData.length} records`);
        loadBackupHistory(); // Refresh history display
        
        document.getElementById('closeProgressBtn').classList.remove('hidden');
        
        // Reload statistics
        await loadStatistics();
        
    } catch (error) {
        console.error('Restore error:', error);
        updateProgress(0, `Restore failed: ${error.message}`);
        document.getElementById('closeProgressBtn').classList.remove('hidden');
    }
}

// Read CSV file
function readCSVFile(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    reject(new Error('CSV parsing error: ' + results.errors[0].message));
                } else {
                    resolve(results.data);
                }
            },
            error: (error) => reject(error)
        });
    });
}

// Restore table data
async function restoreTableData(tableName, data) {
    try {
        // Get existing data
        const response = await fetch(`${API_BASE}/${tableName}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch existing ${tableName} data`);
        }
        const existingData = await response.json();
        
        // Delete existing records one by one
        for (const item of existingData) {
            const deleteResponse = await fetch(`${API_BASE}/${tableName}/${item.id}`, { 
                method: 'DELETE' 
            });
            if (!deleteResponse.ok) {
                console.warn(`Failed to delete ${tableName} record with id: ${item.id}`);
            }
        }
        
        // Insert new data from CSV
        for (const item of data) {
            // Clean up the data - remove any undefined/null values and ensure proper types
            const cleanedItem = {};
            for (const [key, value] of Object.entries(item)) {
                if (value !== null && value !== undefined && value !== '') {
                    // Handle JSON string fields (like beverages object)
                    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                        try {
                            cleanedItem[key] = JSON.parse(value);
                        } catch (e) {
                            cleanedItem[key] = value;
                        }
                    } else {
                        cleanedItem[key] = value;
                    }
                }
            }
            
            const insertResponse = await fetch(`${API_BASE}/${tableName}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedItem)
            });
            
            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Failed to insert record: ${errorText}`);
            }
        }
        
    } catch (error) {
        throw new Error(`Failed to restore data: ${error.message}`);
    }
}

// Convert data to CSV format
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Handle nested objects/arrays
                if (typeof value === 'object' && value !== null) {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                // Escape commas and quotes in string values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');
    
    return csvContent;
}

// Download CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Show progress modal
function showProgressModal(title, message, progressColor) {
    document.getElementById('progressTitle').textContent = title + ' in Progress';
    document.getElementById('progressMessage').textContent = message;
    document.getElementById('progressBar').className = `h-3 rounded-full transition-all duration-300 ease-out ${progressColor}`;
    document.getElementById('progressModal').classList.remove('hidden');
    document.getElementById('closeProgressBtn').classList.add('hidden');
    
    // Set appropriate icon
    const iconHtml = currentOperation === 'backup' 
        ? '<div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>'
        : '<div class="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>';
    
    document.getElementById('progressIcon').innerHTML = iconHtml;
}

// Update progress
function updateProgress(percentage, status) {
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressPercentage').textContent = Math.round(percentage) + '%';
    document.getElementById('progressStatus').textContent = status;
    
    if (percentage === 100) {
        // Replace spinning icon with success icon
        const successIcon = currentOperation === 'backup'
            ? '<svg class="w-16 h-16 text-primary-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
            : '<svg class="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        
        document.getElementById('progressIcon').innerHTML = successIcon;
    }
}

// Close progress modal
function closeProgressModal() {
    document.getElementById('progressModal').classList.add('hidden');
    
    // Reset form inputs
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('restoreTableSelect').value = '';
    document.getElementById('csvFileInput').value = '';
}

// Utility functions
function getCurrentTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Backup History Management Functions
function saveBackupHistory(operation, tables, details) {
    let history = getBackupHistory();
    const newEntry = {
        id: Date.now(),
        operation: operation, // 'backup' or 'restore'
        tables: tables,
        details: details,
        timestamp: new Date().toISOString(),
        status: 'success'
    };
    
    history.unshift(newEntry); // Add to beginning of array
    
    // Keep only last 50 entries to prevent localStorage bloat
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('venuevista_backup_history', JSON.stringify(history));
}

function getBackupHistory() {
    try {
        const history = localStorage.getItem('venuevista_backup_history');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading backup history:', error);
        return [];
    }
}

function loadBackupHistory() {
    const history = getBackupHistory();
    const container = document.getElementById('historyContainer');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    
    if (history.length === 0) {
        noHistoryMessage.style.display = 'block';
        return;
    }
    
    noHistoryMessage.style.display = 'none';
    
    // Clear existing entries except the no history message
    const existingEntries = container.querySelectorAll('.history-entry');
    existingEntries.forEach(entry => entry.remove());
    
    history.forEach(entry => {
        const historyItem = createHistoryItem(entry);
        container.appendChild(historyItem);
    });
}

function createHistoryItem(entry) {
    const div = document.createElement('div');
    div.className = 'history-entry bg-gray-50 rounded-lg p-4 border-l-4 ' + 
        (entry.operation === 'backup' ? 'border-primary-500' : 'border-green-500');
    
    const operationIcon = entry.operation === 'backup' 
        ? '<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>'
        : '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>';
    
    div.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 mt-1">
                ${operationIcon}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                    <h4 class="text-sm font-semibold text-gray-800 capitalize">${entry.operation} Operation</h4>
                    <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Success</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">${entry.details}</p>
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Tables: ${entry.tables.join(', ')}</span>
                    <span>${formatTimestamp(entry.timestamp)}</span>
                </div>
            </div>
            <button onclick="removeHistoryItem(${entry.id})" class="text-red-400 hover:text-red-600 transition-colors duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    return div;
}

function removeHistoryItem(id) {
    let history = getBackupHistory();
    history = history.filter(item => item.id !== id);
    localStorage.setItem('venuevista_backup_history', JSON.stringify(history));
    loadBackupHistory();
}

function clearBackupHistory() {
    if (confirm('Are you sure you want to clear all backup history? This action cannot be undone.')) {
        localStorage.removeItem('venuevista_backup_history');
        loadBackupHistory();
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Make removeHistoryItem globally accessible
window.removeHistoryItem = removeHistoryItem;