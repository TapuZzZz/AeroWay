document.addEventListener('DOMContentLoaded', function() {
    // Animate the container on load
    const container = document.querySelector('.account-deleted-container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.5s ease-out';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Add hover interaction to the icon
    const deleteIcon = document.querySelector('.delete-icon');
    if (deleteIcon) {
        deleteIcon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        deleteIcon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Add smooth hover effects to buttons
    const buttons = document.querySelectorAll('.btn-home, .btn-register');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
    
    // Add click animation to buttons
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Email link interaction
    const emailLink = document.querySelector('.feedback-email');
    if (emailLink) {
        emailLink.addEventListener('click', function(e) {
            // Add a subtle flash effect when email is clicked
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 150);
        });
    }
    
    // Add accessibility focus indicators
    const focusableElements = document.querySelectorAll('a, button');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--accent)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // Console log for debugging (optional)
    console.log('Account Deleted page loaded successfully');
});