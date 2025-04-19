// EditFlight.js - Flight data editing functionality with enhanced validation
document.addEventListener('DOMContentLoaded', function() {
    // Load flight utilities
    loadFlightUtilities().then(() => {
        setupEditFlightButtons();
    });
});

// Global variables to track original flight data and changes
let originalFlightData = null;
let currentFlightData = null;

// Load FlightUtils.js script
function loadFlightUtilities() {
    return new Promise((resolve, reject) => {
        if (window.FlightUtils) {
            // Already loaded
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = '/js/FlightUtils.js';
        script.onload = () => resolve();
        script.onerror = () => {
            console.error('Failed to load FlightUtils.js');
            reject(new Error('Failed to load flight utilities'));
        };
        document.head.appendChild(script);
    });
}

// Set up event listeners for all edit buttons
function setupEditFlightButtons() {
    const editButtons = document.querySelectorAll('.action-btn.edit');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const flightId = this.getAttribute('data-flight-id') || this.getAttribute('onclick').match(/editFlight\((\d+)\)/)[1];
            
            if (!flightId) {
                console.error('Flight ID not found on edit button');
                return;
            }
            
            // Get flight data from server and show edit popup
            fetchFlightData(flightId);
        });
    });
}

// Fetch flight data from the server
function fetchFlightData(flightId) {
    // Show loading indicator
    showLoadingIndicator();
    
    // Add a minimum loading time (at least 1 second) to make the loading animation more visible
    const minLoadingTime = 1000; // 1 second
    const loadingStartTime = Date.now();
    
    // Fetch flight data from API
    fetch(`/api/getFlight?id=${flightId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return response.json();
        })
        .then(flightData => {
            // Calculate elapsed time
            const elapsedTime = Date.now() - loadingStartTime;
            
            // If loading was too fast, wait additional time for better UX
            if (elapsedTime < minLoadingTime) {
                const remainingTime = minLoadingTime - elapsedTime;
                setTimeout(() => {
                    processFlightData(flightData);
                }, remainingTime);
            } else {
                // Proceed immediately if we've already waited long enough
                processFlightData(flightData);
            }
        })
        .catch(error => {
            // Ensure minimum loading time even on error
            const elapsedTime = Date.now() - loadingStartTime;
            if (elapsedTime < minLoadingTime) {
                setTimeout(() => {
                    hideLoadingIndicator();
                    console.error('Error fetching flight data:', error);
                    // Show error notification
                    showErrorMessage('Failed to load flight data. Please try again.');
                }, minLoadingTime - elapsedTime);
            } else {
                hideLoadingIndicator();
                console.error('Error fetching flight data:', error);
                // Show error notification
                showErrorMessage('Failed to load flight data. Please try again.');
            }
        });
}

// Process the flight data after loading
function processFlightData(flightData) {
    hideLoadingIndicator();
    
    // Format flight number according to AW#### standard if necessary
    if (flightData.flightNumber && window.FlightUtils) {
        flightData.flightNumber = window.FlightUtils.formatFlightNumber(flightData.flightNumber);
    }
    
    // Store the original data for comparison when saving
    originalFlightData = { ...flightData };
    currentFlightData = { ...flightData };
    
    // Show the edit popup with the flight data
    showEditPopup(flightData);
}

// Show loading indicator
function showLoadingIndicator() {
    const loadingModal = document.createElement('div');
    loadingModal.id = 'editFlightLoadingModal';
    loadingModal.className = 'edit-flight-popup active';
    
    loadingModal.innerHTML = `
        <div class="edit-flight-container" style="max-width: 300px;">
            <div class="edit-flight-body" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 180px;">
                <div class="edit-flight-spinner"></div>
                <div class="edit-flight-loading-text" style="margin-top: 1.5rem;">Loading flight data...</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loadingModal);
}

// Hide loading indicator
function hideLoadingIndicator() {
    const loadingModal = document.getElementById('editFlightLoadingModal');
    if (loadingModal) {
        loadingModal.remove();
    }
}

// Format date for HTML datetime-local input
function formatDateForInput(dateString) {
    // Handle different date formats
    let date;
    try {
        if (dateString.includes('/')) {
            // DD/MM/YYYY HH:MM format
            const [datePart, timePart] = dateString.split(' ');
            const [day, month, year] = datePart.split('/');
            date = new Date(`${year}-${month}-${day}T${timePart}`);
        } else if (dateString.includes('T')) {
            // ISO format - already compatible with datetime-local
            return dateString;
        } else {
            date = new Date(dateString);
        }
        
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return '';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString; // Return original in case of error
    }
}

// Format currency for display
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '';
    
    // Format with 2 decimal places and add currency symbol
    return `$${parseFloat(amount).toFixed(2)}`;
}

// Show the edit flight popup
function showEditPopup(flightData) {
    // Remove any existing modal
    const existingModal = document.getElementById('editFlightPopup');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal
    const modal = createEditFlightModal(flightData);
    document.body.appendChild(modal);
    
    // Display the modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Set up event listeners for the modal buttons and form elements
    setupEditModalEvents(modal, flightData);
}

