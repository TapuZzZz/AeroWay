// Main JavaScript file that initializes all modules
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page components
    initPage();
});

// Initialize the entire page
function initPage() {
    // Initialize all home page functionality
    if (typeof initTabs === 'function') {
        initTabs();
    }
    
    if (typeof initLocationInputs === 'function') {
        initLocationInputs();
    }
    
    if (typeof initCustomCalendars === 'function') {
        initCustomCalendars();
    }
    
    if (typeof initTravelers === 'function') {
        initTravelers();
    }
    
    if (typeof initSwapButton === 'function') {
        initSwapButton();
    }
    
    if (typeof initFormSubmission === 'function') {
        initFormSubmission();
    }
    
    if (typeof initAnimatedElements === 'function') {
        initAnimatedElements();
    }
    
    if (typeof initTripType === 'function') {
        try {
            initTripType();
        } catch (error) {
            console.error('Main trip type init failed:', error);
            if (typeof initTripTypeAlternative === 'function') {
                initTripTypeAlternative();
            }
        }
    }
    
    // Destinations section
    if (typeof initDestinationsCarousel === 'function') {
        initDestinationsCarousel();
    }
    
    // Fleet section
    if (typeof initFleetGrid === 'function') {
        initFleetGrid();
    }
    
    // Common components
    initSectionObserver();
    initNavigation();
}

// Common functionality for sections
function initSectionObserver() {
    const sections = document.querySelectorAll('.search-section, .destinations-section, .fleet-section, .about-section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    const cards = [
        ...document.querySelectorAll('.destination-card'),
        ...document.querySelectorAll('.fleet-item'),
        ...document.querySelectorAll('.about-feature')
    ];
    
    cards.forEach((card, index) => {
        card.style.setProperty('--card-index', index % 4);
    });
}

// Navigation functionality
function initNavigation() {
    // Active section indicator for navbar
    const navLinks = document.querySelectorAll('.nav-link');
    
    function setActiveLink() {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', setActiveLink);
    window.addEventListener('load', setActiveLink);
    
    // Smooth scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('data-section');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70, // Adjust for navbar height
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Theme toggle animation
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.add('theme-transitioning');
            setTimeout(() => {
                document.body.classList.remove('theme-transitioning');
            }, 500);
        });
    }
    
    // Logo animation
    const logoAccent = document.querySelector('.logo .accent');
    if (logoAccent) {
        setInterval(() => {
            logoAccent.classList.add('animate');
            setTimeout(() => {
                logoAccent.classList.remove('animate');
            }, 3000);
        }, 15000);
    }
}