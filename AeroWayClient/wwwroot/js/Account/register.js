document.addEventListener('DOMContentLoaded', function() {
    const isFirstLoad = !sessionStorage.getItem('formSessionStarted');

    if (isFirstLoad) {
        localStorage.removeItem('savedFormData');
        sessionStorage.setItem('formSessionStarted', 'true');
    }

    window.addEventListener('beforeunload', function() {
        sessionStorage.removeItem('formSessionStarted');
    });

    let currentStep = 1;
    const totalSteps = 3;
    const formData = {
        countryCode: '',
        selectedDay: null,
        selectedMonth: null,
        selectedYear: null,
        selectedGender: null,
        selectedNationality: null,
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    };

    initializeDateDropdowns();
    initializeCustomSelects();
    initializePasswordFeatures();
    initializeFormValidation();
    initializeStepNavigation();
    initializeCountryCodes();
    disableAutocomplete();
    handleServerErrors();
    restoreFormValues();
    showStep(currentStep);

    function showStep(stepNumber) {
        saveCurrentFormValues();
        
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none';
        });

        const currentStepElement = document.getElementById(`step-${stepNumber}`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
            setTimeout(() => {
                currentStepElement.classList.add('active');
            }, 50);
        }

        updateStepIndicators(stepNumber);
        updateNavigationButtons(stepNumber);
        resetFormToSavedValues(stepNumber);
        
        currentStep = stepNumber;
    }
    
    function saveCurrentFormValues() {
        const inputFields = [
            { id: 'firstName', prop: 'firstName' },
            { id: 'lastName', prop: 'lastName' },
            { id: 'email', prop: 'email' },
            { id: 'phoneNumber', prop: 'phoneNumber' },
            { id: 'password', prop: 'password' },
            { id: 'confirmPassword', prop: 'confirmPassword' }
        ];
        
        inputFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                formData[field.prop] = input.value;
            }
        });
        
        updateHiddenPhoneField();
    }
    
    function resetFormToSavedValues(stepNumber) {
        switch (stepNumber) {
            case 1:
                setInputValueIfExists('firstName', formData.firstName);
                setInputValueIfExists('lastName', formData.lastName);
                
                updateDropdownDisplay('dayButton', formData.selectedDay);
                updateDropdownDisplay('monthButton', formData.selectedMonth);
                updateDropdownDisplay('yearButton', formData.selectedYear);
                updateDropdownDisplay('genderButton', formData.selectedGender);
                updateDropdownDisplay('nationalityButton', formData.selectedNationality);
                
                setInputValueIfExists('dateOfBirthHidden', formData.dateOfBirth);
                setInputValueIfExists('genderHidden', formData.selectedGender);
                setInputValueIfExists('nationalityHidden', formData.selectedNationality);
                break;
                
            case 2:
                setInputValueIfExists('email', formData.email);
                setInputValueIfExists('phoneNumber', formData.phoneNumber);
                updateDropdownDisplay('countryCodeButton', formData.countryCode);
                updateHiddenPhoneField();
                break;
                
            case 3:
                setInputValueIfExists('password', formData.password);
                setInputValueIfExists('confirmPassword', formData.confirmPassword);
                
                if (formData.password && document.getElementById('password')) {
                    const passwordInput = document.getElementById('password');
                    const passwordStrength = document.getElementById('passwordStrength');
                    
                    if (passwordStrength) {
                        if (formData.password.length > 0) {
                            passwordStrength.style.display = 'block';
                            checkPasswordRequirements(formData.password);
                            updatePasswordStrength(formData.password);
                        } else {
                            passwordStrength.style.display = 'none';
                        }
                    }
                }
                break;
        }
    }
    
    function setInputValueIfExists(id, value) {
        const input = document.getElementById(id);
        if (input && value !== undefined) {
            input.value = value;
        }
    }
    
    function updateDropdownDisplay(buttonId, value) {
        const button = document.getElementById(buttonId);
        if (button && value) {
            const buttonSpan = button.querySelector('span');
            if (buttonSpan) {
                const dropdown = button.nextElementSibling;
                if (dropdown) {
                    const option = dropdown.querySelector(`.select-option[data-value="${value}"]`);
                    if (option) {
                        if (buttonId === 'countryCodeButton') {
                            buttonSpan.textContent = value;
                            button.classList.add('selected');
                        } else {
                            buttonSpan.textContent = option.textContent;
                        }
                    } else {
                        if (buttonId === 'countryCodeButton') {
                            buttonSpan.textContent = value;
                            button.classList.add('selected');
                        } else {
                            buttonSpan.textContent = value;
                        }
                    }
                } else {
                    if (buttonId === 'countryCodeButton') {
                        buttonSpan.textContent = value;
                        button.classList.add('selected');
                    } else {
                        buttonSpan.textContent = value;
                    }
                }
            }
        } else if (button && buttonId === 'countryCodeButton') {
            const buttonSpan = button.querySelector('span');
            if (buttonSpan) {
                buttonSpan.textContent = 'Select code';
                button.classList.remove('selected');
                formData.countryCode = '';
            }
        }
    }

    function updateStepIndicators(activeStep) {
        for (let i = 1; i <= totalSteps; i++) {
            const stepElement = document.getElementById(`step${i}`);
            if (stepElement) {
                stepElement.classList.remove('active', 'completed');
                
                if (i < activeStep) {
                    const stepNumber = stepElement.querySelector('.step-number');
                    if (stepNumber && !stepNumber.querySelector('i')) {
                        stepNumber.innerHTML = '<i class="fas fa-check"></i>';
                    }
                    stepElement.classList.add('completed');
                } else if (i === activeStep) {
                    const stepNumber = stepElement.querySelector('.step-number');
                    if (stepNumber) {
                        stepNumber.innerHTML = i;
                    }
                    stepElement.classList.add('active');
                } else {
                    const stepNumber = stepElement.querySelector('.step-number');
                    if (stepNumber) {
                        stepNumber.innerHTML = i;
                    }
                }
            }
        }
    }

    function updateNavigationButtons(stepNumber) {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            if (stepNumber === 1) {
                prevBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'inline-flex';
            }
        }

        if (nextBtn && submitBtn) {
            if (stepNumber === totalSteps) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'inline-flex';
            } else {
                nextBtn.style.display = 'inline-flex';
                submitBtn.style.display = 'none';
                nextBtn.disabled = !validateCurrentStep(stepNumber);
            }
        }
    }

    function isAtLeast18YearsOld(day, month, year) {
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18;
        }
        
        return age >= 18;
    }

    function validateCurrentStep(stepNumber) {
        switch (stepNumber) {
            case 1:
                const firstName = document.getElementById('firstName')?.value?.trim() || '';
                const lastName = document.getElementById('lastName')?.value?.trim() || '';
                const isValidAge = formData.selectedDay && formData.selectedMonth && formData.selectedYear &&
                                 isAtLeast18YearsOld(formData.selectedDay, formData.selectedMonth, formData.selectedYear);
                
                const dateOfBirthError = document.querySelector('.date-picker + .text-danger');
                if (dateOfBirthError) {
                    if (formData.selectedDay && formData.selectedMonth && formData.selectedYear && !isValidAge) {
                        dateOfBirthError.textContent = 'You must be at least 18 years old';
                        dateOfBirthError.style.display = 'block';
                    } else {
                        dateOfBirthError.textContent = '';
                        dateOfBirthError.style.display = 'none';
                    }
                }
                
                return firstName.length >= 3 && firstName.length <= 30 && 
                       lastName.length >= 3 && lastName.length <= 30 && 
                       isValidAge &&
                       formData.selectedGender && 
                       formData.selectedNationality;

            case 2:
                const email = document.getElementById('email')?.value?.trim() || '';
                const phoneNumber = document.getElementById('phoneNumber')?.value?.trim() || '';
                const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                const phoneValid = phoneNumber.length >= 7;
                
                return emailValid && phoneValid && formData.countryCode;

            case 3:
                const password = document.getElementById('password')?.value || '';
                const confirmPassword = document.getElementById('confirmPassword')?.value || '';
                
                const hasUpperCase = /[A-Z]/.test(password);
                const hasLowerCase = /[a-z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                const isLongEnough = password.length >= 8;
                
                const passwordsMatch = password === confirmPassword;
                const passwordValid = hasUpperCase && hasLowerCase && hasNumber && isLongEnough;
                
                const confirmPasswordError = document.querySelector('#confirmPassword + .text-danger');
                if (confirmPasswordError) {
                    if (confirmPassword && !passwordsMatch) {
                        confirmPasswordError.textContent = 'Passwords do not match';
                        confirmPasswordError.style.display = 'block';
                    } else {
                        confirmPasswordError.textContent = '';
                        confirmPasswordError.style.display = 'none';
                    }
                }
                
                return passwordValid && passwordsMatch;

            default:
                return false;
        }
    }

    function initializeStepNavigation() {
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (!validateCurrentStep(currentStep)) {
                    return;
                }
                
                saveCurrentFormValues();
                
                const currentStepEl = document.getElementById(`step-${currentStep}`);
                if (currentStepEl) {
                    currentStepEl.classList.add('slide-out');
                    setTimeout(() => {
                        currentStepEl.classList.remove('slide-out');
                        showStep(currentStep + 1);
                    }, 300);
                } else {
                    showStep(currentStep + 1);
                }
            });
        }

        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentStep > 1) {
                    const currentStepEl = document.getElementById(`step-${currentStep}`);
                    if (currentStepEl) {
                        currentStepEl.classList.add('slide-out-right');
                        setTimeout(() => {
                            currentStepEl.classList.remove('slide-out-right');
                            showStep(currentStep - 1);
                            resetFormToSavedValues(currentStep - 1);
                        }, 300);
                    } else {
                        showStep(currentStep - 1);
                    }
                }
            });
        }

        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                const terms = document.getElementById('terms');
                if (!terms?.checked) {
                    e.preventDefault();
                    const termsCheckbox = document.querySelector('.checkbox-group:last-child');
                    if (termsCheckbox) {
                        termsCheckbox.style.animation = 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both';
                        setTimeout(() => {
                            termsCheckbox.style.animation = '';
                        }, 500);
                    }
                    alert('Please accept the terms and conditions to continue.');
                    return false;
                }
                
                saveCurrentFormValues();
                updateHiddenPhoneField();
                
                const submitBtn = document.getElementById('submitBtn');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
                    submitBtn.disabled = true;
                }
            });
        }

        let validationTimeout;
        document.addEventListener('input', function() {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(() => {
                updateNavigationButtons(currentStep);
            }, 300);
        });

        document.addEventListener('change', function() {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(() => {
                updateNavigationButtons(currentStep);
            }, 100);
        });
    }

    function initializeDateDropdowns() {
        const dayDropdown = document.getElementById('dayDropdown');
        if (dayDropdown) {
            for (let i = 1; i <= 31; i++) {
                const option = document.createElement('div');
                option.className = 'select-option';
                option.setAttribute('data-value', i);
                option.textContent = i < 10 ? `0${i}` : i;
                dayDropdown.appendChild(option);
            }
        }

        const yearDropdown = document.getElementById('yearDropdown');
        if (yearDropdown) {
            const currentYear = new Date().getFullYear();
            const maxYear = currentYear - 18;
            for (let i = maxYear; i >= 1900; i--) {
                const option = document.createElement('div');
                option.className = 'select-option';
                option.setAttribute('data-value', i);
                option.textContent = i;
                yearDropdown.appendChild(option);
            }
        }
    }

    function initializeCustomSelects() {
        const selects = document.querySelectorAll('.custom-select');
        
        selects.forEach(select => {
            const button = select.querySelector('.select-button');
            const dropdown = select.querySelector('.select-dropdown');
            const options = dropdown.querySelectorAll('.select-option');

            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                document.querySelectorAll('.select-dropdown').forEach(dd => {
                    if (dd !== dropdown) {
                        dd.classList.remove('show');
                        dd.previousElementSibling.classList.remove('open');
                    }
                });
                
                dropdown.classList.toggle('show');
                button.classList.toggle('open');
                
                if (dropdown.classList.contains('show')) {
                    const activeOption = dropdown.querySelector('.select-option.selected');
                    if (activeOption) {
                        setTimeout(() => {
                            activeOption.scrollIntoView({ block: "nearest", behavior: "auto" });
                        }, 100);
                    }
                }
            });

            options.forEach(option => {
                option.addEventListener('click', function() {
                    const value = this.getAttribute('data-value');
                    const text = this.textContent;
                    
                    const buttonSpan = button.querySelector('span');
                    if (buttonSpan) {
                        if (select.closest('.country-code-select')) {
                            buttonSpan.textContent = value;
                        } else {
                            buttonSpan.textContent = text;
                        }
                    }
                    
                    dropdown.classList.remove('show');
                    button.classList.remove('open');
                    
                    if (select.closest('.country-code-select')) {
                        formData.countryCode = value;
                        button.classList.add('selected');
                        updateHiddenPhoneField();
                    } else if (button.id === 'dayButton') {
                        formData.selectedDay = value;
                        updateDateOfBirth();
                    } else if (button.id === 'monthButton') {
                        formData.selectedMonth = value;
                        updateDateOfBirth();
                    } else if (button.id === 'yearButton') {
                        formData.selectedYear = value;
                        updateDateOfBirth();
                    } else if (button.id === 'genderButton') {
                        formData.selectedGender = value;
                        document.getElementById('genderHidden').value = value;
                    } else if (button.id === 'nationalityButton') {
                        formData.selectedNationality = value;
                        document.getElementById('nationalityHidden').value = value;
                    }
                    
                    options.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    updateNavigationButtons(currentStep);
                    saveToLocalStorage();
                });
            });
        });

        document.addEventListener('click', function() {
            document.querySelectorAll('.select-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
                dropdown.previousElementSibling.classList.remove('open');
            });
        });
        
        const nationalityDropdown = document.getElementById('nationalityDropdown');
        if (nationalityDropdown && nationalityDropdown.querySelectorAll('.select-option').length === 0) {
            const nationalities = [
                "American", "British", "Canadian", "French", "German", 
                "Israeli", "Italian", "Russian", "Spanish", "Chinese"
            ];
            
            nationalities.forEach(nationality => {
                const option = document.createElement('div');
                option.className = 'select-option';
                option.setAttribute('data-value', nationality);
                option.textContent = nationality;
                nationalityDropdown.appendChild(option);
            });
            
            const newOptions = nationalityDropdown.querySelectorAll('.select-option');
            newOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const value = this.getAttribute('data-value');
                    const text = this.textContent;
                    
                    const nationalityButton = document.getElementById('nationalityButton');
                    const buttonSpan = nationalityButton.querySelector('span');
                    if (buttonSpan) {
                        buttonSpan.textContent = text;
                    }
                    
                    nationalityDropdown.classList.remove('show');
                    nationalityButton.classList.remove('open');
                    
                    formData.selectedNationality = value;
                    document.getElementById('nationalityHidden').value = value;
                    
                    newOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    updateNavigationButtons(currentStep);
                    saveToLocalStorage();
                });
            });
        }
    }

    function initializeCountryCodes() {
        const countryCodeDropdown = document.getElementById('countryCodeDropdown');
        if (countryCodeDropdown && countryCodeDropdown.querySelectorAll('.select-option').length === 0) {
            const countryCodes = [
                { code: '+1', country: 'USA/Canada' },
                { code: '+44', country: 'UK' },
                { code: '+33', country: 'France' },
                { code: '+49', country: 'Germany' },
                { code: '+39', country: 'Italy' },
                { code: '+34', country: 'Spain' },
                { code: '+86', country: 'China' },
                { code: '+91', country: 'India' },
                { code: '+972', country: 'Israel' },
                { code: '+7', country: 'Russia' }
            ];
            
            countryCodes.forEach(item => {
                const option = document.createElement('div');
                option.className = 'select-option';
                option.setAttribute('data-value', item.code);
                option.textContent = `${item.code} ${item.country}`;
                countryCodeDropdown.appendChild(option);
            });
            
            const newOptions = countryCodeDropdown.querySelectorAll('.select-option');
            newOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const value = this.getAttribute('data-value');
                    
                    const countryCodeButton = document.getElementById('countryCodeButton');
                    const buttonSpan = countryCodeButton.querySelector('span');
                    if (buttonSpan) {
                        buttonSpan.textContent = value;
                    }
                    
                    countryCodeDropdown.classList.remove('show');
                    countryCodeButton.classList.remove('open');
                    
                    formData.countryCode = value;
                    button.classList.add('selected');
                    updateHiddenPhoneField();
                    
                    newOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    updateNavigationButtons(currentStep);
                    saveToLocalStorage();
                });
            });
        }
    }

    function updateDateOfBirth() {
        if (formData.selectedDay && formData.selectedMonth && formData.selectedYear) {
            const dateString = formData.selectedYear + '-' + 
                             String(formData.selectedMonth).padStart(2, '0') + '-' + 
                             String(formData.selectedDay).padStart(2, '0');
            const hiddenInput = document.getElementById('dateOfBirthHidden');
            if (hiddenInput) {
                hiddenInput.value = dateString;
                formData.dateOfBirth = dateString;
            }
            
            const isValidAge = isAtLeast18YearsOld(formData.selectedDay, formData.selectedMonth, formData.selectedYear);
            const dateOfBirthError = document.querySelector('.date-picker + .text-danger');
            if (dateOfBirthError) {
                if (!isValidAge) {
                    dateOfBirthError.textContent = 'You must be at least 18 years old';
                    dateOfBirthError.style.display = 'block';
                } else {
                    dateOfBirthError.textContent = '';
                    dateOfBirthError.style.display = 'none';
                }
            }
            
            updateNavigationButtons(currentStep);
        }
    }

    function updateHiddenPhoneField() {
        const phoneInput = document.getElementById('phoneNumber');
        const phoneHidden = document.getElementById('phoneHidden');
        
        if (phoneInput && phoneHidden) {
            const phoneNumber = phoneInput.value.trim();
            const countryCode = formData.countryCode || '';
            
            if (countryCode && phoneNumber) {
                phoneHidden.value = countryCode + phoneNumber;
            } else {
                phoneHidden.value = '';
            }
        }
    }

    function saveToLocalStorage() {
        try {
            localStorage.setItem('savedFormData', JSON.stringify(formData));
        } catch (e) {
            console.error('Error saving form data to localStorage', e);
        }
    }

    function initializePasswordFeatures() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const passwordToggle = document.getElementById('passwordToggle');
        const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
        const passwordStrength = document.getElementById('passwordStrength');
        const passwordRequirements = document.getElementById('passwordRequirements');

        if (passwordToggle && password) {
            passwordToggle.addEventListener('click', function() {
                const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                password.setAttribute('type', type);
                this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        }

        if (confirmPasswordToggle && confirmPassword) {
            confirmPasswordToggle.addEventListener('click', function() {
                const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
                confirmPassword.setAttribute('type', type);
                this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        }

        if (password && passwordStrength) {
            password.addEventListener('focus', function() {
                if (passwordRequirements) {
                    passwordRequirements.style.display = 'grid';
                }
                
                if (this.value.length > 0 && passwordStrength) {
                    passwordStrength.style.display = 'block';
                }
            });
            
            password.addEventListener('input', function() {
                const value = this.value;
                
                if (value.length > 0) {
                    if (passwordStrength) {
                        passwordStrength.style.display = 'block';
                    }
                    checkPasswordRequirements(value);
                    updatePasswordStrength(value);
                } else {
                    if (passwordStrength) {
                        passwordStrength.style.display = 'none';
                    }
                    resetPasswordRequirements();
                }
                
                updateNavigationButtons(currentStep);
            });
        }
    }

    function checkPasswordRequirements(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password)
        };

        updateRequirement('lengthReq', requirements.length);
        updateRequirement('uppercaseReq', requirements.uppercase);
        updateRequirement('lowercaseReq', requirements.lowercase);
        updateRequirement('numberReq', requirements.number);
    }

    function updateRequirement(id, met) {
        const req = document.getElementById(id);
        if (req) {
            const icon = req.querySelector('i');
            
            if (met) {
                req.classList.add('met');
                if (icon) icon.className = 'fas fa-check';
            } else {
                req.classList.remove('met');
                if (icon) icon.className = 'fas fa-times';
            }
        }
    }

    function resetPasswordRequirements() {
        ['lengthReq', 'uppercaseReq', 'lowercaseReq', 'numberReq'].forEach(id => {
            updateRequirement(id, false);
        });
    }

    function updatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const passwordStrength = document.getElementById('passwordStrength');
        if (passwordStrength) {
            passwordStrength.className = 'password-strength';
            
            if (strength < 2) {
                passwordStrength.classList.add('weak');
            } else if (strength < 3) {
                passwordStrength.classList.add('medium');
            } else {
                passwordStrength.classList.add('strong');
            }
            
            const passwordBar = passwordStrength.querySelector('.password-strength-bar');
            if (passwordBar) {
                if (strength < 2) {
                    passwordBar.style.width = '33%';
                    passwordBar.style.background = '#ef4444';
                } else if (strength < 3) {
                    passwordBar.style.width = '66%';
                    passwordBar.style.background = '#f59e0b';
                } else {
                    passwordBar.style.width = '100%';
                    passwordBar.style.background = '#10b981';
                }
            }
        }
    }

    function initializeFormValidation() {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const phoneNumber = document.getElementById('phoneNumber');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');

        function restrictToEnglishLetters(e) {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/^[a-zA-Z\s]$/.test(char) && e.which !== 8 && e.which !== 46) {
                e.preventDefault();
                return false;
            }
        }

        function restrictToNumbers(e) {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/^[0-9]$/.test(char) && e.which !== 8 && e.which !== 46) {
                e.preventDefault();
                return false;
            }
        }

        function restrictToEmail(e) {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/^[a-z0-9@.\-_]$/.test(char) && e.which !== 8 && e.which !== 46) {
                e.preventDefault();
                return false;
            }
        }

        function capitalizeFirstLetter(str) {
            if (!str) return str;
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }

        if (firstName) {
            firstName.addEventListener('keypress', restrictToEnglishLetters);
            firstName.addEventListener('paste', function(e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
                document.execCommand('insertText', false, cleaned);
            });
            
            firstName.addEventListener('input', function() {
                this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
                if (this.value.length > 30) {
                    this.value = this.value.substring(0, 30);
                }
                this.value = capitalizeFirstLetter(this.value);
                formData.firstName = this.value.trim();
                const errorSpan = this.nextElementSibling;
                if (errorSpan && errorSpan.classList.contains('text-danger')) {
                    if (this.value.trim().length < 3 && this.value.trim().length > 0) {
                        errorSpan.textContent = 'First name must be at least 3 characters';
                        errorSpan.style.display = 'block';
                    } else if (this.value.length > 30) {
                        errorSpan.textContent = 'First name cannot exceed 30 characters';
                        errorSpan.style.display = 'block';
                    } else {
                        errorSpan.textContent = '';
                        errorSpan.style.display = 'none';
                    }
                }
                updateNavigationButtons(currentStep);
                saveToLocalStorage();
            });
        }

        if (lastName) {
            lastName.addEventListener('keypress', restrictToEnglishLetters);
            lastName.addEventListener('paste', function(e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
                document.execCommand('insertText', false, cleaned);
            });
            
            lastName.addEventListener('input', function() {
                this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
                if (this.value.length > 30) {
                    this.value = this.value.substring(0, 30);
                }
                this.value = capitalizeFirstLetter(this.value);
                formData.lastName = this.value.trim();
                const errorSpan = this.nextElementSibling;
                if (errorSpan && errorSpan.classList.contains('text-danger')) {
                    if (this.value.trim().length < 3 && this.value.trim().length > 0) {
                        errorSpan.textContent = 'Last name must be at least 3 characters';
                        errorSpan.style.display = 'block';
                    } else if (this.value.length > 30) {
                        errorSpan.textContent = 'Last name cannot exceed 30 characters';
                        errorSpan.style.display = 'block';
                    } else {
                        errorSpan.textContent = '';
                        errorSpan.style.display = 'none';
                    }
                }
                updateNavigationButtons(currentStep);
                saveToLocalStorage();
            });
        }

        if (email) {
            email.addEventListener('keypress', restrictToEmail);
            email.addEventListener('paste', function(e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                const cleaned = text.replace(/[^a-z0-9@.\-_]/g, '').toLowerCase();
                document.execCommand('insertText', false, cleaned);
            });
            
            email.addEventListener('input', function() {
                this.value = this.value.replace(/[^a-z0-9@.\-_]/g, '').toLowerCase();
                formData.email = this.value.trim();
                validateEmail(this);
                updateNavigationButtons(currentStep);
                saveToLocalStorage();
            });
        }

        if (phoneNumber) {
            phoneNumber.addEventListener('keypress', restrictToNumbers);
            phoneNumber.addEventListener('paste', function(e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                const cleaned = text.replace(/[^0-9]/g, '');
                document.execCommand('insertText', false, cleaned);
            });
            
            phoneNumber.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
                formData.phoneNumber = this.value.trim();
                updateHiddenPhoneField();
                const errorSpan = this.parentElement.nextElementSibling;
                if (errorSpan && errorSpan.classList.contains('text-danger')) {
                    if (this.value.trim().length < 7 && this.value.trim().length > 0) {
                        errorSpan.textContent = 'Please enter a valid phone number';
                        errorSpan.style.display = 'block';
                    } else {
                        errorSpan.textContent = '';
                        errorSpan.style.display = 'none';
                    }
                }
                updateNavigationButtons(currentStep);
                saveToLocalStorage();
            });
        }
        
        if (password) {
            password.addEventListener('input', function() {
                formData.password = this.value;
                updateNavigationButtons(currentStep);
                saveToLocalStorage();
            });
        }

        if (confirmPassword) {
            confirmPassword.addEventListener('input', function() {
                formData.confirmPassword = this.value;
                if (this.value !== password.value && this.value.length > 0) {
                    const errorSpan = this.nextElementSibling;
                    if (errorSpan && errorSpan.classList.contains('text-danger')) {
                        errorSpan.textContent = 'Passwords do not match';
                        errorSpan.style.display = 'block';
                    }
                } else {
                    const errorSpan = this.nextElementSibling;
                    if (errorSpan && errorSpan.classList.contains('text-danger')) {
                        errorSpan.textContent = '';
                        errorSpan.style.display = 'none';
                    }
                }
                updateNavigationButtons(currentStep);
                saveToLocalStorage();
            });
        }
    }

    function validateEmail(input) {
        const value = input.value.trim();
        const errorSpan = input.nextElementSibling;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (value.length > 0 && !emailRegex.test(value)) {
            showError(input, errorSpan, 'Please enter a valid email address');
            return false;
        } else {
            showSuccess(input, errorSpan);
            return true;
        }
    }

    function showError(input, errorSpan, message) {
        if (errorSpan && errorSpan.classList.contains('text-danger')) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }

    function showSuccess(input, errorSpan) {
        if (errorSpan && errorSpan.classList.contains('text-danger')) {
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
    }

    function disableAutocomplete() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('spellcheck', 'false');
        });
    }

    function handleServerErrors() {
        const errorContainer = document.querySelector('.error-container');
        if (!errorContainer) return;

        const errors = [];
        const errorItems = errorContainer.querySelectorAll('.error-item');
        errorItems.forEach(item => {
            errors.push(item.textContent.trim());
        });

        errors.forEach(error => {
            if (error.includes('18 years old')) {
                const dateError = document.querySelector('.date-picker + .text-danger');
                if (dateError) {
                    dateError.textContent = 'You must be at least 18 years old';
                    dateError.style.display = 'block';
                }
                currentStep = 1;
            }
            else if (error.includes('Passwords do not match')) {
                const confirmError = document.querySelector('#confirmPassword + .text-danger');
                if (confirmError) {
                    confirmError.textContent = 'Passwords do not match';
                    confirmError.style.display = 'block';
                }
                currentStep = 3;
            }
            else if (error.includes('Password must contain')) {
                currentStep = 3;
            }
            else if (error.includes('Email')) {
                currentStep = 2;
            }
            else if (error.includes('First name') || error.includes('Last name')) {
                currentStep = 1;
            }
        });
    }

    function restoreFormValues() {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const phoneNumber = document.getElementById('phoneNumber');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const dateOfBirthHidden = document.getElementById('dateOfBirthHidden');
        const genderHidden = document.getElementById('genderHidden');
        const nationalityHidden = document.getElementById('nationalityHidden');

        if (firstName && firstName.value) {
            formData.firstName = firstName.value;
        }
        if (lastName && lastName.value) {
            formData.lastName = lastName.value;
        }
        if (email && email.value) {
            formData.email = email.value;
        }
        if (phoneNumber && phoneNumber.value) {
            formData.phoneNumber = phoneNumber.value;
        }
        if (password && password.value) {
            formData.password = password.value;
        }
        if (confirmPassword && confirmPassword.value) {
            formData.confirmPassword = confirmPassword.value;
        }

        if (dateOfBirthHidden && dateOfBirthHidden.value) {
            const dateParts = dateOfBirthHidden.value.split('-');
            if (dateParts.length === 3) {
                formData.selectedYear = parseInt(dateParts[0]);
                formData.selectedMonth = parseInt(dateParts[1]);
                formData.selectedDay = parseInt(dateParts[2]);
                formData.dateOfBirth = dateOfBirthHidden.value;
            }
        }

        if (genderHidden && genderHidden.value) {
            formData.selectedGender = genderHidden.value;
        }

        if (nationalityHidden && nationalityHidden.value) {
            formData.selectedNationality = nationalityHidden.value;
        }
    }
});