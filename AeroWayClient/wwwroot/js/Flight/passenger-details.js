// Global variables for profile data
let userProfileData = null;

document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    initializeFormInputs();
    initializeCustomSelects();
    initializeDatePickers();
    initializeValidation();
    
    // Fix select elements for ASP.NET MVC
    fixSelectElements();
});

async function loadUserProfile() {
    try {
        // First try to get user data from hidden inputs (passed from server)
        const userIdElement = document.getElementById('currentUserId');
        const profileEmailElement = document.getElementById('profileEmail');
        const profilePhoneElement = document.getElementById('profilePhone');
        
        if (!userIdElement) {
            console.log('No user ID found, using default validation');
            return;
        }

        const userId = userIdElement.value;
        const sessionEmail = profileEmailElement ? profileEmailElement.value : '';
        const sessionPhone = profilePhoneElement ? profilePhoneElement.value : '';
        
        if (userId) {
            try {
                // Try to get full profile data via AJAX for more complete validation
                const response = await fetch('/Flight/GetUserProfileData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.profile) {
                        // Use full profile data from server
                        userProfileData = {
                            userId: data.profile.userId,
                            email: data.profile.email,
                            phone: data.profile.phone,
                            firstName: data.profile.firstName,
                            lastName: data.profile.lastName
                        };
                        console.log('Full user profile loaded from server:', userProfileData);
                    } else {
                        // Fallback to session data
                        userProfileData = {
                            userId: parseInt(userId),
                            email: sessionEmail,
                            phone: sessionPhone
                        };
                        console.log('Using session data as fallback:', userProfileData);
                    }
                } else {
                    // Fallback to session data
                    userProfileData = {
                        userId: parseInt(userId),
                        email: sessionEmail,
                        phone: sessionPhone
                    };
                    console.log('AJAX failed, using session data:', userProfileData);
                }
            } catch (ajaxError) {
                console.warn('AJAX request failed, using session data:', ajaxError);
                // Fallback to session data
                userProfileData = {
                    userId: parseInt(userId),
                    email: sessionEmail,
                    phone: sessionPhone
                };
            }
            
            // Initialize contact field validation with profile data
            initializeContactValidation();
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Continue without profile data
    }
}

function getUserId() {
    const userIdElement = document.getElementById('currentUserId');
    return userIdElement ? userIdElement.value : null;
}

function initializeContactValidation() {
    const emailInput = document.querySelector('input[name="ContactEmail"]');
    const phoneInput = document.querySelector('input[name="ContactPhone"]');
    
    if (emailInput) {
        // If we have profile data and the input is empty or matches session data, fill with profile data
        if (userProfileData && userProfileData.email) {
            // Only pre-fill if empty or if it matches session data
            if (!emailInput.value || emailInput.value === userProfileData.email) {
                emailInput.value = userProfileData.email;
            }
        }
        validateContactField(emailInput);
    }
    
    if (phoneInput) {
        // If we have profile data and the input is empty or matches session data, fill with profile data
        if (userProfileData && userProfileData.phone) {
            // Only pre-fill if empty or if it matches session data
            if (!phoneInput.value || phoneInput.value === userProfileData.phone) {
                phoneInput.value = userProfileData.phone;
            }
        }
        validateContactField(phoneInput);
    }
}

