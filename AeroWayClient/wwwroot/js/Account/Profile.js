function openEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modal.querySelector('.modal').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    const modalElement = modal.querySelector('.modal');
    
    modalElement.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }, 300);
}

function openDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    const form = document.getElementById('deleteAccountForm');
    form.reset();
    
    // Reset confirmation input
    const confirmInput = document.getElementById('deleteConfirmation');
    confirmInput.value = '';
    confirmInput.classList.remove('input-valid', 'input-validation-error');
    
    // Reset delete button
    const deleteBtn = document.querySelector('.btn-delete-confirm');
    deleteBtn.disabled = true;
    deleteBtn.classList.remove('btn-enabled');
    
    // Clear any error messages
    const errorSpans = modal.querySelectorAll('.text-danger');
    errorSpans.forEach(span => {
        span.style.display = 'none';
        span.textContent = '';
    });
    
    setTimeout(() => {
        modal.querySelector('.modal').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
}

function closeDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    const modalElement = modal.querySelector('.modal');
    
    modalElement.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }, 300);
}

function validateDeleteConfirmation() {
    const confirmInput = document.getElementById('deleteConfirmation');
    const passwordInput = document.querySelector('#deleteAccountModal input[name="CurrentPassword"]');
    const deleteBtn = document.querySelector('.btn-delete-confirm');
    const confirmationWrapper = confirmInput.closest('.form-group');
    const confirmationIcon = confirmationWrapper.querySelector('.input-icon');
    const confirmationError = confirmationWrapper.querySelector('.text-danger');
    
    const confirmationValue = confirmInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    
    let isConfirmationValid = false;
    let isPasswordValid = false;
    
    // Validate confirmation text
    if (confirmationValue === 'DELETE') {
        isConfirmationValid = true;
        confirmInput.classList.add('input-valid');
        confirmInput.classList.remove('input-validation-error');
        if (confirmationIcon) {
            confirmationIcon.style.display = 'block';
            confirmationIcon.style.color = '#10b981';
        }
        if (confirmationError) {
            confirmationError.style.display = 'none';
        }
    } else if (confirmationValue.length > 0) {
        isConfirmationValid = false;
        confirmInput.classList.add('input-validation-error');
        confirmInput.classList.remove('input-valid');
        if (confirmationIcon) {
            confirmationIcon.style.display = 'none';
        }
        if (confirmationError) {
            confirmationError.innerHTML = '<i class="fas fa-exclamation-circle"></i> You must type "DELETE" exactly as shown';
            confirmationError.style.display = 'flex';
        }
    } else {
        confirmInput.classList.remove('input-valid', 'input-validation-error');
        if (confirmationIcon) {
            confirmationIcon.style.display = 'none';
        }
        if (confirmationError) {
            confirmationError.style.display = 'none';
        }
    }
    
    // Validate password
    if (passwordValue.length >= 8) {
        isPasswordValid = true;
        passwordInput.classList.add('input-valid');
        passwordInput.classList.remove('input-validation-error');
        const passwordIcon = passwordInput.closest('.form-group').querySelector('.input-icon');
        if (passwordIcon) {
            passwordIcon.style.display = 'block';
            passwordIcon.style.color = '#10b981';
        }
    } else if (passwordValue.length > 0) {
        isPasswordValid = false;
        passwordInput.classList.add('input-validation-error');
        passwordInput.classList.remove('input-valid');
    } else {
        passwordInput.classList.remove('input-valid', 'input-validation-error');
    }
    
    // Enable/disable delete button
    if (isConfirmationValid && isPasswordValid) {
        deleteBtn.disabled = false;
        deleteBtn.classList.add('btn-enabled');
    } else {
        deleteBtn.disabled = true;
        deleteBtn.classList.remove('btn-enabled');
    }
}