// Create the edit flight modal HTML structure
function createEditFlightModal(flightData) {
    const modal = document.createElement('div');
    modal.id = 'editFlightPopup';
    modal.className = 'edit-flight-popup';
    
    // Format dates for input fields - ensure we have the right format
    const departureDateTime = formatDateForInput(flightData.departureTime);
    const arrivalDateTime = formatDateForInput(flightData.arrivalTime);
    
    // Create aircraft options HTML
    const aircraftOptions = createAircraftOptionsHTML(flightData.aircraft, flightData.origin, flightData.destination);
    
    // Create destination options
    const destinationOptions = createDestinationOptionsHTML(flightData.destination, flightData.origin);
    
    // Create origin options
    const originOptions = createOriginOptionsHTML(flightData.origin, flightData.destination);
    
    // Extract flight number parts
    const flightNumberPrefix = flightData.flightNumber.substring(0, 2);
    const flightNumberDigits = flightData.flightNumber.substring(2);
    
    modal.innerHTML = `
        <div class="edit-flight-container">
            <div class="edit-flight-header">
                <div class="edit-flight-title">
                    <span>✏️</span>
                    <span>Edit Flight ${flightData.flightNumber}</span>
                </div>
            </div>
            
            <div class="edit-flight-body">
                <form id="editFlightForm" class="edit-flight-form">
                    <!-- Flight Details Section -->
                    <div class="edit-flight-section-header">
                        <span>✈️</span>
                        <span>Flight Details</span>
                    </div>
                    
                    <div class="edit-flight-form-group">
                        <label class="edit-flight-form-label" for="flightNumber">
                            Flight Number <span class="required">*</span>
                        </label>
                        <div class="edit-flight-number-input">
                            <div class="edit-flight-number-prefix">AW</div>
                            <input type="text" id="flightNumber" class="edit-flight-input" value="${flightNumberDigits}" 
                                   maxlength="4" required data-original="${flightData.flightNumber}" 
                                   placeholder="0000" pattern="[0-9]{4}" inputmode="numeric">
                        </div>
                        <div class="edit-flight-error" id="flightNumberError"></div>
                        <small class="edit-flight-hint">Format: AW followed by 4 digits (e.g., AW1234)</small>
                    </div>
                    
                    <div class="edit-flight-form-group">
                        <label class="edit-flight-form-label" for="aircraft">
                            Aircraft <span class="required">*</span>
                        </label>
                        <select id="aircraft" class="edit-flight-select custom-select" required data-original="${flightData.aircraft}">
                            ${aircraftOptions}
                        </select>
                        <div class="edit-flight-error" id="aircraftError"></div>
                    </div>
                    
                    <div class="edit-flight-form-group">
                        <label class="edit-flight-form-label" for="origin">
                            Origin <span class="required">*</span>
                        </label>
                        <select id="origin" class="edit-flight-select custom-select" required data-original="${flightData.origin}">
                            ${originOptions}
                        </select>
                        <div class="edit-flight-error" id="originError"></div>
                        <small class="edit-flight-hint">Either origin or destination must be Tel Aviv (TLV)</small>
                    </div>
                    
                    <div class="edit-flight-form-group">
                        <label class="edit-flight-form-label" for="destination">
                            Destination <span class="required">*</span>
                        </label>
                        <select id="destination" class="edit-flight-select custom-select" required data-original="${flightData.destination}">
                            ${destinationOptions}
                        </select>
                        <div class="edit-flight-error" id="destinationError"></div>
                    </div>
                    
                    <div class="edit-flight-form-group">
                        <label class="edit-flight-form-label" for="departureTime">
                            Departure Time <span class="required">*</span>
                        </label>
                        <div class="edit-flight-datetime-picker">
                            <input type="datetime-local" id="departureTime" class="edit-flight-input custom-datetime" 
                                   value="${departureDateTime}" required data-original="${departureDateTime}">
                            <span class="edit-flight-datetime-icon">🗓️</span>
                        </div>
                        <div class="edit-flight-error" id="departureTimeError"></div>
                    </div>
                    
                    <div class="edit-flight-form-group">
                        <label class="edit-flight-form-label" for="arrivalTime">
                            Arrival Time <small>(Calculated automatically)</small>
                        </label>
                        <div class="edit-flight-datetime-picker">
                            <input type="datetime-local" id="arrivalTime" class="edit-flight-input custom-datetime" 
                                   value="${arrivalDateTime}" data-original="${arrivalDateTime}" readonly>
                            <span class="edit-flight-datetime-icon">🗓️</span>
                        </div>
                        <div class="edit-flight-error" id="arrivalTimeError"></div>
                        <small class="edit-flight-hint">Based on origin, destination, and aircraft type</small>
                    </div>
                    
                    <div class="edit-flight-form-group">
                        <label class="edit-flight-form-label" for="gate">
                            Gate <span class="required">*</span>
                        </label>
                        <input type="text" id="gate" class="edit-flight-input" value="${flightData.gate || ''}" 
                               maxlength="4" required data-original="${flightData.gate || ''}" 
                               placeholder="A123" pattern="[A-Za-z][0-9]{1,3}">
                        <div class="edit-flight-error" id="gateError"></div>
                        <small class="edit-flight-hint">Format: Letter followed by number (1-200), e.g. A12, B5, C123</small>
                    </div>
                    
                    <div class="edit-flight-form-group">
                        <label class="edit-flight-form-label" for="terminal">
                            Terminal <span class="required">*</span>
                        </label>
                        <input type="text" id="terminal" class="edit-flight-input" value="${flightData.terminal || ''}" 
                               maxlength="1" required data-original="${flightData.terminal || ''}" 
                               placeholder="3" pattern="[1-9]" inputmode="numeric">
                        <div class="edit-flight-error" id="terminalError"></div>
                        <small class="edit-flight-hint">Single digit only (1-9)</small>
                    </div>
                    
                    <!-- Status field (spans 2 columns) -->
                    <div class="edit-flight-form-group edit-flight-form-full">
                        <div class="edit-flight-status-display">
                            <span class="edit-flight-status-display-label">
                                Status <span class="required">*</span>
                            </span>
                            <div class="edit-flight-status-current ${flightData.statusClass || flightData.status.toLowerCase()}">${flightData.status}</div>
                            <input type="hidden" id="status" value="${flightData.status}" data-original="${flightData.status}">
                        </div>
                    </div>
                    
                    ${['Departed', 'Arrived', 'Cancelled'].includes(flightData.status) ? `
                    <div class="edit-flight-status-warning">
                        <div class="edit-flight-status-warning-title">Warning: ${flightData.status} Flight</div>
                        <div class="edit-flight-status-warning-message">
                            This flight is currently in ${flightData.status} status. Changes to flight details may affect 
                            reporting and tracking systems. The status can't be modified.
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Route validation warning (initially hidden) -->
                    <div id="routeValidationWarning" class="edit-flight-status-warning route-warning" style="display: none;">
                        <div class="edit-flight-status-warning-title">Aircraft Range Warning</div>
                        <div class="edit-flight-status-warning-message" id="routeValidationMessage">
                            <!-- Will be filled dynamically by JS -->
                        </div>
                    </div>
                    
                    <!-- Divider -->
                    <div class="edit-flight-divider"></div>
                    
                    <!-- Pricing Section -->
                    <div class="edit-flight-section-header">
                        <span>💰</span>
                        <span>Pricing Details</span>
                    </div>
                    
                    <div class="edit-flight-price-grid">
                        <div class="edit-flight-form-group">
                            <label class="edit-flight-form-label" for="economyPrice">
                                Economy Price <span class="required">*</span>
                            </label>
                            <div class="edit-flight-currency-input">
                                <input type="number" id="economyPrice" class="edit-flight-input" value="${flightData.economyPrice.toFixed(2)}" 
                                       min="1" required data-original="${flightData.economyPrice.toFixed(2)}" step="0.01">
                            </div>
                            <div class="edit-flight-error" id="economyPriceError"></div>
                        </div>
                        
                        <div class="edit-flight-form-group">
                            <label class="edit-flight-form-label" for="businessPrice">
                                Business Price <span class="required">*</span>
                            </label>
                            <div class="edit-flight-currency-input">
                                <input type="number" id="businessPrice" class="edit-flight-input" value="${flightData.businessPrice.toFixed(2)}" 
                                       min="1" required data-original="${flightData.businessPrice.toFixed(2)}" step="0.01">
                            </div>
                            <div class="edit-flight-error" id="businessPriceError"></div>
                        </div>
                        
                        <div class="edit-flight-form-group">
                            <label class="edit-flight-form-label" for="firstClassPrice">
                                First Class Price
                            </label>
                            <div class="edit-flight-currency-input">
                                <input type="number" id="firstClassPrice" class="edit-flight-input" value="${flightData.firstClassPrice ? flightData.firstClassPrice.toFixed(2) : ''}" 
                                       min="0" data-original="${flightData.firstClassPrice ? flightData.firstClassPrice.toFixed(2) : ''}"
                                       ${!hasFirstClass(flightData.aircraft) ? 'disabled' : ''} step="0.01">
                            </div>
                            <div class="edit-flight-error" id="firstClassPriceError"></div>
                            <small class="edit-flight-hint">${!hasFirstClass(flightData.aircraft) ? 'This aircraft does not have First Class seating' : 'First Class pricing is optional'}</small>
                        </div>
                    </div>
                    
                    <!-- Divider -->
                    <div class="edit-flight-divider"></div>
                    
                    <!-- Capacity Section -->
                    <div class="edit-flight-section-header">
                        <span>🪑</span>
                        <span>Seat Capacity</span>
                        <small style="font-weight: normal; margin-left: 10px; opacity: 0.8;">(determined by aircraft type)</small>
                    </div>
                    
                    <div class="edit-flight-seats-grid">
                        <div class="edit-flight-form-group">
                            <label class="edit-flight-form-label" for="economySeats">
                                Economy Seats
                            </label>
                            <input type="number" id="economySeats" class="edit-flight-input" value="${getAircraftSeating(flightData.aircraft).economy}" 
                                   min="0" readonly data-original="${getAircraftSeating(flightData.aircraft).economy}">
                            <div class="edit-flight-error" id="economySeatsError"></div>
                            <small class="edit-flight-hint">Fixed by aircraft configuration</small>
                        </div>
                        
                        <div class="edit-flight-form-group">
                            <label class="edit-flight-form-label" for="businessSeats">
                                Business Seats
                            </label>
                            <input type="number" id="businessSeats" class="edit-flight-input" value="${getAircraftSeating(flightData.aircraft).business}" 
                                   min="0" readonly data-original="${getAircraftSeating(flightData.aircraft).business}">
                            <div class="edit-flight-error" id="businessSeatsError"></div>
                            <small class="edit-flight-hint">Fixed by aircraft configuration</small>
                        </div>
                        
                        <div class="edit-flight-form-group">
                            <label class="edit-flight-form-label" for="firstClassSeats">
                                First Class Seats
                            </label>
                            <input type="number" id="firstClassSeats" class="edit-flight-input" value="${getAircraftSeating(flightData.aircraft).firstClass}" 
                                   min="0" readonly data-original="${getAircraftSeating(flightData.aircraft).firstClass}">
                            <div class="edit-flight-error" id="firstClassSeatsError"></div>
                            <small class="edit-flight-hint">Fixed by aircraft configuration</small>
                        </div>
                    </div>
                    
                    <div class="edit-flight-form-group edit-flight-form-full">
                        <label class="edit-flight-form-label" for="availableSeats">
                            Available Seats <span class="required">*</span>
                        </label>
                        <input type="number" id="availableSeats" class="edit-flight-input" value="${flightData.availableSeats}" 
                               min="0" max="${getAircraftSeating(flightData.aircraft).total}" required data-original="${flightData.availableSeats}">
                        <div class="edit-flight-error" id="availableSeatsError"></div>
                        <small class="edit-flight-hint">Remaining seats available for booking (maximum: ${getAircraftSeating(flightData.aircraft).total})</small>
                    </div>
                    
                    <!-- Divider before action buttons -->
                    <div class="edit-flight-divider"></div>

                    <!-- Hidden Flight ID field -->
                    <input type="hidden" id="flightId" value="${flightData.id}">
                    
                    <!-- Changes Summary Section (initially hidden, will be shown when changes are made) -->
                    <div id="changesSummary" class="edit-flight-changes" style="display: none;">
                        <div class="edit-flight-changes-title">
                            <span>📝</span>
                            <span>Changes Summary</span>
                        </div>
                        <div id="changesList" class="edit-flight-changes-list">
                            <!-- Changes will be populated by JavaScript -->
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="edit-flight-actions">
                        <button type="button" class="edit-flight-btn cancel">Cancel</button>
                        <button type="submit" class="edit-flight-btn save" disabled>Save Changes</button>
                    </div>
                </form>
                
                <!-- Loading State -->
                <div class="edit-flight-loading" style="display: none;">
                    <div class="edit-flight-spinner"></div>
                    <div class="edit-flight-loading-text">Updating flight data...</div>
                </div>
                
                <!-- Success Message -->
                <div class="edit-flight-success" style="display: none;">
                    <div class="edit-flight-success-icon">✓</div>
                    <div class="edit-flight-success-text">Flight Updated</div>
                    <div class="edit-flight-success-message">
                        The flight has been successfully updated in the system.
                    </div>
                    <button class="edit-flight-done-btn">Done</button>
                </div>
                
                <!-- Error Message -->
                <div class="edit-flight-error-panel" style="display: none;">
                    <div class="edit-flight-error-icon">!</div>
                    <div class="edit-flight-error-text">Error</div>
                    <div class="edit-flight-error-message"></div>
                    <div>
                        <button class="edit-flight-retry-btn">Retry</button>
                        <button class="edit-flight-error-cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Check if aircraft has first class seating
function hasFirstClass(aircraftCode) {
    if (window.FlightUtils && window.FlightUtils.AIRCRAFT[aircraftCode]) {
        return window.FlightUtils.AIRCRAFT[aircraftCode].seats.firstClass > 0;
    }
    return false; // Default if FlightUtils not loaded or aircraft not found
}

// Get aircraft seating configuration
function getAircraftSeating(aircraftCode) {
    if (window.FlightUtils && window.FlightUtils.AIRCRAFT[aircraftCode]) {
        return window.FlightUtils.AIRCRAFT[aircraftCode].seats;
    }
    // Default values if FlightUtils not loaded or aircraft not found
    return {
        economy: 0,
        business: 0,
        firstClass: 0,
        total: 0
    };
}

// Create HTML options for aircraft selection
function createAircraftOptionsHTML(selectedAircraft, origin, destination) {
    if (!window.FlightUtils) {
        return `<option value="${selectedAircraft}" selected>${selectedAircraft}</option>`;
    }
    
    const aircraftList = window.FlightUtils.getAircraftList();
    let optionsHTML = '';
    
    // Calculate distance between airports
    let distance = 0;
    if (origin && destination && origin !== destination) {
        if (origin === 'TLV' && window.FlightUtils.AIRPORTS[destination]) {
            distance = window.FlightUtils.AIRPORTS[destination].distanceFromTLV;
        } else if (destination === 'TLV' && window.FlightUtils.AIRPORTS[origin]) {
            distance = window.FlightUtils.AIRPORTS[origin].distanceFromTLV;
        }
    }
    
    aircraftList.forEach(aircraft => {
        const isSelected = aircraft.code === selectedAircraft;
        const isCompatible = distance === 0 || aircraft.range >= distance;
        
        // Add disabled attribute if range is not compatible
        const disabledAttr = !isCompatible ? 'disabled' : '';
        
        // Add CSS class for compatible/incompatible aircraft
        const compatibilityClass = isCompatible ? 'compatible-aircraft' : 'incompatible-aircraft';
        
        optionsHTML += `
            <option value="${aircraft.code}" ${isSelected ? 'selected' : ''} ${disabledAttr} class="${compatibilityClass}">
                ${aircraft.model} (${aircraft.code}) - Range: ${aircraft.range} km
            </option>
        `;
    });
    
    return optionsHTML;
}

// Create HTML options for destination selection
function createDestinationOptionsHTML(selectedDestination, origin) {
    if (!window.FlightUtils) {
        return `<option value="${selectedDestination}" selected>${selectedDestination}</option>`;
    }
    
    const destinationList = window.FlightUtils.getDestinationList();
    let optionsHTML = '';
    
    // Add TLV as a destination option if origin is not TLV
    if (origin !== 'TLV') {
        const tlvAirport = window.FlightUtils.AIRPORTS['TLV'];
        const isSelected = 'TLV' === selectedDestination;
        optionsHTML += `<option value="TLV" ${isSelected ? 'selected' : ''}>Tel Aviv, Israel (TLV)</option>`;
    }
    
    destinationList.forEach(airport => {
        // Skip TLV if it's already the origin
        if (airport.code === origin) return;
        
        const isSelected = airport.code === selectedDestination;
        optionsHTML += `<option value="${airport.code}" ${isSelected ? 'selected' : ''}>${airport.city}, ${airport.country} (${airport.code})</option>`;
    });
    
    return optionsHTML;
}

// Create HTML options for origin selection
function createOriginOptionsHTML(selectedOrigin, destination) {
    if (!window.FlightUtils) {
        return `<option value="${selectedOrigin}" selected>${selectedOrigin}</option>`;
    }
    
    const originList = window.FlightUtils.getDestinationList();
    let optionsHTML = '';
    
    // Add TLV as an origin option (usually selected by default)
    const tlvAirport = window.FlightUtils.AIRPORTS['TLV'];
    const isTlvSelected = 'TLV' === selectedOrigin;
    optionsHTML += `<option value="TLV" ${isTlvSelected ? 'selected' : ''}>Tel Aviv, Israel (TLV)</option>`;
    
    originList.forEach(airport => {
        // Skip the destination as it can't be both origin and destination
        if (airport.code === destination) return;
        
        const isSelected = airport.code === selectedOrigin;
        optionsHTML += `<option value="${airport.code}" ${isSelected ? 'selected' : ''}>${airport.city}, ${airport.country} (${airport.code})</option>`;
    });
    
    return optionsHTML;
}

// Set up event listeners for the modal form elements
function setupEditModalEvents(modal, flightData) {
    const form = modal.querySelector('#editFlightForm');
    const saveBtn = modal.querySelector('.edit-flight-btn.save');
    const cancelBtn = modal.querySelector('.edit-flight-btn.cancel');
    const formInputs = form.querySelectorAll('input:not([type="hidden"]):not([readonly]), select:not([disabled])');
    const changesSummary = modal.querySelector('#changesSummary');
    const changesList = modal.querySelector('#changesList');
    
    // Get important form elements
    const flightNumberInput = form.querySelector('#flightNumber');
    const aircraftSelect = form.querySelector('#aircraft');
    const originSelect = form.querySelector('#origin');
    const destinationSelect = form.querySelector('#destination');
    const departureTimeInput = form.querySelector('#departureTime');
    const arrivalTimeInput = form.querySelector('#arrivalTime');
    const gateInput = form.querySelector('#gate');
    const terminalInput = form.querySelector('#terminal');
    const availableSeatsInput = form.querySelector('#availableSeats');
    const economySeatsInput = form.querySelector('#economySeats');
    const businessSeatsInput = form.querySelector('#businessSeats');
    const firstClassSeatsInput = form.querySelector('#firstClassSeats');
    const firstClassPriceInput = form.querySelector('#firstClassPrice');
    const routeValidationWarning = form.querySelector('#routeValidationWarning');
    const routeValidationMessage = form.querySelector('#routeValidationMessage');
    
    // Initialize validation for aircraft route compatibility
    validateAircraftRouteCompatibility(
        aircraftSelect.value, 
        originSelect.value, 
        destinationSelect.value, 
        routeValidationWarning, 
        routeValidationMessage
    );
    
    // Initialize pulse effect on invalid inputs
    initializePulseEffect();
    
    // Special event handler for flight number to enforce format (numerical only)
    flightNumberInput.addEventListener('input', function(e) {
        // Remove any non-numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Pad with leading zeros if less than 4 digits
        if (this.value.length < 4) {
            const digitCount = this.value.length;
            const zerosNeeded = 4 - digitCount;
            
            if (this.value !== '') {
                // Only pad if there's at least one digit
                this.value = '0'.repeat(zerosNeeded) + this.value;
            }
        }
        
        // Make sure it's exactly 4 digits
        this.value = this.value.slice(0, 4);
        
        // Check if the value has changed from the original
        const originalFlightNum = flightData.flightNumber.substring(2); // Remove AW prefix
        
        if (originalFlightNum !== this.value) {
            this.classList.add('changed');
        } else {
            this.classList.remove('changed');
        }
        
        // Update changes summary
        updateChangesSummary(form, changesSummary, changesList);
        
        // Enable/disable save button based on changes
        updateSaveButtonState(formInputs, saveBtn);
        
        // Validate immediately
        validateFlightNumber(this, form.querySelector('#flightNumberError'));
    });
    
    // Handle backspace and delete in flight number field
    flightNumberInput.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            const cursorPosition = this.selectionStart;
            
            // If user is trying to delete a leading zero, shift all digits left
            if (cursorPosition > 0 && this.value.charAt(cursorPosition - 1) === '0' && this.value.startsWith('0')) {
                e.preventDefault();
                
                // Remove the first zero and add a zero at the end
                this.value = this.value.substring(1) + '0';
                
                // Keep cursor at the same position
                this.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
            }
        }
    });
    
    // Gate validation (letter followed by number between 1-200)
    gateInput.addEventListener('input', function() {
        const value = this.value;
        
        // Keep track of cursor position
        const cursorPosition = this.selectionStart;
        
        // First character must be a letter
        if (value.length > 0) {
            const firstChar = value.charAt(0);
            if (!/[A-Za-z]/.test(firstChar)) {
                this.value = '';
            } else {
                // Make sure the first character is uppercase
                if (firstChar !== firstChar.toUpperCase()) {
                    this.value = firstChar.toUpperCase() + value.substring(1);
                }
                
                // Rest of characters must be numbers and limited to 1-200
                if (value.length > 1) {
                    const numericalPart = value.substring(1);
                    
                    // Remove any non-numeric characters
                    const cleanedNumPart = numericalPart.replace(/[^0-9]/g, '');
                    
                    if (cleanedNumPart !== numericalPart) {
                        // There were non-numeric characters
                        this.value = firstChar + cleanedNumPart;
                    }
                    
                    // Make sure the number is between 1-200
                    const num = parseInt(cleanedNumPart, 10);
                    if (num > 200) {
                        this.value = firstChar + '200';
                    } else if (cleanedNumPart.startsWith('0') && cleanedNumPart.length > 1) {
                        // Remove leading zeros
                        this.value = firstChar + num;
                    }
                }
            }
        }
        
        // Check if value has changed from original
        const originalValue = this.getAttribute('data-original');
        if (originalValue !== this.value) {
            this.classList.add('changed');
        } else {
            this.classList.remove('changed');
        }
        
        // Validate immediately
        validateGate(this, form.querySelector('#gateError'));
        
        // Update changes summary
        updateChangesSummary(form, changesSummary, changesList);
        
        // Enable/disable save button based on changes
        updateSaveButtonState(formInputs, saveBtn);
    });
    
    // Terminal validation (single digit 1-9)
    terminalInput.addEventListener('input', function() {
        // Only allow single digits 1-9
        const value = this.value;
        
        if (value.length > 0) {
            const digit = value.charAt(0);
            if (!/[1-9]/.test(digit)) {
                this.value = '';
            } else {
                // Ensure only one digit
                this.value = digit;
            }
        }
        
        // Check if value has changed from original
        const originalValue = this.getAttribute('data-original');
        if (originalValue !== this.value) {
            this.classList.add('changed');
        } else {
            this.classList.remove('changed');
        }
        
        // Validate immediately
        validateTerminal(this, form.querySelector('#terminalError'));
        
        // Update changes summary
        updateChangesSummary(form, changesSummary, changesList);
        
        // Enable/disable save button based on changes
        updateSaveButtonState(formInputs, saveBtn);
    });
    
    // Aircraft change handler (updates seating configuration)
    aircraftSelect.addEventListener('change', function() {
        if (window.FlightUtils) {
            const aircraft = window.FlightUtils.getAircraftInfo(this.value);
            if (aircraft) {
                // Update seating capacity based on aircraft type
                economySeatsInput.value = aircraft.seats.economy;
                economySeatsInput.setAttribute('data-original', aircraft.seats.economy);
                
                businessSeatsInput.value = aircraft.seats.business;
                businessSeatsInput.setAttribute('data-original', aircraft.seats.business);
                
                firstClassSeatsInput.value = aircraft.seats.firstClass;
                firstClassSeatsInput.setAttribute('data-original', aircraft.seats.firstClass);
                
                // Update max available seats
                availableSeatsInput.max = aircraft.totalSeats;
                
                // If available seats is more than total, cap it
                if (parseInt(availableSeatsInput.value) > aircraft.totalSeats) {
                    availableSeatsInput.value = aircraft.totalSeats;
                }
                
                // Enable/disable first class price based on aircraft configuration
                firstClassPriceInput.disabled = aircraft.seats.firstClass === 0;
                
                if (aircraft.seats.firstClass === 0) {
                    firstClassPriceInput.value = '';
                    firstClassPriceInput.placeholder = 'N/A';
                }
                
                // Update first class price hint
                const firstClassHint = firstClassPriceInput.nextElementSibling.nextElementSibling;
                if (firstClassHint) {
                    firstClassHint.textContent = aircraft.seats.firstClass === 0 ? 
                        'This aircraft does not have First Class seating' : 
                        'First Class pricing is optional';
                }
                
                // Update available seats hint
                const availableSeatsHint = availableSeatsInput.nextElementSibling.nextElementSibling;
                if (availableSeatsHint) {
                    availableSeatsHint.textContent = `Remaining seats available for booking (maximum: ${aircraft.totalSeats})`;
                }
                
                // Validate aircraft range for the selected route
                validateAircraftRouteCompatibility(
                    this.value, 
                    originSelect.value, 
                    destinationSelect.value, 
                    routeValidationWarning, 
                    routeValidationMessage
                );
                
                // Update arrival time based on departure time and destination
                calculateAndUpdateArrivalTime(
                    departureTimeInput.value, 
                    originSelect.value,
                    destinationSelect.value, 
                    arrivalTimeInput
                );
            }
        }
        
        // Mark as changed if different from original
        const originalValue = this.getAttribute('data-original');
        if (originalValue !== this.value) {
            this.classList.add('changed');
        } else {
            this.classList.remove('changed');
        }
        
        // Update changes summary
        updateChangesSummary(form, changesSummary, changesList);
        
        // Enable/disable save button
        updateSaveButtonState(formInputs, saveBtn);
    });
    
    // Origin change handler
    originSelect.addEventListener('change', function() {
        // If origin is the same as destination, reset destination
        if (this.value === destinationSelect.value) {
            // Update destination options
            const newDestOptions = createDestinationOptionsHTML('', this.value);
            destinationSelect.innerHTML = newDestOptions;
            
            // Mark destination as changed
            destinationSelect.classList.add('changed');
        } else {
            // Update destination options
            const newDestOptions = createDestinationOptionsHTML(destinationSelect.value, this.value);
            destinationSelect.innerHTML = newDestOptions;
        }
        
        // Check if either origin or destination is TLV
        const hasValidRoute = this.value === 'TLV' || destinationSelect.value === 'TLV';
        if (!hasValidRoute) {
            showRouteValidationWarning(
                routeValidationWarning, 
                routeValidationMessage, 
                'Either origin or destination must be Tel Aviv (TLV)'
            );
        } else {
            hideRouteValidationWarning(routeValidationWarning);
        }
        
        // Validate aircraft range for the selected route
        validateAircraftRouteCompatibility(
            aircraftSelect.value, 
            this.value, 
            destinationSelect.value, 
            routeValidationWarning, 
            routeValidationMessage
        );
        
        // Update aircraft options based on new route
        const newAircraftOptions = createAircraftOptionsHTML(aircraftSelect.value, this.value, destinationSelect.value);
        aircraftSelect.innerHTML = newAircraftOptions;
        
        // Update arrival time based on new route
        calculateAndUpdateArrivalTime(
            departureTimeInput.value, 
            this.value,
            destinationSelect.value, 
            arrivalTimeInput
        );
        
        // Mark as changed if different from original
        const originalValue = this.getAttribute('data-original');
        if (originalValue !== this.value) {
            this.classList.add('changed');
        } else {
            this.classList.remove('changed');
        }
        
        // Update changes summary
        updateChangesSummary(form, changesSummary, changesList);
        
        // Enable/disable save button
        updateSaveButtonState(formInputs, saveBtn);
    });
    
    // Destination change handler
    destinationSelect.addEventListener('change', function() {
        // If destination is the same as origin, reset origin
        if (this.value === originSelect.value) {
            // Update origin options
            const newOriginOptions = createOriginOptionsHTML('', this.value);
            originSelect.innerHTML = newOriginOptions;
            
            // Mark origin as changed
            originSelect.classList.add('changed');
        } else {
            // Update origin options
            const newOriginOptions = createOriginOptionsHTML(originSelect.value, this.value);
            originSelect.innerHTML = newOriginOptions;
        }
        
        // Check if either origin or destination is TLV
        const hasValidRoute = originSelect.value === 'TLV' || this.value === 'TLV';
        if (!hasValidRoute) {
            showRouteValidationWarning(
                routeValidationWarning, 
                routeValidationMessage, 
                'Either origin or destination must be Tel Aviv (TLV)'
            );
        } else {
            hideRouteValidationWarning(routeValidationWarning);
        }
        
        // Validate aircraft range for the selected route
        validateAircraftRouteCompatibility(
            aircraftSelect.value, 
            originSelect.value, 
            this.value, 
            routeValidationWarning, 
            routeValidationMessage
        );
        
        // Update aircraft options based on new route
        const newAircraftOptions = createAircraftOptionsHTML(aircraftSelect.value, originSelect.value, this.value);
        aircraftSelect.innerHTML = newAircraftOptions;
        
        // Update arrival time based on new route
        calculateAndUpdateArrivalTime(
            departureTimeInput.value, 
            originSelect.value, 
            this.value, 
            arrivalTimeInput
        );
        
        // Mark as changed if different from original
        const originalValue = this.getAttribute('data-original');
        if (originalValue !== this.value) {
            this.classList.add('changed');
        } else {
            this.classList.remove('changed');
        }
        
        // Update changes summary
        updateChangesSummary(form, changesSummary, changesList);
        
        // Enable/disable save button
        updateSaveButtonState(formInputs, saveBtn);
    });
    
    // Departure time change handler (updates arrival time)
    departureTimeInput.addEventListener('change', function() {
        // Update arrival time based on new departure time and destination
        calculateAndUpdateArrivalTime(
            this.value, 
            originSelect.value, 
            destinationSelect.value, 
            arrivalTimeInput
        );
        
        // Mark as changed if different from original
        const originalValue = this.getAttribute('data-original');
        if (originalValue !== this.value) {
            this.classList.add('changed');
        } else {
            this.classList.remove('changed');
        }
        
        // Update changes summary
        updateChangesSummary(form, changesSummary, changesList);
        
        // Enable/disable save button
        updateSaveButtonState(formInputs, saveBtn);
    });
    
    // Generic input change handler for other form fields
    formInputs.forEach(input => {
        // Skip elements that already have specific handlers
        if (input.id === 'flightNumber' || input.id === 'aircraft' || 
            input.id === 'origin' || input.id === 'destination' || 
            input.id === 'departureTime' || input.id === 'gate' || 
            input.id === 'terminal') {
            return;
        }
        
        input.addEventListener('input', function() {
            // Check if the value has changed from the original
            const originalValue = this.getAttribute('data-original');
            const currentValue = this.value;
            
            if (originalValue !== currentValue) {
                this.classList.add('changed');
            } else {
                this.classList.remove('changed');
            }
            
            // Perform field-specific validation
            if (this.id.includes('Price')) {
                validatePrice(this, form.querySelector(`#${this.id}Error`));
            } else if (this.id === 'availableSeats') {
                validateAvailableSeats(
                    this, 
                    form.querySelector('#availableSeatsError'), 
                    getAircraftSeating(aircraftSelect.value).total
                );
            }
            
            // Update the changes summary
            updateChangesSummary(form, changesSummary, changesList);
            
            // Enable/disable save button
            updateSaveButtonState(formInputs, saveBtn);
        });
    });
    
    // Form validation and submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Perform comprehensive validation
        if (validateForm(form)) {
            // Get current aircraft seating configuration
            const aircraft = form.querySelector('#aircraft').value;
            const seating = getAircraftSeating(aircraft);
            
            // Collect updated data
            const updatedData = {
                id: parseInt(form.querySelector('#flightId').value),
                flightNumber: 'AW' + form.querySelector('#flightNumber').value,
                origin: form.querySelector('#origin').value,
                destination: form.querySelector('#destination').value,
                departureTime: form.querySelector('#departureTime').value,
                arrivalTime: form.querySelector('#arrivalTime').value,
                gate: form.querySelector('#gate').value,
                terminal: form.querySelector('#terminal').value,
                aircraft: aircraft,
                status: form.querySelector('#status').value,
                economyPrice: parseFloat(form.querySelector('#economyPrice').value),
                businessPrice: parseFloat(form.querySelector('#businessPrice').value),
                firstClassPrice: form.querySelector('#firstClassPrice').value ? parseFloat(form.querySelector('#firstClassPrice').value) : null,
                economySeats: seating.economy,
                businessSeats: seating.business,
                firstClassSeats: seating.firstClass,
                availableSeats: parseInt(form.querySelector('#availableSeats').value)
            };
            
            // Update the flight via API
            updateFlight(updatedData, modal);
        }
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', () => {
        closeEditModal(modal);
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeEditModal(modal);
        }
    });
    
    // Success "Done" button
    const doneBtn = modal.querySelector('.edit-flight-done-btn');
    doneBtn.addEventListener('click', () => {
        closeEditModal(modal);
        
        // Refresh the page to show updated flight list
        window.location.reload();
    });
    
    // Error "Retry" button
    const retryBtn = modal.querySelector('.edit-flight-retry-btn');
    retryBtn.addEventListener('click', () => {
        // Reset to form view
        modal.querySelector('.edit-flight-error-panel').style.display = 'none';
        form.style.display = 'grid';
    });
    
    // Error "Cancel" button
    const errorCancelBtn = modal.querySelector('.edit-flight-error-cancel-btn');
    errorCancelBtn.addEventListener('click', () => {
        closeEditModal(modal);
    });
}

