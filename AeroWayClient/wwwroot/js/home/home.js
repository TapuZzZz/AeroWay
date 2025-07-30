function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabButtons.length || !tabContents.length) {
        console.error('Tab elements not found!');
        return;
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            
            const targetContent = document.getElementById(`${tabId}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function initTripType() {
    const tripTypeRadios = document.querySelectorAll('input[name="TripType"], input[name="tripType"]');
    const returnDateWrapper = document.querySelector('.return-date');
    const returnDateInput = document.getElementById('returnDate');
    
    console.log('Found trip type radios:', tripTypeRadios.length);
    console.log('Return date wrapper:', returnDateWrapper);
    
    if (!tripTypeRadios.length || !returnDateWrapper) {
        console.error('Trip type elements not found!');
        console.error('Radios found:', tripTypeRadios.length);
        console.error('Return wrapper found:', !!returnDateWrapper);
        return;
    }
    
    function handleTripTypeChange() {
        let selectedType = document.querySelector('input[name="TripType"]:checked')?.value || 
                          document.querySelector('input[name="tripType"]:checked')?.value;
        
        console.log('Selected trip type:', selectedType);
        
        if (selectedType === 'oneway') {
            returnDateWrapper.style.transition = 'all 0.3s ease';
            returnDateWrapper.style.opacity = '0';
            returnDateWrapper.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                returnDateWrapper.style.display = 'none';
                if (returnDateInput) {
                    returnDateInput.value = '';
                }
            }, 300);
        } else if (selectedType === 'roundtrip') {
            returnDateWrapper.style.display = 'flex';
            returnDateWrapper.offsetHeight;
            
            setTimeout(() => {
                returnDateWrapper.style.opacity = '1';
                returnDateWrapper.style.transform = 'translateX(0)';
            }, 10);
        }
    }
    
    tripTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleTripTypeChange);
        console.log('Added listener to radio:', radio.value);
    });
    
    handleTripTypeChange();
    
    const form = document.querySelector('.flight-search-form');
    if (form) {
        form.addEventListener('reset', () => {
            setTimeout(handleTripTypeChange, 10);
        });
    }
}

function initTripTypeAlternative() {
    const oneWayRadio = document.querySelector('input[value="oneway"]');
    const roundTripRadio = document.querySelector('input[value="roundtrip"]');
    const returnDateWrapper = document.querySelector('.return-date');
    
    if (!oneWayRadio || !roundTripRadio || !returnDateWrapper) {
        console.error('Alternative: Elements not found');
        return;
    }
    
    returnDateWrapper.style.transition = 'all 0.3s ease';
    
    function updateTripType() {
        if (oneWayRadio.checked) {
            returnDateWrapper.style.opacity = '0';
            returnDateWrapper.style.transform = 'translateX(20px)';
            setTimeout(() => {
                returnDateWrapper.style.display = 'none';
            }, 300);
        } else if (roundTripRadio.checked) {
            returnDateWrapper.style.display = 'flex';
            setTimeout(() => {
                returnDateWrapper.style.opacity = '1';
                returnDateWrapper.style.transform = 'translateX(0)';
            }, 10);
        }
    }
    
    oneWayRadio.addEventListener('change', updateTripType);
    roundTripRadio.addEventListener('change', updateTripType);
    
    updateTripType();
}

function initLocationInputs() {
    const fromLocation = document.getElementById('fromLocation');
    const toLocation = document.getElementById('toLocation');
    const fromDropdown = document.getElementById('fromDropdown');
    const toDropdown = document.getElementById('toDropdown');
    
    const airports = [
        { code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel' },
        { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
        { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
        { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
        { code: 'FCO', name: 'Leonardo da Vinci Airport', city: 'Rome', country: 'Italy' },
        { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE' },
        { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
        { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
        { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
        { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia' }
    ];
    
    function populateDropdown(dropdown, airports, inputField, otherInputField) {
        dropdown.innerHTML = '';
        
        airports.forEach(airport => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            
            item.innerHTML = `
                <div class="dropdown-item-icon">
                    <span class="letter-icon">${airport.code.charAt(0)}</span>
                </div>
                <div class="dropdown-item-content">
                    <div class="label-text">${airport.city} <span class="airport-code">${airport.code}</span></div>
                    <div class="label-desc">
                        <i class="fas fa-map-marker-alt" style="font-size: 0.8rem;"></i> 
                        ${airport.name}, ${airport.country}
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                const selectedValue = `${airport.city} (${airport.code})`;
                
                if (otherInputField.value === selectedValue) {
                    item.style.transition = 'background-color 0.3s ease';
                    item.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    
                    setTimeout(() => {
                        item.style.backgroundColor = '';
                    }, 300);
                    return;
                }
                
                inputField.value = selectedValue;
                dropdown.classList.remove('active');
                
                updateDropdownVisuals();
            });
            
            dropdown.appendChild(item);
        });
    }
    
    function updateDropdownVisuals() {
        const fromItems = fromDropdown.querySelectorAll('.dropdown-item');
        fromItems.forEach(item => {
            const cityText = item.querySelector('.label-text').childNodes[0].textContent.trim();
            const code = item.querySelector('.airport-code').textContent;
            const fullValue = `${cityText} (${code})`;
            
            if (toLocation.value === fullValue) {
                item.style.opacity = '0.5';
                item.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                item.style.cursor = 'not-allowed';
            } else {
                item.style.opacity = '';
                item.style.backgroundColor = '';
                item.style.cursor = '';
            }
        });
        
        const toItems = toDropdown.querySelectorAll('.dropdown-item');
        toItems.forEach(item => {
            const cityText = item.querySelector('.label-text').childNodes[0].textContent.trim();
            const code = item.querySelector('.airport-code').textContent;
            const fullValue = `${cityText} (${code})`;
            
            if (fromLocation.value === fullValue) {
                item.style.opacity = '0.5';
                item.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                item.style.cursor = 'not-allowed';
            } else {
                item.style.opacity = '';
                item.style.backgroundColor = '';
                item.style.cursor = '';
            }
        });
    }
    
    populateDropdown(fromDropdown, airports, fromLocation, toLocation);
    populateDropdown(toDropdown, airports, toLocation, fromLocation);
    
    fromLocation.addEventListener('focus', () => {
        fromDropdown.classList.add('active');
        updateDropdownVisuals();
    });
    
    toLocation.addEventListener('focus', () => {
        toDropdown.classList.add('active');
        updateDropdownVisuals();
    });
    
    fromLocation.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterAirports(searchTerm, fromDropdown, airports, fromLocation, toLocation);
    });
    
    toLocation.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterAirports(searchTerm, toDropdown, airports, toLocation, fromLocation);
    });
    
    function filterAirports(searchTerm, dropdown, airports, inputField, otherInputField) {
        const filtered = airports.filter(airport => 
            airport.code.toLowerCase().includes(searchTerm) ||
            airport.city.toLowerCase().includes(searchTerm) ||
            airport.name.toLowerCase().includes(searchTerm) ||
            airport.country.toLowerCase().includes(searchTerm)
        );
        
        dropdown.innerHTML = '';
        
        if (filtered.length === 0) {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerHTML = `
                <div class="dropdown-item-icon">
                    <span class="letter-icon">?</span>
                </div>
                <div class="dropdown-item-content">
                    <div class="label-text">No airports found</div>
                </div>
            `;
            dropdown.appendChild(item);
            return;
        }
        
        populateDropdown(dropdown, filtered, inputField, otherInputField);
        updateDropdownVisuals();
    }
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.from-wrapper')) {
            fromDropdown.classList.remove('active');
        }
        
        if (!e.target.closest('.to-wrapper')) {
            toDropdown.classList.remove('active');
        }
    });
}

