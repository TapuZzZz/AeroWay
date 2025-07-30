// AeroWayClient\wwwroot\js\Flight\mybookings.js

document.addEventListener('DOMContentLoaded', function() {
    initializeCustomSelect();
    initializeAnimations();
});

// Custom Select Dropdown
function initializeCustomSelect() {
    const customSelect = document.getElementById('customSelect');
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const options = customSelect.querySelectorAll('.custom-option');
    const hiddenSelect = document.getElementById('sortBookings');
    
    trigger.addEventListener('click', function() {
        customSelect.classList.toggle('open');
    });
    
    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.textContent;
            
            trigger.querySelector('span').textContent = text;
            
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            hiddenSelect.value = value;
            
            customSelect.classList.remove('open');
            
            sortTable();
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });
}

// Filter Bookings with Empty State
function filterBookings(status) {
    const pills = document.querySelectorAll('.filter-pill');
    const rows = document.querySelectorAll('#bookingsTable tbody tr');
    const cards = document.querySelectorAll('.mobile-booking-card');
    const tbody = document.querySelector('#bookingsTable tbody');
    const mobileContainer = document.querySelector('.mobile-bookings');
    
    // Update active pill
    pills.forEach(pill => {
        if (pill.getAttribute('data-filter') === status) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
    
    // Count visible items
    let visibleCount = 0;
    
    // Filter desktop rows
    rows.forEach(row => {
        if (status === 'all') {
            row.style.display = '';
            visibleCount++;
        } else {
            const rowStatus = row.getAttribute('data-status');
            if (rowStatus === status) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        }
    });
    
    // Filter mobile cards
    cards.forEach(card => {
        if (status === 'all') {
            card.style.display = '';
        } else {
            const cardStatus = card.getAttribute('data-status');
            card.style.display = cardStatus === status ? '' : 'none';
        }
    });
    
    // Handle empty state
    handleEmptyFilterState(status, visibleCount, tbody, mobileContainer);
}

// Handle Empty Filter State
function handleEmptyFilterState(status, visibleCount, tbody, mobileContainer) {
    // Remove any existing empty state message
    const existingEmptyRow = document.querySelector('.empty-filter-row');
    const existingEmptyCard = document.querySelector('.empty-filter-card');
    
    if (existingEmptyRow) existingEmptyRow.remove();
    if (existingEmptyCard) existingEmptyCard.remove();
    
    // If no results found, show empty state
    if (visibleCount === 0 && status !== 'all') {
        // Get status display name
        const statusText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        
        // Create empty state for desktop
        if (tbody) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-filter-row';
            emptyRow.innerHTML = `
                <td colspan="7" style="padding: 3rem; text-align: center;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <i class="fas fa-plane-slash" style="font-size: 3rem; color: var(--text-secondary); opacity: 0.5;"></i>
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin: 0;">
                            No ${statusText} Bookings
                        </h3>
                        <p style="color: var(--text-secondary); margin: 0;">
                            You don't have any ${statusText.toLowerCase()} flight bookings at the moment.
                        </p>
                    </div>
                </td>
            `;
            tbody.appendChild(emptyRow);
        }
        
        // Create empty state for mobile
        if (mobileContainer && window.innerWidth <= 1050) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'empty-filter-card';
            emptyCard.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem;">
                    <i class="fas fa-plane-slash" style="font-size: 3rem; color: var(--text-secondary); opacity: 0.5;"></i>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin: 1rem 0 0.5rem;">
                        No ${statusText} Bookings
                    </h3>
                    <p style="color: var(--text-secondary); margin: 0;">
                        You don't have any ${statusText.toLowerCase()} flight bookings at the moment.
                    </p>
                </div>
            `;
            mobileContainer.appendChild(emptyCard);
        }
    }
}

// Sort Table
function sortTable() {
    const select = document.getElementById('sortBookings');
    const tbody = document.querySelector('#bookingsTable tbody');
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.classList.contains('empty-filter-row'));
    const mobileContainer = document.querySelector('.mobile-bookings');
    const cards = Array.from(document.querySelectorAll('.mobile-booking-card'));
    const [sortBy, direction] = select.value.split('-');
    
    // Sort rows
    rows.sort((a, b) => {
        let aVal, bVal;
        
        if (sortBy === 'date') {
            aVal = parseInt(a.getAttribute('data-date'));
            bVal = parseInt(b.getAttribute('data-date'));
        } else if (sortBy === 'price') {
            aVal = parseFloat(a.getAttribute('data-price'));
            bVal = parseFloat(b.getAttribute('data-price'));
        }
        
        if (direction === 'asc') {
            return aVal - bVal;
        } else {
            return bVal - aVal;
        }
    });
    
    // Sort cards
    cards.sort((a, b) => {
        let aVal, bVal;
        
        if (sortBy === 'date') {
            aVal = parseInt(a.getAttribute('data-date'));
            bVal = parseInt(b.getAttribute('data-date'));
        } else if (sortBy === 'price') {
            aVal = parseFloat(a.getAttribute('data-price'));
            bVal = parseFloat(b.getAttribute('data-price'));
        }
        
        if (direction === 'asc') {
            return aVal - bVal;
        } else {
            return bVal - aVal;
        }
    });
    
    // Clear tbody and re-append sorted rows
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    
    rows.forEach(row => tbody.appendChild(row));
    
    // Re-apply current filter to maintain empty state if needed
    const activeFilter = document.querySelector('.filter-pill.active');
    if (activeFilter) {
        const currentFilter = activeFilter.getAttribute('data-filter');
        filterBookings(currentFilter);
    }
    
    if (mobileContainer) {
        cards.forEach(card => mobileContainer.appendChild(card));
    }
}

// Enhanced Animations on load
function initializeAnimations() {
    window.addEventListener('load', () => {
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                row.style.transition = 'all 0.5s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, 300 + (index * 50));
        });
        
        const mobileCards = document.querySelectorAll('.mobile-booking-card');
        mobileCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 300 + (index * 100));
        });
    });
}