// FlightUtils.js - Utility functions for flight management
// Contains data models for aircraft, destinations, and helper functions

/**
 * Define airport data with IATA codes and distances from Tel Aviv (TLV)
 * Distances are in kilometers, calculated based on great circle distance
 */
const AIRPORTS = {
    // Tel Aviv (Base airport)
    'TLV': {
        code: 'TLV',
        name: 'Ben Gurion International',
        city: 'Tel Aviv',
        country: 'Israel',
    },
    
    // International destinations
    'JFK': {
        code: 'JFK',
        name: 'John F. Kennedy International',
        city: 'New York',
        country: 'USA',
        distanceFromTLV: 9037, // in kilometers
        flightTimeHours: 12.5 // approx flight time in hours
    },
    'LHR': {
        code: 'LHR',
        name: 'Heathrow',
        city: 'London',
        country: 'UK',
        distanceFromTLV: 3582,
        flightTimeHours: 5.0
    },
    'CDG': {
        code: 'CDG',
        name: 'Charles de Gaulle',
        city: 'Paris',
        country: 'France',
        distanceFromTLV: 3307,
        flightTimeHours: 4.5
    },
    'DXB': {
        code: 'DXB',
        name: 'Dubai International',
        city: 'Dubai',
        country: 'UAE',
        distanceFromTLV: 1923,
        flightTimeHours: 3.0
    },
    'SIN': {
        code: 'SIN',
        name: 'Changi',
        city: 'Singapore',
        country: 'Singapore',
        distanceFromTLV: 8038,
        flightTimeHours: 11.0
    },
    'HND': {
        code: 'HND',
        name: 'Haneda',
        city: 'Tokyo',
        country: 'Japan',
        distanceFromTLV: 9302,
        flightTimeHours: 12.0
    },
    'SYD': {
        code: 'SYD',
        name: 'Kingsford Smith',
        city: 'Sydney',
        country: 'Australia',
        distanceFromTLV: 13876,
        flightTimeHours: 18.0
    },
    'GRU': {
        code: 'GRU',
        name: 'Guarulhos',
        city: 'São Paulo',
        country: 'Brazil',
        distanceFromTLV: 11893,
        flightTimeHours: 15.0
    },
    'CPT': {
        code: 'CPT',
        name: 'Cape Town International',
        city: 'Cape Town',
        country: 'South Africa',
        distanceFromTLV: 7427,
        flightTimeHours: 10.0
    },
    'EZE': {
        code: 'EZE',
        name: 'Ezeiza',
        city: 'Buenos Aires',
        country: 'Argentina',
        distanceFromTLV: 12233,
        flightTimeHours: 16.0
    },
    'LAX': {
        code: 'LAX',
        name: 'Los Angeles International',
        city: 'Los Angeles',
        country: 'USA',
        distanceFromTLV: 12276,
        flightTimeHours: 16.0
    },
    'SVO': {
        code: 'SVO',
        name: 'Sheremetyevo',
        city: 'Moscow',
        country: 'Russia',
        distanceFromTLV: 2624,
        flightTimeHours: 3.5
    },
    'BKK': {
        code: 'BKK',
        name: 'Suvarnabhumi',
        city: 'Bangkok',
        country: 'Thailand',
        distanceFromTLV: 7164,
        flightTimeHours: 9.5
    },
    'MEX': {
        code: 'MEX',
        name: 'Benito Juárez',
        city: 'Mexico City',
        country: 'Mexico',
        distanceFromTLV: 12217,
        flightTimeHours: 16.0
    }
};

/**
 * Aircraft models with specifications
 * - Range: Maximum flight distance in kilometers
 * - Seating configurations: Fixed for each aircraft type
 */
const AIRCRAFT = {
    'B737': {
        model: 'Boeing 737-800',
        code: 'B737',
        range: 5500, // Maximum range in kilometers
        seats: {
            economy: 144,
            business: 16,
            firstClass: 0 // No first class in this aircraft
        },
        totalSeats: 160
    },
    'B787': {
        model: 'Boeing 787-9 Dreamliner',
        code: 'B787',
        range: 14000,
        seats: {
            economy: 198,
            business: 30,
            firstClass: 8
        },
        totalSeats: 236
    },
    'A320': {
        model: 'Airbus A320neo',
        code: 'A320',
        range: 6300,
        seats: {
            economy: 140,
            business: 20,
            firstClass: 0
        },
        totalSeats: 160
    },
    'A350': {
        model: 'Airbus A350-900',
        code: 'A350',
        range: 15000,
        seats: {
            economy: 210,
            business: 36,
            firstClass: 12
        },
        totalSeats: 258
    },
    'B777': {
        model: 'Boeing 777-300ER',
        code: 'B777',
        range: 13650,
        seats: {
            economy: 232,
            business: 42,
            firstClass: 14
        },
        totalSeats: 288
    },
    'A321': {
        model: 'Airbus A321neo',
        code: 'A321',
        range: 7400,
        seats: {
            economy: 170,
            business: 20,
            firstClass: 0
        },
        totalSeats: 190
    },
    'B747': {
        model: 'Boeing 747-8',
        code: 'B747',
        range: 14320,
        seats: {
            economy: 276,
            business: 54,
            firstClass: 20
        },
        totalSeats: 350
    },
    'A330': {
        model: 'Airbus A330-300',
        code: 'A330',
        range: 11300,
        seats: {
            economy: 210,
            business: 28,
            firstClass: 0
        },
        totalSeats: 238
    }
};