function initTravelers() {
    const travelersContainer = document.getElementById('travelersContainer');
    const travelersDropdown = document.getElementById('travelersDropdown');
    const travelersCount = document.getElementById('travelersCount');
    
    if (!travelersContainer || !travelersDropdown) {
        console.error('Travelers elements not found!');
        return;
    }
    
    const counters = {
        adults: {
            count: 1,
            min: 1,
            max: 9,
            el: document.getElementById('adultsCount')
        },
        children: {
            count: 0,
            min: 0,
            max: 5,
            el: document.getElementById('childrenCount')
        },
        infants: {
            count: 0,
            min: 0,
            max: 5,
            el: document.getElementById('infantsCount')
        }
    };
    
    function updateHiddenInputs() {
        const adultsInput = document.getElementById('adultsInput');
        const childrenInput = document.getElementById('childrenInput');
        const infantsInput = document.getElementById('infantsInput');
        
        if (adultsInput) adultsInput.value = counters.adults.count;
        if (childrenInput) childrenInput.value = counters.children.count;
        if (infantsInput) infantsInput.value = counters.infants.count;
    }
    
    const iconElement = travelersContainer.querySelector('.fa-user-friends, .fa-plane');
    if (iconElement) {
        iconElement.className = 'fas fa-user user-icon';
        iconElement.style.fontSize = '1.1rem';
    }
    
    travelersContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        
        document.querySelectorAll('.custom-dropdown.active, .custom-calendar.active').forEach(dropdown => {
            if (dropdown !== travelersDropdown) {
                dropdown.classList.remove('active');
            }
        });
        
        travelersDropdown.classList.toggle('active');
        travelersContainer.classList.toggle('active');
        
        if (travelersDropdown.classList.contains('active')) {
            travelersContainer.style.transform = 'scale(0.98)';
            setTimeout(() => {
                travelersContainer.style.transform = 'scale(1)';
            }, 200);
        }
    });
    
    document.addEventListener('click', () => {
        if (travelersDropdown.classList.contains('active')) {
            updateTravelersText();
            travelersDropdown.classList.remove('active');
            travelersContainer.classList.remove('active');
            
            travelersContainer.style.transform = 'scale(0.98)';
            setTimeout(() => {
                travelersContainer.style.transform = 'scale(1)';
            }, 200);
        }
    });
    
    travelersDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    const counterBtns = travelersDropdown.querySelectorAll('.counter-btn');
    
    counterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            const isPlus = btn.classList.contains('plus');
            
            if (isPlus && counters[type].count < counters[type].max) {
                counters[type].count++;
                animateCounterChange(counters[type].el, counters[type].count, true);
            } else if (!isPlus && counters[type].count > counters[type].min) {
                counters[type].count--;
                animateCounterChange(counters[type].el, counters[type].count, false);
            }
            
            updateCounterButtons();
            updateHiddenInputs();
            updateTravelersTextNoAnimation();
        });
    });
    
    function animateCounterChange(element, newValue, isIncrement) {
        element.style.transform = isIncrement ? 'scale(1.2)' : 'scale(0.8)';
        element.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 100);
    }
    
    function updateTravelersText() {
        updateTravelersTextNoAnimation();
        
        travelersContainer.style.transform = 'scale(0.98)';
        setTimeout(() => {
            travelersContainer.style.transform = 'scale(1)';
        }, 200);
    }
    
    function updateTravelersTextNoAnimation() {
        const total = counters.adults.count + counters.children.count + counters.infants.count;
        let text = '';
        
        if (total === 1) {
            text = '1 Traveler';
        } else {
            const parts = [];
            
            if (counters.adults.count > 0) {
                parts.push(`${counters.adults.count} Adult${counters.adults.count !== 1 ? 's' : ''}`);
            }
            
            if (counters.children.count > 0) {
                parts.push(`${counters.children.count} Child${counters.children.count !== 1 ? 'ren' : ''}`);
            }
            
            if (counters.infants.count > 0) {
                parts.push(`${counters.infants.count} Infant${counters.infants.count !== 1 ? 's' : ''}`);
            }
            
            text = parts.length > 1 ? `${total} Travelers` : parts[0];
        }
        
        travelersCount.textContent = text;
    }
    
    function updateCounterButtons() {
        for (const type in counters) {
            const counter = counters[type];
            const minusBtn = travelersDropdown.querySelector(`.counter-btn.minus[data-type="${type}"]`);
            const plusBtn = travelersDropdown.querySelector(`.counter-btn.plus[data-type="${type}"]`);
            
            if (counter.count <= counter.min) {
                minusBtn.classList.add('disabled');
            } else {
                minusBtn.classList.remove('disabled');
            }
            
            if (counter.count >= counter.max) {
                plusBtn.classList.add('disabled');
            } else {
                plusBtn.classList.remove('disabled');
            }
        }
    }
    
    updateCounterButtons();
    updateHiddenInputs();
}

