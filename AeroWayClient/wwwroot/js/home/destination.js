// Destinations carousel - Using Swiper.js for perfect slide experience
function initDestinationsCarousel() {
    const airports = [
        { 
            code: 'TLV', 
            name: 'Ben Gurion Airport', 
            city: 'Tel Aviv', 
            country: 'Israel',
            image: 'https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800'
        },
        { 
            code: 'JFK', 
            name: 'John F. Kennedy International', 
            city: 'New York', 
            country: 'USA',
            image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800'
        },
        { 
            code: 'LHR', 
            name: 'Heathrow Airport', 
            city: 'London', 
            country: 'UK',
            image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'
        },
        { 
            code: 'CDG', 
            name: 'Charles de Gaulle Airport', 
            city: 'Paris', 
            country: 'France',
            image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'
        },
        { 
            code: 'FCO', 
            name: 'Leonardo da Vinci Airport', 
            city: 'Rome', 
            country: 'Italy',
            image: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800'
        },
        { 
            code: 'DXB', 
            name: 'Dubai International Airport', 
            city: 'Dubai', 
            country: 'UAE',
            image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800'
        },
        { 
            code: 'LAX', 
            name: 'Los Angeles International', 
            city: 'Los Angeles', 
            country: 'USA',
            // Fixed LA image URL to ensure it loads properly
            image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800'
        },
        { 
            code: 'SIN', 
            name: 'Changi Airport', 
            city: 'Singapore', 
            country: 'Singapore',
            image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'
        },
        { 
            code: 'HND', 
            name: 'Haneda Airport', 
            city: 'Tokyo', 
            country: 'Japan',
            image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800'
        },
        { 
            code: 'SYD', 
            name: 'Sydney Airport', 
            city: 'Sydney', 
            country: 'Australia',
            image: 'https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=800'
        }
    ];
    
    // Function to check if Swiper is already loaded, otherwise load it
    function loadSwiperIfNeeded(callback) {
        if (window.Swiper) {
            callback();
            return;
        }
        
        // Load Swiper CSS
        const swiperCSS = document.createElement('link');
        swiperCSS.rel = 'stylesheet';
        swiperCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/9.4.1/swiper-bundle.min.css';
        document.head.appendChild(swiperCSS);
        
        // Load Swiper JS
        const swiperScript = document.createElement('script');
        swiperScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/9.4.1/swiper-bundle.min.js';
        swiperScript.onload = callback;
        document.body.appendChild(swiperScript);
    }
    
    // Preload images for smoother transitions
    function preloadImages() {
        airports.forEach(airport => {
            const img = new Image();
            img.src = airport.image;
        });
    }
    
    // Initialize the carousel with Swiper
    function initializeSwiper() {
        const carouselContainer = document.querySelector('.carousel-container');
        if (!carouselContainer) return;
        
        // Create Swiper HTML structure
        carouselContainer.innerHTML = `
            <div class="swiper-container destinations-swiper">
                <div class="swiper-wrapper" id="destinationsTrack">
                    ${airports.map(airport => `
                        <div class="swiper-slide carousel-slide">
                            <div class="destination-card">
                                <div class="destination-image loading">
                                    <img src="${airport.image}" alt="${airport.city}" loading="eager">
                                </div>
                                <div class="destination-content">
                                    <h3 class="destination-name">${airport.city}</h3>
                                    <div class="destination-location">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <span>${airport.name}, ${airport.country}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add loading effect and remove when images load
        document.querySelectorAll('.destination-image img').forEach(img => {
            if (img.complete) {
                img.parentElement.classList.remove('loading');
            } else {
                img.onload = () => img.parentElement.classList.remove('loading');
            }
        });
        
        // Initialize Swiper
        const swiper = new Swiper('.destinations-swiper', {
            slidesPerView: 3,
            spaceBetween: 30,
            centeredSlides: true,
            loop: true,
            speed: 800,
            effect: 'coverflow',  // Cool 3D effect
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false,
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            navigation: {
                nextEl: '#nextDestination',
                prevEl: '#prevDestination',
            },
            on: {
                slideChange: function() {
                    // Update active class for current slide
                    document.querySelectorAll('.carousel-slide').forEach(slide => {
                        slide.classList.remove('active');
                    });
                    const activeSlide = document.querySelector('.swiper-slide-active');
                    if (activeSlide) {
                        activeSlide.classList.add('active');
                    }
                },
                init: function() {
                    // Set initial active class
                    const activeSlide = document.querySelector('.swiper-slide-active');
                    if (activeSlide) {
                        activeSlide.classList.add('active');
                    }
                }
            },
            breakpoints: {
                // When screen width is less than 768px
                768: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                // When screen width is between 769px and 1200px
                1200: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                }
            }
        });
        
        // Add hover animation to all cards
        document.querySelectorAll('.destination-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                // Advanced hover animation for the card itself
                this.style.transform = 'translateY(-15px) scale(1.05)';
                this.style.boxShadow = '0 20px 40px var(--shadow-color)';
                this.style.borderColor = 'var(--accent)';
                this.style.borderWidth = '2px';
                
                // Zoom in the image too
                const img = this.querySelector('.destination-image img');
                if (img) {
                    img.style.transform = 'scale(1.15)';
                }
                
                // Add a subtle glow effect
                this.style.filter = 'drop-shadow(0 0 10px rgba(46, 92, 215, 0.3))';
                
                // Enhance text elements dynamically - NO MOVEMENT, just color changes
                const locationText = this.querySelector('.destination-location span');
                if (locationText) {
                    // Create a highlight effect for the country name
                    const text = locationText.textContent;
                    const parts = text.split(',');
                    if (parts.length > 1) {
                        locationText.innerHTML = `${parts[0]}, <span style="color: var(--accent); font-weight: 700;">${parts[1].trim()}</span>`;
                    }
                }
                
                // Add background highlight to the content section
                const contentSection = this.querySelector('.destination-content');
                if (contentSection) {
                    contentSection.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(46, 92, 215, 0.05) 100%)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                if (!this.closest('.carousel-slide').classList.contains('active')) {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                    this.style.borderColor = '';
                    this.style.borderWidth = '';
                    this.style.filter = '';
                    
                    // Reset image zoom
                    const img = this.querySelector('.destination-image img');
                    if (img) {
                        img.style.transform = '';
                    }
                    
                    // Reset enhanced text
                    const locationText = this.querySelector('.destination-location span');
                    if (locationText) {
                        const text = locationText.textContent;
                        locationText.innerHTML = text; // Reset to plain text
                    }
                    
                    // Reset content background
                    const contentSection = this.querySelector('.destination-content');
                    if (contentSection) {
                        contentSection.style.background = '';
                    }
                }
            });
        });
        
        // Add custom active state to slides with enhanced styling
        const setActiveSlide = () => {
            document.querySelectorAll('.carousel-slide').forEach(slide => {
                if (slide.classList.contains('swiper-slide-active')) {
                    slide.classList.add('active');
                    // Add special styling to active card
                    const card = slide.querySelector('.destination-card');
                    if (card) {
                        card.style.borderColor = 'var(--accent)';
                        card.style.borderWidth = '2px';
                        card.style.transform = 'scale(1.05)';
                        card.style.boxShadow = '0 15px 30px var(--shadow-color)';
                    }
                } else {
                    slide.classList.remove('active');
                    // Remove special styling from inactive cards
                    const card = slide.querySelector('.destination-card');
                    if (card) {
                        card.style.borderColor = '';
                        card.style.borderWidth = '';
                        card.style.transform = '';
                        card.style.boxShadow = '';
                    }
                }
            });
        };
        
        // Initial set
        setActiveSlide();
        
        // Set on each transition
        swiper.on('slideChangeTransitionEnd', setActiveSlide);
    }
    
    // Start the carousel initialization
    function init() {
        preloadImages();
        loadSwiperIfNeeded(() => {
            initializeSwiper();
        });
    }
    
    // Custom implementation if Swiper fails to load
    function fallbackImplementation() {
        // Our custom carousel implementation will go here if needed
        console.log("Using fallback carousel implementation");
        
        const track = document.getElementById('destinationsTrack');
        const prevBtn = document.getElementById('prevDestination');
        const nextBtn = document.getElementById('nextDestination');
        const carouselContainer = document.querySelector('.carousel-container');
        
        if (!track || !prevBtn || !nextBtn) return;
        
        // Clear existing content
        track.innerHTML = '';
        
        // Create slides
        airports.forEach((airport, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.setAttribute('data-index', index);
            
            slide.innerHTML = `
                <div class="destination-card">
                    <div class="destination-image loading">
                        <img src="${airport.image}" alt="${airport.city}" loading="eager">
                    </div>
                    <div class="destination-content">
                        <h3 class="destination-name">${airport.city}</h3>
                        <div class="destination-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${airport.name}, ${airport.country}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove loading class when image is loaded
            const img = slide.querySelector('img');
            if (img.complete) {
                slide.querySelector('.destination-image').classList.remove('loading');
            } else {
                img.onload = () => {
                    slide.querySelector('.destination-image').classList.remove('loading');
                };
            }
            
            track.appendChild(slide);
        });
        
        // Clone the first 2 and last 2 slides for infinite effect
        const firstSlide = track.querySelector('.carousel-slide:first-child').cloneNode(true);
        const secondSlide = track.querySelector('.carousel-slide:nth-child(2)').cloneNode(true);
        const lastSlide = track.querySelector('.carousel-slide:last-child').cloneNode(true);
        const secondLastSlide = track.querySelector('.carousel-slide:nth-last-child(2)').cloneNode(true);
        
        track.appendChild(firstSlide);
        track.appendChild(secondSlide);
        track.insertBefore(lastSlide, track.firstChild);
        track.insertBefore(secondLastSlide, track.firstChild);
        
        // Initialize variables
        let currentIndex = 2; // Start at index 2 (after the 2 clones)
        let isAnimating = false;
        let autoplayInterval;
        
        // Show exactly 3 slides
        function updateVisibleSlides() {
            const slides = track.querySelectorAll('.carousel-slide');
            const slideWidth = carouselContainer.offsetWidth / 3;
            
            // Hide all slides
            slides.forEach(slide => {
                slide.style.display = 'none';
                slide.classList.remove('active');
            });
            
            // Calculate which 3 slides to show
            const visibleIndices = [
                (currentIndex - 1 + slides.length) % slides.length,
                currentIndex % slides.length,
                (currentIndex + 1) % slides.length
            ];
            
            // Show and position only these 3 slides
            visibleIndices.forEach((slideIndex, positionIndex) => {
                const slide = slides[slideIndex];
                slide.style.display = 'block';
                slide.style.width = `${slideWidth}px`;
                slide.style.transform = `translateX(${(positionIndex - 1) * slideWidth}px)`;
                
                // Center slide is active
                if (positionIndex === 1) {
                    slide.classList.add('active');
                }
            });
        }
        
        // Initialize slide positions
        updateVisibleSlides();
        
        // Navigation functions
        function goToNext() {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = (currentIndex + 1) % track.querySelectorAll('.carousel-slide').length;
            
            track.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            updateVisibleSlides();
            
            setTimeout(() => {
                track.style.transition = 'none';
                
                // If we reached a clone, jump to the original
                if (currentIndex <= 1) {
                    currentIndex = airports.length + currentIndex;
                    updateVisibleSlides();
                } else if (currentIndex >= airports.length + 2) {
                    currentIndex = currentIndex - airports.length;
                    updateVisibleSlides();
                }
                
                isAnimating = false;
            }, 800);
        }
        
        function goToPrev() {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = (currentIndex - 1 + track.querySelectorAll('.carousel-slide').length) % track.querySelectorAll('.carousel-slide').length;
            
            track.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            updateVisibleSlides();
            
            setTimeout(() => {
                track.style.transition = 'none';
                
                // If we reached a clone, jump to the original
                if (currentIndex <= 1) {
                    currentIndex = airports.length + currentIndex;
                    updateVisibleSlides();
                } else if (currentIndex >= airports.length + 2) {
                    currentIndex = currentIndex - airports.length;
                    updateVisibleSlides();
                }
                
                isAnimating = false;
            }, 800);
        }
        
        // Autoplay
        function startAutoplay() {
            clearInterval(autoplayInterval);
            autoplayInterval = setInterval(goToNext, 5000);
        }
        
        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }
        
        // Event listeners
        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            goToPrev();
            startAutoplay();
        });
        
        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            goToNext();
            startAutoplay();
        });
        
        // Pause on hover
        carouselContainer.addEventListener('mouseenter', stopAutoplay);
        carouselContainer.addEventListener('mouseleave', startAutoplay);
        
        // Touch support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoplay();
        }, { passive: true });
        
        track.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToNext();
                } else {
                    goToPrev();
                }
            }
            
            startAutoplay();
        }, { passive: true });
        
        // Add hover effects
        document.querySelectorAll('.destination-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
                this.style.boxShadow = '0 15px 40px var(--shadow-color)';
                this.style.borderColor = 'var(--accent)';
            });
            
            card.addEventListener('mouseleave', function() {
                if (!this.closest('.carousel-slide').classList.contains('active')) {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                    this.style.borderColor = '';
                }
            });
        });
        
        // Start autoplay
        startAutoplay();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            updateVisibleSlides();
        });
    }
    
    // Try to use Swiper, fallback to custom implementation if loading fails
    try {
        init();
    } catch (error) {
        console.error("Error initializing Swiper carousel, using fallback", error);
        fallbackImplementation();
    }
}