function initializeCustomSelects() {
    const selects = document.querySelectorAll('.custom-select');
    
    selects.forEach(select => {
        const button = select.querySelector('.select-button');
        const dropdown = select.querySelector('.select-dropdown');
        const options = dropdown.querySelectorAll('.select-option');
        const hiddenSelect = select.querySelector('select');

        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            document.querySelectorAll('.select-dropdown').forEach(dd => {
                if (dd !== dropdown) {
                    dd.classList.remove('show');
                    dd.parentElement.querySelector('.select-button').classList.remove('open');
                }
            });
            
            document.querySelectorAll('.date-calendar').forEach(cal => {
                cal.classList.remove('show');
                const container = cal.closest('.date-picker-container');
                if (container) {
                    const display = container.querySelector('.date-input-display');
                    if (display) display.classList.remove('active');
                }
            });
            
            dropdown.classList.toggle('show');
            button.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const textElement = this.querySelector('span:last-child') || this;
                const text = textElement.textContent;
                
                button.querySelector('span').textContent = text;
                
                if (hiddenSelect) {
                    hiddenSelect.value = value;
                    hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                dropdown.classList.remove('show');
                button.classList.remove('open');
                
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                button.classList.add('select-valid');
                
                const container = select.closest('.form-group');
                const errorSpan = container.querySelector('.text-danger');
                if (errorSpan) {
                    errorSpan.style.display = 'none';
                    errorSpan.textContent = '';
                }
                
                validateInput(button);
            });
        });
    });

    document.addEventListener('click', function() {
        document.querySelectorAll('.select-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
            dropdown.parentElement.querySelector('.select-button').classList.remove('open');
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
        let hiddenInput = container.querySelector('input[type="hidden"]');
        
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = container.getAttribute('data-name') || 'DateOfBirth';
            container.appendChild(hiddenInput);
        }
        
        let selectedDate = null;
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        initializeYearOptions();
        
        function initializeYearOptions() {
            const currentDate = new Date();
            const maxYear = currentDate.getFullYear() - 18;
            const minYear = currentDate.getFullYear() - 100;
            
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
            document.querySelectorAll('.date-calendar').forEach(cal => {
                if (cal !== calendar) {
                    cal.classList.remove('show');
                    const otherContainer = cal.closest('.date-picker-container');
                    if (otherContainer) {
                        const otherDisplay = otherContainer.querySelector('.date-input-display');
                        if (otherDisplay) otherDisplay.classList.remove('active');
                    }
                }
            });
            
            document.querySelectorAll('.select-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
                dropdown.parentElement.querySelector('.select-button').classList.remove('open');
            });
            
            calendar.classList.toggle('show');
            display.classList.toggle('active');
            
            if (calendar.classList.contains('show')) {
                updateCalendar();
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

                if (!isValidAge(date)) {
                    dayElement.style.opacity = '0.3';
                    dayElement.style.pointerEvents = 'none';
                }

                dayElement.addEventListener('click', function() {
                    if (!isValidAge(date)) return;
                    
                    selectedDate = new Date(date);
                    updateCalendar();
                    
                    const formattedDate = formatDate(selectedDate);
                    display.querySelector('.date-display-text').textContent = formattedDate;
                    
                    if (hiddenInput) {
                        hiddenInput.value = selectedDate.toISOString().split('T')[0];
                    }
                    
                    display.classList.add('valid-date');
                    container.classList.add('date-valid');
                    
                    const calendarIcon = display.querySelector('.fa-calendar-alt');
                    if (calendarIcon) {
                        calendarIcon.style.color = '#10b981';
                    }
                    
                    calendar.classList.remove('show');
                    display.classList.remove('active');
                    
                    validateDateAge(selectedDate, container);
                });

                daysContainer.appendChild(dayElement);
            }
        }

        function isValidAge(birthDate) {
            const today = new Date();
            const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
            return age >= 18;
        }

        function validateDateAge(birthDate, container) {
            const today = new Date();
            const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
            const validationContainer = container.querySelector('.age-validation-container');
            
            if (validationContainer) {
                validationContainer.innerHTML = '';
                
                if (age < 18) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'age-validation-message error';
                    messageDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> You must be at least 18 years old`;
                    validationContainer.appendChild(messageDiv);
                    return false;
                }
            }
            
            return true;
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

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.date-picker-container')) {
            document.querySelectorAll('.date-calendar').forEach(calendar => {
                calendar.classList.remove('show');
                const container = calendar.closest('.date-picker-container');
                if (container) {
                    const display = container.querySelector('.date-input-display');
                    if (display) display.classList.remove('active');
                }
            });
        }
    });
}

function initializeFormInputs() {
    const nameInputs = document.querySelectorAll('input[name="FirstName"], input[name="LastName"]');
    nameInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
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

    const phoneInputs = document.querySelectorAll('input[name="Phone"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^+0-9]/g, '');
            
            if (value.length > 0 && !value.startsWith('+')) {
                value = '+' + value;
            }
            
            if (value.length > 1) {
                const digits = value.substring(1);
                if (digits.length > 12) {
                    value = '+' + digits.substring(0, 12);
                }
            }
            
            e.target.value = value;
            validateInput(e.target);
        });

        input.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which || e.keyCode);
            const currentValue = e.target.value;
            
            if (e.which !== 8 && e.which !== 46) {
                if (currentValue.length === 0 && char !== '+') {
                    e.preventDefault();
                    return;
                }
                
                if (currentValue.length > 0 && !/^[0-9]$/.test(char)) {
                    e.preventDefault();
                    return;
                }
                
                const futureValue = currentValue + char;
                if (futureValue.length > 13) {
                    e.preventDefault();
                    return;
                }
                
                if (futureValue.length > 1) {
                    const digits = futureValue.substring(1);
                    if (digits.length > 12) {
                        e.preventDefault();
                        return;
                    }
                }
            }
        });

        input.addEventListener('paste', function(e) {
            e.preventDefault();
            let text = (e.clipboardData || window.clipboardData).getData('text');
            text = text.replace(/[^+0-9]/g, '');
            
            if (text.length > 0 && !text.startsWith('+')) {
                text = '+' + text;
            }
            
            if (text.length > 1) {
                const digits = text.substring(1);
                if (digits.length > 12) {
                    text = '+' + digits.substring(0, 12);
                }
            }
            
            e.target.value = text;
            validateInput(e.target);
        });
    });
}

function validateInput(input) {
    const wrapper = input.closest('.form-group');
    const icon = wrapper ? wrapper.querySelector('.input-icon') : null;
    const errorSpan = wrapper ? wrapper.querySelector('.text-danger') : null;
    
    let isValid = true;
    let errorMessage = '';

    if (input.classList && input.classList.contains('select-button')) {
        const hiddenSelect = wrapper.querySelector('select');
        if (hiddenSelect && (!hiddenSelect.value || hiddenSelect.value === '')) {
            isValid = false;
            errorMessage = hiddenSelect.name.includes('Gender') ? 'Please select a gender' : 'Please select a nationality';
            input.classList.remove('select-valid');
            input.classList.add('input-validation-error');
        } else {
            input.classList.add('select-valid');
            input.classList.remove('input-validation-error');
            isValid = true;
        }
    } 
    else if (input.tagName === 'INPUT') {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (input.value.trim()) {
            if (input.name && input.name.includes('FirstName')) {
                if (input.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'First name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(input.value)) {
                    isValid = false;
                    errorMessage = 'First name can only contain English letters';
                }
            } else if (input.name && input.name.includes('LastName')) {
                if (input.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Last name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(input.value)) {
                    isValid = false;
                    errorMessage = 'Last name can only contain English letters';
                }
            } else if (input.name === 'Phone') {
                const phoneRegex = /^\+[1-9]\d{8,11}$/;
                if (!phoneRegex.test(input.value)) {
                    isValid = false;
                    errorMessage = 'Phone must be +[country code][9-12 digits]';
                }
            } else if (input.type === 'password') {
                if (input.value.length < 8) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters';
                }
            } else if (input.type === 'date') {
                const birthDate = new Date(input.value);
                const today = new Date();
                const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
                
                if (age < 18) {
                    isValid = false;
                    errorMessage = 'You must be at least 18 years old';
                }
            }
        }

        if (icon) {
            if (isValid && input.value.trim()) {
                icon.style.display = 'block';
                icon.style.color = '#10b981';
                input.classList.add('input-valid');
                input.classList.remove('input-validation-error');
            } else {
                if (input.value.trim()) {
                    icon.style.display = 'none';
                } else {
                    icon.style.display = 'none';
                }
                
                if (!isValid) {
                    input.classList.add('input-validation-error');
                    input.classList.remove('input-valid');
                } else {
                    input.classList.remove('input-validation-error', 'input-valid');
                }
            }
        }
    }

    if (errorSpan) {
        if (!isValid && errorMessage) {
            errorSpan.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
            errorSpan.style.display = 'flex';
        } else {
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
    }

    return isValid;
}

document.addEventListener('DOMContentLoaded', function() {
    initializeFormInputs();
    initializeCustomSelects();
    initializeDatePickers();
    
    // Initialize delete account modal event listeners
    const deleteConfirmationInput = document.getElementById('deleteConfirmation');
    const deletePasswordInput = document.querySelector('#deleteAccountModal input[name="CurrentPassword"]');
    
    if (deleteConfirmationInput) {
        deleteConfirmationInput.addEventListener('input', validateDeleteConfirmation);
        deleteConfirmationInput.addEventListener('paste', function(e) {
            setTimeout(validateDeleteConfirmation, 10);
        });
    }
    
    if (deletePasswordInput) {
        deletePasswordInput.addEventListener('input', validateDeleteConfirmation);
    }
    
    // Modal click outside to close
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
    
    document.getElementById('deleteAccountModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDeleteAccountModal();
        }
    });

    // Animate cards on load
    window.addEventListener('load', () => {
        const cards = document.querySelectorAll('.content-card, .sidebar-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            setTimeout(() => {
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-10px)';
                setTimeout(() => alert.remove(), 300);
            }, 5000);
        });
    });

    // Input validation events
    document.addEventListener('input', function(e) {
        if (e.target.matches('.form-input')) {
            validateInput(e.target);
        }
    });

    document.addEventListener('blur', function(e) {
        if (e.target.matches('.form-input')) {
            validateInput(e.target);
        }
    });

    // Edit profile form submission
    document.getElementById('editProfileForm').addEventListener('submit', function(e) {
        let isValid = true;
        const inputs = this.querySelectorAll('.form-input, .select-button');
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        const dateContainers = this.querySelectorAll('.date-picker-container');
        dateContainers.forEach(container => {
            const hiddenInput = container.querySelector('input[type="hidden"]');
            const display = container.querySelector('.date-input-display');
            
            if (!hiddenInput || !hiddenInput.value) {
                isValid = false;
                const errorSpan = container.querySelector('.text-danger') || container.parentElement.querySelector('.text-danger');
                if (errorSpan) {
                    errorSpan.innerHTML = '<i class="fas fa-exclamation-circle"></i> Date of birth is required';
                    errorSpan.style.display = 'flex';
                }
                if (display) {
                    display.classList.add('input-validation-error');
                }
            } else {
                const birthDate = new Date(hiddenInput.value);
                const today = new Date();
                const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
                
                if (age < 18) {
                    isValid = false;
                    const errorSpan = container.querySelector('.text-danger') || container.parentElement.querySelector('.text-danger');
                    if (errorSpan) {
                        errorSpan.innerHTML = '<i class="fas fa-exclamation-circle"></i> You must be at least 18 years old';
                        errorSpan.style.display = 'flex';
                    }
                    if (display) {
                        display.classList.add('input-validation-error');
                    }
                }
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            
            const firstError = this.querySelector('.text-danger[style*="flex"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            const modal = this.closest('.modal');
            modal.style.animation = 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
            setTimeout(() => {
                modal.style.animation = '';
            }, 500);
            
            return false;
        }
        
        const submitBtn = this.querySelector('.btn-save');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Changes...';
            submitBtn.disabled = true;
        }
    });

    // Delete account form submission
    document.getElementById('deleteAccountForm').addEventListener('submit', function(e) {
        const confirmInput = document.getElementById('deleteConfirmation');
        const passwordInput = this.querySelector('input[name="CurrentPassword"]');
        
        if (confirmInput.value.trim() !== 'DELETE') {
            e.preventDefault();
            alert('You must type "DELETE" exactly to confirm account deletion.');
            return false;
        }
        
        if (passwordInput.value.trim().length < 6) {
            e.preventDefault();
            alert('Please enter your current password.');
            return false;
        }
        
        const submitBtn = this.querySelector('.btn-delete-confirm');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting Account...';
            submitBtn.disabled = true;
        }
    });
    
    // Add shake animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            10%, 90% { transform: translate(-50%, -50%) translateX(-1px); }
            20%, 80% { transform: translate(-50%, -50%) translateX(2px); }
            30%, 50%, 70% { transform: translate(-50%, -50%) translateX(-3px); }
            40%, 60% { transform: translate(-50%, -50%) translateX(3px); }
        }
    `;
    document.head.appendChild(style);
});