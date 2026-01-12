// Global variables
let participants = [];
let filteredParticipants = [];
let activityHistory = [];
let currentUser = null;
let currentTheme = 'light';
let isSearchActive = false;

// DOM elements
const loginPage = document.getElementById('loginPage');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchIndicator = document.getElementById('searchIndicator');
const searchText = document.getElementById('searchText');
const addParticipantBtn = document.getElementById('addParticipant');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const treeContainer = document.getElementById('treeContainer');
const loadingContainer = document.getElementById('loadingContainer');
const totalParticipantsEl = document.getElementById('totalParticipants');
const attendedCountEl = document.getElementById('searchResultsList');
const attendedCountEl = document.getElementById('attendedCount');
const attendanceRateEl = const document.getElementById('attendanceRate');
const currentUserEl = document.getElementById('currentUser');
const userAvatar = document.getElementById('userAvatar');

// Search Results elements
const searchResults = document.getElementById('searchResults');
const searchResultsList = document.getElementById('searchResultsList');
const clearSearchBtn = document.getElementById('clearSearch');
const searchResultsTitle = document.getElementById('searchResultsTitle');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showDashboard();
    }

    // Load data from JSON file
    loadData();

    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    searchForm.addEventListener('submit', handleSearch);
    addParticipantBtn.addEventListener('click', () => showModal(addModal);
    viewHistoryBtn.addEventListener('click', () => {
        renderActivityHistory();
        showModal(historyModal);
    });
    exportDataBtn.addEventListener('click', exportData);

    // Theme toggle event listeners
    themeToggle.addEventListener('click', toggleTheme);
    themeToggleHeader.addEventListener('click', toggleTheme);

    // Modal event listeners
    closeEditModal.addEventListener('createPaymentStatusElement(paymentStatus) {
        closeEditModal.addEventListener('click', () => hideModal(editModal);
    closeAddModal.addEventListener('click', () => hideModal(addModal);
    closeHistoryModal.addEventListener('click', () => hideModal(historyModal);
    cancelEdit.addEventListener('click', () => hideModal(editModal));
    cancelAdd.addEventListener('click', () => hideModal(addModal);
    closeHistory.addEventListener('click', () => hideModal(historyModal));
    saveEdit.addEventListener('click', saveParticipantEdit);
    saveAdd.addEventListener('click', saveNewParticipant);
    
    // Clear search button
    clearSearchBtn.addEventListener('click', clearSearch);
});

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    applyTheme(savedTheme);
}

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    // Add to activity history
    if (currentUser) {
        addActivity('Theme', `Switched to ${currentTheme} mode`, 'info');
    }
}

// Apply theme
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeIconHeader.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
        themeTextHeader.textContent = 'search-results-title">Light Mode</span>;
        themeTextHeader.textContent = 'Dark Mode';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeIconHeader.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
        themeTextHeader.textContent = 'Dark Mode';
    }
}

// Load data from JSON file
async function loadData() {
    try {
        console.log('Starting to load data...');
        
        // Try to load from the root directory first
        let response = await fetch('./database.json');
        
        // If that fails, try with the full path
        if (!response.ok) {
            response = await fetch(window.location.origin + '/database.json');
        }
        
        // If that still fails, try with the repository name in the path
        if (!response.ok) {
            const pathParts = window.location.pathname.split('/');
            if (pathParts.length > 1) {
                const repoName = pathParts[1];
                response = await fetch(window.location.origin + '/' + repoName + '/database.json');
            }
        }
        
        if (!response.ok) {
            throw new Error('Failed to load database file');
        }
        
        const data = await response.json();
        console.log('Data loaded successfully:', data);
        
        // Transform the data to match the expected format
        participants = data.map(item => ({
            id: item.ID,
            name: item.Name,
            degree: item["Degree Programme"],
            email: item.Email,
            whatsapp: item["Whatsapp no"],
            lunchType: item["Lunch Type"],
            paymentStatus: item["Payment Slip"],
            district: item["Living District"],
            attended: false,
            remarks: ""
        }));
        
        filteredParticipants = [...participants];
        
        if (currentUser) {
            renderTreeView();
            updateStatistics();
        }
        
        console.log('Successfully loaded', participants.length, 'participants');
        showToast('Data loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Show error message in the tree container
        if (treeContainer) {
            treeContainer.innerHTML = `
                <div class="loading-container">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--danger); margin-bottom: 16px;"></i>
                    <p style="color: var(--text-primary);">Failed to load participant data</p>
                    <p style="color: var(--text-secondary); font-size: 14px;">Please make sure the database.json file is in the correct location</p>
                    <button onclick="loadData()" class="btn btn-primary" style="margin-top: 16px;">
                        <i class="fas fa-sync"></i> Retry Loading
                    </button>
                </div>
            `;
        }
        
        showToast('Failed to load participant data. Please check the console for details.', 'error');
    }
}

// Manual retry function
async function loadData() {
    try {
        console.log('Retrying to load data...');
        await loadData();
    } catch (error) {
        console.error('Retry failed:', error);
        showToast('Still unable to load data. Please check your internet connection.', 'error');
    }
}

// Clear search function
function clearSearch() {
    searchInput.value = '';
    searchResults.classList.remove('active');
    treeContainer.style.display = 'block';
    isSearchActive = false;
    filteredParticipants = [...participants];
    renderTreeView();
    updateStatistics();
    showToast('Search cleared', 'info');
}

// Search handler
function handleSearch(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        clearSearch();
        return;
    }
    
    // Filter participants based on search term
    filteredParticipants = participants.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.id.toString().includes(searchTerm)
    );
    
    // Show search results
    showSearchResults(searchTerm);
    
    // Add to activity history
    addActivity('Search', `Searched for "${searchTerm}"`, 'info');
}

