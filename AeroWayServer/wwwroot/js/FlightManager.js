// Theme management
const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
const root = document.documentElement;
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}

// Toggle theme function
function toggleTheme() {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dashboard-theme', newTheme);
    applyTheme(newTheme);
    
    const themeChangeEvent = new CustomEvent('themeChange', {
        detail: { theme: newTheme }
    });
    window.dispatchEvent(themeChangeEvent);
}

// Auto-refresh functionality
let isAutoRefresh = true;
let refreshInterval = setInterval(() => { location.reload(); }, 300000); // 5 minutes = 300000 ms

function toggleRefresh() {
    const statusBadge = document.getElementById('refreshStatus');
    const statusIcon = statusBadge.querySelector('.status-icon');
    const statusText = statusBadge.querySelector('.status-text');

    if (isAutoRefresh) {
        clearInterval(refreshInterval);
        statusIcon.textContent = '⏸️';
        statusText.textContent = 'Refresh Paused';
        statusBadge.classList.remove('status-active');
        statusBadge.classList.add('status-paused');
        isAutoRefresh = false;
    } else {
        refreshInterval = setInterval(() => { location.reload(); }, 300000);
        statusIcon.textContent = '🔄';
        statusText.textContent = 'Auto Refresh';
        statusBadge.classList.remove('status-paused');
        statusBadge.classList.add('status-active');
        isAutoRefresh = true;
    }
}

// Update the last update time
function updateLastUpdateTime() {
    const now = new Date();
    const formattedDate = now.getFullYear() + '-' + 
          String(now.getMonth() + 1).padStart(2, '0') + '-' + 
          String(now.getDate()).padStart(2, '0') + ' ' + 
          String(now.getHours()).padStart(2, '0') + ':' + 
          String(now.getMinutes()).padStart(2, '0') + ':' + 
          String(now.getSeconds()).padStart(2, '0');
    
    document.getElementById('lastUpdateTime').textContent = formattedDate;
}

// Safely clear highlights to prevent status display issues
function clearHighlights() {
    document.querySelectorAll('.highlight-search').forEach(el => {
        try {
            const text = el.textContent;
            const span = document.createElement('span');
            span.textContent = text;
            el.parentNode.replaceChild(span.firstChild, el);
        } catch (e) {
            console.error("Error clearing highlight:", e);
        }
    });
}

// Function to update flight statistics based on visible rows
function updateFlightStats() {
    const tableRows = document.querySelectorAll('.flights-table tbody tr');
    const searchInput = document.getElementById('flightSearchInput');
    const clearButton = document.getElementById('clearSearch');
    
    // Initialize counters
    let totalVisible = 0;
    let scheduledCount = 0;
    let boardingCount = 0;
    let departedCount = 0;
    let arrivedCount = 0;
    let delayedCount = 0;
    let cancelledCount = 0;
    
    // Count visible rows by status
    tableRows.forEach(row => {
        if (row.style.display !== 'none' && !row.id?.includes('noResultsMessage')) {
            totalVisible++;
            
            const statusCell = row.querySelector('.status-badge');
            if (statusCell) {
                const status = statusCell.textContent.trim().toLowerCase();
                
                if (status === 'scheduled') scheduledCount++;
                else if (status === 'boarding') boardingCount++;
                else if (status === 'departed') departedCount++;
                else if (status === 'arrived') arrivedCount++;
                else if (status === 'delayed') delayedCount++;
                else if (status === 'cancelled') cancelledCount++;
            }
        }
    });
    
    // Update statistics displays
    document.querySelector('.flight-stats .total .stat-value').textContent = totalVisible;
    document.querySelector('.flight-stats .scheduled .stat-value').textContent = scheduledCount;
    document.querySelector('.flight-stats .boarding .stat-value').textContent = boardingCount;
    document.querySelector('.flight-stats .departed .stat-value').textContent = departedCount;
    document.querySelector('.flight-stats .arrived .stat-value').textContent = arrivedCount;
    document.querySelector('.flight-stats .delayed .stat-value').textContent = delayedCount;
    document.querySelector('.flight-stats .cancelled .stat-value').textContent = cancelledCount;
    
    // Add or remove red borders based on search results
    const statBoxes = document.querySelectorAll('.stat-item');
    const searchIsActive = searchInput && searchInput.value.trim().length > 0;
    
    if (searchIsActive && totalVisible === 0) {
        statBoxes.forEach(box => {
            box.classList.add('no-results-border');
        });
        if (searchInput) {
            searchInput.classList.add('no-results-border');
        }
        if (clearButton) {
            clearButton.classList.add('no-results-border');
        }
    } else {
        statBoxes.forEach(box => {
            box.classList.remove('no-results-border');
        });
        if (searchInput) {
            searchInput.classList.remove('no-results-border');
        }
        if (clearButton) {
            clearButton.classList.remove('no-results-border');
        }
    }
}