/**
 * Validates if an aircraft can operate a specific route based on range
 * @param {string} aircraftCode - The aircraft code (e.g., 'B737')
 * @param {string} destinationCode - The destination airport code (e.g., 'JFK')
 * @returns {Object} - Validation result with isValid and message properties
 */
function validateAircraftRange(aircraftCode, destinationCode) {
    if (!AIRCRAFT[aircraftCode]) {
        return {
            isValid: false,
            message: `Aircraft model ${aircraftCode} not found in database`
        };
    }
    
    if (destinationCode === 'TLV') {
        return { isValid: true, message: '' };
    }
    
    if (!AIRPORTS[destinationCode]) {
        return {
            isValid: false,
            message: `Destination airport ${destinationCode} not found in database`
        };
    }
    
    const aircraft = AIRCRAFT[aircraftCode];
    const destination = AIRPORTS[destinationCode];
    
    if (destination.distanceFromTLV > aircraft.range) {
        return {
            isValid: false,
            message: `${aircraft.model} cannot fly to ${destination.city} due to range limitations (${destination.distanceFromTLV} km, maximum range: ${aircraft.range} km)`
        };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Calculates estimated arrival time based on departure time and flight duration
 * @param {string} departureTimeStr - ISO format departure time
 * @param {string} destinationCode - Destination airport code
 * @returns {string} - ISO format estimated arrival time
 */
function calculateArrivalTime(departureTimeStr, destinationCode) {
    if (!departureTimeStr || destinationCode === 'TLV') {
        return departureTimeStr; // Return the same time if no data or destination is TLV
    }
    
    try {
        const departureTime = new Date(departureTimeStr);
        const destination = AIRPORTS[destinationCode];
        
        if (!destination) {
            console.error(`Destination ${destinationCode} not found in airport database`);
            return departureTimeStr;
        }
        
        // Calculate flight duration in milliseconds
        const flightDurationMs = destination.flightTimeHours * 60 * 60 * 1000;
        
        // Calculate arrival time
        const arrivalTime = new Date(departureTime.getTime() + flightDurationMs);
        
        // Return in ISO format (YYYY-MM-DDTHH:MM)
        return arrivalTime.toISOString().substring(0, 16);
    } catch (error) {
        console.error('Error calculating arrival time:', error);
        return departureTimeStr;
    }
}

/**
 * Gets fixed seating configuration for a specific aircraft
 * @param {string} aircraftCode - The aircraft code
 * @returns {Object} - Seating configuration and validation status
 */
function getAircraftSeating(aircraftCode) {
    if (!AIRCRAFT[aircraftCode]) {
        return {
            isValid: false,
            message: `Aircraft model ${aircraftCode} not found`,
            seats: {
                economy: 0,
                business: 0,
                firstClass: 0,
                total: 0
            }
        };
    }
    
    const aircraft = AIRCRAFT[aircraftCode];
    
    return {
        isValid: true,
        seats: {
            economy: aircraft.seats.economy,
            business: aircraft.seats.business,
            firstClass: aircraft.seats.firstClass,
            total: aircraft.totalSeats
        }
    };
}

/**
 * Formats a flight number according to AeroWay standards (AW#### format)
 * @param {string} input - Raw input value for flight number
 * @returns {string} - Formatted flight number
 */
function formatFlightNumber(input) {
    if (!input) return '';
    
    // Make sure it starts with AW (capitalize if needed)
    let formatted = input.toUpperCase();
    
    // If it doesn't start with AW, add it
    if (!formatted.startsWith('AW')) {
        formatted = 'AW' + formatted.replace(/^[A-Z]*/, '');
    }
    
    // Extract digits after AW
    const digits = formatted.substring(2).replace(/\D/g, '');
    
    // Pad to 4 digits with leading zeros
    const paddedDigits = digits.padStart(4, '0').substring(0, 4);
    
    return 'AW' + paddedDigits;
}

/**
 * Gets airport full information based on IATA code
 * @param {string} code - IATA airport code
 * @returns {Object|null} - Airport information or null if not found
 */
function getAirportInfo(code) {
    return AIRPORTS[code] || null;
}

/**
 * Gets aircraft full information based on code
 * @param {string} code - Aircraft code
 * @returns {Object|null} - Aircraft information or null if not found
 */
function getAircraftInfo(code) {
    return AIRCRAFT[code] || null;
}

/**
 * Gets list of destination airports with full details
 * @returns {Array} - List of destination airports
 */
function getDestinationList() {
    return Object.values(AIRPORTS).filter(airport => airport.code !== 'TLV');
}

/**
 * Gets list of aircraft types with full details
 * @returns {Array} - List of aircraft types
 */
function getAircraftList() {
    return Object.values(AIRCRAFT);
}

// Export functions and constants
window.FlightUtils = {
    AIRPORTS,
    AIRCRAFT,
    validateAircraftRange,
    calculateArrivalTime,
    getAircraftSeating,
    formatFlightNumber,
    getAirportInfo,
    getAircraftInfo,
    getDestinationList,
    getAircraftList
};