// Show search results
function showSearchResults(searchTerm) {
    isSearchActive = true;
    treeContainer.style.display = 'none';
    searchResults.classList.add('active');
    searchResultsTitle.textContent = `Search Results for "${searchTerm}"`;
    
    // Clear previous results
    searchResultsList.innerHTML = '';
    
    // Add search results
    filteredParticipants.forEach(participant => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        const header = document.createElement('div');
        header.className = 'search-result-header';
        header.innerHTML = `
            <div class="search-result-name">${participant.name}</div>
            <div class="search-result-id">ID: ${participant.id}</div>
        `;
        
        const details = document.createElement('div');
        details.className = 'search-result-details';
        details.innerHTML = `
            <div class="search-result-detail">
                <i class="fas fa-graduation-cap"></i>
                <span>${participant.degree}</span>
            </div>
            <div class="search-result-detail">
                <i class="fa-envelope"></i>
                <span>${participant.email}</span>
            </div>
            <div class="search-result-detail">
                <i class="fa-phone"></i>
                <span>${participant.whatsapp}</span>
            </div>
            <div class="search-result-detail">
                <i class="fa-utensils"></i>
                <span>${participant.lunchType}</span>
            </div>
            <div class="search-result-detail">
                <i class="fa-map-marker-alt"></i>
                <span>${participant.district}</span>
            </div>
            <div class="search-result-detail">
                <i class="fa-sticky-note"></i>
                <span>${participant.remarks || 'No remarks'}</span>
            </div>
            <div class="search-result-detail">
                <i class="fas fa-receipt"></i>
                <span>Payment Status: ${createPaymentStatusElement(participant.paymentStatus)}</span>
            </div>
            `;
        
        const actions = document.createElement('div');
        actions.className = 'search-result-actions';
        actions.innerHTML = `
            <button class="btn btn-outline btn-sm edit-btn" data-id="${participant.id}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn ${participant.attended ? 'btn-outline' : 'btn-success'} btn-sm attendance-btn" data-id="${participant.id}">
                <i class="fas fa-user-check"></i> ${participant.attended ? 'Unmark' : 'Mark as Attended'}
            </button>
        `;
        
        resultItem.appendChild(header);
        details.appendChild(details);
        actions.appendChild(actions);
        
        // Add event listeners to buttons
        const editBtn = resultItem.querySelector('.edit-btn');
        const attendanceBtn = resultItem.querySelector('.attendance-btn');
        
        editBtn.addEventListener('click', () => openEditModal(participant));
        attendanceBtn.addEventListener('click', () => toggleAttendance(participant.id));
        
        searchResultsList.appendChild(resultItem);
    });
    
    // Show "No results" if no participants found
    if (filteredParticipants.length === 0) {
        searchResultsList.innerHTML = `
            <div class="loading-container">
                <i class="fas fa-search" style="font-size: 48px; color: var(--text-tertiary); margin-bottom: 16px;"></i>
                <p style="color: var(--text-primary);">No participants found</p>
                <p style="color: var(--text-secondary); font-size: 14px;">Try adjusting your search criteria</p>
            </div>
        `;
    }
}

// Create payment status element
function createPaymentStatusElement(status) {
    // Check if the status is a URL (contains "http" or "https")
    const isUrl = status.includes('http') || status.includes('https');
    
    if (isUrl) {
        return `<a href="${status}" target="_blank" class="payment-status link">${status}</a>`;
    } else if (status.toLowerCase() === 'verified') {
        return `<span class="payment-status verified">${status}</span>`;
    } else if (status.toLowerCase() === 'done') {
        return `<span class="payment-status done">${status}</span>`;
    } else {
        return `<span>${status}</span>`;
    }
}