function initSwapButton() {
    const swapBtn = document.querySelector('.swap-btn');
    const fromLocation = document.getElementById('fromLocation');
    const toLocation = document.getElementById('toLocation');
    const fromWrapper = document.querySelector('.from-wrapper');
    const toWrapper = document.querySelector('.to-wrapper');
    
    swapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const fromValue = fromLocation.value;
        const toValue = toLocation.value;
        
        swapBtn.classList.add('btn-active');
        
        fromWrapper.classList.add('field-transition-out');
        toWrapper.classList.add('field-transition-out');
        
        setTimeout(() => {
            fromLocation.value = toValue;
            toLocation.value = fromValue;
            
            fromWrapper.classList.remove('field-transition-out');
            toWrapper.classList.remove('field-transition-out');
            fromWrapper.classList.add('field-transition-in');
            toWrapper.classList.add('field-transition-in');
            
            swapBtn.classList.remove('btn-active');
            
            setTimeout(() => {
                fromWrapper.classList.remove('field-transition-in');
                toWrapper.classList.remove('field-transition-in');
            }, 300);
        }, 200);
    });
}

function initFormSubmission() {
    const flightSearchForm = document.getElementById('flightSearchForm');
    const searchBtn = document.querySelector('.btn-search');
    
    flightSearchForm.addEventListener('submit', (e) => {
        const fromLocation = document.getElementById('fromLocation').value;
        const toLocation = document.getElementById('toLocation').value;
        const departDate = document.getElementById('departDate').value;
        const returnDate = document.getElementById('returnDate').value;
        const tripType = document.querySelector('input[name="TripType"]:checked')?.value;
        
        let isValid = true;
        
        const existingErrorContainer = document.querySelector('.form-error-container');
        if (existingErrorContainer) {
            existingErrorContainer.remove();
        }
        
        if (!fromLocation) {
            isValid = false;
            document.querySelector('.from-wrapper .input-with-icon').classList.add('error');
            e.preventDefault();
        } else {
            document.querySelector('.from-wrapper .input-with-icon').classList.remove('error');
        }
        
        if (!toLocation) {
            isValid = false;
            document.querySelector('.to-wrapper .input-with-icon').classList.add('error');
            e.preventDefault();
        } else {
            document.querySelector('.to-wrapper .input-with-icon').classList.remove('error');
        }
        
        if (fromLocation && toLocation && fromLocation === toLocation) {
            isValid = false;
            document.querySelector('.from-wrapper .input-with-icon').classList.add('error');
            document.querySelector('.to-wrapper .input-with-icon').classList.add('error');
            e.preventDefault();
            
            const errorContainer = document.createElement('div');
            errorContainer.className = 'form-error-container';
            errorContainer.innerHTML = `
                <div class="form-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Origin and destination cannot be the same</span>
                </div>
            `;
            document.querySelector('.search-card').appendChild(errorContainer);
        }
        
        if (!departDate) {
            isValid = false;
            document.getElementById('departDateContainer').classList.add('error');
            e.preventDefault();
        } else {
            document.getElementById('departDateContainer').classList.remove('error');
        }
        
        if (tripType === 'roundtrip' && !returnDate) {
            isValid = false;
            document.getElementById('returnDateContainer').classList.add('error');
            e.preventDefault();
        } else {
            document.getElementById('returnDateContainer').classList.remove('error');
        }
        
        if (isValid) {
            const originalContent = searchBtn.innerHTML;
            searchBtn.innerHTML = `
                <span class="spinner-circle"></span>
                <span>Searching Flights...</span>
            `;
            searchBtn.classList.add('loading');
            searchBtn.disabled = true;
        }
    });
}

function initAnimatedElements() {
    const shapes = document.querySelectorAll('.floating-shape');
    
    shapes.forEach((shape, index) => {
        const randomDuration = 15 + Math.random() * 10;
        const randomDelay = Math.random() * 5;
        
        shape.style.animationDuration = `${randomDuration}s`;
        shape.style.animationDelay = `${randomDelay}s`;
    });
}