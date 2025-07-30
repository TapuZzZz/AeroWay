document.addEventListener('DOMContentLoaded', function() {
    initializePasswordToggle();
    initializeFormSubmission();
    initializeSocialLogin();
    removeValidationErrors();
    checkLoginStatus();
    initializeAnimatedElements();
    
    function initializePasswordToggle() {
        const passwordToggle = document.querySelector('.password-toggle');
        const passwordField = document.querySelector('input[type="password"]');
        
        if (passwordToggle && passwordField) {
            passwordToggle.addEventListener('click', function() {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                
                const icon = passwordToggle.querySelector('i');
                if (icon) {
                    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
            });
        }
    }
    
    function initializeFormSubmission() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                removeValidationErrors();
                
                const email = document.getElementById('email');
                const password = document.getElementById('password');
                
                let isValid = true;
                
                if (email && !email.value.trim()) {
                    isValid = false;
                    showCustomError("Please enter your login credentials");
                    e.preventDefault();
                    return false;
                }
                
                if (password && !password.value.trim()) {
                    isValid = false;
                    showCustomError("Please enter your login credentials");
                    e.preventDefault();
                    return false;
                }
                
                if (!isValid) {
                    e.preventDefault();
                    return false;
                }
                
                const loginButton = document.querySelector('.btn-login');
                if (loginButton) {
                    const originalContent = loginButton.innerHTML;
                    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
                    loginButton.disabled = true;
                    
                    setTimeout(function() {
                        loginButton.innerHTML = originalContent;
                        loginButton.disabled = false;
                    }, 8000);
                }
                
                sessionStorage.setItem('loginAttempted', 'true');
                
                setTimeout(removeValidationErrors, 10);
            });
        }
    }
    
    function initializeSocialLogin() {
        const socialButtons = document.querySelectorAll('.btn-social');
        
        socialButtons.forEach(button => {
            button.addEventListener('click', function() {
                removeValidationErrors();
                
                const originalContent = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
                this.disabled = true;
                
                const provider = this.classList.contains('btn-google') ? 'google' : 'facebook';
                const redirectUrl = `/account/${provider}-login`;
                
                sessionStorage.setItem('loginAttempted', 'true');
                
                window.location.href = redirectUrl;
                
                setTimeout(function() {
                    button.innerHTML = originalContent;
                    button.disabled = false;
                }, 5000);
            });
        });
    }
    
    function removeValidationErrors() {
        const errorElements = document.querySelectorAll('.text-danger, .validation-summary-errors, .field-validation-error, .alert, .alert-danger');
        errorElements.forEach(function(element) {
            element.style.display = 'none';
        });
        
        const inputsWithError = document.querySelectorAll('input.input-validation-error');
        inputsWithError.forEach(function(input) {
            input.classList.remove('input-validation-error');
        });
    }
    
    function initializeAnimatedElements() {
        const shapes = document.querySelectorAll('.floating-shape');
        if (shapes.length > 0) {
            shapes.forEach(shape => {
                const randomDelay = Math.random() * 5;
                shape.style.animationDelay = `${randomDelay}s`;
            });
        }
    }
    
    function checkLoginStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const loginAttempted = sessionStorage.getItem('loginAttempted') === 'true';
        const hasError = urlParams.has('error') || urlParams.has('authFailed') || 
                         document.querySelector('.validation-summary-errors') !== null;
        
        if (loginAttempted && hasError) {
            showCustomError("Invalid username or password. Please try again.");
            sessionStorage.removeItem('loginAttempted');
        }
    }
    
    function showCustomError(message) {
        let errorDiv = document.querySelector('.custom-error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'custom-error-message';
            
            const form = document.getElementById('loginForm');
            if (form) {
                form.insertBefore(errorDiv, form.firstChild);
            }
        }
        
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        
        setTimeout(() => {
            errorDiv.classList.remove('shake-animation');
            void errorDiv.offsetWidth;
            errorDiv.classList.add('shake-animation');
        }, 100);
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm && loginForm.getAttribute('data-login-failed') === 'true') {
        showCustomError("Invalid username or password. Please try again.");
    }
});