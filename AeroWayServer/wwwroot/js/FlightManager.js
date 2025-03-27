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

// Apply theme on page load
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(savedTheme);
    updateLastUpdateTime();
    setupFlightSearch();
});

// Toggle theme function
function toggleTheme() {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dashboard-theme', newTheme);
    applyTheme(newTheme);
    
    // שידור אירוע שינוי ערכת נושא
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
    // Find highlight elements and process them carefully
    document.querySelectorAll('.highlight-search').forEach(el => {
        try {
            // Method 1: Use textContent to replace the element
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
    
    // Count visible rows by status (excluding the no-results message row)
    tableRows.forEach(row => {
        // Check if row is visible and not the "no results" message
        if (row.style.display !== 'none' && !row.id?.includes('noResultsMessage')) {
            totalVisible++;
            
            // Get status from the row
            const statusCell = row.querySelector('.status-badge');
            if (statusCell) {
                const status = statusCell.textContent.trim().toLowerCase();
                
                // Increment appropriate counter
                if (status === 'scheduled') scheduledCount++;
                else if (status === 'boarding') boardingCount++;
                else if (status === 'departed') departedCount++;
                else if (status === 'arrived') arrivedCount++;
                else if (status === 'delayed') delayedCount++;
                else if (status === 'cancelled') cancelledCount++;
            }
        }
    });
    
    // Update statistics displays - immediately after counting
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
        // No results found - add red borders and backgrounds
        statBoxes.forEach(box => {
            box.classList.add('no-results-border');
        });
        // Add red styling to search input and clear button
        if (searchInput) {
            searchInput.classList.add('no-results-border');
        }
        if (clearButton) {
            clearButton.classList.add('no-results-border');
        }
    } else {
        // Results found or no search active - remove red styling
        statBoxes.forEach(box => {
            box.classList.remove('no-results-border');
        });
        // Remove red styling from search input and clear button
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
    // Store a copy of innerHTML for safer manipulation
    const originalHTML = element.innerHTML;
    
    try {
        // Create a text node with the text content
        const text = element.textContent;
        const lowerText = text.toLowerCase();
        
        // Check if search term exists in the text
        if (lowerText.indexOf(searchTerm.toLowerCase()) !== -1) {
            // Create a temporary div to work with
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalHTML;
            
            // Create a document fragment to hold the result
            const fragment = document.createDocumentFragment();
            
            // Process each child node
            Array.from(tempDiv.childNodes).forEach(node => {
                // If it's a text node, check for matches
                if (node.nodeType === Node.TEXT_NODE) {
                    const nodeText = node.textContent;
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    
                    // Split the text by matches
                    const parts = nodeText.split(regex);
                    
                    // Recreate with highlight spans
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
                    // For other nodes, clone them
                    fragment.appendChild(node.cloneNode(true));
                }
            });
            
            // Clear and append the new content
            element.innerHTML = '';
            element.appendChild(fragment);
        }
    } catch (e) {
        console.error("Error highlighting text:", e);
        // Restore original HTML in case of error
        element.innerHTML = originalHTML;
    }
}

// Function to update error message with the latest search term
function updateErrorMessage(searchTerm) {
    // Get current error message if exists
    let noResultsMessage = document.getElementById('noResultsMessage');
    
    // When no results are found, we'll show or update the error message
    if (noResultsMessage) {
        // Update the existing message with the new search term
        const tdElement = noResultsMessage.querySelector('td');
        if (tdElement) {
            tdElement.textContent = `No flights found matching "${searchTerm}"`;
        }
    } else {
        // Create a new message element if doesn't exist
        noResultsMessage = document.createElement('tr');
        noResultsMessage.id = 'noResultsMessage';
        noResultsMessage.innerHTML = `<td colspan="10" class="no-results">No flights found matching "${searchTerm}"</td>`;
        
        // Append it to the table body
        const tbody = document.querySelector('.flights-table tbody');
        if (tbody) {
            tbody.appendChild(noResultsMessage);
        }
    }
}

// Enhanced flight search with input validation
function setupFlightSearch() {
    const searchInput = document.getElementById('flightSearchInput');
    const clearButton = document.getElementById('clearSearch');
    const tableRows = document.querySelectorAll('.flights-table tbody tr');
    
    if (searchInput && clearButton && tableRows) {
        // Flag to optimize performance by tracking if the last state was "no results"
        let lastSearchHadNoResults = false;
        
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
            
            // Proceed with search function for every character change
            performSearch(this.value);
        });
        
        // Extract search logic to separate function for reuse
        function performSearch(searchTerm) {
            searchTerm = searchTerm.toLowerCase();
            
            // Show/hide clear button based on search input
            if (searchTerm.length > 0) {
                clearButton.style.visibility = 'visible';
                clearButton.style.opacity = '1';
            } else {
                clearButton.style.visibility = 'hidden';
                clearButton.style.opacity = '0';
            }
            
            // Clear previous highlights safely
            clearHighlights();
            
            let hasResults = false;
            
            // Only do full table search for non-empty search terms
            if (searchTerm.length > 0) {
                tableRows.forEach(row => {
                    // Skip the no-results message row if it exists
                    if (row.id === 'noResultsMessage') return;
                    
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        row.style.display = '';
                        hasResults = true;
                        
                        // Highlight matching text using the safer method
                        // Only process standard data cells, not action cells
                        Array.from(row.querySelectorAll('td:not(.actions)')).forEach(cell => {
                            // Check if the cell contains text (not just buttons)
                            const cellText = cell.textContent.toLowerCase();
                            if (cellText.includes(searchTerm)) {
                                // Use the safer highlighting method
                                highlightTextSafely(cell, searchTerm);
                            }
                        });
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                // Real-time update of error message on each keystroke
                if (!hasResults) {
                    updateErrorMessage(searchInput.value);
                    lastSearchHadNoResults = true;
                } else if (lastSearchHadNoResults) {
                    // Remove error message if previously had no results
                    const noResultsMessage = document.getElementById('noResultsMessage');
                    if (noResultsMessage) {
                        noResultsMessage.remove();
                    }
                    lastSearchHadNoResults = false;
                }
            } else {
                // Empty search term - show all rows
                tableRows.forEach(row => {
                    if (row.id !== 'noResultsMessage') {
                        row.style.display = '';
                    }
                });
                
                // Remove error message for empty search
                const noResultsMessage = document.getElementById('noResultsMessage');
                if (noResultsMessage) {
                    noResultsMessage.remove();
                }
                lastSearchHadNoResults = false;
            }
            
            // Update flight statistics based on filtered results - do this on every keystroke
            updateFlightStats();
        }
        
        // Clear search button
        clearButton.addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = '';
            
            // Use the safe method to clear highlights
            clearHighlights();
            
            // Reset row display
            tableRows.forEach(row => {
                if (row.id !== 'noResultsMessage') {
                    row.style.display = '';
                }
            });
            
            // Remove no results message
            const noResultsMessage = document.getElementById('noResultsMessage');
            if (noResultsMessage) {
                noResultsMessage.remove();
            }
            
            // Hide clear button
            clearButton.style.visibility = 'hidden';
            clearButton.style.opacity = '0';
            
            // Reset input focus
            searchInput.focus();
            
            // Update statistics to show original counts
            updateFlightStats();
            
            // Reset the last search flag
            lastSearchHadNoResults = false;
        });
    }
}

// פונקציה להוספת סינון בלחיצה על קוביות הסטטוס
function setupStatusFiltering() {
    // מצא את כל קוביות הסטטוס
    const statItems = document.querySelectorAll('.stat-item');
    const tableRows = document.querySelectorAll('.flights-table tbody tr');
    const searchInput = document.getElementById('flightSearchInput');
    
    // עבור על כל קוביות הסטטוס והוסף להן אירוע לחיצה
    statItems.forEach(statItem => {
        statItem.style.cursor = 'pointer'; // שינוי סמן העכבר לסמן לחיצה
        
        statItem.addEventListener('click', function() {
            // בטל את החיפוש הנוכחי אם קיים
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                // הסר הדגשות
                clearHighlights();
                // הסר הודעת שגיאה אם קיימת
                const noResultsMessage = document.getElementById('noResultsMessage');
                if (noResultsMessage) {
                    noResultsMessage.remove();
                }
                // הסתר כפתור ניקוי חיפוש
                const clearButton = document.getElementById('clearSearch');
                if (clearButton) {
                    clearButton.style.visibility = 'hidden';
                    clearButton.style.opacity = '0';
                }
            }
            
            // בדוק איזה סטטוס נבחר
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
            
            // הסר הדגשה מכל הקוביות
            statItems.forEach(item => {
                item.classList.remove('active-filter');
            });
            
            // סנן את הטבלה לפי הסטטוס שנבחר
            let hasResults = false;
            
            tableRows.forEach(row => {
                // דלג על שורת הודעת שגיאה אם קיימת
                if (row.id === 'noResultsMessage') return;
                
                if (selectedStatus === 'total') {
                    // הצג את כל השורות
                    row.style.display = '';
                    hasResults = true;
                } else {
                    // בדוק אם הסטטוס של השורה תואם את הסטטוס שנבחר
                    const statusBadge = row.querySelector('.status-badge');
                    if (statusBadge && statusBadge.textContent.trim().toLowerCase() === selectedStatus) {
                        row.style.display = '';
                        hasResults = true;
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
            
            // הוסף הדגשה לקוביה שנבחרה
            if (selectedStatus !== 'total') {
                this.classList.add('active-filter');
            }
            
            // הצג הודעת שגיאה אם אין תוצאות
            if (!hasResults && selectedStatus !== 'total') {
                // יצירת הודעת שגיאה
                const noResultsMessage = document.createElement('tr');
                noResultsMessage.id = 'noResultsMessage';
                noResultsMessage.innerHTML = `<td colspan="10" class="no-results">No flights found with status "${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}"</td>`;
                
                // הוספת ההודעה לטבלה
                const tbody = document.querySelector('.flights-table tbody');
                if (tbody) {
                    tbody.appendChild(noResultsMessage);
                }
            }
            
            // עדכון סטטיסטיקות
            updateFlightStats();
        });
    });
}

// הוספת סגנון CSS לקובייה שנבחרה
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
    setupStatusFiltering(); // הוספת קריאה לפונקציה החדשה
    
    // Set initial stats
    updateFlightStats();
});