function validateContactField(input) {
    const wrapper = input.closest('.form-group');
    const icon = wrapper ? wrapper.querySelector('.input-icon') : null;
    const errorSpan = wrapper ? wrapper.querySelector('.text-danger, .text-warning') : null;
    
    let isValid = true;
    let validationState = 'valid'; // 'valid', 'warning', 'error'
    let message = '';
    let iconClass = 'fa-check';
    
    const fieldType = input.type === 'email' ? 'email' : 'phone';
    const currentValue = input.value.trim();
    
    if (!currentValue) {
        isValid = false;
        validationState = 'error';
        message = `${fieldType === 'email' ? 'Email' : 'Phone number'} is required`;
        iconClass = 'fa-times';
    } else {
        // Validate format
        if (fieldType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(currentValue)) {
                isValid = false;
                validationState = 'error';
                message = 'Email format is invalid';
                iconClass = 'fa-times';
            } else if (userProfileData && userProfileData.email && currentValue !== userProfileData.email) {
                isValid = true;
                validationState = 'warning';
                message = 'Email differs from profile';
                iconClass = 'fa-exclamation-triangle';
            }
        } else if (fieldType === 'phone') {
            // Phone validation: must start with + and have 9-12 digits
            const phoneRegex = /^\+[1-9]\d{8,11}$/;
            if (!phoneRegex.test(currentValue)) {
                isValid = false;
                validationState = 'error';
                message = 'Phone number format is invalid (must be +country code followed by 9-12 digits)';
                iconClass = 'fa-times';
            } else if (userProfileData && userProfileData.phone && currentValue !== userProfileData.phone) {
                isValid = true;
                validationState = 'warning';
                message = 'Phone number differs from profile';
                iconClass = 'fa-exclamation-triangle';
            }
        }
    }
    
    // Apply visual feedback
    input.classList.remove('contact-valid', 'contact-warning', 'contact-error');
    
    if (icon) {
        icon.className = 'fas input-icon';
        icon.classList.remove('contact-valid', 'contact-warning', 'contact-error');
        
        if (currentValue) {
            icon.style.display = 'block';
            icon.classList.add(`fa-${iconClass.replace('fa-', '')}`);
            icon.classList.add(`contact-${validationState}`);
        } else {
            icon.style.display = 'none';
        }
    }
    
    switch (validationState) {
        case 'valid':
            input.classList.add('contact-valid');
            input.style.borderColor = '#10b981';
            break;
        case 'warning':
            input.classList.add('contact-warning');
            input.style.borderColor = '#f59e0b';
            break;
        case 'error':
            input.classList.add('contact-error');
            input.style.borderColor = '#ef4444';
            break;
    }
    
    // Update error message
    if (errorSpan) {
        errorSpan.remove();
    }
    
    if (message) {
        const messageSpan = document.createElement('span');
        messageSpan.className = validationState === 'warning' ? 'text-warning' : 'text-danger';
        messageSpan.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
        messageSpan.style.display = 'block';
        wrapper.appendChild(messageSpan);
    }
    
    return isValid;
}

function fixSelectElements() {
    // Ensure all hidden selects have proper name attributes for form submission
    document.querySelectorAll('.custom-select select').forEach((select, index) => {
        // Check if this is a Gender or Nationality select
        const customSelect = select.closest('.custom-select');
        const formGroup = customSelect.closest('.form-group');
        const label = formGroup.querySelector('label');
        
        if (!select.hasAttribute('name') || select.name === '') {
            // Try to determine the field type
            if (label) {
                const labelText = label.textContent.toLowerCase();
                const passengerCard = select.closest('.passenger-card');
                const passengerIndex = Array.from(document.querySelectorAll('.passenger-card')).indexOf(passengerCard);
                
                if (labelText.includes('gender')) {
                    select.name = `Passengers[${passengerIndex}].Gender`;
                } else if (labelText.includes('nationality')) {
                    select.name = `Passengers[${passengerIndex}].Nationality`;
                }
                
                // Also set ID for consistency
                select.id = select.name.replace(/[\[\]\.]/g, '_');
            }
        }
        
        console.log('Fixed select element:', {
            name: select.name,
            id: select.id,
            value: select.value
        });
    });
}

