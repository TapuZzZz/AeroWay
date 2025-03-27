document.addEventListener('DOMContentLoaded', function() {
    // Map opening event
    const routePlanningCard = document.querySelector('.action-card.route-planning');
    if (routePlanningCard) {
        routePlanningCard.addEventListener('click', function() {
            setTimeout(initializeRouteMap, 700);
        });
    }
    
    // Close button event to ensure proper cleanup
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('popup-close') && e.target.closest('#routePlanningPopup')) {
            // Clean up SVG elements when closing
            const mapContainer = document.querySelector('#routePlanningPopup .map-container');
            if (mapContainer) {
                const existingSvg = mapContainer.querySelector('.stylish-routes-svg');
                if (existingSvg) {
                    existingSvg.remove();
                }
                
                // Remove flight info popup
                const infoPopup = document.querySelector('.flight-info-popup');
                if (infoPopup) {
                    infoPopup.remove();
                }
                
                // Remove status filter legend
                const legend = document.querySelector('.status-filter-legend');
                if (legend) {
                legend.classList.add('exiting');
                setTimeout(() => {
                    legend.style.display = 'none';
                }, 400); // Match this to animation duration
                }
            }
        }
    });
    
    // Add custom popup styles function
    function addCustomPopupStyles() {
        // Remove existing style if it exists
        const existingStyle = document.getElementById('flight-info-popup-styles');
        if (existingStyle) existingStyle.remove();
        
        // Create style element
        const styleElement = document.createElement('style');
        styleElement.id = 'flight-info-popup-styles';
        styleElement.textContent = `
            .flight-info-popup {
                position: fixed !important;
                background: linear-gradient(
                    145deg, 
                    rgba(37, 99, 235, 0.1) 0%, 
                    rgba(99, 102, 241, 0.15) 100%
                );
                border-radius: 16px;
                padding: 20px 24px;
                color: white;
                font-size: 14px;
                max-width: 320px;
                min-width: 250px;
                pointer-events: none;
                opacity: 0;
                transform: translateY(15px) scale(0.92);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.25),
                    0 0 0 1px rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(99, 102, 241, 0.15);
                backdrop-filter: blur(12px) saturate(180%);
                z-index: 10000 !important;
                overflow: hidden;
                outline: none;
                will-change: transform, opacity;
            }
            
            .flight-info-popup::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(
                    90deg, 
                    rgba(99, 102, 241, 0.7) 0%, 
                    rgba(168, 85, 247, 0.7) 100%
                );
            }
            
            .flight-info-popup.visible {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            
            .flight-info-title {
                font-weight: 700;
                font-size: 20px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: white;
                position: relative;
                padding-left: 36px;
                letter-spacing: -0.5px;
            }
            
            .flight-info-title::before {
                content: "";
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 28px;
                height: 28px;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='url(%23gradientFill)'%3E%3Cdefs%3E%3ClinearGradient id='gradientFill' x1='0%' y1='0%' x2='100%' y2='100%'%3E%3Cstop offset='0%' stop-color='%236366f1'/%3E%3Cstop offset='100%' stop-color='%23a855f7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M21.5 14.9V12c0-.3-.2-.5-.5-.5h-5.7l.1-.8 5.7-3.4c.3-.2.4-.6.2-.9l-1.4-2.2c-.1-.3-.5-.4-.8-.3l-5.7 3.4-.6-.5V1.5c0-.3-.2-.5-.5-.5h-2.8c-.3 0-.5.2-.5.5v5.3l-.6.5L2.7 4c-.3-.2-.7-.1-.8.3L.4 6.5c-.2.3-.1.7.2.9l5.7 3.4.1.8H.5c-.3 0-.5.2-.5.5v2.8c0 .3.2.5.5.5h5.7l-.1.8-5.7 3.4c-.3.2-.4.6-.2.9l1.4 2.2c.1.3.5.4.8.3l5.7-3.4.6.5v5.3c0 .3.2.5.5.5h2.8c.3 0 .5-.2.5-.5v-5.3l.6-.5 5.7 3.4c.3.2.7.1.8-.3l1.4-2.2c.2-.3.1-.7-.2-.9l-5.7-3.4-.1-.8h5.7c.3 0 .5-.2.5-.5'/%3E%3C/svg%3E");
                background-size: contain;
                background-repeat: no-repeat;
                filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
            }
            
            .flight-info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
                line-height: 1.4;
                opacity: 0.9;
                transition: opacity 0.2s ease;
            }
            
            .flight-info-row:hover {
                opacity: 1;
            }
            
            .flight-info-label {
                font-weight: 500;
                color: rgba(148, 163, 184, 0.8);
                min-width: 95px;
                transition: color 0.2s ease;
            }
            
            .flight-info-value {
                font-weight: 600;
                color: #f1f5f9;
                text-align: right;
                position: relative;
            }
            
            .flight-info-status {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 6px;
                font-weight: 700;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: all 0.2s ease;
            }
            
            /* Modern, gradient-based status colors */
            .status-Scheduled {
                background: linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(129, 140, 248, 0.1) 100%);
                color: #818cf8;
                border: 1px solid rgba(129, 140, 248, 0.3);
            }
            
            .status-Boarding {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
                color: #f59e0b;
                border: 1px solid rgba(245, 158, 11, 0.3);
            }
            
            .status-Departed {
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
                color: #22c55e;
                border: 1px solid rgba(34, 197, 94, 0.3);
            }
            
            .status-Arrived {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
                color: #8b5cf6;
                border: 1px solid rgba(139, 92, 246, 0.3);
            }
            
            .status-Delayed {
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%);
                color: #f97316;
                border: 1px solid rgba(249, 115, 22, 0.3);
            }
            
            .status-Cancelled {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
                color: #ef4444;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }
            
            /* Light mode adjustments with more subtle changes */
            [data-theme="light"] .flight-info-popup {
                background: linear-gradient(
                    145deg, 
                    rgba(241, 245, 249, 0.8) 0%, 
                    rgba(226, 232, 240, 0.6) 100%
                );
                color: #1e293b;
                border: 1px solid rgba(99, 102, 241, 0.1);
                box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(99, 102, 241, 0.05);
            }
            
            [data-theme="light"] .flight-info-title {
                color: #1e293b;
            }
            
            [data-theme="light"] .flight-info-label {
                color: rgba(100, 116, 139, 0.7);
            }
            
            [data-theme="light"] .flight-info-value {
                color: #0f172a;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Active filters - start with all statuses except "Scheduled"
    const activeFilters = {
        "Boarding": true,
        "Departed": true,
        "Arrived": true,
        "Delayed": true,
        "Cancelled": true,
        "Scheduled": false
    };
    
    // Cache of flight data for better performance
    const flightDataCache = {};
    
    // Initialize active filters - reset to defaults each time
    function initializeActiveFilters() {
        // בכל פתיחה חדשה, הגדר את כל הסטטוסים כפעילים למעט Scheduled
        activeFilters.Boarding = true;
        activeFilters.Departed = true;
        activeFilters.Arrived = true;
        activeFilters.Delayed = true;
        activeFilters.Cancelled = true;
        activeFilters.Scheduled = false;
    }
    
    // Initialize the route map and fetch all flights
    async function initializeRouteMap() {
        console.log("Initializing route map and fetching flights");
        
        // Reset all filters to defaults on each initialize
        initializeActiveFilters();
        
        // Fetch all flights from database
        const allFlights = await fetchAllFlights();
        if (allFlights && allFlights.length > 0) {
            createDynamicRoutes(allFlights);
            // Add flight info popup functionality
            setTimeout(createFlightInfoPopup, 1000);
            // Create status filter legend
            createStatusFilterLegend(allFlights);
            
            // Enable global hover handling right away
            setTimeout(enableGlobalHoverHandling, 1500);
        } else {
            console.log("No flights found in database");
        }
    }
    
    // Fetch all flights from database or use cached data
    async function fetchAllFlights() {
        // Check if we have data from the server
        if (window.allFlightsData && Array.isArray(window.allFlightsData)) {
            console.log(`Found ${window.allFlightsData.length} flights from server`);
            return window.allFlightsData;
        }
        
        // Fall back to departed flights data if available
        if (window.departedFlightsData && Array.isArray(window.departedFlightsData)) {
            console.log(`Found ${window.departedFlightsData.length} departed flights from server`);
            return window.departedFlightsData;
        }
        
        console.log("No flights data available");
        return [];
    }
    
    // Map colors by flight status - EXACTLY DEFINED COLORS
    const statusColors = {
        'Scheduled': { color: "#818cf8", glow: "rgba(129, 140, 248, 0.6)", label: "Scheduled" },
        'Boarding': { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.6)", label: "Boarding" },
        'Departed': { color: "#22c55e", glow: "rgba(34, 197, 94, 0.6)", label: "Departed" }, // Changed "In Flight" to "Departed"
        'Arrived': { color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.6)", label: "Arrived" },
        'Delayed': { color: "#f97316", glow: "rgba(249, 115, 22, 0.6)", label: "Delayed" },
        'Cancelled': { color: "#ef4444", glow: "rgba(239, 68, 68, 0.6)", label: "Cancelled" }
    };
    
    // Create status filter legend
    function createStatusFilterLegend(flights) {
        // Remove existing legend if any
        const existingLegend = document.querySelector('.status-filter-legend');
        if (existingLegend) {
            existingLegend.remove();
        }
        
        // Create legend container
        const legend = document.createElement('div');
        legend.className = 'status-filter-legend';
        
        // Create legend title
        const legendTitle = document.createElement('div');
        legendTitle.className = 'legend-title';
        legendTitle.textContent = 'Filter by Status:';
        legend.appendChild(legendTitle);
        
        // Count flights by status
        const statusCounts = {};
        flights.forEach(flight => {
            if (flight.Status) {
                statusCounts[flight.Status] = (statusCounts[flight.Status] || 0) + 1;
            }
        });
        
        // Add legend items for each status
        Object.keys(statusColors).forEach(status => {
            // Only add statuses that have flights
            if (statusCounts[status] && statusCounts[status] > 0) {
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.setAttribute('data-status', status);
                
                if (activeFilters[status]) {
                    item.classList.add('active');
                }
                
                // Create color indicator
                const colorIndicator = document.createElement('span');
                colorIndicator.className = 'color-indicator';
                colorIndicator.style.backgroundColor = statusColors[status].color;
                
                // Create label with count
                const label = document.createElement('span');
                label.className = 'legend-label';
                label.textContent = `${statusColors[status].label} (${statusCounts[status] || 0})`;
                
                // Add to item
                item.appendChild(colorIndicator);
                item.appendChild(label);
                
                // Add click handler for filtering
                item.addEventListener('click', () => {
                    activeFilters[status] = !activeFilters[status];
                    item.classList.toggle('active');
                    applyFilters(flights);
                });
                
                legend.appendChild(item);
            }
        });
        
        // Add legend to map container
        const mapContainer = document.querySelector('#routePlanningPopup .map-container');
        if (mapContainer) {
            mapContainer.appendChild(legend);
        }
    }
    
    // Apply status filters to the map
    function applyFilters(flights) {
        // Get all route lines
        const routeLines = document.querySelectorAll('.stylish-route-line');
        
        // Hide/show based on filters
        routeLines.forEach(line => {
            const status = line.getAttribute('data-status');
            const routeId = line.getAttribute('id');
            
            if (status && activeFilters[status]) {
                // Show the route line
                line.style.display = 'block';
                line.style.pointerEvents = 'all';
                
                // Show the plane icon if it's a departed flight
                const planeIcon = document.querySelector(`.plane-icon[data-for="${routeId}"]`);
                if (planeIcon) {
                    planeIcon.style.display = 'block';
                }
            } else {
                // Hide the route line
                line.style.display = 'none';
                line.style.pointerEvents = 'none';
                
                // Hide the plane icon
                const planeIcon = document.querySelector(`.plane-icon[data-for="${routeId}"]`);
                if (planeIcon) {
                    planeIcon.style.display = 'none';
                }
            }
        });
        
        // Reset any active highlights
        resetAirportHighlights();
        hideFlightInfoPopup();
    }
    
    // Create dynamic routes based on flights
    function createDynamicRoutes(flights) {
        console.log(`Creating dynamic routes for ${flights.length} flights`);
        
        // Find the map container
        const mapContainer = document.querySelector('#routePlanningPopup .map-container');
        if (!mapContainer) {
            console.error("Map container not found");
            return;
        }
        
        // Clear existing lines
        const existingLines = document.querySelectorAll('.stylish-route-line');
        existingLines.forEach(line => line.remove());
        
        // Clear existing SVG
        const existingSvg = mapContainer.querySelector('.stylish-routes-svg');
        if (existingSvg) {
            existingSvg.remove();
        }
        
        // Get airport points
        const airportPoints = {};
        const pointElements = mapContainer.querySelectorAll('.airport-point');
        
        pointElements.forEach(point => {
            const code = point.getAttribute('data-code');
            if (code) {
                const rect = point.getBoundingClientRect();
                const mapRect = mapContainer.getBoundingClientRect();
                
                airportPoints[code] = {
                    x: rect.left + rect.width/2 - mapRect.left,
                    y: rect.top + rect.height/2 - mapRect.top
                };
                
                console.log(`Found airport ${code} at x:${airportPoints[code].x}, y:${airportPoints[code].y}`);
            }
        });
        
        // Fallback positions if points not found
        const fallbackPositions = {
            'TLV': { x: 715, y: 285 },  // Tel Aviv
            'JFK': { x: 253, y: 248 },  // New York
            'LHR': { x: 564, y: 170 },  // London
            'CDG': { x: 582, y: 183 },  // Paris
            'DXB': { x: 804, y: 333 },  // Dubai
            'SIN': { x: 1018, y: 487 }, // Singapore
            'HND': { x: 1124, y: 262 }, // Tokyo
            'SYD': { x: 1180, y: 666 }, // Sydney
            'GRU': { x: 368, y: 600 },  // São Paulo
            'CPT': { x: 644, y: 654 },  // Cape Town
            'LAX': { x: 84, y: 278 },   // Los Angeles
            'SVO': { x: 822, y: 153 },  // Moscow
            'BKK': { x: 1000, y: 392 }, // Bangkok
            'MEX': { x: 137, y: 350 },  // Mexico City
            'EZE': { x: 351, y: 636 }   // Buenos Aires
        };
        
        // Create SVG container for routes
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.classList.add('stylish-routes-svg');
        svgContainer.setAttribute('width', '100%');
        svgContainer.setAttribute('height', '100%');
        svgContainer.style.position = 'absolute';
        svgContainer.style.top = '0';
        svgContainer.style.left = '0';
        svgContainer.style.zIndex = '25';
        svgContainer.style.pointerEvents = 'all'; // Make entire SVG interactive
        mapContainer.appendChild(svgContainer);
        
        // Create invisible paths first - they will be revealed one by one
        const routeElements = [];
        
        flights.forEach((flight, index) => {
            const origin = flight.Origin;
            const destination = flight.Destination;
            
            // Skip flights without origin/destination
            if (!origin || !destination) return;
            
            // IMPORTANT: Ensure we're only using defined status colors
            let routeColor;
            if (flight.Status && statusColors[flight.Status]) {
                routeColor = statusColors[flight.Status];
            } else {
                // Default to Boarding color if status is unknown
                routeColor = statusColors['Boarding'];
            }
            
            const routeConfig = {
                from: origin,
                to: destination,
                color: routeColor.color,
                glow: routeColor.glow,
                status: flight.Status || 'Unknown'
            };
            
            // Check if points exist
            let startPoint, endPoint;
            
            if (airportPoints[routeConfig.from] && airportPoints[routeConfig.to]) {
                startPoint = airportPoints[routeConfig.from];
                endPoint = airportPoints[routeConfig.to];
            } else if (fallbackPositions[routeConfig.from] && fallbackPositions[routeConfig.to]) {
                startPoint = fallbackPositions[routeConfig.from];
                endPoint = fallbackPositions[routeConfig.to];
            } else {
                console.error(`Cannot create route from ${routeConfig.from} to ${routeConfig.to} - positions unknown`);
                return;
            }
            
            // Store valid routes for animation
            routeElements.push({
                flight: flight,
                routeConfig: routeConfig,
                startPoint: startPoint,
                endPoint: endPoint,
                index: index
            });
            
            // Cache flight data
            const flightKey = `${origin}-${destination}-${flight.FlightNumber}`;
            flightDataCache[flightKey] = {
                from: origin,
                to: destination,
                flightNumber: flight.FlightNumber,
                aircraft: flight.Aircraft || 'Unknown',
                departureTime: formatDateTime(flight.DepartureTime),
                arrivalTime: formatDateTime(flight.ArrivalTime),
                status: flight.Status,
                statusText: getStatusText(flight.Status),
                color: routeColor.color
            };
        });
        
        // Now, animate each route one at a time with proper delay
        routeElements.forEach((routeData, idx) => {
            setTimeout(() => {
                createAnimatedLine(
                    svgContainer, 
                    routeData.routeConfig, 
                    routeData.startPoint, 
                    routeData.endPoint, 
                    routeData.flight
                );
            }, idx * 30); // 30ms delay between each line - reduced for faster loading
        });
    }
    
    function createAnimatedLine(svgContainer, route, startPoint, endPoint, flightData) {
        // Generate unique ID for this route - ensure safe for SVG
        const safeFlightNumber = flightData.FlightNumber.replace(/[^a-zA-Z0-9]/g, '_');
        const routeId = `route-${route.from}-${route.to}-${safeFlightNumber}`;
        
        // Create glow effect
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgContainer.appendChild(defs);
        
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', `glow-${routeId}`);
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');
        defs.appendChild(filter);
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', '4');
        feGaussianBlur.setAttribute('result', 'coloredBlur');
        filter.appendChild(feGaussianBlur);
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        filter.appendChild(feMerge);
        
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'coloredBlur');
        feMerge.appendChild(feMergeNode1);
        
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        feMerge.appendChild(feMergeNode2);
        
        // Create curved line based on distance
        const distance = Math.sqrt(
            Math.pow(endPoint.x - startPoint.x, 2) + 
            Math.pow(endPoint.y - startPoint.y, 2)
        );
        
        // Adjust curvature based on distance
        const curveFactor = Math.min(0.2, 80 / distance);
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        
        // Calculate perpendicular direction for control point
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const perpX = -dy;
        const perpY = dx;
        
        // Normalize and scale for control point
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        const curveControlX = midX + (perpX / perpLength) * distance * curveFactor;
        const curveControlY = midY + (perpY / perpLength) * distance * curveFactor;
        
        // Calculate path for both the visual and interaction layers
        const pathData = `M ${startPoint.x} ${startPoint.y} Q ${curveControlX} ${curveControlY}, ${endPoint.x} ${endPoint.y}`;
        
        // Create path with unique ID
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', routeId);
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', route.color);
        path.setAttribute('stroke-width', '3');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('filter', `url(#glow-${routeId})`);
        path.classList.add('stylish-route-line');
        path.setAttribute('data-status', route.status);
        path.setAttribute('data-from', route.from);
        path.setAttribute('data-to', route.to);
        path.setAttribute('data-flight-number', flightData.FlightNumber);
        
        // Make the path interactive
        path.style.cursor = 'pointer';
        path.style.pointerEvents = activeFilters[route.status] ? 'all' : 'none';
        
        // Use the same dashed line style for all routes
        path.setAttribute('stroke-dasharray', '10,5');
        
        // Add animation for "Departed" flights
        if (route.status === 'Departed') {
            // Continuous movement animation
            const animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animation.setAttribute('attributeName', 'stroke-dashoffset');
            animation.setAttribute('from', '0');
            animation.setAttribute('to', '-100');
            animation.setAttribute('dur', '5s');
            animation.setAttribute('repeatCount', 'indefinite');
            path.appendChild(animation);
            
            // Add plane icon
            addPlaneIcon(svgContainer, path, route, routeId);
        }
        
        // Use consistent opacity for all routes - no varying opacity
        path.style.opacity = '0'; // Start invisible for animation
        
        // Don't show if not in active filters
        if (!activeFilters[route.status]) {
            path.style.display = 'none';
        }
        
        svgContainer.appendChild(path);
        
        // Fade-in animation - with a slight delay to create a better sequential effect
        setTimeout(() => {
            path.style.opacity = '1';
            path.style.transition = 'opacity 0.5s ease';
        }, 50);
    }
    
    function addPlaneIcon(svgContainer, path, route, routeId) {
        try {
            // Group for plane
            const plane = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            plane.classList.add('plane-icon');
            plane.setAttribute('data-for', routeId); // For filtering
            svgContainer.appendChild(plane);
            
            // Plane shape - size varies with path length
            const planeShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            planeShape.setAttribute('d', 'M 0,-3 L 5,0 L 0,3 L -10,0 Z');
            planeShape.setAttribute('fill', 'white');
            planeShape.setAttribute('stroke', route.color);
            planeShape.setAttribute('stroke-width', '1');
            plane.appendChild(planeShape);
            
            // Animation along the path
            const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
            animateMotion.setAttribute('dur', '10s'); // Longer animation duration
            animateMotion.setAttribute('repeatCount', 'indefinite');
            animateMotion.setAttribute('rotate', 'auto');
            
            const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
            mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${routeId}`);
            animateMotion.appendChild(mpath);
            
            plane.appendChild(animateMotion);
            
            // Hide if filter is inactive
            if (path.style.display === 'none') {
                plane.style.display = 'none';
            }
            
            console.log(`Added plane icon for ${routeId}`);
        } catch (error) {
            console.error(`Error adding plane icon for ${routeId}:`, error);
        }
    }
    
    // Enable global hover handling for paths
    function enableGlobalHoverHandling() {
        const mapContainer = document.querySelector('#routePlanningPopup .map-container');
        if (!mapContainer) return;
        
        // Add global hover detection for all paths
        const routePaths = document.querySelectorAll('.stylish-route-line');
        
        routePaths.forEach(path => {
            path.addEventListener('mouseenter', function(e) {
                const status = this.getAttribute('data-status');
                if (!activeFilters[status]) return;
                
                const routeId = this.getAttribute('id');
                const from = this.getAttribute('data-from');
                const to = this.getAttribute('data-to');
                const flightNumber = this.getAttribute('data-flight-number');
                
                // Highlight effect
                this.setAttribute('stroke-width', '5');
                this.style.filter = `url(#glow-${routeId}) drop-shadow(0 0 5px ${statusColors[status].color})`;
                
                // Highlight airports
                highlightAirports(from, to);
                
                // Get flight data - either from cache or attributes
                const flightKey = `${from}-${to}-${flightNumber}`;
                let flightData = flightDataCache[flightKey];
                
                if (!flightData) {
                    // Create from path attributes if not in cache
                    flightData = {
                        from: from,
                        to: to,
                        flightNumber: flightNumber,
                        aircraft: 'N/A',
                        departureTime: 'N/A',
                        arrivalTime: 'N/A',
                        status: status,
                        statusText: getStatusText(status),
                        color: statusColors[status].color
                    };
                }
                
                // Show popup
                showFlightInfoPopup(flightData, e);
            });
            
            path.addEventListener('mouseleave', function() {
                const routeId = this.getAttribute('id');
                
                // Remove highlight
                this.setAttribute('stroke-width', '3');
                this.style.filter = `url(#glow-${routeId})`;
                
                // Reset airports
                resetAirportHighlights();
                
                // Hide popup
                hideFlightInfoPopup();
            });
            
            path.addEventListener('mousemove', function(e) {
                // Update popup position
                updatePopupPosition(e);
            });
        });
        
        console.log("Global hover handling enabled for all routes");
    }
    
    // Toggle between dark and light maps
    document.addEventListener('themeChange', function(e) {
        const isDarkTheme = e.detail.theme === 'dark';
        const darkMap = document.getElementById('darkMapImage');
        const lightMap = document.getElementById('lightMapImage');
        
        if (darkMap && lightMap) {
            darkMap.style.display = isDarkTheme ? 'block' : 'none';
            lightMap.style.display = isDarkTheme ? 'none' : 'block';
        }
    });
    
    // ------------ Flight Info Popup Functions ------------
    
    function createFlightInfoPopup() {
        // Check if popup already exists
        const existingPopup = document.querySelector('.flight-info-popup');
        if (existingPopup) existingPopup.remove();
        
        // Add custom styles
        addCustomPopupStyles();
        
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'flight-info-popup';
        popup.style.zIndex = '10000'; // Very high z-index
        document.body.appendChild(popup);
        
        console.log('Flight info popup created and styled');
    }

    // Helper function to convert status to text
    function getStatusText(status) {
        const statusMap = {
            'Scheduled': 'Scheduled',
            'Boarding': 'Boarding',
            'Departed': 'Departed',
            'Arrived': 'Arrived',
            'Delayed': 'Delayed',
            'Cancelled': 'Cancelled'
        };
        
        return statusMap[status] || status;
    }

    // Helper function to format date and time
    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return 'N/A';
        
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('en-US', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateTimeStr;
        }
    }

    // Show flight information popup
    function showFlightInfoPopup(flightData, event) {
        const popup = document.querySelector('.flight-info-popup');
        if (!popup || !flightData) return;
        
        // Create popup content with styled status badge
        popup.innerHTML = `
            <div class="flight-info-title">
                ${flightData.flightNumber}
            </div>
            <div class="flight-info-row">
                <span class="flight-info-label">Route:</span>
                <span class="flight-info-value">${flightData.from} → ${flightData.to}</span>
            </div>
            <div class="flight-info-row">
                <span class="flight-info-label">Aircraft:</span>
                <span class="flight-info-value">${flightData.aircraft}</span>
            </div>
            <div class="flight-info-row">
                <span class="flight-info-label">Departure:</span>
                <span class="flight-info-value">${flightData.departureTime}</span>
            </div>
            <div class="flight-info-row">
                <span class="flight-info-label">Arrival:</span>
                <span class="flight-info-value">${flightData.arrivalTime}</span>
            </div>
            <div class="flight-info-row">
                <span class="flight-info-label">Status:</span>
                <span class="flight-info-value">
                    <span class="flight-info-status status-${flightData.status}">${flightData.statusText}</span>
                </span>
            </div>
        `;
        
        // Position and show popup
        updatePopupPosition(event);
        popup.classList.add('visible');
    }

    // Update popup position based on mouse coordinates
    function updatePopupPosition(event) {
        const popup = document.querySelector('.flight-info-popup');
        if (!popup) return;
        
        const padding = 15; // Space between cursor and popup
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get popup dimensions
        const popupWidth = popup.offsetWidth;
        const popupHeight = popup.offsetHeight;
        
        // Initial position (right of cursor)
        let leftPos = event.clientX + padding;
        let topPos = event.clientY - (popupHeight / 2); // Centered vertically to cursor
        
        // Check right edge overflow
        if (leftPos + popupWidth + padding > viewportWidth) {
            leftPos = event.clientX - popupWidth - padding; // Position left of cursor
        }
        
        // Check top edge overflow
        if (topPos < padding) {
            topPos = padding;
        }
        
        // Check bottom edge overflow
        if (topPos + popupHeight + padding > viewportHeight) {
            topPos = viewportHeight - popupHeight - padding;
        }
        
        // Set position
        popup.style.left = `${leftPos}px`;
        popup.style.top = `${topPos}px`;
    }

    // Hide flight information popup
    function hideFlightInfoPopup() {
        const popup = document.querySelector('.flight-info-popup');
        if (popup) {
            popup.classList.remove('visible');
        }
    }

    // Highlight airports connected by a flight
    function highlightAirports(originCode, destinationCode) {
        // Find airport points
        const originPoint = document.querySelector(`.airport-point[data-code="${originCode}"]`);
        const destPoint = document.querySelector(`.airport-point[data-code="${destinationCode}"]`);
        
        // Add highlight class
        if (originPoint) originPoint.classList.add('has-active-flight');
        if (destPoint) destPoint.classList.add('has-active-flight');
    }

    // Reset airport highlights
    function resetAirportHighlights() {
        const highlightedPoints = document.querySelectorAll('.airport-point.has-active-flight');
        highlightedPoints.forEach(point => {
            point.classList.remove('has-active-flight');
        });
    }

    // Initialize if popup is already open
    if (document.querySelector('#routePlanningPopup.active')) {
        setTimeout(initializeRouteMap, 500);
    }
});