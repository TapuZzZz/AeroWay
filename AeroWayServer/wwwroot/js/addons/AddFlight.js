// AddFlight.js - JavaScript for the Add Flight form

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Add Flight form functionality
    initAddFlightForm();
});

function initAddFlightForm() {
    // Auto-calculate available seats from the sum of all seat classes
    function calculateTotalSeats() {
        const economySeats = parseInt(document.getElementById('economySeats').value) || 0;
        const businessSeats = parseInt(document.getElementById('businessSeats').value) || 0;
        const firstClassSeats = parseInt(document.getElementById('firstClassSeats').value) || 0;
        
        const totalSeats = economySeats + businessSeats + firstClassSeats;
        document.getElementById('availableSeats').value = totalSeats;
    }
    
    // Attach event listeners for seat inputs
    const economySeatsInput = document.getElementById('economySeats');
    const businessSeatsInput = document.getElementById('businessSeats');
    const firstClassSeatsInput = document.getElementById('firstClassSeats');
    
    if (economySeatsInput) {
        economySeatsInput.addEventListener('input', calculateTotalSeats);
    }
    
    if (businessSeatsInput) {
        businessSeatsInput.addEventListener('input', calculateTotalSeats);
    }
    
    if (firstClassSeatsInput) {
        firstClassSeatsInput.addEventListener('input', calculateTotalSeats);
    }
    
    // Set minimum date for datetime-local inputs to now
    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 16);
    
    const departureTimeInput = document.getElementById('departureTime');
    const arrivalTimeInput = document.getElementById('arrivalTime');
    
    if (departureTimeInput) {
        departureTimeInput.min = localDateTime;
        
        // Set default dates (departure = now + 2 hours)
        const departureDefault = new Date();
        departureDefault.setHours(departureDefault.getHours() + 2);
        departureTimeInput.value = departureDefault.toISOString().slice(0, 16);
    }
    
    if (arrivalTimeInput) {
        arrivalTimeInput.min = localDateTime;
        
        // Set default dates (arrival = now + 6 hours)
        const arrivalDefault = new Date();
        arrivalDefault.setHours(arrivalDefault.getHours() + 6);
        arrivalTimeInput.value = arrivalDefault.toISOString().slice(0, 16);
    }
    
    // Validate origin != destination
    const destinationInput = document.getElementById('destination');
    if (destinationInput) {
        destinationInput.addEventListener('change', function() {
            const origin = document.getElementById('origin').value;
            const destination = this.value;
            
            if (origin === destination) {
                alert('Origin and destination cannot be the same airport.');
                this.value = '';
            }
        });
    }
    
    // Validate arrival time > departure time
    if (arrivalTimeInput) {
        arrivalTimeInput.addEventListener('change', function() {
            const departureTime = new Date(document.getElementById('departureTime').value);
            const arrivalTime = new Date(this.value);
            
            if (arrivalTime <= departureTime) {
                alert('Arrival time must be after departure time.');
                this.value = '';
            }
        });
    }
    
    // Form submission handler
    const flightForm = document.getElementById('flightForm');
    if (flightForm) {
        flightForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addFlight(e);
        });
    }
}

function addFlight(event) {
    // Create a loading indicator
    const formMessages = document.getElementById('formMessages');
    formMessages.innerHTML = '<div class="info-message">Processing request...</div>';
    
    // Get form data
    const form = document.getElementById('flightForm');
    const formData = new FormData(form);
    
    // Calculate total seats
    const economySeats = parseInt(formData.get('economySeats')) || 0;
    const businessSeats = parseInt(formData.get('businessSeats')) || 0;
    const firstClassSeats = parseInt(formData.get('firstClassSeats')) || 0;
    const totalSeats = economySeats + businessSeats + firstClassSeats;
    
    // Format departure and arrival times for MySQL
    const departureTime = new Date(formData.get('departureTime')).toISOString().slice(0, 19).replace('T', ' ');
    const arrivalTime = new Date(formData.get('arrivalTime')).toISOString().slice(0, 19).replace('T', ' ');
    
    // Current timestamp for created_at and updated_at
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Build SQL query
    const sqlQuery = `
        INSERT INTO Flights (
            FlightNumber, Origin, Destination, DepartureTime, ArrivalTime, 
            Gate, Terminal, Aircraft, Status, 
            EconomyPrice, BusinessPrice, FirstClassPrice, 
            EconomySeats, BusinessSeats, FirstClassSeats, 
            TotalSeats, AvailableSeats, CreatedAt, UpdatedAt
        ) VALUES (
            '${formData.get('flightNumber')}', 
            '${formData.get('origin')}', 
            '${formData.get('destination')}', 
            '${departureTime}', 
            '${arrivalTime}', 
            '${formData.get('gate')}', 
            '${formData.get('terminal')}', 
            '${formData.get('aircraft')}', 
            '${formData.get('status')}', 
            ${formData.get('economyPrice')}, 
            ${formData.get('businessPrice')}, 
            ${formData.get('firstClassPrice') || 'NULL'}, 
            ${economySeats}, 
            ${businessSeats}, 
            ${firstClassSeats}, 
            ${totalSeats}, 
            ${formData.get('availableSeats')}, 
            '${timestamp}', 
            '${timestamp}'
        );
    `;
    
    // Create XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    formMessages.innerHTML = '<div class="success-message">Flight added successfully!</div>';
                    // Reset form
                    form.reset();
                    
                    // Set default dates again
                    const departureDefault = new Date();
                    departureDefault.setHours(departureDefault.getHours() + 2);
                    
                    const arrivalDefault = new Date();
                    arrivalDefault.setHours(arrivalDefault.getHours() + 6);
                    
                    document.getElementById('departureTime').value = departureDefault.toISOString().slice(0, 16);
                    document.getElementById('arrivalTime').value = arrivalDefault.toISOString().slice(0, 16);
                    
                    // Reload main page after 1.5 seconds
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    formMessages.innerHTML = `<div class="error-message">Error: ${response.message}</div>`;
                }
            } catch (e) {
                formMessages.innerHTML = '<div class="success-message">Flight added successfully!</div>';
                // Reload main page after 1.5 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } else {
            formMessages.innerHTML = `<div class="error-message">Error: ${xhr.statusText}</div>`;
        }
    };
    
    xhr.onerror = function() {
        formMessages.innerHTML = '<div class="error-message">Network error occurred</div>';
    };
    
    // Send the SQL query as form data
    const data = 'command=' + encodeURIComponent(sqlQuery);
    xhr.send(data);
    
    return false;
}