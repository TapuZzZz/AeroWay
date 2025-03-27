// AeroWay Enhanced Site JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Search tabs functionality
    initSearchTabs();
    
    // Trip type radio buttons
    initTripTypeToggle();
    
    // Mobile menu toggle
    initMobileMenu();
    
    // Passenger dropdown
    initPassengerDropdown();
    
    // Date pickers validation
    initDatePickers();
    
    // Airport swap functionality
    initSwapButtons();
    
    // Destination slider
    initDestinationSlider();
    
    // Service card animations
    initServiceCardAnimations();
    
    // Smooth scroll for anchor links
    initSmoothScroll();
});

// Theme toggle functionality
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlTag = document.querySelector('body');
    const isDarkTheme = localStorage.getItem('theme') === 'dark' || 
                        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Set initial theme
    if (isDarkTheme) {
        htmlTag.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        htmlTag.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = htmlTag.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            htmlTag.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            htmlTag.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

// Search tabs functionality
function initSearchTabs() {
    const tabs = document.querySelectorAll('.search-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Trip type radio buttons functionality
function initTripTypeToggle() {
    const tripRadios = document.querySelectorAll('input[name="trip-type"]');
    const returnDateGroup = document.querySelector('.return-date');
    
    tripRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'oneway') {
                returnDateGroup.style.display = 'none';
            } else {
                returnDateGroup.style.display = 'block';
            }
        });
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            if (mobileMenu.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
                document.body.style.overflow = 'hidden';
            } else {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = '';
            }
        });
    }
}

// Passenger dropdown functionality
function initPassengerDropdown() {
    const passengersInput = document.getElementById('passengers');
    const passengersDropdown = document.querySelector('.passengers-dropdown');
    const applyBtn = document.querySelector('.apply-btn');
    const counterBtns = document.querySelectorAll('.counter-btn');
    
    let adultCount = 1;
    let childCount = 0;
    let infantCount = 0;
    
    // Toggle dropdown
    if (passengersInput) {
        passengersInput.addEventListener('click', (e) => {
            e.stopPropagation();
            passengersDropdown.style.display = passengersDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
    
    // Handle counter buttons
    counterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.classList.contains('counter-plus') ? 'increase' : 'decrease';
            const type = btn.getAttribute('data-type');
            
            if (type === 'adult') {
                if (action === 'increase') {
                    adultCount = Math.min(adultCount + 1, 9);
                } else {
                    adultCount = Math.max(adultCount - 1, 1);
                }
                document.getElementById('adult-count').textContent = adultCount;
            } else if (type === 'child') {
                if (action === 'increase') {
                    childCount = Math.min(childCount + 1, 9);
                } else {
                    childCount = Math.max(childCount - 1, 0);
                }
                document.getElementById('child-count').textContent = childCount;
            } else if (type === 'infant') {
                if (action === 'increase') {
                    infantCount = Math.min(infantCount + 1, adultCount);
                } else {
                    infantCount = Math.max(infantCount - 1, 0);
                }
                document.getElementById('infant-count').textContent = infantCount;
            }
            
            // Disable/enable infant plus button based on adult count
            const infantPlusBtn = document.querySelector('.counter-plus[data-type="infant"]');
            if (infantPlusBtn) {
                infantPlusBtn.disabled = infantCount >= adultCount;
            }
        });
    });
    
    // Apply passenger selection
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            let passengerText = `${adultCount} Adult${adultCount > 1 ? 's' : ''}`;
            
            if (childCount > 0) {
                passengerText += `, ${childCount} Child${childCount > 1 ? 'ren' : ''}`;
            }
            
            if (infantCount > 0) {
                passengerText += `, ${infantCount} Infant${infantCount > 1 ? 's' : ''}`;
            }
            
            passengersInput.value = passengerText;
            passengersDropdown.style.display = 'none';
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (passengersDropdown && !e.target.closest('.dropdown-parent')) {
            passengersDropdown.style.display = 'none';
        }
    });
}

// Date pickers functionality
function initDatePickers() {
    const departDate = document.getElementById('depart');
    const returnDate = document.getElementById('return');
    
    if (departDate && returnDate) {
        // Set min date to today
        const today = new Date();
        const todayFormatted = today.toISOString().split('T')[0];
        departDate.min = todayFormatted;
        returnDate.min = todayFormatted;
        
        // Set default values
        departDate.valueAsDate = today;
        
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        returnDate.valueAsDate = nextWeek;
        
        // Ensure return date is after depart date
        departDate.addEventListener('change', () => {
            if (departDate.value > returnDate.value) {
                // Set return date to depart date if it's before depart date
                returnDate.value = departDate.value;
            }
            returnDate.min = departDate.value;
        });
    }
}

// Airport swap functionality
function initSwapButtons() {
    const swapBtn = document.querySelector('.swap-btn');
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    
    if (swapBtn && fromInput && toInput) {
        swapBtn.addEventListener('click', () => {
            const fromValue = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = fromValue;
        });
    }
}

// Destination slider functionality
function initDestinationSlider() {
    const slider = document.querySelector('.destinations-wrapper');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    
    if (!slider || !dots.length || !prevBtn || !nextBtn) return;
    
    let currentSlide = 0;
    const slideCount = dots.length;
    
    function goToSlide(index) {
        currentSlide = index;
        
        // Calculate slide position based on viewport
        let slideWidth = 33.33; // Default for desktop (3 cards)
        
        if (window.innerWidth < 768) {
            slideWidth = 100; // Mobile: 1 card at a time
        } else if (window.innerWidth < 1200) {
            slideWidth = 50; // Tablet: 2 cards at a time
        }
        
        slider.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Arrow navigation
    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        goToSlide(currentSlide);
    });
    
    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slideCount;
        goToSlide(currentSlide);
    });
    
    // Auto slide
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        goToSlide(currentSlide);
    }, 5000);
    
    // Initial slide
    goToSlide(0);
    
    // Responsive adjustments
    window.addEventListener('resize', () => {
        goToSlide(currentSlide);
    });
}

// Service card animations
function initServiceCardAnimations() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    // Added entry animations with intersection observer
    if (serviceCards.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered animation delay
                    setTimeout(() => {
                        entry.target.style.opacity = 1;
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // Set initial state and observe
        serviceCards.forEach(card => {
            card.style.opacity = 0;
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            observer.observe(card);
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}