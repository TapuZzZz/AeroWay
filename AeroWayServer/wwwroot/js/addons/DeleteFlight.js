// DeleteFlight.js - Simplified with clean dots animation
document.addEventListener('DOMContentLoaded', function() {
    setupDeleteFlightButtons();
});

// Set up event listeners for all delete buttons
function setupDeleteFlightButtons() {
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    
    deleteButtons.forEach(button => {
        // בדוק אם הטיסה במצב שניתן למחיקה
        const row = button.closest('tr');
        if (row) {
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                const status = statusBadge.textContent.trim().toLowerCase();
                
                // רק טיסות במצב scheduled או delayed ניתנות למחיקה
                if (status !== 'scheduled' && status !== 'delayed') {
                    // הסר את אירוע הלחיצה ושנה את הסגנון של הכפתור
                    button.removeAttribute('data-flight-id');
                    button.style.opacity = '0.5';
                    button.style.cursor = 'not-allowed';
                    button.title = 'לא ניתן למחוק טיסות שאינן במצב "Scheduled" או "Delayed"';
                    
                    // מנע לחיצה על הכפתור
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        showStatusDeleteError();
                    });
                    
                    return; // סיים את הפונקציה כאן עבור טיסות שלא ניתנות למחיקה
                }
            }
        }
        
        // המשך עם הקוד הקיים עבור טיסות שניתנות למחיקה
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
            
            // Store a reference to the row for animation later
            this.dataset.rowReference = row.id || 'row-' + Math.random().toString(36).substring(2, 9);
            if (!row.id) {
                row.id = this.dataset.rowReference;
            }
            
            // Extract all relevant flight data
            const flightDetails = {
                flightId: flightId,
                flightNumber: row.querySelector('.flight-number').textContent.trim(),
                origin: row.cells[1].textContent.trim(),
                destination: row.cells[2].textContent.trim(),
                departureTime: row.cells[3].textContent.trim(),
                arrivalTime: row.cells[4].textContent.trim(),
                gate: row.cells[5].textContent.trim() || 'Not Assigned',
                status: row.querySelector('.status-badge').textContent.trim(),
                statusClass: row.querySelector('.status-badge').classList[1] || '',
                rowReference: this.dataset.rowReference
            };
            
            showDeleteConfirmation(flightDetails);
        });
    });
}

