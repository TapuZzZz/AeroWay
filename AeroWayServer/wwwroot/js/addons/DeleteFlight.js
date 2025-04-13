// DeleteFlight.js - Handles flight deletion functionality
document.addEventListener('DOMContentLoaded', function() {
    setupDeleteFlightButtons();
});

// Set up event listeners for all delete buttons
function setupDeleteFlightButtons() {
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const flightId = this.dataset.flightId;
            if (!flightId) {
                console.error('Flight ID not found on delete button');
                return;
            }
            
            // Get flight details from the row
            const row = this.closest('tr');
            if (!row) {
                console.error('Could not find parent row');
                return;
            }
            
            const flightDetails = {
                flightId: flightId,
                flightNumber: row.querySelector('.flight-number').textContent.trim(),
                origin: row.cells[1].textContent.trim(),
                destination: row.cells[2].textContent.trim(),
                departureTime: row.cells[3].textContent.trim(),
                status: row.querySelector('.status-badge').textContent.trim(),
                statusClass: row.querySelector('.status-badge').classList[1] || ''
            };
            
            showDeleteConfirmation(flightDetails);
        });
    });
}

// Show the delete confirmation popup with flight details
function showDeleteConfirmation(flightDetails) {
    // Create modal if it doesn't exist yet
    let deleteModal = document.getElementById('deleteFlightPopup');
    
    if (!deleteModal) {
        deleteModal = createDeleteFlightModal();
        document.body.appendChild(deleteModal);
    }
    
    // Update the modal with flight details
    updateDeleteModalContent(deleteModal, flightDetails);
    
    // Display the modal
    setTimeout(() => {
        deleteModal.classList.add('active');
    }, 10);
    
    // Set up event listeners for the modal buttons
    setupDeleteModalEvents(deleteModal, flightDetails);
}