// Initialize pulse effect for invalid inputs
function initializePulseEffect() {
    // Add CSS for pulse animation
    if (!document.getElementById('pulse-animation-css')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation-css';
        style.textContent = `
            @keyframes pulse-error {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
            .pulse-error {
                animation: pulse-error 1.5s infinite;
                border-color: rgba(239, 68, 68, 0.8) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Add pulse effect to an input element
function addPulseEffect(element) {
    element.classList.add('pulse-error');
}

// Remove pulse effect from an input element
function removePulseEffect(element) {
    element.classList.remove('pulse-error');
}

// Flight number validation
function validateFlightNumber(input, errorElement) {
    const value = input.value;
    const isValid = /^\d{4}$/.test(value);
    
    if (!isValid) {
        input.classList.add('error');
        addPulseEffect(input);
        if (errorElement) {
            errorElement.textContent = 'Flight number must be 4 digits';
            errorElement.style.display = 'block';
        }
        return false;
    } else {
        input.classList.remove('error');
        removePulseEffect(input);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        return true;
    }
}

// Gate validation
function validateGate(input, errorElement) {
    const value = input.value;
    const isValid = /^[A-Z][0-9]{1,3}$/.test(value) && parseInt(value.substring(1)) >= 1 && parseInt(value.substring(1)) <= 200;
    
    if (!isValid) {
        input.classList.add('error');
        addPulseEffect(input);
        if (errorElement) {
            errorElement.textContent = 'Gate must be a letter followed by a number between 1-200 (e.g., A12)';
            errorElement.style.display = 'block';
        }
        return false;
    } else {
        input.classList.remove('error');
        removePulseEffect(input);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        return true;
    }
}

// Terminal validation
function validateTerminal(input, errorElement) {
    const value = input.value;
    const isValid = /^[1-9]$/.test(value);
    
    if (!isValid) {
        input.classList.add('error');
        addPulseEffect(input);
        if (errorElement) {
            errorElement.textContent = 'Terminal must be a single digit (1-9)';
            errorElement.style.display = 'block';
        }
        return false;
    } else {
        input.classList.remove('error');
        removePulseEffect(input);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        return true;
    }
}

// Price validation
function validatePrice(input, errorElement) {
    const value = parseFloat(input.value);
    
    if (isNaN(value) || value <= 0) {
        input.classList.add('error');
        addPulseEffect(input);
        if (errorElement) {
            errorElement.textContent = 'Price must be a positive number';
            errorElement.style.display = 'block';
        }
        return false;
    } else {
        input.classList.remove('error');
        removePulseEffect(input);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        return true;
    }
}

// Available seats validation
function validateAvailableSeats(input, errorElement, totalSeats) {
    const value = parseInt(input.value);
    
    if (isNaN(value) || value < 0) {
        input.classList.add('error');
        addPulseEffect(input);
        if (errorElement) {
            errorElement.textContent = 'Available seats must be a non-negative number';
            errorElement.style.display = 'block';
        }
        return false;
    } else if (value > totalSeats) {
        input.classList.add('error');
        addPulseEffect(input);
        if (errorElement) {
            errorElement.textContent = `Available seats cannot exceed total seats (${totalSeats})`;
            errorElement.style.display = 'block';
        }
        return false;
    } else {
        input.classList.remove('error');
        removePulseEffect(input);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        return true;
    }
}

// Show route validation warning
function showRouteValidationWarning(warningElement, messageElement, message) {
    if (warningElement && messageElement) {
        warningElement.style.display = 'block';
        messageElement.textContent = message;
        
        // Add a highlight effect
        warningElement.classList.add('warning-highlight');
        setTimeout(() => {
            warningElement.classList.remove('warning-highlight');
        }, 500);
    }
}

// Hide route validation warning
function hideRouteValidationWarning(warningElement) {
    if (warningElement) {
        warningElement.style.display = 'none';
    }
}

// Validate aircraft compatibility with the route
function validateAircraftRouteCompatibility(aircraft, origin, destination, warningElement, messageElement) {
    if (!window.FlightUtils) return;
    
    // First check if either origin or destination is TLV
    if (origin !== 'TLV' && destination !== 'TLV') {
        showRouteValidationWarning(
            warningElement, 
            messageElement, 
            'Either origin or destination must be Tel Aviv (TLV)'
        );
        return;
    }
    
    // Calculate the distance for the route
    let distance = 0;
    let originCity = '', destinationCity = '';
    
    if (origin === 'TLV' && destination !== 'TLV') {
        // TLV to another destination
        const destAirport = window.FlightUtils.AIRPORTS[destination];
        if (destAirport) {
            distance = destAirport.distanceFromTLV;
            originCity = 'Tel Aviv';
            destinationCity = destAirport.city;
        }
    } else if (destination === 'TLV' && origin !== 'TLV') {
        // Another origin to TLV
        const origAirport = window.FlightUtils.AIRPORTS[origin];
        if (origAirport) {
            distance = origAirport.distanceFromTLV;
            originCity = origAirport.city;
            destinationCity = 'Tel Aviv';
        }
    } else {
        // Both are TLV or neither is TLV
        hideRouteValidationWarning(warningElement);
        return;
    }
    
    // Now check if the aircraft can handle this distance
    const aircraftInfo = window.FlightUtils.AIRCRAFT[aircraft];
    if (!aircraftInfo) {
        hideRouteValidationWarning(warningElement);
        return;
    }
    
    if (distance > aircraftInfo.range) {
        showRouteValidationWarning(
            warningElement, 
            messageElement, 
            `${aircraftInfo.model} cannot fly from ${originCity} to ${destinationCity} (${distance} km) due to range limitations (max: ${aircraftInfo.range} km)`
        );
    } else {
        hideRouteValidationWarning(warningElement);
    }
}

// Calculate and update arrival time based on departure time and route
function calculateAndUpdateArrivalTime(departureTime, origin, destination, arrivalTimeInput) {
    if (!window.FlightUtils || !departureTime) return;
    
    let flightHours = 0;
    
    // Calculate flight duration based on route
    if (origin === 'TLV' && destination !== 'TLV') {
        // TLV to another destination
        const destAirport = window.FlightUtils.AIRPORTS[destination];
        if (destAirport) {
            flightHours = destAirport.flightTimeHours;
        }
    } else if (destination === 'TLV' && origin !== 'TLV') {
        // Another origin to TLV
        const origAirport = window.FlightUtils.AIRPORTS[origin];
        if (origAirport) {
            flightHours = origAirport.flightTimeHours;
        }
    }
    
    if (flightHours === 0) {
        // Invalid route or same origin/destination
        arrivalTimeInput.value = departureTime;
        return;
    }
    
    try {
        const departureDate = new Date(departureTime);
        
        // Add flight hours to get arrival time
        const flightDurationMs = flightHours * 60 * 60 * 1000;
        const arrivalDate = new Date(departureDate.getTime() + flightDurationMs);
        
        // Format for input field (YYYY-MM-DDTHH:MM)
        const arrivalTimeFormatted = arrivalDate.toISOString().substring(0, 16);
        arrivalTimeInput.value = arrivalTimeFormatted;
        
        // Mark arrival time as changed if it's different from the original
        const originalValue = arrivalTimeInput.getAttribute('data-original');
        if (originalValue !== arrivalTimeFormatted) {
            arrivalTimeInput.classList.add('changed');
        } else {
            arrivalTimeInput.classList.remove('changed');
        }
    } catch (error) {
        console.error('Error calculating arrival time:', error);
    }
}

// Update save button state based on form changes
function updateSaveButtonState(formInputs, saveButton) {
    const hasChanges = Array.from(formInputs).some(input => {
        return input.getAttribute('data-original') !== input.value;
    });
    
    saveButton.disabled = !hasChanges;
}

// Update the changes summary section
function updateChangesSummary(form, summaryContainer, summaryList) {
    // Clear existing content
    summaryList.innerHTML = '';
    
    // Collect all changed fields
    const changedFields = [];
    const formInputs = form.querySelectorAll('input:not([type="hidden"]), select');
    
    formInputs.forEach(input => {
        let originalValue = input.getAttribute('data-original');
        let currentValue = input.value;
        
        // Special handling for flight number (add AW prefix)
        if (input.id === 'flightNumber') {
            currentValue = 'AW' + currentValue;
            // Original value already has AW prefix
        }
        
        if (originalValue !== currentValue) {
            const labelElement = input.closest('.edit-flight-form-group').querySelector('.edit-flight-form-label, .edit-flight-status-display-label');
            let fieldName = '';
            
            if (labelElement) {
                fieldName = labelElement.textContent.trim().replace('*', '').replace(/\(.*\)/, '').trim();
            } else {
                fieldName = input.id.replace(/([A-Z])/g, ' $1').trim();
                fieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
            }
            
            changedFields.push({
                id: input.id,
                field: fieldName,
                from: originalValue,
                to: currentValue
            });
        }
    });
    
    // If there are changes, show the summary
    if (changedFields.length > 0) {
        summaryContainer.style.display = 'block';
        
        // Create list items for each change
        changedFields.forEach(change => {
            const changeItem = document.createElement('div');
            changeItem.className = 'edit-flight-change-item';
            
            // Format value display based on field type
            let fromValue = change.from;
            let toValue = change.to;
            
            // Format datetime values
            if (change.field.includes('Time')) {
                fromValue = formatDateTimeDisplay(change.from);
                toValue = formatDateTimeDisplay(change.to);
            }
            
            // Format price values
            if (change.field.includes('Price')) {
                fromValue = `$${parseFloat(change.from || 0).toFixed(2)}`;
                toValue = `$${parseFloat(change.to || 0).toFixed(2)}`;
            }
            
            // Format aircraft display
            if (change.field.includes('Aircraft') && window.FlightUtils) {
                const fromAircraft = window.FlightUtils.getAircraftInfo(change.from);
                const toAircraft = window.FlightUtils.getAircraftInfo(change.to);
                
                if (fromAircraft) fromValue = `${fromAircraft.model} (${change.from})`;
                if (toAircraft) toValue = `${toAircraft.model} (${change.to})`;
            }
            
            // Format origin/destination display
            if ((change.field.includes('Origin') || change.field.includes('Destination')) && window.FlightUtils) {
                const fromAirport = window.FlightUtils.getAirportInfo(change.from);
                const toAirport = window.FlightUtils.getAirportInfo(change.to);
                
                if (fromAirport) fromValue = `${fromAirport.city}, ${fromAirport.country} (${change.from})`;
                if (toAirport) toValue = `${toAirport.city}, ${toAirport.country} (${change.to})`;
            }
            
            changeItem.innerHTML = `
                <div class="edit-flight-change-field">${change.field}</div>
                <div class="edit-flight-change-from">${fromValue}</div>
                <div class="edit-flight-change-to">${toValue}</div>
                <div class="edit-flight-change-actions">
                    <button type="button" class="edit-flight-reset-change" data-field-id="${change.id}" title="Reset to original value">↩️</button>
                </div>
            `;
            
            summaryList.appendChild(changeItem);
            
            // Add event listener to the reset button
            const resetBtn = changeItem.querySelector('.edit-flight-reset-change');
            resetBtn.addEventListener('click', function() {
                const fieldId = this.getAttribute('data-field-id');
                resetFieldToOriginal(form, fieldId);
            });
        });
    } else {
        summaryContainer.style.display = 'none';
    }
}

// Reset a single field to its original value
function resetFieldToOriginal(form, fieldId) {
    const field = form.querySelector(`#${fieldId}`);
    if (field) {
        const originalValue = field.getAttribute('data-original');

        // Set field back to original value
        field.value = originalValue;
        
        // Remove 'changed' class
        field.classList.remove('changed');
        
        // Remove any error class and pulse effect
        field.classList.remove('error');
        field.classList.remove('pulse-error');
        
        // Clear associated error message
        const errorElement = form.querySelector(`#${fieldId}Error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Special handling for different field types
        switch (fieldId) {
            case 'aircraft':
                resetAircraftRelatedFields(form, originalValue);
                break;
            case 'origin':
            case 'destination':
                resetRouteRelatedFields(form);
                break;
            case 'departureTime':
                resetDepartureTimeRelatedFields(form);
                break;
            case 'flightNumber':
                // Special handling for flight number (remove AW prefix)
                if (originalValue.startsWith('AW')) {
                    field.value = originalValue.substring(2);
                }
                break;
        }
        
        // Update changes summary
        const changesSummary = form.querySelector('#changesSummary');
        const changesList = form.querySelector('#changesList');
        updateChangesSummary(form, changesSummary, changesList);
        
        // Enable/disable save button based on if there are changes
        const saveBtn = form.querySelector('.edit-flight-btn.save');
        const formInputs = form.querySelectorAll('input:not([type="hidden"]):not([readonly]), select:not([disabled])');
        updateSaveButtonState(formInputs, saveBtn);
    }
}

// Reset aircraft-related fields when aircraft is reset
function resetAircraftRelatedFields(form, originalAircraftValue) {
    const economySeatsInput = form.querySelector('#economySeats');
    const businessSeatsInput = form.querySelector('#businessSeats');
    const firstClassSeatsInput = form.querySelector('#firstClassSeats');
    const firstClassPriceInput = form.querySelector('#firstClassPrice');
    const availableSeatsInput = form.querySelector('#availableSeats');
    const originSelect = form.querySelector('#origin');
    const destinationSelect = form.querySelector('#destination');
    const departureTimeInput = form.querySelector('#departureTime');
    const arrivalTimeInput = form.querySelector('#arrivalTime');
    const routeValidationWarning = form.querySelector('#routeValidationWarning');
    const routeValidationMessage = form.querySelector('#routeValidationMessage');
    
    if (window.FlightUtils) {
        const aircraft = window.FlightUtils.getAircraftInfo(originalAircraftValue);
        
        if (aircraft) {
            // Update seating configuration
            economySeatsInput.value = aircraft.seats.economy;
            economySeatsInput.setAttribute('data-original', aircraft.seats.economy);
            
            businessSeatsInput.value = aircraft.seats.business;
            businessSeatsInput.setAttribute('data-original', aircraft.seats.business);
            
            firstClassSeatsInput.value = aircraft.seats.firstClass;
            firstClassSeatsInput.setAttribute('data-original', aircraft.seats.firstClass);
            
            // Enable/disable first class price input
            firstClassPriceInput.disabled = aircraft.seats.firstClass === 0;
            
            if (aircraft.seats.firstClass === 0) {
                firstClassPriceInput.value = '';
                firstClassPriceInput.placeholder = 'N/A';
            }
            
            // Update first class price hint
            const firstClassHint = firstClassPriceInput.nextElementSibling.nextElementSibling;
            if (firstClassHint) {
                firstClassHint.textContent = aircraft.seats.firstClass === 0 ? 
                    'This aircraft does not have First Class seating' : 
                    'First Class pricing is optional';
            }
            
            // Update available seats max
            availableSeatsInput.max = aircraft.totalSeats;
            
            // Validate route compatibility
            validateAircraftRouteCompatibility(
                originalAircraftValue, 
                originSelect.value, 
                destinationSelect.value, 
                routeValidationWarning, 
                routeValidationMessage
            );
            
            // Update arrival time calculation
            calculateAndUpdateArrivalTime(
                departureTimeInput.value, 
                originSelect.value, 
                destinationSelect.value, 
                arrivalTimeInput
            );
        }
    }
}

// Reset route-related fields when origin or destination is reset
function resetRouteRelatedFields(form) {
    const originSelect = form.querySelector('#origin');
    const destinationSelect = form.querySelector('#destination');
    const aircraftSelect = form.querySelector('#aircraft');
    const departureTimeInput = form.querySelector('#departureTime');
    const arrivalTimeInput = form.querySelector('#arrivalTime');
    const routeValidationWarning = form.querySelector('#routeValidationWarning');
    const routeValidationMessage = form.querySelector('#routeValidationMessage');
    
    // Check if either origin or destination is TLV
    const hasValidRoute = originSelect.value === 'TLV' || destinationSelect.value === 'TLV';
    if (!hasValidRoute) {
        showRouteValidationWarning(
            routeValidationWarning, 
            routeValidationMessage, 
            'Either origin or destination must be Tel Aviv (TLV)'
        );
    } else {
        hideRouteValidationWarning(routeValidationWarning);
    }
    
    // Validate aircraft range for the route
    validateAircraftRouteCompatibility(
        aircraftSelect.value, 
        originSelect.value, 
        destinationSelect.value, 
        routeValidationWarning, 
        routeValidationMessage
    );
    
    // Update aircraft options
    const newAircraftOptions = createAircraftOptionsHTML(
        aircraftSelect.value, 
        originSelect.value, 
        destinationSelect.value
    );
    aircraftSelect.innerHTML = newAircraftOptions;
    
    // Update arrival time
    calculateAndUpdateArrivalTime(
        departureTimeInput.value, 
        originSelect.value, 
        destinationSelect.value, 
        arrivalTimeInput
    );
}

// Reset departure time-related fields
function resetDepartureTimeRelatedFields(form) {
    const originSelect = form.querySelector('#origin');
    const destinationSelect = form.querySelector('#destination');
    const departureTimeInput = form.querySelector('#departureTime');
    const arrivalTimeInput = form.querySelector('#arrivalTime');
    
    // Update arrival time calculation
    calculateAndUpdateArrivalTime(
        departureTimeInput.value, 
        originSelect.value, 
        destinationSelect.value, 
        arrivalTimeInput
    );
}

// Format datetime for display
function formatDateTimeDisplay(dateTimeString) {
    if (!dateTimeString) return '';
    
    try {
        if (dateTimeString.includes('T')) {
            // Convert ISO format to readable format
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) return dateTimeString;
            
            return date.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace(',', '');
        }
        
        return dateTimeString;
    } catch (error) {
        console.error('Error formatting datetime for display:', error);
        return dateTimeString;
    }
}

// Validate the form before submission
function validateForm(form) {
    let isValid = true;
    
    // Reset previous error states
    form.querySelectorAll('.edit-flight-input, .edit-flight-select').forEach(input => {
        input.classList.remove('error');
        removePulseEffect(input);
    });
    
    form.querySelectorAll('.edit-flight-error').forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
    
    // Check each required field
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value) {
            field.classList.add('error');
            addPulseEffect(field);
            
            const errorElement = form.querySelector(`#${field.id}Error`);
            if (errorElement) {
                errorElement.textContent = 'This field is required';
                errorElement.style.display = 'block';
            }
            
            isValid = false;
        }
    });
    
    // Flight number validation
    const flightNumberInput = form.querySelector('#flightNumber');
    isValid = validateFlightNumber(flightNumberInput, form.querySelector('#flightNumberError')) && isValid;
    
    // Gate validation
    const gateInput = form.querySelector('#gate');
    isValid = validateGate(gateInput, form.querySelector('#gateError')) && isValid;
    
    // Terminal validation
    const terminalInput = form.querySelector('#terminal');
    isValid = validateTerminal(terminalInput, form.querySelector('#terminalError')) && isValid;
    
    // Origin and destination validation
    const originSelect = form.querySelector('#origin');
    const destinationSelect = form.querySelector('#destination');
    
    // Validate they are not the same
    if (originSelect.value === destinationSelect.value) {
        originSelect.classList.add('error');
        destinationSelect.classList.add('error');
        addPulseEffect(originSelect);
        addPulseEffect(destinationSelect);
        
        const errorElement = form.querySelector('#destinationError');
        if (errorElement) {
            errorElement.textContent = 'Origin and destination cannot be the same';
            errorElement.style.display = 'block';
        }
        
        isValid = false;
    }
    
    // Validate one of them is TLV
    if (originSelect.value !== 'TLV' && destinationSelect.value !== 'TLV') {
        originSelect.classList.add('error');
        destinationSelect.classList.add('error');
        addPulseEffect(originSelect);
        addPulseEffect(destinationSelect);
        
        const errorElement = form.querySelector('#originError');
        if (errorElement) {
            errorElement.textContent = 'Either origin or destination must be Tel Aviv (TLV)';
            errorElement.style.display = 'block';
        }
        
        isValid = false;
    }
    
    // Aircraft compatibility with route
    const aircraftSelect = form.querySelector('#aircraft');
    const routeValidationWarning = form.querySelector('#routeValidationWarning');
    
    if (routeValidationWarning && routeValidationWarning.style.display !== 'none') {
        // There's an active route warning
        aircraftSelect.classList.add('error');
        addPulseEffect(aircraftSelect);
        
        const errorElement = form.querySelector('#aircraftError');
        if (errorElement) {
            errorElement.textContent = 'Selected aircraft is not compatible with this route';
            errorElement.style.display = 'block';
        }
        
        isValid = false;
    }
    
    // Departure time validation
    const departureTimeInput = form.querySelector('#departureTime');
    if (departureTimeInput.value) {
        const departureTime = new Date(departureTimeInput.value);
        if (isNaN(departureTime.getTime())) {
            departureTimeInput.classList.add('error');
            addPulseEffect(departureTimeInput);
            
            const errorElement = form.querySelector('#departureTimeError');
            if (errorElement) {
                errorElement.textContent = 'Invalid departure time format';
                errorElement.style.display = 'block';
            }
            
            isValid = false;
        }
    }
    
    // Price validations
    const economyPriceInput = form.querySelector('#economyPrice');
    const businessPriceInput = form.querySelector('#businessPrice');
    const firstClassPriceInput = form.querySelector('#firstClassPrice');
    
    // Validate each price is positive
    if (economyPriceInput.value) {
        isValid = validatePrice(economyPriceInput, form.querySelector('#economyPriceError')) && isValid;
    }
    
    if (businessPriceInput.value) {
        isValid = validatePrice(businessPriceInput, form.querySelector('#businessPriceError')) && isValid;
    }
    
    if (firstClassPriceInput.value && !firstClassPriceInput.disabled) {
        isValid = validatePrice(firstClassPriceInput, form.querySelector('#firstClassPriceError')) && isValid;
    }
    
    // Business price must be higher than economy price
    if (economyPriceInput.value && businessPriceInput.value) {
        const economyPrice = parseFloat(economyPriceInput.value);
        const businessPrice = parseFloat(businessPriceInput.value);
        
        if (businessPrice <= economyPrice) {
            businessPriceInput.classList.add('error');
            addPulseEffect(businessPriceInput);
            
            const errorElement = form.querySelector('#businessPriceError');
            if (errorElement) {
                errorElement.textContent = 'Business price must be higher than economy price';
                errorElement.style.display = 'block';
            }
            
            isValid = false;
        }
    }
    
    // First class price must be higher than business price (if provided)
    if (firstClassPriceInput.value && businessPriceInput.value && !firstClassPriceInput.disabled) {
        const businessPrice = parseFloat(businessPriceInput.value);
        const firstClassPrice = parseFloat(firstClassPriceInput.value);
        
        if (firstClassPrice <= businessPrice) {
            firstClassPriceInput.classList.add('error');
            addPulseEffect(firstClassPriceInput);
            
            const errorElement = form.querySelector('#firstClassPriceError');
            if (errorElement) {
                errorElement.textContent = 'First class price must be higher than business price';
                errorElement.style.display = 'block';
            }
            
            isValid = false;
        }
    }
    
    // Available seats validation
    const availableSeatsInput = form.querySelector('#availableSeats');
    if (availableSeatsInput.value) {
        const availableSeats = parseInt(availableSeatsInput.value);
        const totalSeats = parseInt(availableSeatsInput.max);
        
        isValid = validateAvailableSeats(availableSeatsInput, form.querySelector('#availableSeatsError'), totalSeats) && isValid;
    }
    
    // If not valid, highlight the first field with error
    if (!isValid) {
        const firstErrorField = form.querySelector('.error');
        if (firstErrorField) {
            firstErrorField.focus();
            
            // Scroll to the field
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    return isValid;
}

// Update the flight data on the server
function updateFlight(flightData, modal) {
    // Show loading state
    const form = modal.querySelector('#editFlightForm');
    const loadingState = modal.querySelector('.edit-flight-loading');
    const errorPanel = modal.querySelector('.edit-flight-error-panel');
    const errorMessage = modal.querySelector('.edit-flight-error-message');
    
    form.style.display = 'none';
    loadingState.style.display = 'flex';
    
    // Set minimum loading time for better UX (at least 1 second)
    const minLoadingTime = 1000; // 1 second
    const loadingStartTime = Date.now();
    
    // Make API request to update flight
    fetch('/api/updateFlight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(flightData)
    })
    .then(response => {
        // Calculate elapsed time
        const elapsedTime = Date.now() - loadingStartTime;
        
        // If operation was quick, add artificial delay for better UX
        if (elapsedTime < minLoadingTime) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(response);
                }, minLoadingTime - elapsedTime);
            });
        }
        
        return response;
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Failed to update flight');
            });
        }
        return response.json();
    })
    .then(data => {
        // Hide loading state
        loadingState.style.display = 'none';
        
        // Show success message
        const successMessage = modal.querySelector('.edit-flight-success');
        successMessage.style.display = 'flex';
        
        // Update the original data reference with the new values
        originalFlightData = { ...flightData };
        currentFlightData = { ...flightData };
    })
    .catch(error => {
        console.error('Error updating flight:', error);
        
        // Hide loading state
        loadingState.style.display = 'none';
        
        // Show error message
        errorMessage.textContent = error.message || 'An error occurred while updating the flight';
        errorPanel.style.display = 'flex';
    });
}

// Show an error message in the edit modal
function showErrorMessage(message) {
    // Create a simple error modal if no edit modal exists
    const errorModal = document.createElement('div');
    errorModal.className = 'edit-flight-popup active';
    
    errorModal.innerHTML = `
        <div class="edit-flight-container" style="max-width: 450px;">
            <div class="edit-flight-header">
                <div class="edit-flight-title">
                    <span>⚠️</span>
                    <span>Error</span>
                </div>
            </div>
            
            <div class="edit-flight-body">
                <div class="edit-flight-error-panel" style="display: flex;">
                    <div class="edit-flight-error-icon">!</div>
                    <div class="edit-flight-error-text">Error</div>
                    <div class="edit-flight-error-message">${message}</div>
                    <button class="edit-flight-done-btn">OK</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorModal);
    
    // Close button event
    const closeBtn = errorModal.querySelector('.edit-flight-done-btn');
    closeBtn.addEventListener('click', () => {
        errorModal.remove();
    });
}

// Close the edit modal
function closeEditModal(modal) {
    modal.classList.remove('active');
    
    // Reset global variables
    originalFlightData = null;
    currentFlightData = null;
    
    // Remove the modal from DOM after animation completes
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}