function initializeFormInputs() {
    // Name inputs - English letters only with auto-capitalization
    const nameInputs = document.querySelectorAll('input[name*="FirstName"], input[name*="LastName"]');
    nameInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Remove non-English letters
            let value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            
            // Auto-capitalize first letter and after spaces
            value = value.replace(/\b\w/g, letter => letter.toUpperCase());
            
            e.target.value = value;
            validateInput(e.target);
        });

        input.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/^[a-zA-Z\s]$/.test(char) && e.which !== 8 && e.which !== 46) {
                e.preventDefault();
            }
        });

        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            const cleaned = text.replace(/[^a-zA-Z\s]/g, '').replace(/\b\w/g, letter => letter.toUpperCase());
            e.target.value = cleaned;
            validateInput(e.target);
        });
    });

    // Contact inputs - special validation
    const contactInputs = document.querySelectorAll('input[name="ContactEmail"], input[name="ContactPhone"]');
    contactInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            validateContactField(e.target);
        });

        input.addEventListener('blur', function(e) {
            validateContactField(e.target);
        });
    });

    // Passport inputs - exactly 8 digits
    const passportInputs = document.querySelectorAll('.passport-input');
    passportInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Only allow digits
            let value = e.target.value.replace(/[^0-9]/g, '');
            
            // Limit to 8 digits
            if (value.length > 8) {
                value = value.substring(0, 8);
            }
            
            e.target.value = value;
            validateInput(e.target);
        });

        input.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/^[0-9]$/.test(char) && e.which !== 8 && e.which !== 46) {
                e.preventDefault();
            }
            
            // Prevent typing if already 8 digits
            if (e.target.value.length >= 8 && e.which !== 8 && e.which !== 46) {
                e.preventDefault();
            }
        });
    });
}

function initializeCustomSelects() {
    const selects = document.querySelectorAll('.custom-select');
    
    selects.forEach(select => {
        const button = select.querySelector('.select-button');
        const dropdown = select.querySelector('.select-dropdown');
        const options = dropdown.querySelectorAll('.select-option');
        const hiddenSelect = select.querySelector('select');

        // Fix missing name attribute from ASP.NET MVC
        if (hiddenSelect && !hiddenSelect.hasAttribute('name')) {
            // Extract the expected name from parent form structure
            const formGroup = select.closest('.form-group');
            const label = formGroup ? formGroup.querySelector('label') : null;
            
            if (label && label.getAttribute('for')) {
                const forAttr = label.getAttribute('for');
                hiddenSelect.setAttribute('name', forAttr);
                hiddenSelect.setAttribute('id', forAttr);
            }
        }

        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Close other dropdowns
            document.querySelectorAll('.select-dropdown').forEach(dd => {
                if (dd !== dropdown) {
                    dd.classList.remove('show');
                    dd.parentElement.querySelector('.select-button').classList.remove('open');
                    // Remove calendar-active classes
                    const otherSelect = dd.closest('.custom-select');
                    const otherCard = otherSelect.closest('.passenger-card');
                    const otherRow = otherSelect.closest('.form-row');
                    const otherGroup = otherSelect.closest('.form-group');
                    if (otherCard) otherCard.classList.remove('calendar-active');
                    if (otherRow) otherRow.classList.remove('calendar-active');
                    if (otherGroup) otherGroup.classList.remove('calendar-active');
                }
            });

            // Close other calendars
            document.querySelectorAll('.date-calendar').forEach(cal => {
                cal.classList.remove('show');
                const container = cal.closest('.date-picker-container');
                const card = container.closest('.passenger-card');
                const row = container.closest('.form-row');
                const group = container.closest('.form-group');
                if (card) card.style.zIndex = '';
                if (row) row.style.zIndex = '';
                if (group) group.style.zIndex = '';
            });
            document.querySelectorAll('.date-input-display').forEach(display => {
                display.classList.remove('active');
            });
            
            dropdown.classList.toggle('show');
            button.classList.toggle('open');
            
            // When dropdown is opened, add class instead of inline styles
            const passengerCard = select.closest('.passenger-card');
            const formRow = select.closest('.form-row');
            const formGroup = select.closest('.form-group');
            
            if (dropdown.classList.contains('show')) {
                // Remove calendar-active classes from all elements
                document.querySelectorAll('.calendar-active').forEach(el => {
                    el.classList.remove('calendar-active');
                });
                
                if (passengerCard) passengerCard.classList.add('calendar-active');
                if (formRow) formRow.classList.add('calendar-active');
                if (formGroup) formGroup.classList.add('calendar-active');
            } else {
                if (passengerCard) passengerCard.classList.remove('calendar-active');
                if (formRow) formRow.classList.remove('calendar-active');
                if (formGroup) formGroup.classList.remove('calendar-active');
            }
        });

        options.forEach(option => {
            option.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const textElement = this.querySelector('span:last-child') || this;
                const text = textElement.textContent;
                
                button.querySelector('span').textContent = text;
                
                if (hiddenSelect) {
                    hiddenSelect.value = value;
                    // Trigger change event for ASP.NET MVC validation
                    hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    // Also trigger input event for form submission
                    hiddenSelect.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    // Set the name attribute if it's missing
                    if (!hiddenSelect.hasAttribute('name')) {
                        const nameAttr = hiddenSelect.getAttribute('asp-for') || hiddenSelect.id;
                        if (nameAttr) {
                            hiddenSelect.setAttribute('name', nameAttr);
                        }
                    }
                }
                
                dropdown.classList.remove('show');
                button.classList.remove('open');
                
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Add validation indicator for custom selects - GREEN BORDER
                select.classList.add('validated', 'select-valid');
                button.style.borderColor = '#10b981';
                
                // Clear any existing errors
                const container = select.closest('.form-group');
                const errorSpan = container.querySelector('.text-danger');
                if (errorSpan) {
                    errorSpan.style.display = 'none';
                    errorSpan.textContent = '';
                }
                
                // Reset z-index
                const passengerCard = select.closest('.passenger-card');
                const formRow = select.closest('.form-row');
                const formGroup = select.closest('.form-group');
                if (passengerCard) passengerCard.style.zIndex = '';
                if (formRow) formRow.style.zIndex = '';
                if (formGroup) formGroup.style.zIndex = '';
                
                validateInput(hiddenSelect || button);
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.select-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
            dropdown.parentElement.querySelector('.select-button').classList.remove('open');
            // Reset z-index when closing
            const select = dropdown.closest('.custom-select');
            const card = select.closest('.passenger-card');
            const row = select.closest('.form-row');
            const group = select.closest('.form-group');
            if (card) card.style.zIndex = '';
            if (row) row.style.zIndex = '';
            if (group) group.style.zIndex = '';
        });
    });
}