// פונקציה חדשה להצגת שגיאה כאשר מנסים למחוק טיסה שאינה ניתנת למחיקה
function showStatusDeleteError() {
    // הסר חלונות קיימים אם יש
    const existingModal = document.getElementById('statusErrorPopup');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // יצירת חלון השגיאה
    const modal = document.createElement('div');
    modal.id = 'statusErrorPopup';
    modal.className = 'delete-flight-popup';
    
    modal.innerHTML = `
        <div class="delete-flight-container" style="max-width: 450px;">
            <div class="delete-flight-header">
                <div class="delete-flight-title">
                    <span>⚠️</span>
                    <span>Flight Deletion Restriction</span>
                </div>
            </div>
            
            <div class="delete-flight-body">
                <div class="delete-flight-error" style="display: flex;">
                    <div class="delete-flight-error-icon">!</div>
                    <div class="delete-flight-error-text">Cannot Delete</div>
                    <div class="delete-flight-error-message">
                        Only flights with status "Scheduled" or "Delayed" can be deleted.<br>
                        Flights with other statuses cannot be removed from the system.
                    </div>
                    <button class="delete-flight-done-btn">Got it</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // הוספת אנימציה להצגת החלון
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // הוספת אירוע ללחצן הסגירה
    const closeBtn = modal.querySelector('.delete-flight-done-btn');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    });
}

// Show the delete confirmation popup
function showDeleteConfirmation(flightDetails) {
    // Remove any existing modal
    const existingModal = document.getElementById('deleteFlightPopup');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal
    const modal = createDeleteFlightModal();
    document.body.appendChild(modal);
    
    // Update the modal with flight details
    updateDeleteModalContent(modal, flightDetails);
    
    // Display the modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Set up event listeners for the modal buttons
    setupDeleteModalEvents(modal, flightDetails);
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
            </div>
            
            <div class="delete-flight-body">
                <div class="delete-flight-confirmation-view">
                    <div class="delete-flight-message">
                        <p>Are you sure you want to delete this flight?</p>
                        <p>This action cannot be undone and will permanently remove the flight from the system.</p>
                    </div>
                    
                    <div class="delete-flight-info">
                        <div class="delete-flight-info-row">
                            <span class="delete-flight-label">Database ID:</span>
                            <span class="delete-flight-value flight-db-id"></span>
                        </div>
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
                            <span class="delete-flight-label">Arrival:</span>
                            <span class="delete-flight-value flight-arrival"></span>
                        </div>
                        <div class="delete-flight-info-row">
                            <span class="delete-flight-label">Gate:</span>
                            <span class="delete-flight-value flight-gate"></span>
                        </div>
                        <div class="delete-flight-info-row">
                            <span class="delete-flight-label">Status:</span>
                            <span class="delete-flight-value flight-status"></span>
                        </div>
                    </div>
                    
                    <div class="delete-flight-form">
                        <div class="delete-flight-form-group">
                            <label class="delete-flight-form-label" for="deletionReason">
                                Deletion Reason: <span style="color: var(--danger-color);">*</span>
                            </label>
                            <select class="delete-flight-select" id="deletionReason" required>
                                <option value="" selected disabled>Select reason...</option>
                                <option value="canceled">Flight Canceled</option>
                                <option value="duplicate">Duplicate Entry</option>
                                <option value="date-change">Date/Time Change</option>
                                <option value="routing">Routing Change</option>
                                <option value="technical">Technical Issues</option>
                                <option value="other">Other</option>
                            </select>
                            <div class="delete-flight-error-text" id="reasonError" style="display: none; color: var(--danger-color); font-size: 0.8rem; margin-top: 0.4rem;">
                                Please select a deletion reason
                            </div>
                        </div>
                        
                        <div class="delete-flight-form-group" id="otherReasonGroup" style="display: none;">
                            <label class="delete-flight-form-label" for="otherReason">
                                Specify Reason: <span style="color: var(--danger-color);">*</span>
                            </label>
                            <input type="text" class="delete-flight-input" id="otherReason" placeholder="Please provide details...">
                            <div class="delete-flight-error-text" id="otherReasonError" style="display: none; color: var(--danger-color); font-size: 0.8rem; margin-top: 0.4rem;">
                                Please provide a specific reason
                            </div>
                        </div>
                    </div>
                    
                    <div class="delete-flight-confirmation">
                        <div class="delete-flight-checkbox">
                            <input type="checkbox" class="delete-flight-checkbox-input" id="confirmDeleteCheckbox">
                            <label class="delete-flight-checkbox-label" for="confirmDeleteCheckbox">
                                I confirm that I want to delete this flight from the flight board
                            </label>
                        </div>
                    </div>
                    
                    <div class="delete-flight-actions">
                        <button class="delete-flight-btn cancel">Cancel</button>
                        <button class="delete-flight-btn confirm" disabled>Delete Flight</button>
                    </div>
                </div>
                
                <div class="delete-flight-loading">
                    <div class="delete-flight-spinner"></div>
                    <div class="delete-flight-loading-text">Deleting flight from system...</div>
                </div>
                
                <div class="delete-flight-dots-animation">
                    <div class="delete-flight-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div class="delete-flight-animation-text">Removing flight...</div>
                </div>
                
                <div class="delete-flight-success">
                    <div class="delete-flight-success-icon">✓</div>
                    <div class="delete-flight-success-text">Flight Deleted</div>
                    <div class="delete-flight-success-message">
                        The flight has been permanently removed from the system.
                    </div>
                    <button class="delete-flight-done-btn">Done</button>
                </div>
                
                <div class="delete-flight-error">
                    <div class="delete-flight-error-icon">!</div>
                    <div class="delete-flight-error-text">Error</div>
                    <div class="delete-flight-error-message"></div>
                    <div>
                        <button class="delete-flight-retry-btn">Retry</button>
                        <button class="delete-flight-cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add animation styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Simple dots animation */
        .delete-flight-dots-animation {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem 1rem;
            text-align: center;
            height: 200px;
        }
        
        /* Dots animation */
        .delete-flight-dots {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            margin-bottom: 40px;
        }
        
        .delete-flight-dots span {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: var(--danger-color, #ef4444);
            opacity: 0.7;
        }
        
        .delete-flight-dots span:nth-child(1) {
            animation: dotPulse 1.4s infinite 0s;
        }
        
        .delete-flight-dots span:nth-child(2) {
            animation: dotPulse 1.4s infinite 0.2s;
        }
        
        .delete-flight-dots span:nth-child(3) {
            animation: dotPulse 1.4s infinite 0.4s;
        }
        
        @keyframes dotPulse {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(1); opacity: 0.7; }
        }
        
        /* Text animation */
        .delete-flight-animation-text {
            color: var(--text);
            font-weight: 500;
            font-size: 1rem;
            opacity: 0.9;
        }
        
        /* Row fade out animation */
        .fadeOutRow {
            animation: fadeOutSmoothly 1s forwards;
        }
        
        @keyframes fadeOutSmoothly {
            0% { opacity: 1; background-color: rgba(239, 68, 68, 0.05); }
            50% { background-color: rgba(239, 68, 68, 0.1); }
            100% { opacity: 0; height: 0; padding: 0; border: 0; }
        }
        
        /* סגנון לכפתור מחיקה שאינו פעיל */
        .action-btn.delete.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }
        
        /* עיצוב לכפתור מחיקה כאשר עוברים עליו עם העכבר במצב לא פעיל */
        .action-btn.delete[disabled]:hover {
            transform: none;
            color: var(--blue-gray);
        }
        
        /* סגנון לחלון שגיאת סטטוס */
        #statusErrorPopup .delete-flight-container {
            max-width: 450px;
        }
        
        #statusErrorPopup .delete-flight-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        
        #statusErrorPopup .delete-flight-error-message {
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
    `;
    document.head.appendChild(styleElement);
    
    return modal;
}