// Safe method to highlight text that won't affect HTML structure
function highlightTextSafely(element, searchTerm) {
    const originalHTML = element.innerHTML;
    
    try {
        const text = element.textContent;
        const lowerText = text.toLowerCase();
        
        if (lowerText.indexOf(searchTerm.toLowerCase()) !== -1) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalHTML;
            
            const fragment = document.createDocumentFragment();
            
            Array.from(tempDiv.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const nodeText = node.textContent;
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    
                    const parts = nodeText.split(regex);
                    
                    parts.forEach(part => {
                        if (part.toLowerCase() === searchTerm.toLowerCase()) {
                            const span = document.createElement('span');
                            span.className = 'highlight-search';
                            span.textContent = part;
                            fragment.appendChild(span);
                        } else if (part) {
                            fragment.appendChild(document.createTextNode(part));
                        }
                    });
                } else {
                    fragment.appendChild(node.cloneNode(true));
                }
            });
            
            element.innerHTML = '';
            element.appendChild(fragment);
        }
    } catch (e) {
        console.error("Error highlighting text:", e);
        element.innerHTML = originalHTML;
    }
}

// Function to update error message with the latest search term
function updateErrorMessage(searchTerm) {
    let noResultsMessage = document.getElementById('noResultsMessage');
    
    if (noResultsMessage) {
        const tdElement = noResultsMessage.querySelector('td');
        if (tdElement) {
            tdElement.textContent = `No flights found matching "${searchTerm}"`;
        }
    } else {
        noResultsMessage = document.createElement('tr');
        noResultsMessage.id = 'noResultsMessage';
        noResultsMessage.innerHTML = `<td colspan="10" class="no-results">No flights found matching "${searchTerm}"</td>`;
        
        const tbody = document.querySelector('.flights-table tbody');
        if (tbody) {
            tbody.appendChild(noResultsMessage);
        }
    }
}

// Helper function to get a unique identifier for a row without an ID
function getRowIdentifier(row) {
    const flightNumberCell = row.querySelector('.flight-number');
    if (flightNumberCell) {
        return 'row-' + flightNumberCell.textContent.trim();
    }
    
    const parent = row.parentElement;
    if (parent) {
        return 'row-index-' + Array.from(parent.children).indexOf(row);
    }
    
    return 'row-' + Math.random().toString(36).substring(2, 9);
}

