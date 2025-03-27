document.addEventListener('DOMContentLoaded', function() {
    // Map opening event
    const weatherAlertsCard = document.querySelector('.action-card.weather-alerts');
    if (weatherAlertsCard) {
        weatherAlertsCard.addEventListener('click', function() {
            setTimeout(initializeWeatherMap, 300); // Reduced delay for faster loading
        });
    }
    
    // Close button event to ensure proper cleanup
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('popup-close') && e.target.closest('#weatherAlertsPopup')) {
            // Clean up SVG elements when closing
            const mapContainer = document.querySelector('#weatherAlertsPopup .map-container');
            if (mapContainer) {
                const existingSvg = mapContainer.querySelector('.weather-routes-svg');
                if (existingSvg) {
                    existingSvg.remove();
                }
                
                // Remove flight info popup
                const infoPopup = document.querySelector('.weather-info-popup');
                if (infoPopup) {
                    infoPopup.remove();
                }
                
                // Remove status filter legend
                const legend = document.querySelector('.weather-status-filter-legend');
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
        const existingStyle = document.getElementById('weather-info-popup-styles');
        if (existingStyle) existingStyle.remove();
        
        // Create style element
        const styleElement = document.createElement('style');
        styleElement.id = 'weather-info-popup-styles';
        styleElement.textContent = `
            .weather-info-popup {
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
            
            .weather-info-popup::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(
                    90deg, 
                    rgba(14, 165, 233, 0.7) 0%, 
                    rgba(56, 189, 248, 0.7) 100%
                );
            }
            
            .weather-info-popup.visible {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            
            .weather-info-title {
                font-weight: 700;
                font-size: 20px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: white;
                position: relative;
                letter-spacing: -0.5px;
            }
            
            .local-time {
                font-size: 14px;
                opacity: 0.8;
                font-weight: 400;
                margin-left: auto;
                background: rgba(14, 165, 233, 0.15);
                padding: 4px 8px;
                border-radius: 4px;
                letter-spacing: 0;
            }
            
            .weather-info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
                line-height: 1.4;
                opacity: 0.9;
                transition: opacity 0.2s ease;
            }
            
            .weather-info-row:hover {
                opacity: 1;
            }
            
            .weather-info-label {
                font-weight: 500;
                color: rgba(148, 163, 184, 0.8);
                min-width: 95px;
                transition: color 0.2s ease;
            }
            
            .weather-info-value {
                font-weight: 600;
                color: #f1f5f9;
                text-align: right;
                position: relative;
            }
            
            .weather-info-status {
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
            .status-Clear {
                background: linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0.1) 100%);
                color: #0ea5e9;
                border: 1px solid rgba(14, 165, 233, 0.3);
            }
            
            .status-Cloudy {
                background: linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(148, 163, 184, 0.1) 100%);
                color: #94a3b8;
                border: 1px solid rgba(148, 163, 184, 0.3);
            }
            
            .status-Rain {
                background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%);
                color: #38bdf8;
                border: 1px solid rgba(56, 189, 248, 0.3);
            }
            
            .status-Thunderstorm {
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%);
                color: #a855f7;
                border: 1px solid rgba(168, 85, 247, 0.3);
            }
            
            .status-Snow {
                background: linear-gradient(135deg, rgba(226, 232, 240, 0.2) 0%, rgba(226, 232, 240, 0.1) 100%);
                color: #e2e8f0;
                border: 1px solid rgba(226, 232, 240, 0.3);
            }
            
            .status-Storm {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
                color: #ef4444;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }
            
            /* Light mode adjustments with more subtle changes */
            [data-theme="light"] .weather-info-popup {
                background: linear-gradient(
                    145deg, 
                    rgba(241, 245, 249, 0.8) 0%, 
                    rgba(226, 232, 240, 0.6) 100%
                );
                color: #1e293b;
                border: 1px solid rgba(14, 165, 233, 0.1);
                box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(14, 165, 233, 0.05);
            }
            
            [data-theme="light"] .weather-info-title {
                color: #1e293b;
            }
            
            [data-theme="light"] .local-time {
                background: rgba(14, 165, 233, 0.1);
                color: #0369a1;
            }
            
            [data-theme="light"] .weather-info-label {
                color: rgba(100, 116, 139, 0.7);
            }
            
            [data-theme="light"] .weather-info-value {
                color: #0f172a;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Active filters - start with all condition types
    const activeFilters = {
        "Clear": true,
        "Cloudy": true,
        "Rain": true,
        "Thunderstorm": true,
        "Snow": true,
        "Storm": true
    };
    
    // Cache of weather data for better performance
    const weatherDataCache = {};
    
    // Cache for airport local times
    const airportTimesCache = {};
    
    // Initialize active filters - reset to defaults each time
    function initializeActiveFilters() {
        activeFilters.Clear = true;
        activeFilters.Cloudy = true;
        activeFilters.Rain = true;
        activeFilters.Lightning = true;
        activeFilters.Snow = true;
        activeFilters.Storm = true;
    }
    
    
    // Initialize the weather map and fetch all weather data
    async function initializeWeatherMap() {
        console.log("Initializing weather map");
        
        // Reset all filters to defaults on each initialize
        initializeActiveFilters();
        
        // Start loading indicators
        showLoadingIndicator();
        
        // Use Promise.all to parallelize operations
        try {
            const [weatherData] = await Promise.all([
                fetchWeatherDataFromAPI(),
                preloadAllAirportTimes() // This runs in parallel
            ]);
            
            if (weatherData && weatherData.length > 0) {
                // Check if all data entries contain errors
                const allErrorsOrEmpty = weatherData.every(item => item.error === true);
                
                if (allErrorsOrEmpty) {
                    // Show error message if all data points have errors
                    showAPIErrorMessage();
                } else {
                    // Process valid data
                    createWeatherAlerts(weatherData);
                    setTimeout(createWeatherInfoPopup, 100);
                    createWeatherFilterLegend(weatherData);
                    setTimeout(enableGlobalHoverHandling, 200);
                }
            } else {
                console.log("No weather data found or API error");
                showAPIErrorMessage();
            }
            
            // Hide loading indicator after data loaded
            hideLoadingIndicator();
        } catch (error) {
            console.error("Error initializing weather map:", error);
            showAPIErrorMessage();
            
            // Hide loading indicator
            hideLoadingIndicator();
        }
    }

    // Show API error message
    function showAPIErrorMessage() {
        const mapContainer = document.querySelector('#weatherAlertsPopup .map-container');
        if (!mapContainer) return;
        
        // Clear any existing content
        const existingSvg = mapContainer.querySelector('.weather-routes-svg');
        if (existingSvg) {
            existingSvg.remove();
        }
        
        const existingLegend = mapContainer.querySelector('.weather-status-filter-legend');
        if (existingLegend) {
            existingLegend.remove();
        }
        
        // Create error message container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'weather-api-error';
        errorContainer.innerHTML = `
            <div class="error-icon">❌</div>
            <h3>Weather Data Unavailable</h3>
            <p>We're unable to retrieve current weather data. Please try again later.</p>
        `;
        
        // Add to map container
        mapContainer.appendChild(errorContainer);
        
        // Add styles for error message
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .weather-api-error {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(15, 23, 42, 0.8);
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                color: white;
                backdrop-filter: blur(8px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                z-index: 1000;
                width: 80%;
                max-width: 400px;
            }
            
            .weather-api-error .error-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }
            
            .weather-api-error h3 {
                font-size: 24px;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .weather-api-error p {
                font-size: 16px;
                opacity: 0.9;
                line-height: 1.5;
            }
            
            [data-theme="light"] .weather-api-error {
                background: rgba(241, 245, 249, 0.8);
                color: #1e293b;
                border: 1px solid rgba(14, 165, 233, 0.2);
            }
        `;
        document.head.appendChild(styleElement);
    }

    
    // Create a loading indicator
    function showLoadingIndicator() {
        const mapContainer = document.querySelector('#weatherAlertsPopup .map-container');
        if (!mapContainer) return;
        
        // Remove any existing loading indicator
        const existing = document.querySelector('#weather-loading-indicator');
        if (existing) existing.remove();
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'weather-loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading Weather Data...</div>
        `;
        
        // Add to map container
        mapContainer.appendChild(loadingIndicator);
    }
    
    // Hide loading indicator
    function hideLoadingIndicator() {
        const loadingIndicator = document.querySelector('#weather-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('fade-out');
            setTimeout(() => {
                if (loadingIndicator && loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }, 500);
        }
    }
    
    // Pre-fetch all airport times using reliable time API
    async function preloadAllAirportTimes() {
        const airports = [
            'TLV', 'JFK', 'LHR', 'CDG', 'DXB', 
            'SIN', 'HND', 'SYD', 'GRU', 'CPT', 
            'LAX', 'SVO', 'BKK', 'MEX', 'EZE'
        ];
        
        // Define reliable time API endpoints
        const timeApiEndpoints = [
            { name: 'WorldTime', url: 'https://worldtimeapi.org/api/timezone/' },
            { name: 'TimeAPI', url: 'https://timeapi.io/api/Time/current/zone?timeZone=' }
        ];
        
        // Fetch all airport times in parallel
        const timePromises = airports.map(async (code) => {
            try {
                // Get the local time with retries and fallbacks
                const time = await getReliableLocalTime(code, timeApiEndpoints);
                airportTimesCache[code] = time;
                return { code, time };
            } catch (error) {
                console.error(`Error fetching time for ${code}:`, error);
                const fallbackTime = getTimeWithOffset(code);
                airportTimesCache[code] = fallbackTime;
                return { code, time: fallbackTime };
            }
        });
        
        // Wait for all time fetches to complete
        await Promise.all(timePromises);
        console.log("Preloaded airport times:", airportTimesCache);
    }
    
    // Get reliable local time with retries and multiple APIs
    async function getReliableLocalTime(airportCode, apiEndpoints) {
        // Map of airport codes to timezone identifiers and UTC offsets
        const airportTimezones = {
            'TLV': { timezone: 'Asia/Jerusalem', offset: 3 },
            'JFK': { timezone: 'America/New_York', offset: -4 },
            'LHR': { timezone: 'Europe/London', offset: 1 },
            'CDG': { timezone: 'Europe/Paris', offset: 2 },
            'DXB': { timezone: 'Asia/Dubai', offset: 4 },
            'SIN': { timezone: 'Asia/Singapore', offset: 8 },
            'HND': { timezone: 'Asia/Tokyo', offset: 9 },
            'SYD': { timezone: 'Australia/Sydney', offset: 10 },
            'GRU': { timezone: 'America/Sao_Paulo', offset: -3 },
            'CPT': { timezone: 'Africa/Johannesburg', offset: 2 },
            'LAX': { timezone: 'America/Los_Angeles', offset: -7 },
            'SVO': { timezone: 'Europe/Moscow', offset: 3 },
            'BKK': { timezone: 'Asia/Bangkok', offset: 7 },
            'MEX': { timezone: 'America/Mexico_City', offset: -5 },
            'EZE': { timezone: 'America/Argentina/Buenos_Aires', offset: -3 }
        };
        
        // Get timezone info for the airport
        const timezoneInfo = airportTimezones[airportCode];
        
        if (!timezoneInfo) {
            console.error(`No timezone data for airport: ${airportCode}`);
            return getTimeWithOffset(0); // Default to UTC
        }
        
        // Try each API endpoint
        for (const api of apiEndpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 second timeout
                
                const url = `${api.url}${timezoneInfo.timezone}`;
                const response = await fetch(url, { 
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Parse the datetime string depending on API
                    let dateTime;
                    if (api.name === 'WorldTime') {
                        dateTime = new Date(data.datetime || data.utc_datetime);
                    } else if (api.name === 'TimeAPI') {
                        dateTime = new Date(data.dateTime);
                    } else {
                        dateTime = new Date();
                    }
                    
                    // Format time as HH:MM (24-hour format)
                    const hours = dateTime.getHours().toString().padStart(2, '0');
                    const minutes = dateTime.getMinutes().toString().padStart(2, '0');
                    return `${hours}:${minutes}`;
                }
            } catch (error) {
                console.warn(`${api.name} failed for ${airportCode}: ${error.message}`);
                // Continue to next API
            }
        }
        
        // All APIs failed, use offset calculation
        return getTimeWithOffset(timezoneInfo.offset);
    }
    
    // Calculate time based on UTC offset - more accurate than before
    function getTimeWithOffset(airportCode) {
        // Map of airport codes to timezone identifiers and UTC offsets
        const airportTimezones = {
            'TLV': { timezone: 'Asia/Jerusalem', offset: 3 },
            'JFK': { timezone: 'America/New_York', offset: -4 },
            'LHR': { timezone: 'Europe/London', offset: 1 },
            'CDG': { timezone: 'Europe/Paris', offset: 2 },
            'DXB': { timezone: 'Asia/Dubai', offset: 4 },
            'SIN': { timezone: 'Asia/Singapore', offset: 8 },
            'HND': { timezone: 'Asia/Tokyo', offset: 9 },
            'SYD': { timezone: 'Australia/Sydney', offset: 10 },
            'GRU': { timezone: 'America/Sao_Paulo', offset: -3 },
            'CPT': { timezone: 'Africa/Johannesburg', offset: 2 },
            'LAX': { timezone: 'America/Los_Angeles', offset: -7 },
            'SVO': { timezone: 'Europe/Moscow', offset: 3 },
            'BKK': { timezone: 'Asia/Bangkok', offset: 7 },
            'MEX': { timezone: 'America/Mexico_City', offset: -5 },
            'EZE': { timezone: 'America/Argentina/Buenos_Aires', offset: -3 }
        };
        
        let offset = 0;
        
        // If passed an airport code, get its offset
        if (typeof airportCode === 'string') {
            const timezoneInfo = airportTimezones[airportCode];
            if (timezoneInfo) {
                offset = timezoneInfo.offset;
            }
        } else if (typeof airportCode === 'number') {
            // If passed a number, use that as the offset directly
            offset = airportCode;
        }
        
        // Get current UTC time
        const now = new Date();
        
        // Calculate the local time by adding the offset hours
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000); // convert to UTC
        const localTime = new Date(utcTime + (offset * 3600000)); // add offset in milliseconds
        
        // Format the time
        const hours = localTime.getHours().toString().padStart(2, '0');
        const minutes = localTime.getMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes}`;
    }
    
    // Create fallback weather data for when API fails
    function createFallbackWeatherData() {
        return [
            { airport: "TLV", condition: "X", temperature: "X", windSpeed: "12", windDirection: "NE", humidity: "45", visibility: "Good" },
            { airport: "JFK", condition: "X", temperature: "X", windSpeed: "10", windDirection: "SW", humidity: "65", visibility: "Good" },
            { airport: "LHR", condition: "X", temperature: "X", windSpeed: "16", windDirection: "W", humidity: "78", visibility: "Moderate" },
            { airport: "CDG", condition: "X", temperature: "X", windSpeed: "8", windDirection: "NW", humidity: "70", visibility: "Good" },
            { airport: "DXB", condition: "X", temperature: "X", windSpeed: "6", windDirection: "E", humidity: "32", visibility: "Excellent" },
            { airport: "SIN", condition: "X", temperature: "X", windSpeed: "14", windDirection: "S", humidity: "85", visibility: "Moderate" },
            { airport: "HND", condition: "X", temperature: "22", windSpeed: "18", windDirection: "SE", humidity: "75", visibility: "Moderate" },
            { airport: "SYD", condition: "X", temperature: "23", windSpeed: "8", windDirection: "NE", humidity: "55", visibility: "Excellent" },
            { airport: "GRU", condition: "X", temperature: "25", windSpeed: "12", windDirection: "N", humidity: "80", visibility: "Poor" },
            { airport: "CPT", condition: "X", temperature: "20", windSpeed: "14", windDirection: "S", humidity: "50", visibility: "Excellent" },
            { airport: "LAX", condition: "X", temperature: "24", windSpeed: "6", windDirection: "W", humidity: "48", visibility: "Good" },
            { airport: "SVO", condition: "X", temperature: "0", windSpeed: "20", windDirection: "N", humidity: "82", visibility: "Poor" },
            { airport: "BKK", condition: "X", temperature: "32", windSpeed: "8", windDirection: "SE", humidity: "78", visibility: "Moderate" },
            { airport: "MEX", condition: "X", temperature: "21", windSpeed: "10", windDirection: "SW", humidity: "60", visibility: "Good" },
            { airport: "EZE", condition: "X", temperature: "18", windSpeed: "25", windDirection: "S", humidity: "75", visibility: "Poor" }
        ];
    }
    
    // Fetch weather data from free API (Open-Meteo)
    async function fetchWeatherDataFromAPI() {
        try {
            // Airport coordinates to fetch weather for
            const airports = [
                { code: "TLV", lat: 32.01, lon: 34.88 },
                { code: "JFK", lat: 40.64, lon: -73.78 },
                { code: "LHR", lat: 51.47, lon: -0.45 },
                { code: "CDG", lat: 49.01, lon: 2.55 },
                { code: "DXB", lat: 25.25, lon: 55.36 },
                { code: "SIN", lat: 1.36, lon: 103.99 },
                { code: "HND", lat: 35.55, lon: 139.78 },
                { code: "SYD", lat: -33.95, lon: 151.18 },
                { code: "GRU", lat: -23.43, lon: -46.47 },
                { code: "CPT", lat: -33.97, lon: 18.60 },
                { code: "LAX", lat: 33.94, lon: -118.40 },
                { code: "SVO", lat: 55.97, lon: 37.41 },
                { code: "BKK", lat: 13.69, lon: 100.75 },
                { code: "MEX", lat: 19.44, lon: -99.07 },
                { code: "EZE", lat: -34.82, lon: -58.54 }
            ];
            
            // Use timeout to prevent hanging API calls
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            // Use Open-Meteo API (no API key required)
            const weatherData = await Promise.all(
                airports.map(async (airport) => {
                    try {
                        const response = await fetch(
                            `https://api.open-meteo.com/v1/forecast?latitude=${airport.lat}&longitude=${airport.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,visibility`,
                            { signal: controller.signal }
                        );
                        
                        clearTimeout(timeoutId);
                        
                        if (!response.ok) {
                            throw new Error(`Weather API error: ${response.status}`);
                        }
                        
                        const data = await response.json();
                        
                        // Map weather code to our condition types
                        let condition = mapWeatherCodeToCondition(data.current.weather_code);
                        
                        // Properly map visibility value
                        let visibilityText = "Good"; // Default value
                        
                        if (data.current.visibility !== undefined) {
                            visibilityText = getAccurateVisibilityText(data.current.visibility);
                        }
                        
                        return {
                            airport: airport.code,
                            condition: condition,
                            temperature: Math.round(data.current.temperature_2m || 0),
                            windSpeed: Math.round(data.current.wind_speed_10m || 0),
                            windDirection: getWindDirection(data.current.wind_direction_10m),
                            humidity: Math.round(data.current.relative_humidity_2m || 0),
                            visibility: visibilityText
                        };
                    } catch (error) {
                        console.error(`Error fetching weather for ${airport.code}:`, error);
                        
                        // Return an error object instead of fallback data
                        return {
                            airport: airport.code,
                            error: true,
                            errorMessage: "Data unavailable"
                        };
                    }
                })
            );
            
            return weatherData;
        } catch (error) {
            console.error("Error in weather API call:", error);
            return null;
        }
    }
    
    // More accurate visibility text mapping
    function getAccurateVisibilityText(visibilityMeters) {
        if (!visibilityMeters && visibilityMeters !== 0) return "Unknown";
        
        // Convert visibility in meters to appropriate categories
        if (visibilityMeters >= 20000) return "Excellent";
        if (visibilityMeters >= 10000) return "Very Good";
        if (visibilityMeters >= 5000) return "Good";
        if (visibilityMeters >= 2000) return "Moderate";
        if (visibilityMeters >= 1000) return "Poor";
        return "Very Poor";
    }
    
    // Map WMO weather codes to our condition types
    function mapWeatherCodeToCondition(code) {
        // Based on WMO weather interpretation codes
        if (!code) return "Clear";
        
        // Clear
        if ([0, 1].includes(code)) return "Clear";
        
        // Cloudy
        if ([2, 3, 45, 48].includes(code)) return "Cloudy";
        
        // Rain
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
        
        // Lightning (formerly Thunderstorm)
        if ([95, 96, 99].includes(code)) return "Lightning";
        
        // Snow
        if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
        
        // Storm
        if ([17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 91, 92, 93, 94, 97, 98].includes(code)) return "Storm";
        
        // Default to Clear
        return "Clear";
    }
    
    // Convert wind direction degrees to cardinal direction
    function getWindDirection(degrees) {
        if (degrees === undefined || degrees === null) return "N/A";
        
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const index = Math.round(((degrees % 360) / 45) % 8);
        return directions[index];
    }
    
    // Weather colors by condition - EXACTLY DEFINED COLORS
    const weatherColors = {
        'Clear': { color: "#0ea5e9", glow: "rgba(14, 165, 233, 0.6)", label: "Clear" },          // Sky blue
        'Cloudy': { color: "#94a3b8", glow: "rgba(148, 163, 184, 0.6)", label: "Cloudy" },       // Slate gray
        'Rain': { color: "#3b82f6", glow: "rgba(59, 130, 246, 0.6)", label: "Rain" },            // Royal blue
        'Lightning': { color: "#7c3aed", glow: "rgba(124, 58, 237, 0.6)", label: "Lightning" },  // Violet
        'Snow': { color: "#e2e8f0", glow: "rgba(226, 232, 240, 0.6)", label: "Snow" },           // Light gray/white
        'Storm': { color: "#dc2626", glow: "rgba(220, 38, 38, 0.6)", label: "Storm" }            // Red
    };
    
    // Create weather filter legend - simplified version
    function createWeatherFilterLegend(weatherData) {
        // Remove existing legend if any
        const existingLegend = document.querySelector('.weather-status-filter-legend');
        if (existingLegend) {
            existingLegend.remove();
        }
        
        // Create legend container
        const legend = document.createElement('div');
        legend.className = 'weather-status-filter-legend';
        
        // Create legend title
        const legendTitle = document.createElement('div');
        legendTitle.className = 'legend-title';
        legendTitle.textContent = 'Filter by Weather:';
        legend.appendChild(legendTitle);
        
        // Count airports by weather condition
        const conditionCounts = {};
        weatherData.forEach(data => {
            if (data.condition && !data.error) {
                conditionCounts[data.condition] = (conditionCounts[data.condition] || 0) + 1;
            }
        });
        
        // Add legend items for ALL weather conditions, regardless of count
        Object.keys(weatherColors).forEach(condition => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.setAttribute('data-condition', condition);
            
            // Check if this condition is active
            if (activeFilters[condition]) {
                item.classList.add('active');
            }
            
            // Check if this condition has any data
            const hasData = (conditionCounts[condition] && conditionCounts[condition] > 0);
            if (!hasData) {
                item.classList.add('no-data');
            }
            
            // Create color indicator
            const colorIndicator = document.createElement('span');
            colorIndicator.className = 'color-indicator';
            colorIndicator.style.backgroundColor = weatherColors[condition].color;
            
            // Create label with count (showing "0" if none)
            const label = document.createElement('span');
            label.className = 'legend-label';
            label.textContent = `${weatherColors[condition].label} (${conditionCounts[condition] || 0})`;
            
            // Add to item
            item.appendChild(colorIndicator);
            item.appendChild(label);
            
            // Add click handler for filtering (only if there's data)
            item.addEventListener('click', () => {
                if (hasData) {
                    activeFilters[condition] = !activeFilters[condition];
                    item.classList.toggle('active');
                    applyFilters(weatherData);
                }
            });
            
            legend.appendChild(item);
        });
        
        // Add legend to map container
        const mapContainer = document.querySelector('#weatherAlertsPopup .map-container');
        if (mapContainer) {
            mapContainer.appendChild(legend);
        }
    }
    
    // Apply weather condition filters to the map
    function applyFilters(weatherData) {
        // Get all weather circles
        const weatherCircles = document.querySelectorAll('.weather-alert-circle');
        
        // Hide/show based on filters
        weatherCircles.forEach(circle => {
            const condition = circle.getAttribute('data-condition');
            
            if (condition && activeFilters[condition]) {
                // Show the weather circle
                circle.style.display = 'block';
                circle.style.pointerEvents = 'all';
            } else {
                // Hide the weather circle
                circle.style.display = 'none';
                circle.style.pointerEvents = 'none';
            }
        });
        
        // Reset any active highlights
        resetAirportHighlights();
        hideWeatherInfoPopup();
    }
    
    // Create weather alerts based on data
    function createWeatherAlerts(weatherData) {
        console.log(`Creating weather alerts for ${weatherData.length} airports`);
        
        // Find the map container
        const mapContainer = document.querySelector('#weatherAlertsPopup .map-container');
        if (!mapContainer) {
            console.error("Map container not found");
            return;
        }
        
        // Clear existing elements
        const existingCircles = document.querySelectorAll('.weather-alert-circle');
        existingCircles.forEach(circle => circle.remove());
        
        // Clear existing SVG
        const existingSvg = mapContainer.querySelector('.weather-routes-svg');
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
        
        // Create SVG container for weather alerts
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.classList.add('weather-routes-svg');
        svgContainer.setAttribute('width', '100%');
        svgContainer.setAttribute('height', '100%');
        svgContainer.style.position = 'absolute';
        svgContainer.style.top = '0';
        svgContainer.style.left = '0';
        svgContainer.style.zIndex = '25';
        svgContainer.style.pointerEvents = 'all'; // Make entire SVG interactive
        mapContainer.appendChild(svgContainer);
        
        // Create weather circles all at once for better performance
        weatherData.forEach((data, index) => {
            const airport = data.airport;
            const condition = data.condition;
            
            // Skip if we don't have the airport or condition isn't valid
            if (!airport || !weatherColors[condition]) return;
            
            // Get airport position
            let position;
            if (airportPoints[airport]) {
                position = airportPoints[airport];
            } else if (fallbackPositions[airport]) {
                position = fallbackPositions[airport];
            } else {
                console.error(`Cannot create weather alert for ${airport} - position unknown`);
                return;
            }
            
            // Create weather alert circle
            createWeatherAlertCircle(svgContainer, position, data);
        });
        
        // Animate all circles in
        setTimeout(() => {
            const circles = document.querySelectorAll('.weather-alert-circle');
            circles.forEach(circle => {
                circle.style.opacity = '1';
                circle.style.transform = 'scale(1)';
            });
        }, 100);
        
        // Cache weather data for info popup
        weatherData.forEach(data => {
            weatherDataCache[data.airport] = data;
        });
    }
    
    // Create individual weather alert circles
    function createWeatherAlertCircle(svgContainer, position, weatherData) {
        // Generate unique ID for this weather alert
        const weatherId = `weather-${weatherData.airport}-${weatherData.condition}`;
        
        // Create defs for the glow effect
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        if (!document.getElementById(`glow-${weatherId}`)) {
            svgContainer.appendChild(defs);
            
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.setAttribute('id', `glow-${weatherId}`);
            filter.setAttribute('x', '-50%');
            filter.setAttribute('y', '-50%');
            filter.setAttribute('width', '200%');
            filter.setAttribute('height', '200%');
            defs.appendChild(filter);
            
            const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
            feGaussianBlur.setAttribute('stdDeviation', '5');
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
        }
        
        // Get color based on weather condition
        const weatherColor = weatherColors[weatherData.condition] || weatherColors['Clear'];
        
        // Create the circle for this weather alert
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('id', weatherId);
        circle.setAttribute('cx', position.x);
        circle.setAttribute('cy', position.y);
        circle.setAttribute('r', '18'); // Larger than airport dots
        circle.setAttribute('fill', weatherColor.color);
        circle.setAttribute('fill-opacity', '0.25');
        circle.setAttribute('stroke', weatherColor.color);
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('filter', `url(#glow-${weatherId})`);
        circle.classList.add('weather-alert-circle');
        circle.setAttribute('data-airport', weatherData.airport);
        circle.setAttribute('data-condition', weatherData.condition);
        
        // Make interactive
        circle.style.cursor = 'pointer';
        circle.style.pointerEvents = 'all';
        
        // Apply initial state for animation
        circle.style.opacity = '0';
        circle.style.transform = 'scale(0)';
        circle.style.transformOrigin = `${position.x}px ${position.y}px`;
        circle.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.17, 0.67, 0.43, 1.64)';
        
        // Don't show if not in active filters
        if (!activeFilters[weatherData.condition]) {
            circle.style.display = 'none';
        }
        
        // Add to SVG
        svgContainer.appendChild(circle);
        
        // Add event listeners
        circle.addEventListener('mouseenter', function(e) {
            // Highlight effect
            this.setAttribute('r', '22');
            this.setAttribute('stroke-width', '3');
            
            // Highlight airport
            highlightAirport(weatherData.airport);
            
            // Show popup
            showWeatherInfoPopup(weatherData, e);
        });
        
        circle.addEventListener('mouseleave', function() {
            // Remove highlight
            this.setAttribute('r', '18');
            this.setAttribute('stroke-width', '2');
            
            // Reset airports
            resetAirportHighlights();
            
            // Hide popup
            hideWeatherInfoPopup();
        });
        
        circle.addEventListener('mousemove', function(e) {
            // Update popup position
            updatePopupPosition(e);
        });
    }
    
    // ------------ Enhanced Weather Info Popup Functions ------------
    
    // Create weather info popup with improved styling
    function createWeatherInfoPopup() {
        // Check if popup already exists
        const existingPopup = document.querySelector('.weather-info-popup');
        if (existingPopup) existingPopup.remove();
        
        // Add custom styles
        addCustomPopupStyles();
        
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'weather-info-popup';
        popup.style.zIndex = '10000'; // Very high z-index
        document.body.appendChild(popup);
        
        console.log('Weather info popup created and styled');
    }
    
    // Show weather information popup with local time
    function showWeatherInfoPopup(weatherData, event) {
        const popup = document.querySelector('.weather-info-popup');
        if (!popup || !weatherData) return;
        
        // Get emoji for the weather condition
        const weatherIcon = getWeatherIconForCondition(weatherData.condition);
        
        // Get cached local time for the airport or fallback to current calculation
        const localTime = airportTimesCache[weatherData.airport] || getTimeWithOffset(weatherData.airport);
        
        // Create a wind direction arrow
        const windArrow = getWindDirectionArrow(weatherData.windDirection);
        
        // Create popup content with styled status badge, dynamic icon, and wind direction arrow
        popup.innerHTML = `
            <div class="weather-info-title">
                ${weatherIcon} ${weatherData.airport}
                <span class="local-time">${localTime}</span>
            </div>
            <div class="weather-info-row">
                <span class="weather-info-label">Condition:</span>
                <span class="weather-info-value">
                    <span class="weather-info-status status-${weatherData.condition}">${weatherData.condition}</span>
                </span>
            </div>
            <div class="weather-info-row">
                <span class="weather-info-label">Temperature:</span>
                <span class="weather-info-value">${weatherData.temperature === "N/A" ? "N/A" : `${weatherData.temperature}°C`}</span>
            </div>
            <div class="weather-info-row">
                <span class="weather-info-label">Wind:</span>
                <span class="weather-info-value">
                    ${weatherData.windSpeed === "N/A" ? "N/A" : `${weatherData.windSpeed} km/h`} 
                    <span class="wind-direction-container">
                        <span class="wind-direction-text">${weatherData.windDirection}</span>
                        <span class="wind-direction-arrow" aria-hidden="true">${windArrow}</span>
                    </span>
                </span>
            </div>
            <div class="weather-info-row">
                <span class="weather-info-label">Humidity:</span>
                <span class="weather-info-value">${weatherData.humidity === "N/A" ? "N/A" : `${weatherData.humidity}%`}</span>
            </div>
            <div class="weather-info-row">
                <span class="weather-info-label">Visibility:</span>
                <span class="weather-info-value">${weatherData.visibility}</span>
            </div>
        `;
        
        // Position and show popup
        updatePopupPosition(event);
        popup.classList.add('visible');
    }

    function getWindDirectionArrow(direction) {
        // These arrows point in the opposite direction of the wind label
        // because wind direction is reported as the direction FROM which the wind originates
        switch(direction) {
            case "N": return "↑"; // Wind FROM North, arrow points North
            case "NE": return "↗"; // Wind FROM Northeast, arrow points Northeast
            case "E": return "→"; // Wind FROM East, arrow points East
            case "SE": return "↘"; // Wind FROM Southeast, arrow points Southeast
            case "S": return "↓"; // Wind FROM South, arrow points South
            case "SW": return "↙"; // Wind FROM Southwest, arrow points Southwest
            case "W": return "←"; // Wind FROM West, arrow points West
            case "NW": return "↖"; // Wind FROM Northwest, arrow points Northwest
            default: return "•"; // For undefined directions
        }
    }
    
    // Helper function to get weather emoji based on condition
    function getWeatherIconForCondition(condition) {
        switch(condition) {
            case "Clear":
                return "☀️";
            case "Cloudy":
                return "☁️";
            case "Rain":
                return "🌧️";
            case "Lightning":
                return "⚡️";
            case "Snow":
                return "❄️";
            case "Storm":
                return "🌪️";
            default:
                return "🌡️";
        }
    }
    
    // Update popup position based on mouse coordinates
    function updatePopupPosition(event) {
        const popup = document.querySelector('.weather-info-popup');
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
    
    // Hide weather information popup
    function hideWeatherInfoPopup() {
        const popup = document.querySelector('.weather-info-popup');
        if (popup) {
            popup.classList.remove('visible');
        }
    }
    
    // Highlight airport affected by weather
    function highlightAirport(airportCode) {
        // Find airport point
        const airportPoint = document.querySelector(`.airport-point[data-code="${airportCode}"]`);
        
        // Add highlight class
        if (airportPoint) airportPoint.classList.add('has-active-weather');
    }
    
    // Reset airport highlights
    function resetAirportHighlights() {
        const highlightedPoints = document.querySelectorAll('.airport-point.has-active-weather');
        highlightedPoints.forEach(point => {
            point.classList.remove('has-active-weather');
        });
    }
    
    // Enable global hover handling for paths
    function enableGlobalHoverHandling() {
        const mapContainer = document.querySelector('#weatherAlertsPopup .map-container');
        if (!mapContainer) return;
        
        // Add global hover detection for all weather circles
        const weatherCircles = document.querySelectorAll('.weather-alert-circle');
        
        weatherCircles.forEach(circle => {
            // Ensure event listeners are correctly attached
            if (circle._hasHoverEvents) return;
            
            circle._hasHoverEvents = true;
            
            circle.addEventListener('mouseenter', function(e) {
                const condition = this.getAttribute('data-condition');
                if (!activeFilters[condition]) return;
                
                const airport = this.getAttribute('data-airport');
                
                // Highlight effect
                this.setAttribute('r', '22');
                this.setAttribute('stroke-width', '3');
                
                // Highlight airport
                highlightAirport(airport);
                
                // Get weather data from cache or circle attributes
                let weatherData = weatherDataCache[airport];
                
                if (!weatherData) {
                    // Create basic data from attributes
                    weatherData = {
                        airport: airport,
                        condition: condition,
                        temperature: "N/A",
                        windSpeed: "N/A",
                        windDirection: "N/A",
                        humidity: "N/A",
                        visibility: "N/A"
                    };
                }
                
                // Show popup
                showWeatherInfoPopup(weatherData, e);
            });
            
            circle.addEventListener('mouseleave', function() {
                // Reset circle
                this.setAttribute('r', '18');
                this.setAttribute('stroke-width', '2');
                
                // Reset airport highlight
                resetAirportHighlights();
                
                // Hide popup
                hideWeatherInfoPopup();
            });
            
            circle.addEventListener('mousemove', function(e) {
                // Update popup position
                updatePopupPosition(e);
            });
        });
        
        console.log("Global hover handling enabled for all weather alerts");
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
    
    // Initialize if popup is already open
    if (document.querySelector('#weatherAlertsPopup.active')) {
        setTimeout(initializeWeatherMap, 300);
    }
});