function initializeDatePickers() {
    const datePickers = document.querySelectorAll('.date-picker-container');
    
    datePickers.forEach((container, index) => {
        const display = container.querySelector('.date-input-display');
        const calendar = container.querySelector('.date-calendar');
        const monthSelect = calendar.querySelector('.month-select');
        const yearSelect = calendar.querySelector('.year-select');
        const daysContainer = calendar.querySelector('.calendar-days');
        let hiddenInput = container.querySelector('.date-hidden-input');
        
        // If hidden input doesn't exist, create it
        if (!hiddenInput) {
            hiddenInput = container.querySelector('input[type="hidden"]');
            if (!hiddenInput) {
                // Create the hidden input
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.className = 'date-hidden-input';
                hiddenInput.name = `Passengers[${index}].DateOfBirth`;
                hiddenInput.id = `Passengers_${index}__DateOfBirth`;
                container.appendChild(hiddenInput);
                console.log(`Created hidden input for date picker ${index}`);
            }
        }
        
        // Log for debugging
        console.log(`Date picker ${index}:`, {
            hasDisplay: !!display,
            hasCalendar: !!calendar,
            hasHiddenInput: !!hiddenInput,
            hiddenInputName: hiddenInput ? hiddenInput.name : 'NOT FOUND'
        });
        
        const passengerType = display.getAttribute('data-passenger-type');
        
        let selectedDate = null;
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        // Initialize year options based on passenger type
        initializeYearOptions();
        
        function initializeYearOptions() {
            const currentDate = new Date();
            let minYear, maxYear;
            
            switch (passengerType) {
                case 'Adult':
                    // Adults: 12+ years old
                    maxYear = currentDate.getFullYear() - 12;
                    minYear = currentDate.getFullYear() - 100;
                    break;
                case 'Child':
                    // Children: 2-11 years old
                    maxYear = currentDate.getFullYear() - 2;
                    minYear = currentDate.getFullYear() - 11;
                    break;
                case 'Infant':
                    // Infants: Under 2 years old
                    maxYear = currentDate.getFullYear();
                    minYear = currentDate.getFullYear() - 2;
                    break;
                default:
                    maxYear = currentDate.getFullYear() - 12;
                    minYear = currentDate.getFullYear() - 100;
            }
            
            yearSelect.innerHTML = '';
            for (let year = maxYear; year >= minYear; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            }
            
            currentYear = maxYear;
            yearSelect.value = currentYear;
        }

        display.addEventListener('click', function() {
            // Close other calendars and dropdowns
            document.querySelectorAll('.date-calendar').forEach(cal => {
                if (cal !== calendar) {
                    cal.classList.remove('show');
                }
            });
            document.querySelectorAll('.select-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
                dropdown.parentElement.querySelector('.select-button').classList.remove('open');
                // Reset z-index for dropdowns
                const select = dropdown.closest('.custom-select');
                const card = select.closest('.passenger-card');
                const row = select.closest('.form-row');
                const group = select.closest('.form-group');
                if (card) card.style.zIndex = '';
                if (row) row.style.zIndex = '';
                if (group) group.style.zIndex = '';
            });
            
            calendar.classList.toggle('show');
            display.classList.toggle('active');
            
            // Set z-index for calendar using classes
            const passengerCard = container.closest('.passenger-card');
            const formRow = container.closest('.form-row');
            const formGroup = container.closest('.form-group');
            
            if (calendar.classList.contains('show')) {
                // Remove calendar-active classes from all elements
                document.querySelectorAll('.calendar-active').forEach(el => {
                    el.classList.remove('calendar-active');
                });
                
                if (passengerCard) passengerCard.classList.add('calendar-active');
                if (formRow) formRow.classList.add('calendar-active');
                if (formGroup) formGroup.classList.add('calendar-active');
                updateCalendar();
            } else {
                if (passengerCard) passengerCard.classList.remove('calendar-active');
                if (formRow) formRow.classList.remove('calendar-active');
                if (formGroup) formGroup.classList.remove('calendar-active');
            }
        });

        monthSelect.addEventListener('change', function() {
            currentMonth = parseInt(this.value);
            updateCalendar();
        });

        yearSelect.addEventListener('change', function() {
            currentYear = parseInt(this.value);
            updateCalendar();
        });

        function updateCalendar() {
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());

            monthSelect.value = currentMonth;
            yearSelect.value = currentYear;

            daysContainer.innerHTML = '';

            for (let i = 0; i < 42; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);

                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = date.getDate();

                if (date.getMonth() !== currentMonth) {
                    dayElement.classList.add('other-month');
                }

                if (isToday(date)) {
                    dayElement.classList.add('today');
                }

                if (selectedDate && isSameDate(date, selectedDate)) {
                    dayElement.classList.add('selected');
                }

                // Validate age for passenger type
                if (!isValidAge(date, passengerType)) {
                    dayElement.style.opacity = '0.3';
                    dayElement.style.pointerEvents = 'none';
                }

                dayElement.addEventListener('click', function() {
                    if (!isValidAge(date, passengerType)) return;
                    
                    selectedDate = new Date(date);
                    updateCalendar();
                    
                    const formattedDate = formatDate(selectedDate);
                    display.querySelector('.date-display-text').textContent = formattedDate;
                    
                    // Make sure hiddenInput exists before setting value
                    if (hiddenInput) {
                        hiddenInput.value = selectedDate.toISOString().split('T')[0];
                        console.log('Date set:', hiddenInput.name, hiddenInput.value);
                    } else {
                        console.error('Hidden input not found for date picker');
                    }
                    
                    // Add green border for valid date
                    display.classList.add('valid-date');
                    display.classList.add('date-selected');
                    container.classList.add('date-valid');
                    
                    // Make sure the border color is applied
                    display.style.borderColor = '#10b981';
                    
                    // Change calendar icon color to green
                    const calendarIcon = display.querySelector('.fa-calendar-alt');
                    if (calendarIcon) {
                        calendarIcon.style.color = '#10b981';
                    }
                    
                    // Don't add checkmark icon for date picker
                    
                    calendar.classList.remove('show');
                    display.classList.remove('active');
                    
                    // Remove calendar-active classes
                    const passengerCard = container.closest('.passenger-card');
                    const formRow = container.closest('.form-row');
                    const formGroup = container.closest('.form-group');
                    if (passengerCard) passengerCard.classList.remove('calendar-active');
                    if (formRow) formRow.classList.remove('calendar-active');
                    if (formGroup) formGroup.classList.remove('calendar-active');
                    
                    validateDateAge(selectedDate, passengerType, container);
                });

                daysContainer.appendChild(dayElement);
            }
        }

        function isValidAge(birthDate, type) {
            const today = new Date();
            const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
            
            switch (type) {
                case 'Adult':
                    return age >= 12;
                case 'Child':
                    return age >= 2 && age < 12;
                case 'Infant':
                    return age < 2;
                default:
                    return age >= 12;
            }
        }

        function validateDateAge(birthDate, type, container) {
            const today = new Date();
            const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
            const validationContainer = container.querySelector('.age-validation-container');
            
            if (!validationContainer) {
                console.error('Age validation container not found');
                return true; // Return true to not block submission
            }
            
            validationContainer.innerHTML = '';
            
            let isValid = false;
            let message = '';
            let messageType = 'error';
            
            switch (type) {
                case 'Adult':
                    if (age >= 12) {
                        isValid = true;
                        message = `Valid adult age (${Math.floor(age)} years old)`;
                        messageType = 'success';
                    } else {
                        message = 'Adults must be 12+ years old';
                    }
                    break;
                case 'Child':
                    if (age >= 2 && age < 12) {
                        isValid = true;
                        message = `Valid child age (${Math.floor(age)} years old)`;
                        messageType = 'success';
                    } else if (age < 2) {
                        message = 'Children must be 2-11 years old. This age qualifies as Infant.';
                    } else {
                        message = 'Children must be 2-11 years old. This age qualifies as Adult.';
                    }
                    break;
                case 'Infant':
                    if (age < 2) {
                        isValid = true;
                        message = `Valid infant age (${Math.floor(age * 12)} months old)`;
                        messageType = 'success';
                    } else {
                        message = 'Infants must be under 2 years old. This age qualifies as Child or Adult.';
                    }
                    break;
            }
            
            if (!isValid) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `age-validation-message ${messageType}`;
                messageDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
                validationContainer.appendChild(messageDiv);
            }
            
            return isValid;
        }

        function isToday(date) {
            const today = new Date();
            return isSameDate(date, today);
        }

        function isSameDate(date1, date2) {
            return date1.getDate() === date2.getDate() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getFullYear() === date2.getFullYear();
        }

        function formatDate(date) {
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            return date.toLocaleDateString('en-US', options);
        }

        updateCalendar();
    });

    // Close calendars when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.date-picker-container')) {
            document.querySelectorAll('.date-calendar').forEach(calendar => {
                calendar.classList.remove('show');
                // Reset z-index when closing calendar
                const container = calendar.closest('.date-picker-container');
                const card = container.closest('.passenger-card');
                const row = container.closest('.form-row');
                const group = container.closest('.form-group');
                if (card) card.style.zIndex = '';
                if (row) row.style.zIndex = '';
                if (group) group.style.zIndex = '';
            });
            document.querySelectorAll('.date-input-display').forEach(display => {
                display.classList.remove('active');
            });
        }
    });
}