// Open edit modal
function openEditModal(participant) {
    document.getElementById('editId').value = participant.id;
    document.getElementById('editName').value = participant.name;
    document.getElementById('editDegree').value = participant.degree;
    document.getElementById('editEmail').value = participant.email;
    document.getElementById('editWhatsapp').value = participant.whatsapp;
    document.getElementById('editLunch').value = participant.lunchType;
    document.getElementById('createPaymentStatusElement(participant.paymentStatus);
    document.getElementById('editDistrict').value = participant.district;
    document.getElementById('editRemarks').value = participant.remarks || '';
    
    showModal(editModal);
}

// Create payment status element for edit form
function createPaymentStatusElement(status) {
    const paymentStatusElement = document.getElementById('editPaymentStatus');
    paymentStatus.innerHTML = createPaymentStatusElement(status);
    return paymentStatusElement;
}

// Save participant edit
function saveParticipantEdit() {
    const id = document.getElementById('editId').value;
    const participantIndex = participants.findIndex(p => p.id == id);
    
    if (participantIndex !== -1) {
        participants[participantIndex] = {
            ...participants[participantIndex],
            name: document.getElementById('editName').value,
            degree: document.getElementById('editDegree').value,
            email: document.getElementById('editEmail').value,
            whatsapp: document.getElementById('editWhatsapp').value,
            lunchType: document.getElementById('editLunch').value,
            district: document.getElementById('editDistrict').value,
            remarks: document.getElementById('editRemarks').value
        };
        
        // Update filtered participants if needed
        const filteredIndex = filteredParticipants.findIndex(p => p.id == id);
        if (filteredIndex !== -1) {
            filteredParticipants[filteredIndex] = participants[participantIndex];
        }
        
        renderTreeView();
        updateStatistics();
        hideModal(editModal);
        
        // Add to activity history
        addActivity('Edit', `Updated information for ${participants[participantIndex].name}`, 'info');
        
        showToast('Participant information updated successfully', 'success');
    }
}

// Save new participant
function saveNewParticipant() {
    const newParticipant = {
        id: document.getElementById('addId').value,
        name: document.getElementById('addName').value,
        degree: document.getElementById('addDegree').value,
        email: document.getElementById('addEmail').value,
        whatsapp: document.getElementById('addWhatsapp').value,
        lunchType: document.getElementById('addLunch').value,
        district: document.getElementById('addDistrict').value,
        paymentStatus: "Pending",
        attended: false,
        remarks: document.getElementById('addRemarks').value
    };
    
    // Check if ID already exists
    if (participants.some(p => p.id == newParticipant.id)) {
        showToast('A participant with this ID already exists', 'error');
        return;
    }
    
    participants.push(newParticipant);
    filteredParticipants.push(newParticipant);
    
    renderTreeView();
    updateStatistics();
    hideModal(addModal);
    
    // Reset form
    addForm.reset();
    
    // Add to activity history
    addActivity('Add', `Added new participant: ${newParticipant.name}`, 'success');
    
    showToast('New participant added successfully', 'success');
}

// Toggle attendance
function toggleAttendance(id) {
    const participantIndex = participants.findIndex(p => p.id == id);
    
    if (participantIndex !== -1) {
        const wasAttended = participants[participantIndex].attended;
        participants[participantIndex].attended = !wasAttended;
        
        // Update filtered participants if needed
        const filteredIndex = filteredParticipants.findIndex(p => p.id == id);
        if (filteredIndex !== -1) {
            filteredParticipants[filteredIndex] = participants[participantIndex];
        }
        
        renderTreeView();
        updateStatistics();
        
        // Add to activity history
        const action = wasAttended ? 'Unmarked attendance' : 'Marked as attended';
        addActivity('Attendance', `${action} for ${participants[participantIndex].name}`, wasAttended ? 'warning' : 'success');
        
        showToast(
            wasAttended ? 'Attendance unmarked' : 'Marked as attended',
            wasAttended ? 'info' : 'success'
        );
    }
}

// Update statistics
function updateStatistics() {
    const total = participants.length;
    const attended = participants.filter(p => p.attended).length;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
    
    totalParticipantsEl.textContent = total;
    attendedCountEl.textContent = attended;
    attendanceRateEl.textContent = `${rate}%`;
}

// Add activity to history
function addActivity(type, description, category = 'info') {
    const now = new Date();
    const timeString = now.toLocaleString();
    
    activityHistory.unshift({
        type,
        description,
        category,
        time: timeString
    });
    
    // Keep only the last 50 activities
    if (activityHistory.length > 50) {
        activityHistory.pop();
    }
}

// Render activity history
function renderActivityHistory() {
    activityList.innerHTML = '';
    
    if (activityHistory.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No activity history available.</p>';
        return;
    }
    
    activityHistory.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        let iconClass = 'info';
        if (activity.category === 'success') iconClass = 'success';
        if (activity.category === 'warning') iconClass = 'warning';
        
        item.innerHTML = `
            <div class="activity-icon ${iconClass}">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        
        activityList.appendChild(item);
    });
}

// Get activity icon
function getActivityIcon(type) {
    switch (type) {
        case 'Login': return 'sign-in-alt';
        case 'Logout': return 'sign-out-alt';
        case 'Search': return 'search';
        case 'Edit': return 'edit';
        case 'Add': return 'user-plus';
        case 'Attendance': return 'user-check';
        case 'Theme': return 'palette';
        case 'Export': return 'download';
        default: return 'info-circle';
    }
}

// Show modal
function showModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'info-circle';
    if (type === 'success') iconClass = 'check-circle';
    if (type === 'error') iconClass = 'exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${iconClass} toast-icon"></i>
        <div>${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}