// Optimized search function to perform all visual updates simultaneously
function performSearch(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    
    // First, collect all the visual changes we need to make
    let visualChanges = {
        clearButtonVisible: searchTerm.length > 0,
        rowVisibility: {},
        highlightElements: [],
        showNoResults: false
    };
    
    // Clear previous highlights safely
    clearHighlights();
    
    let hasResults = false;
    
    // Only do full table search for non-empty search terms
    if (searchTerm.length > 0) {
        const tableRows = document.querySelectorAll('.flights-table tbody tr');
        tableRows.forEach(row => {
            // Skip the no-results message row if it exists
            if (row.id === 'noResultsMessage') return;
            
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                visualChanges.rowVisibility[row.id || getRowIdentifier(row)] = true;
                hasResults = true;
                
                // Collect elements for highlighting
                Array.from(row.querySelectorAll('td:not(.actions)')).forEach(cell => {
                    const cellText = cell.textContent.toLowerCase();
                    if (cellText.includes(searchTerm)) {
                        visualChanges.highlightElements.push({
                            element: cell,
                            term: searchTerm
                        });
                    }
                });
            } else {
                visualChanges.rowVisibility[row.id || getRowIdentifier(row)] = false;
            }
        });
        
        visualChanges.showNoResults = !hasResults;
    } else {
        // Empty search term - show all rows
        const tableRows = document.querySelectorAll('.flights-table tbody tr');
        tableRows.forEach(row => {
            if (row.id !== 'noResultsMessage') {
                visualChanges.rowVisibility[row.id || getRowIdentifier(row)] = true;
            }
        });
    }
    
    // Now, batch apply all visual changes in one go
    requestAnimationFrame(() => {
        // 1. Update clear button visibility
        const clearButton = document.getElementById('clearSearch');
        if (clearButton) {
            clearButton.style.visibility = visualChanges.clearButtonVisible ? 'visible' : 'hidden';
            clearButton.style.opacity = visualChanges.clearButtonVisible ? '1' : '0';
        }
        
        // 2. Update row visibility
        const tableRows = document.querySelectorAll('.flights-table tbody tr');
        tableRows.forEach(row => {
            if (row.id === 'noResultsMessage') return;
            
            const identifier = row.id || getRowIdentifier(row);
            if (identifier in visualChanges.rowVisibility) {
                row.style.display = visualChanges.rowVisibility[identifier] ? '' : 'none';
            }
        });
        
        // 3. Apply highlights
        visualChanges.highlightElements.forEach(item => {
            highlightTextSafely(item.element, item.term);
        });
        
        // 4. Show/hide no results message
        const noResultsMessage = document.getElementById('noResultsMessage');
        if (visualChanges.showNoResults) {
            if (!noResultsMessage) {
                updateErrorMessage(document.getElementById('flightSearchInput').value);
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
        
        // 5. Update flight statistics based on filtered results
        updateFlightStats();
    });
}

// Improved flight search with optimized updates
function setupFlightSearch() {
    const searchInput = document.getElementById('flightSearchInput');
    const clearButton = document.getElementById('clearSearch');
    
    if (searchInput && clearButton) {
        // Add input validation to restrict input to English letters, numbers and symbols
        searchInput.addEventListener('input', function(e) {
            // Get current value
            let value = this.value;
            
            // Remove invalid characters (non-English letters, numbers, or basic symbols)
            const validInput = value.replace(/[^\w\s\-_.#@&*()[\]{}|\\\/+:;,?!=]/g, '');
            
            if (value !== validInput) {
                // If invalid characters were entered, replace with cleaned version
                this.value = validInput;
                value = validInput;
            }
            
            // Convert to uppercase
            this.value = value.toUpperCase();
            
            // Reset status filter when using search
            document.querySelectorAll('.stat-item').forEach(item => {
                item.classList.remove('active-filter');
            });
            
            // Clear any existing no-results messages
            const noResultsMessage = document.getElementById('noResultsMessage');
            if (noResultsMessage) {
                noResultsMessage.remove();
            }
            
            // Perform optimized search
            performSearch(this.value);
        });
        
        // Clear search button
        clearButton.addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = '';
            
            // Use the safe method to clear highlights
            clearHighlights();
            
            // Perform optimized empty search
            performSearch('');
            
            // Reset input focus
            searchInput.focus();
        });
    }
}

// Improved status filtering with proper message management
function setupStatusFiltering() {
    const statItems = document.querySelectorAll('.stat-item');
    const tableRows = document.querySelectorAll('.flights-table tbody tr');
    const searchInput = document.getElementById('flightSearchInput');
    
    // Track the currently active filter
    let activeFilter = null;
    
    statItems.forEach(statItem => {
        statItem.style.cursor = 'pointer';
        
        statItem.addEventListener('click', function() {
            // Clear current search if exists
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                clearHighlights();
                
                // Remove error message if exists
                removeNoResultsMessage();
                
                // Hide clear search button
                const clearButton = document.getElementById('clearSearch');
                if (clearButton) {
                    clearButton.style.visibility = 'hidden';
                    clearButton.style.opacity = '0';
                }
            }
            
            // Determine which status was selected
            let selectedStatus = '';
            if (this.classList.contains('total')) {
                selectedStatus = 'total';
            } else if (this.classList.contains('scheduled')) {
                selectedStatus = 'scheduled';
            } else if (this.classList.contains('boarding')) {
                selectedStatus = 'boarding';
            } else if (this.classList.contains('departed')) {
                selectedStatus = 'departed';
            } else if (this.classList.contains('arrived')) {
                selectedStatus = 'arrived';
            } else if (this.classList.contains('delayed')) {
                selectedStatus = 'delayed';
            } else if (this.classList.contains('cancelled')) {
                selectedStatus = 'cancelled';
            }
            
            // If clicking the same filter again, treat it as clearing the filter
            if (activeFilter === selectedStatus && selectedStatus !== 'total') {
                selectedStatus = 'total';
                activeFilter = null;
            } else {
                activeFilter = selectedStatus;
            }
            
            // Remove highlight from all items
            statItems.forEach(item => {
                item.classList.remove('active-filter');
            });
            
            // Filter the table by selected status
            let hasResults = false;
            
            // Always remove any existing no-results message first
            removeNoResultsMessage();
            
            tableRows.forEach(row => {
                // Skip error message row if exists
                if (row.id === 'noResultsMessage') return;
                
                if (selectedStatus === 'total') {
                    // Show all rows
                    row.style.display = '';
                    hasResults = true;
                } else {
                    // Check if row status matches selected status
                    const statusBadge = row.querySelector('.status-badge');
                    if (statusBadge && statusBadge.textContent.trim().toLowerCase() === selectedStatus) {
                        row.style.display = '';
                        hasResults = true;
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
            
            // Add highlight to selected item (only if not 'total')
            if (selectedStatus !== 'total') {
                this.classList.add('active-filter');
                
                // Show error message if no results and not 'total'
                if (!hasResults) {
                    createNoResultsMessage(selectedStatus);
                }
            }
            
            // Update statistics
            updateFlightStats();
        });
    });
}

// Helper function to remove no results message
function removeNoResultsMessage() {
    const noResultsMessage = document.getElementById('noResultsMessage');
    if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

// Helper function to create no results message
function createNoResultsMessage(status) {
    const noResultsMessage = document.createElement('tr');
    noResultsMessage.id = 'noResultsMessage';
    
    // Format the status text with first letter capitalized
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    
    noResultsMessage.innerHTML = `<td colspan="10" class="no-results">No flights found with status "${formattedStatus}"</td>`;
    
    // Add the message to the table
    const tbody = document.querySelector('.flights-table tbody');
    if (tbody) {
        tbody.appendChild(noResultsMessage);
    }
}

// Add styles for status filter highlighting
const styleElement = document.createElement('style');
styleElement.textContent = `
    .stat-item {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .stat-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .stat-item.active-filter {
        border-width: 3px;
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    [data-theme="light"] .stat-item.active-filter {
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    }
`;
document.head.appendChild(styleElement);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    applyTheme(savedTheme);
    updateLastUpdateTime();
    setupFlightSearch();
    setupStatusFiltering();
    
    // Set initial stats
    updateFlightStats();
});