// Update the modal content with the specific flight details
function updateDeleteModalContent(modal, flightDetails) {
    // Update flight details - now showing Database ID first
    modal.querySelector('.flight-db-id').textContent = flightDetails.flightId;
    modal.querySelector('.flight-number').textContent = flightDetails.flightNumber;
    modal.querySelector('.flight-route').innerHTML = `
        <span>${flightDetails.origin}</span>
        <span style="margin: 0 4px; opacity: 0.7;">→</span>
        <span>${flightDetails.destination}</span>
    `;
    modal.querySelector('.flight-departure').textContent = flightDetails.departureTime;
    modal.querySelector('.flight-arrival').textContent = flightDetails.arrivalTime;
    modal.querySelector('.flight-gate').textContent = flightDetails.gate || 'Not Assigned';
    
    // Update status with badge
    const statusElem = modal.querySelector('.flight-status');
    const statusBadge = document.createElement('span');
    statusBadge.className = `delete-flight-value-status ${flightDetails.statusClass}`;
    statusBadge.textContent = flightDetails.status;
    statusElem.appendChild(statusBadge);
    
    // Store the flight ID as a data attribute for the confirm button
    modal.querySelector('.delete-flight-btn.confirm').dataset.flightId = flightDetails.flightId;
    modal.querySelector('.delete-flight-btn.confirm').dataset.rowReference = flightDetails.rowReference;
    
    // Add warning for flights that have already departed or arrived
    if(['departed', 'arrived'].includes(flightDetails.status.toLowerCase())) {
        const warningMessage = document.createElement('div');
        warningMessage.className = 'delete-flight-warning';
        warningMessage.style.backgroundColor = 'rgba(245, 158, 11, 0.05)';
        warningMessage.style.borderLeft = '2px solid #f59e0b';
        warningMessage.style.padding = '0.8rem 1rem';
        warningMessage.style.marginBottom = '1.5rem';
        warningMessage.style.borderRadius = '4px';
        warningMessage.style.fontSize = '0.85rem';
        warningMessage.style.color = '#f59e0b';
        warningMessage.style.fontWeight = '500';
        
        warningMessage.innerHTML = `
            <div style="margin-bottom: 0.3rem; font-weight: 600;">Note: ${flightDetails.status} Flight</div>
            <div style="opacity: 0.9;">This flight has already ${flightDetails.status.toLowerCase()}. Deleting it may affect reporting data.</div>
        `;
        
        // Insert warning after the standard message
        const messageContainer = modal.querySelector('.delete-flight-message');
        messageContainer.parentNode.insertBefore(warningMessage, messageContainer.nextSibling);
    }
}