function validateInput(input) {
    const wrapper = input.closest('.form-group');
    const icon = wrapper ? wrapper.querySelector('.input-icon') : null;
    const errorSpan = wrapper ? wrapper.querySelector('.text-danger') : null;
    
    let isValid = true;
    let errorMessage = '';

    // For select buttons (Gender, Nationality)
    if (input.classList.contains('select-button')) {
        const hiddenSelect = wrapper.querySelector('select');
        if (hiddenSelect && (!hiddenSelect.value || hiddenSelect.value === '')) {
            isValid = false;
            errorMessage = hiddenSelect.name.includes('Gender') ? 'Please select a gender' : 'Please select a nationality';
            input.style.borderColor = '#ef4444';
        } else {
            input.style.borderColor = '#10b981';
            isValid = true;
        }
    } 
    // For regular text inputs
    else if (input.tagName === 'INPUT') {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (input.value.trim()) {
            // Specific validations
            if (input.name && input.name.includes('FirstName')) {
                if (input.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'First name must be at least 2 characters';
                }
            } else if (input.name && input.name.includes('LastName')) {
                if (input.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Last name must be at least 2 characters';
                }
            } else if (input.classList.contains('passport-input')) {
                if (input.value.length !== 8) {
                    isValid = false;
                    errorMessage = 'Passport number must be exactly 8 digits';
                }
            }
        }

        // Update visual feedback for inputs (excluding contact fields)
        if (icon && !input.name.includes('Contact')) {
            if (isValid && input.value.trim()) {
                icon.style.display = 'block';
                icon.style.color = '#10b981';
                input.style.borderColor = '#10b981';
            } else {
                icon.style.display = 'none';
                if (!isValid) {
                    input.style.borderColor = '#ef4444';
                } else {
                    input.style.borderColor = '';
                }
            }
        }
    }

    // Update error message (only for non-contact fields)
    if (errorSpan && !input.name.includes('Contact')) {
        if (!isValid && errorMessage) {
            errorSpan.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
            errorSpan.style.display = 'block';
        } else {
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
    }

    return isValid;
}

function initializeValidation() {
    // Real-time validation for all inputs
    document.addEventListener('input', function(e) {
        if (e.target.matches('input[type="text"]')) {
            validateInput(e.target);
        }
    });

    document.addEventListener('blur', function(e) {
        if (e.target.matches('input[type="text"]')) {
            validateInput(e.target);
        }
    });

    // Terms checkbox validation
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            const termsContainer = this.closest('.checkbox-group');
            const termsError = termsContainer ? termsContainer.nextElementSibling : null;
            
            if (this.checked) {
                // Clear error when checked
                if (termsError && termsError.classList.contains('text-danger')) {
                    termsError.style.display = 'none';
                    termsError.textContent = '';
                }
                if (termsContainer) {
                    termsContainer.style.borderColor = '';
                    termsContainer.style.backgroundColor = '';
                }
            }
        });
    }

    // Form submission validation
    const form = document.querySelector('form#passenger-form');
    if (form) {
        console.log('Form found, attaching submit handler');
        form.addEventListener('submit', function(e) {
            console.log('Form submission triggered');
            let isValid = true;
            let validationErrors = [];
            
            // Validate all text inputs (including contact fields with special handling)
            document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
                if (input.closest('.passenger-forms')) {
                    if (input.name.includes('Contact')) {
                        // Special validation for contact fields
                        if (!validateContactField(input)) {
                            isValid = false;
                            validationErrors.push(`Contact validation failed: ${input.name}`);
                        }
                    } else {
                        if (!validateInput(input)) {
                            isValid = false;
                            validationErrors.push(`Input validation failed: ${input.name}`);
                        }
                    }
                }
            });

            // Validate date inputs
            document.querySelectorAll('.date-picker-container').forEach((container, index) => {
                const hiddenInput = container.querySelector('.date-hidden-input') || container.querySelector('input[type="hidden"]');
                const dateDisplay = container.querySelector('.date-input-display');
                
                console.log(`Checking date container ${index}:`, {
                    hasHiddenInput: !!hiddenInput,
                    value: hiddenInput ? hiddenInput.value : 'NO INPUT',
                    name: hiddenInput ? hiddenInput.name : 'NO NAME'
                });
                
                if (!hiddenInput || !hiddenInput.value) {
                    isValid = false;
                    validationErrors.push(`Date validation failed for passenger ${index + 1}`);
                    const errorSpan = container.querySelector('.text-danger');
                    if (errorSpan) {
                        errorSpan.innerHTML = '<i class="fas fa-exclamation-circle"></i> Date of birth is required';
                        errorSpan.style.display = 'block';
                    }
                    if (dateDisplay) {
                        dateDisplay.style.borderColor = '#ef4444';
                    }
                } else {
                    console.log('Date input value:', hiddenInput.name, hiddenInput.value);
                }
            });

            // Validate selects
            document.querySelectorAll('.custom-select select').forEach(select => {
                console.log('Checking select:', {
                    name: select.name,
                    id: select.id,
                    value: select.value,
                    hasName: select.hasAttribute('name')
                });
                
                if (!select.value || select.value === '') {
                    isValid = false;
                    const fieldName = select.name.includes('Gender') ? 'gender' : 'nationality';
                    validationErrors.push(`${fieldName} validation failed: ${select.name}`);
                    
                    const container = select.closest('.form-group');
                    const errorSpan = container.querySelector('.text-danger');
                    const button = container.querySelector('.select-button');
                    
                    if (errorSpan) {
                        errorSpan.innerHTML = `<i class="fas fa-exclamation-circle"></i> Please select a ${fieldName}`;
                        errorSpan.style.display = 'block';
                    }
                    if (button) {
                        button.style.borderColor = '#ef4444';
                    }
                } else {
                    console.log(`Validation passed for:`, select.name, 'Value:', select.value);
                }
            });

            // Check terms acceptance
            const terms = document.getElementById('terms');
            if (!terms || !terms.checked) {
                isValid = false;
                validationErrors.push('Terms not accepted');
                const termsContainer = terms ? terms.closest('.checkbox-group') : null;
                const termsError = termsContainer ? termsContainer.nextElementSibling : null;
                
                if (termsError && termsError.classList.contains('text-danger')) {
                    termsError.innerHTML = '<i class="fas fa-exclamation-circle"></i> You must accept the terms and conditions to continue';
                    termsError.style.display = 'block';
                    termsError.style.color = '#ef4444';
                }
                
                if (termsContainer) {
                    termsContainer.style.borderColor = '#ef4444';
                    termsContainer.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                }
            } else {
                const termsContainer = terms.closest('.checkbox-group');
                const termsError = termsContainer ? termsContainer.nextElementSibling : null;
                
                if (termsError && termsError.classList.contains('text-danger')) {
                    termsError.style.display = 'none';
                    termsError.textContent = '';
                }
                
                if (termsContainer) {
                    termsContainer.style.borderColor = '';
                    termsContainer.style.backgroundColor = '';
                }
                
                console.log('Terms validation passed - checkbox checked');
            }

            if (!isValid) {
                e.preventDefault();
                console.log('Form submission prevented - validation failed');
                console.log('Validation errors:', validationErrors);
                
                // Scroll to first error
                const firstError = document.querySelector('.text-danger[style*="block"], .text-warning[style*="block"]');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                // Log all form data before submission
                console.log('=== FORM SUBMISSION DATA ===');
                console.log('Validation passed - form will be submitted');
                
                // Log each passenger's data
                document.querySelectorAll('.passenger-card').forEach((card, index) => {
                    console.log(`\n--- Passenger ${index + 1} ---`);
                    
                    const firstName = card.querySelector('input[name*="FirstName"]');
                    console.log('First Name:', firstName ? firstName.value : 'NOT FOUND');
                    
                    const lastName = card.querySelector('input[name*="LastName"]');
                    console.log('Last Name:', lastName ? lastName.value : 'NOT FOUND');
                    
                    const dateInput = card.querySelector('.date-hidden-input') || card.querySelector('input[type="hidden"][name*="DateOfBirth"]');
                    console.log('Date of Birth:', dateInput ? dateInput.value : 'NOT FOUND');
                    
                    const gender = card.querySelector('select[name*="Gender"]');
                    console.log('Gender:', gender ? gender.value : 'NOT FOUND');
                    
                    const passport = card.querySelector('.passport-input');
                    console.log('Passport:', passport ? passport.value : 'NOT FOUND');
                    
                    const nationality = card.querySelector('select[name*="Nationality"]');
                    console.log('Nationality:', nationality ? nationality.value : 'NOT FOUND');
                });
                
                // Log contact information
                console.log('\n--- Contact Information ---');
                const contactEmail = document.querySelector('input[name="ContactEmail"]');
                console.log('Contact Email:', contactEmail ? contactEmail.value : 'NOT FOUND');
                
                const contactPhone = document.querySelector('input[name="ContactPhone"]');
                console.log('Contact Phone:', contactPhone ? contactPhone.value : 'NOT FOUND');
                
                // Log terms acceptance
                console.log('\n--- Terms ---');
                console.log('Terms Accepted:', terms.checked);
                
                console.log('\n=== FORM SUBMITTING TO SERVER ===\n');
            }
        });
    } else {
        console.error('Form element not found! Make sure the form has id="passenger-form"');
    }
}