// Create the delete confirmation modal HTML structure
function createDeleteFlightModal() {
    const modal = document.createElement('div');
    modal.id = 'deleteFlightPopup';
    modal.className = 'delete-flight-popup';
    
    modal.innerHTML = `
        <div class="delete-flight-container">
            <div class="delete-flight-header">
                <div class="delete-flight-title">
                    <span>🗑️</span>
                    <span>Delete Flight</span>
                </div>
                <button class="delete-flight-close"></button>
            </div>
            
            <div class="delete-flight-body">
                <div class="delete-flight-confirmation">
                    <div class="delete-flight-message">
                        <p>Are you sure you want to delete this flight?</p>
                        <p>This action cannot be undone.</p>
                    </div>
                    
                    <div class="delete-flight-info">
                        <div class="delete-flight-info-row">
                            <span class="delete-flight-label">Flight Number:</span>
                            <span class="delete-flight-value flight-number"></span>
                        </div>
                        <div class="delete-flight-info-row">
                            <span class="delete-flight-label">Route:</span>
                            <span class="delete-flight-value flight-route"></span>
                        </div>
                        <div class="delete-flight-info-row">
                            <span class="delete-flight-label">Departure:</span>
                            <span class="delete-flight-value flight-departure"></span>
                        </div>
                        <div class="delete-flight-info-row">
                            <span class="delete-flight-label">Status:</span>
                            <span class="delete-flight-value flight-status"></span>
                        </div>
                    </div>
                    
                    <div class="delete-flight-actions">
                        <button class="delete-flight-btn cancel">Cancel</button>
                        <button class="delete-flight-btn confirm">Delete Flight</button>
                    </div>
                </div>
                
                <div class="delete-flight-loading">
                    <div class="delete-flight-spinner"></div>
                    <div class="delete-flight-loading-text">Deleting flight...</div>
                </div>
                
                <div class="delete-flight-success">
                    <div class="delete-flight-success-icon">✓</div>
                    <div class="delete-flight-success-text">Flight Deleted Successfully</div>
                    <div class="delete-flight-success-message">
                        The flight has been permanently removed from the system.
                    </div>
                    <button class="delete-flight-done-btn">Done</button>
                </div>
                
                <div class="delete-flight-error">
                    <div class="delete-flight-error-icon">!</div>
                    <div class="delete-flight-error-text">Error Deleting Flight</div>
                    <div class="delete-flight-error-message"></div>
                    <div>
                        <button class="delete-flight-retry-btn">Retry</button>
                        <button class="delete-flight-cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Update the modal content with the specific flight details
function updateDeleteModalContent(modal, flightDetails) {
    // Reset modal state
    modal.querySelector('.delete-flight-confirmation').style.display = 'block';
    modal.querySelector('.delete-flight-loading').classList.remove('active');
    modal.querySelector('.delete-flight-success').classList.remove('active');
    modal.querySelector('.delete-flight-error').classList.remove('active');
    
    // Update flight details
    modal.querySelector('.flight-number').textContent = flightDetails.flightNumber;
    modal.querySelector('.flight-route').textContent = `${flightDetails.origin} → ${flightDetails.destination}`;
    modal.querySelector('.flight-departure').textContent = flightDetails.departureTime;
    
    // Update status with badge
    const statusElem = modal.querySelector('.flight-status');
    statusElem.innerHTML = '';
    
    const statusBadge = document.createElement('span');
    statusBadge.className = `delete-flight-value-status ${flightDetails.statusClass}`;
    statusBadge.textContent = flightDetails.status;
    statusElem.appendChild(statusBadge);
    
    // Store the flight ID as a data attribute for the confirm button
    modal.querySelector('.delete-flight-btn.confirm').dataset.flightId = flightDetails.flightId;
}

// Set up event listeners for the modal buttons
function setupDeleteModalEvents(modal, flightDetails) {
    // Close button
    const closeBtn = modal.querySelector('.delete-flight-close');
    closeBtn.addEventListener('click', () => closeDeleteModal(modal), { once: true });
    
    // Cancel button
    const cancelBtn = modal.querySelector('.delete-flight-btn.cancel');
    cancelBtn.addEventListener('click', () => closeDeleteModal(modal), { once: true });
    
    // Confirm delete button
    const confirmBtn = modal.querySelector('.delete-flight-btn.confirm');
    confirmBtn.addEventListener('click', () => {
        // Show loading state
        modal.querySelector('.delete-flight-confirmation').style.display = 'none';
        modal.querySelector('.delete-flight-loading').classList.add('active');
        
        // Call the delete API
        deleteFlight(flightDetails.flightId, modal);
    }, { once: true });
    
    // Success done button
    const doneBtn = modal.querySelector('.delete-flight-done-btn');
    doneBtn.addEventListener('click', () => {
        closeDeleteModal(modal);
        // Refresh the page to show updated flight list
        window.location.reload();
    }, { once: true });
    
    // Error retry button
    const retryBtn = modal.querySelector('.delete-flight-retry-btn');
    retryBtn.addEventListener('click', () => {
        // Reset to confirmation view
        modal.querySelector('.delete-flight-error').classList.remove('active');
        modal.querySelector('.delete-flight-confirmation').style.display = 'block';
        
        // Re-add event listener to confirm button
        const confirmBtn = modal.querySelector('.delete-flight-btn.confirm');
        confirmBtn.addEventListener('click', () => {
            modal.querySelector('.delete-flight-confirmation').style.display = 'none';
            modal.querySelector('.delete-flight-loading').classList.add('active');
            deleteFlight(flightDetails.flightId, modal);
        }, { once: true });
    }, { once: true });
    
    // Error cancel button
    const errorCancelBtn = modal.querySelector('.delete-flight-cancel-btn');
    errorCancelBtn.addEventListener('click', () => closeDeleteModal(modal), { once: true });
}

// Close the delete modal and reset it
function closeDeleteModal(modal) {
    modal.classList.remove('active');
    
    // Remove the modal from DOM after animation completes
    setTimeout(() => {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// Send delete request to the server
function deleteFlight(flightId, modal) {
    // Create URL-encoded form data
    const formData = `flightId=${encodeURIComponent(flightId)}`;
    
    // Send AJAX request to delete the flight
    fetch('/api/deleteFlight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Show success message
            modal.querySelector('.delete-flight-loading').classList.remove('active');
            modal.querySelector('.delete-flight-success').classList.add('active');
            
            // Remove the flight row from the table
            const flightRow = document.querySelector(`.action-btn.delete[data-flight-id="${flightId}"]`).closest('tr');
            if (flightRow) {
                // Add fade-out animation
                flightRow.style.transition = 'opacity 0.5s ease';
                flightRow.style.opacity = '0';
                
                // Remove after animation
                setTimeout(() => {
                    if (flightRow.parentNode) {
                        flightRow.parentNode.removeChild(flightRow);
                        
                        // Update flight stats
                        if (typeof updateFlightStats === 'function') {
                            updateFlightStats();
                        }
                    }
                }, 500);
            }
        } else {
            throw new Error(data.message || 'Unknown error occurred');
        }
    })
    .catch(error => {
        // Show error message
        modal.querySelector('.delete-flight-loading').classList.remove('active');
        modal.querySelector('.delete-flight-error').classList.add('active');
        modal.querySelector('.delete-flight-error-message').textContent = 
            error.message || 'Failed to delete the flight. Please try again.';
    });
}