// Set up event listeners for the modal buttons and form elements
function setupDeleteModalEvents(modal, flightDetails) {
    // Deletion reason dropdown change event
    const deletionReasonSelect = modal.querySelector('#deletionReason');
    const reasonError = modal.querySelector('#reasonError');
    const otherReasonGroup = modal.querySelector('#otherReasonGroup');
    const otherReasonInput = modal.querySelector('#otherReason');
    const otherReasonError = modal.querySelector('#otherReasonError');
    
    deletionReasonSelect.addEventListener('change', function() {
        // Reset error message
        reasonError.style.display = 'none';
        deletionReasonSelect.style.borderColor = '';
        
        if (this.value === 'other') {
            otherReasonGroup.style.display = 'block';
            otherReasonInput.required = true;
        } else {
            otherReasonGroup.style.display = 'none';
            otherReasonInput.required = false;
            otherReasonError.style.display = 'none';
            otherReasonInput.style.borderColor = '';
        }
    });
    
    otherReasonInput.addEventListener('input', function() {
        if (this.value.trim()) {
            otherReasonError.style.display = 'none';
            this.style.borderColor = '';
        }
    });
    
    // Confirmation checkbox change event - this enables/disables the delete button
    const confirmCheckbox = modal.querySelector('#confirmDeleteCheckbox');
    const confirmBtn = modal.querySelector('.delete-flight-btn.confirm');
    
    confirmCheckbox.addEventListener('change', function() {
        confirmBtn.disabled = !this.checked;
    });
    
    // Cancel button - closes the modal
    const cancelBtn = modal.querySelector('.delete-flight-btn.cancel');
    cancelBtn.addEventListener('click', () => {
        closeDeleteModal(modal);
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeDeleteModal(modal);
        }
    });
    
    // Confirm delete button
    confirmBtn.addEventListener('click', () => {
        // Validate form - required deletion reason
        let isValid = true;
        
        if (!deletionReasonSelect.value) {
            isValid = false;
            reasonError.style.display = 'block';
            deletionReasonSelect.style.borderColor = 'var(--danger-color)';
            deletionReasonSelect.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                deletionReasonSelect.style.animation = '';
            }, 500);
        }
        
        if (deletionReasonSelect.value === 'other' && !otherReasonInput.value.trim()) {
            isValid = false;
            otherReasonError.style.display = 'block';
            otherReasonInput.style.borderColor = 'var(--danger-color)';
            otherReasonInput.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                otherReasonInput.style.animation = '';
            }, 500);
        }
        
        if (!isValid) {
            return;
        }
        
        // Show animation state - just the dots animation
        modal.querySelector('.delete-flight-confirmation-view').style.display = 'none';
        modal.querySelector('.delete-flight-dots-animation').style.display = 'flex';
        
        // Animate the row in the table if it exists
        const rowId = confirmBtn.dataset.rowReference;
        const row = document.getElementById(rowId);
        if (row) {
            row.classList.add('fadeOutRow');
        }
        
        // After animation completes, call the delete API
        setTimeout(() => {
            modal.querySelector('.delete-flight-dots-animation').style.display = 'none';
            modal.querySelector('.delete-flight-loading').style.display = 'flex';
            
            // Call the delete API
            deleteFlight(flightDetails.flightId, modal, flightDetails.status);
        }, 2500);
    });
    
    // Success done button
    const doneBtn = modal.querySelector('.delete-flight-done-btn');
    doneBtn.addEventListener('click', () => {
        closeDeleteModal(modal);
        
        // Refresh the page to show updated flight list
        window.location.reload();
    });
    
    // Error retry button
    const retryBtn = modal.querySelector('.delete-flight-retry-btn');
    retryBtn.addEventListener('click', () => {
        // Reset to confirmation view
        modal.querySelector('.delete-flight-error').style.display = 'none';
        modal.querySelector('.delete-flight-confirmation-view').style.display = 'block';
    });
    
    // Error cancel button
    const errorCancelBtn = modal.querySelector('.delete-flight-cancel-btn');
    errorCancelBtn.addEventListener('click', () => {
        closeDeleteModal(modal);
    });
}

// Close the delete modal
function closeDeleteModal(modal) {
    modal.classList.remove('active');
    
    // Remove the modal from DOM after animation completes
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// Delete flight API call
function deleteFlight(flightId, modal, status) {
    // Get deletion reason
    const deletionReasonSelect = modal.querySelector('#deletionReason');
    let deletionReason = deletionReasonSelect.value;
    
    if (deletionReason === 'other') {
        const otherReasonInput = modal.querySelector('#otherReason');
        deletionReason = otherReasonInput.value.trim();
    }
    
    // Convert to URL encoded string
    const params = new URLSearchParams();
    params.append('flightId', flightId);
    params.append('reason', deletionReason);
    params.append('status', status); // שליחת הסטטוס לשרת לצורך אימות
    
    // Make API request
    fetch('/api/deleteFlight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading
        modal.querySelector('.delete-flight-loading').style.display = 'none';
        
        if (data.success) {
            // Show success message
            modal.querySelector('.delete-flight-success').style.display = 'flex';
        } else {
            // Show error message
            const errorMessage = modal.querySelector('.delete-flight-error-message');
            errorMessage.textContent = data.message || 'An unknown error occurred while deleting the flight.';
            modal.querySelector('.delete-flight-error').style.display = 'flex';
        }
    })
    .catch(error => {
        // Hide loading
        modal.querySelector('.delete-flight-loading').style.display = 'none';
        
        // Show error message
        const errorMessage = modal.querySelector('.delete-flight-error-message');
        errorMessage.textContent = 'Network error: Please check your connection and try again.';
        modal.querySelector('.delete-flight-error').style.display = 'flex';
    });
}