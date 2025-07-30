// Enhanced Fleet grid initialization with better images and hover effects
function initFleetGrid() {
    const fleetData = [
        {
            name: "Gulfstream G700",
            category: "Ultra Long Range",
            // Using local image paths
            image: "/images/fleet/gulfstream-g700.jpg",
            range: "7,500 NM",
            passengers: "19",
            speed: "710 mph",
            altitude: "51,000 ft",
            description: "The flagship of the Gulfstream fleet, offering unparalleled luxury and performance."
        },
        {
            name: "Bombardier Global 7500",
            category: "Ultra Long Range",
            image: "/images/fleet/bombardier-global-7500.jpg",
            range: "7,700 NM",
            passengers: "17",
            speed: "716 mph",
            altitude: "51,000 ft",
            description: "The industry's longest-range business jet with four distinct living spaces."
        },
        {
            name: "Dassault Falcon 8X",
            category: "Ultra Long Range",
            image: "/images/fleet/dassault-falcon-8x.jpg",
            range: "6,450 NM",
            passengers: "16",
            speed: "685 mph",
            altitude: "51,000 ft",
            description: "Exceptional versatility with the ability to access short airfields and steep approaches."
        },
        {
            name: "Embraer Praetor 600",
            category: "Super Mid-Size",
            image: "/images/fleet/embraer-praetor-600.jpg",
            range: "4,018 NM",
            passengers: "12",
            speed: "590 mph",
            altitude: "45,000 ft",
            description: "The most technologically advanced super-midsize business jet in its class."
        },
        {
            name: "Cessna Citation Longitude",
            category: "Super Mid-Size",
            image: "/images/fleet/cessna-citation-longitude.jpg",
            range: "3,500 NM",
            passengers: "12",
            speed: "548 mph",
            altitude: "45,000 ft",
            description: "Offering the lowest cabin altitude in its class for greater passenger comfort."
        },
        {
            name: "Pilatus PC-24",
            category: "Light Jet",
            image: "/images/fleet/pilatus-pc-24.jpg",
            range: "2,000 NM",
            passengers: "10",
            speed: "440 mph",
            altitude: "45,000 ft",
            description: "The world's first Super Versatile Jet, designed to land on unpaved runways."
        }
    ];
    
    const fleetGrid = document.getElementById('fleetGrid');
    if (!fleetGrid) return;
    
    // Clear existing content
    fleetGrid.innerHTML = '';
    
    // Create fleet items with enhanced hover effects
    fleetData.forEach((aircraft, index) => {
        const fleetItem = document.createElement('div');
        fleetItem.className = 'fleet-item';
        fleetItem.style.setProperty('--animation-delay', `${index * 0.1}s`);
        
        fleetItem.innerHTML = `
            <div class="fleet-image">
                <img src="${aircraft.image}" alt="${aircraft.name}" loading="lazy">
            </div>
            <div class="fleet-content">
                <span class="fleet-category">${aircraft.category}</span>
                <h3 class="fleet-title">${aircraft.name}</h3>
                <div class="fleet-specs">
                    <div class="fleet-spec">
                        <span class="spec-label">Range</span>
                        <span class="spec-value"><i class="fas fa-route"></i> ${aircraft.range}</span>
                    </div>
                    <div class="fleet-spec">
                        <span class="spec-label">Passengers</span>
                        <span class="spec-value"><i class="fas fa-user-friends"></i> ${aircraft.passengers}</span>
                    </div>
                    <div class="fleet-spec">
                        <span class="spec-label">Speed</span>
                        <span class="spec-value"><i class="fas fa-tachometer-alt"></i> ${aircraft.speed}</span>
                    </div>
                    <div class="fleet-spec">
                        <span class="spec-label">Altitude</span>
                        <span class="spec-value"><i class="fas fa-plane-departure"></i> ${aircraft.altitude}</span>
                    </div>
                </div>
                <!-- Description and button removed as requested -->
            </div>
        `;
        
        // Add loading indicator for images
        const img = fleetItem.querySelector('.fleet-image img');
        if (img) {
            // Set loading state
            img.parentElement.classList.add('loading');
            
            // Remove loading state when image loads
            img.onload = function() {
                img.parentElement.classList.remove('loading');
            };
            
            // If image fails to load, try a fallback
            img.onerror = function() {
                console.log("Image failed to load, trying fallback for: " + aircraft.name);
                // Fallback to generic image
                img.src = "/images/fleet/default-jet.jpg";
                img.parentElement.classList.remove('loading');
            };
        }
        
        // Add enhanced hover effects with staggered transitions
        const transitionDelays = [0, 0.05, 0.1, 0.15]; // Staggered delays for specs
        
        fleetItem.addEventListener('mouseenter', function() {
            // Preload the image to avoid flickering on first hover
            const img = this.querySelector('.fleet-image img');
            if (img) {
                const preloadImg = new Image();
                preloadImg.src = img.src;
            }
            
            // Apply staggered animation to specs
            const specs = this.querySelectorAll('.fleet-spec');
            specs.forEach((spec, index) => {
                spec.style.transitionDelay = `${transitionDelays[index % 4]}s`;
            });
        });
        
        fleetItem.addEventListener('mouseleave', function() {
            // Reset transition delays
            const specs = this.querySelectorAll('.fleet-spec');
            specs.forEach((spec) => {
                spec.style.transitionDelay = '0s';
            });
        });
        
        fleetGrid.appendChild(fleetItem);
    });
    
    // Add staggered appearance animation after all items are created
    setTimeout(() => {
        const fleetItems = document.querySelectorAll('.fleet-item');
        fleetItems.forEach((item, idx) => {
            item.style.opacity = 0;
            item.style.transform = 'translateY(30px)';
            
            // Set delay based on position in grid
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = 1;
                item.style.transform = 'translateY(0)';
            }, 100 + (idx * 150));
        });
    }, 100);
}