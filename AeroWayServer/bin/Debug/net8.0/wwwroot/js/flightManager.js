// נתוני מטוסים - מספר מושבים ומחירי בסיס
const aircraftData = {
    // Boeing
    '737': { maxPassengers: 180, priceMultiplier: 1.0 },
    '747': { maxPassengers: 410, priceMultiplier: 1.3 },
    '757': { maxPassengers: 220, priceMultiplier: 1.1 },
    '767': { maxPassengers: 290, priceMultiplier: 1.15 },
    '777': { maxPassengers: 368, priceMultiplier: 1.25 },
    '787': { maxPassengers: 330, priceMultiplier: 1.2 },
    
    // Airbus
    '319': { maxPassengers: 140, priceMultiplier: 0.95 },
    '320': { maxPassengers: 150, priceMultiplier: 1.0 },
    '321': { maxPassengers: 200, priceMultiplier: 1.05 },
    '330': { maxPassengers: 260, priceMultiplier: 1.15 },
    '340': { maxPassengers: 320, priceMultiplier: 1.2 },
    '350': { maxPassengers: 350, priceMultiplier: 1.25 },
    '380': { maxPassengers: 525, priceMultiplier: 1.35 }
};

// מחירי בסיס מציאותיים יותר לפי מרחק
const ROUTES_PRICING = {
    // טיסות פנימיות
    'DOMESTIC': 150, // מחיר בסיס לשעת טיסה פנימית
    
    // טיסות קצרות (אירופה, מזרח תיכון)
    'SHORT': 200, // מחיר בסיס לשעת טיסה קצרה
    
    // טיסות בינוניות (טרנס-אטלנטיות)
    'MEDIUM': 300, // מחיר בסיס לשעת טיסה בינונית
    
    // טיסות ארוכות (בין-יבשתיות, טרנס-פסיפיות)
    'LONG': 400  // מחיר בסיס לשעת טיסה ארוכה
};

// יעדים מוכרים וקטגוריות מרחק שלהם
const DESTINATIONS = {
    // ישראל כמקור
    'TLV': {
        // יעדים פנימיים
        'ETH': 'DOMESTIC', // אילת
        'HFA': 'DOMESTIC', // חיפה
        
        // יעדים קצרים (מזרח תיכון ואירופה)
        'ATH': 'SHORT', // אתונה
        'IST': 'SHORT', // איסטנבול
        'AMS': 'SHORT', // אמסטרדם
        'CDG': 'SHORT', // פריז
        'FCO': 'SHORT', // רומא
        'LHR': 'SHORT', // לונדון
        'MAD': 'SHORT', // מדריד
        'VIE': 'SHORT', // וינה
        'ZRH': 'SHORT', // ציריך
        
        // יעדים בינוניים
        'JFK': 'MEDIUM', // ניו יורק
        'EWR': 'MEDIUM', // ניוארק
        'LAX': 'MEDIUM', // לוס אנג'לס
        'YYZ': 'MEDIUM', // טורונטו
        
        // יעדים רחוקים
        'BKK': 'LONG', // בנגקוק
        'HND': 'LONG', // טוקיו
        'SYD': 'LONG', // סידני
        'MEL': 'LONG', // מלבורן
        'HKG': 'LONG'  // הונג קונג
    }
};

// פונקציה להחלת ערכת נושא
function applyTheme(theme) {
    const root = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}

// החלפת ערכת נושא
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dashboard-theme', newTheme);
    applyTheme(newTheme);
}

// רענון אוטומטי
let isAutoRefresh = true;
let refreshInterval = setInterval(() => { location.reload(); }, 300000);

function toggleRefresh() {
    const statusBadge = document.getElementById('refreshStatus');
    const statusIcon = statusBadge.querySelector('.status-icon');
    const statusText = statusBadge.querySelector('.status-text');

    if (isAutoRefresh) {
        clearInterval(refreshInterval);
        statusIcon.textContent = '⏸️';
        statusText.textContent = 'Refresh Paused';
        statusBadge.classList.remove('status-active');
        statusBadge.classList.add('status-paused');
        isAutoRefresh = false;
    } else {
        refreshInterval = setInterval(() => { location.reload(); }, 300000);
        statusIcon.textContent = '🔄';
        statusText.textContent = 'Auto Refresh';
        statusBadge.classList.remove('status-paused');
        statusBadge.classList.add('status-active');
        isAutoRefresh = true;
    }
}

// אתחול בטעינת הדף
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
    applyTheme(savedTheme);

    const inputs = document.querySelectorAll('.form-input');

    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                
                // אם זה השדה האחרון, שלח את הטופס
                if (index === inputs.length - 1) {
                    document.getElementById('flightForm').dispatchEvent(new Event('submit'));
                } else {
                    // עבור לשדה הבא
                    inputs[index + 1].focus();
                }
            }
        });
    });

    // עדכון אוטומטי של נתוני המטוס
    const aircraftTypeInput = document.querySelector('input[name="aircraftType"]');
    if (aircraftTypeInput) {
        aircraftTypeInput.addEventListener('change', function() {
            updateAircraftData();
            calculateTicketPrice();
        });
    }

    // עדכון בעת שינוי זמן המראה או משך טיסה
    const departureTimeInput = document.querySelector('input[name="departureTime"]');
    if (departureTimeInput) {
        departureTimeInput.addEventListener('change', function() {
            calculateArrivalTime();
            calculateTicketPrice();
        });
    }

    const flightDurationInput = document.querySelector('input[name="flightDuration"]');
    if (flightDurationInput) {
        flightDurationInput.addEventListener('change', function() {
            calculateArrivalTime();
            calculateTicketPrice();
        });
    }
});

// חישוב שעת הגעה
function calculateArrivalTime() {
    const departureTime = document.querySelector('input[name="departureTime"]').value;
    const flightDuration = document.querySelector('input[name="flightDuration"]').value;
    const arrivalTimeInput = document.querySelector('input[name="arrivalTime"]');
    
    if (!departureTime || !flightDuration) {
        arrivalTimeInput.value = '';
        return;
    }
    
    // פירוק משך הטיסה לשעות ודקות
    const [hours, minutes] = flightDuration.split(':').map(Number);
    const durationMinutes = hours * 60 + minutes;
    
    // חישוב זמן הגעה
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(departureDate.getTime() + durationMinutes * 60000);
    
    // פורמט לתצוגה
    const formattedArrival = formatDate(arrivalDate);
    arrivalTimeInput.value = formattedArrival;
}

// פורמט תאריך לתצוגה
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// עדכון נתוני המטוס
function updateAircraftData() {
    const aircraftType = document.querySelector('input[name="aircraftType"]').value;
    const maxPassengersInput = document.querySelector('input[name="maxPassengers"]');
    const availableSeatsInput = document.querySelector('input[name="availableSeats"]');
    
    if (aircraftData[aircraftType]) {
        maxPassengersInput.value = aircraftData[aircraftType].maxPassengers;
        availableSeatsInput.value = aircraftData[aircraftType].maxPassengers; // בהתחלה כל המושבים פנויים
        
        // עדכון מחיר אם יש זמני טיסה
        calculateTicketPrice();
    } else {
        maxPassengersInput.value = '';
        availableSeatsInput.value = '';
        document.querySelector('input[name="ticketPrice"]').value = '';
    }
}

// חישוב מחיר כרטיס מציאותי
function calculateTicketPrice() {
    const aircraftType = document.querySelector('input[name="aircraftType"]').value;
    const flightDuration = document.querySelector('input[name="flightDuration"]').value;
    const origin = document.querySelector('input[name="origin"]').value;
    const destination = document.querySelector('input[name="destination"]').value;
    const ticketPriceInput = document.querySelector('input[name="ticketPrice"]');
    
    if (!aircraftData[aircraftType] || !flightDuration || !origin || !destination) {
        ticketPriceInput.value = '';
        return;
    }
    
    // פירוק משך הטיסה לשעות ודקות
    const [hours, minutes] = flightDuration.split(':').map(Number);
    const durationHours = hours + (minutes / 60);
    
    // קביעת קטגורית המרחק
    let routeCategory = 'MEDIUM'; // ברירת מחדל
    
    // בדיקה בטבלת היעדים המוכרים
    if (DESTINATIONS[origin] && DESTINATIONS[origin][destination]) {
        routeCategory = DESTINATIONS[origin][destination];
    } else if (origin === destination) {
        routeCategory = 'DOMESTIC';
    } else if (durationHours <= 2) {
        routeCategory = 'DOMESTIC';
    } else if (durationHours <= 5) {
        routeCategory = 'SHORT';
    } else if (durationHours <= 10) {
        routeCategory = 'MEDIUM';
    } else {
        routeCategory = 'LONG';
    }
    
    // חישוב מחיר בסיס לפי קטגוריה
    let basePrice = ROUTES_PRICING[routeCategory] * durationHours;
    
    // הכפלה במקדם המחיר של סוג המטוס
    basePrice *= aircraftData[aircraftType].priceMultiplier;
    
    // תוספות מיוחדות
    if (routeCategory === 'LONG') {
        // טיסות ארוכות יש להן תוספת נוחות
        basePrice *= 1.2;
    }
    
    // עונתיות - תוספת עונתית לפי חודש
    const departureDate = new Date(document.querySelector('input[name="departureTime"]').value);
    const month = departureDate.getMonth() + 1; // חודש 1-12
    
    // עונות שיא (חגים, קיץ)
    if ([6, 7, 8, 12].includes(month)) {
        basePrice *= 1.25; // תוספת 25% בעונת שיא
    }
    
    // עיגול לדולרים שלמים
    const finalPrice = Math.round(basePrice);
    ticketPriceInput.value = finalPrice;
}

// פונקציות ולידציה
function validateFlightNumber(input) {
    const value = input.value.toUpperCase();
    input.value = value;
    const errorElement = input.nextElementSibling;
    
    const regex = /^[A-Z]{2,3}[0-9]{1,4}$/;
    
    if (!regex.test(value)) {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
        errorElement.textContent = 'Flight number must be 2-3 letters followed by 1-4 numbers (e.g., LY315)';
        input.setCustomValidity('Invalid flight number');
        return false;
    }
    
    input.classList.remove('invalid');
    errorElement.style.display = 'none';
    input.setCustomValidity('');
    return true;
}

function validateAircraftType(input) {
    const value = input.value;
    const errorElement = input.nextElementSibling;
    
    // בדיקה אם מספר התווים נכון (3 מספרים)
    const regex = /^[0-9]{3}$/;
    
    if (!regex.test(value)) {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
        errorElement.textContent = 'Aircraft type must be exactly 3 numbers (e.g., 737)';
        input.setCustomValidity('Invalid aircraft type format');
        return false;
    }
    
    // בדיקה אם סוג המטוס מותר
    if (!aircraftData[value]) {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
        errorElement.textContent = 'Invalid aircraft type. Allowed Boeing types: 737, 747, 757, 767, 777, 787. Allowed Airbus types: 319, 320, 321, 330, 340, 350, 380';
        input.setCustomValidity('Invalid aircraft type');
        return false;
    }
    
    // הכל תקין
    input.classList.remove('invalid');
    errorElement.style.display = 'none';
    input.setCustomValidity('');
    
    // עדכון נתוני המטוס
    updateAircraftData();
    return true;
}

function validateIATACode(input) {
    const value = input.value.toUpperCase();
    input.value = value;
    const errorElement = input.nextElementSibling;
    
    const regex = /^[A-Z]{3}$/;
    
    if (!regex.test(value)) {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
        errorElement.textContent = 'Must be exactly 3 uppercase letters (e.g., TLV, JFK)';
        input.setCustomValidity('Invalid IATA code');
        return false;
    }
    
    input.classList.remove('invalid');
    errorElement.style.display = 'none';
    input.setCustomValidity('');
    return true;
}

function validateDepartureTime(input) {
    const selectedTime = new Date(input.value);
    const now = new Date();
    const errorElement = input.nextElementSibling;
    
    if (selectedTime < now) {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
        errorElement.textContent = 'Departure time cannot be in the past';
        input.setCustomValidity('Invalid departure time');
        return false;
    }
    
    input.classList.remove('invalid');
    errorElement.style.display = 'none';
    input.setCustomValidity('');
    
    // עדכון שעת הגעה
    calculateArrivalTime();
    return true;
}

function validateFlightDuration(input) {
    const value = input.value;
    const errorElement = input.nextElementSibling;
    
    // בדיקת פורמט שעה:דקה
    const regex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!regex.test(value)) {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
        errorElement.textContent = 'Flight duration must be in format hh:mm (e.g., 02:30)';
        input.setCustomValidity('Invalid flight duration format');
        return false;
    }
    
    // בדיקה שמשך הטיסה חיובי
    const [hours, minutes] = value.split(':').map(Number);
    if (hours === 0 && minutes === 0) {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
        errorElement.textContent = 'Flight duration must be greater than 00:00';
        input.setCustomValidity('Flight duration must be greater than zero');
        return false;
    }
    
    // בדיקת סבירות (לא יותר מ-24 שעות)
    if (hours >= 24) {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
        errorElement.textContent = 'Flight duration cannot exceed 23:59';
        input.setCustomValidity('Flight duration too long');
        return false;
    }
    
    // הכל תקין
    input.classList.remove('invalid');
    errorElement.style.display = 'none';
    input.setCustomValidity('');
    
    // חישוב שעת הגעה
    calculateArrivalTime();
    return true;
}

function validateGate(input) {
    const value = input.value.toUpperCase();
    input.value = value;
    const errorElement = input.nextElementSibling;
    
    // בדיקת פורמט - אות אחת ואחריה 1-3 מספרים
    const regex = /^[A-Z][0-9]{1,3}$/;
    
    if (!regex.test(value)) {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
        errorElement.textContent = 'Gate must be a letter followed by 1-3 numbers (e.g., B7)';
        input.setCustomValidity('Invalid gate format');
        return false;
    }
    
    // הכל תקין
    input.classList.remove('invalid');
    errorElement.style.display = 'none';
    input.setCustomValidity('');
    return true;
}

// ולידציה כללית של שדה
function validateField(input, validationFunction) {
    if (input.value.trim() !== '') {
        return validationFunction(input);
    } else {
        const errorElement = input.nextElementSibling;
        input.classList.remove('invalid');
        errorElement.style.display = 'none';
        input.setCustomValidity('');
        return true;
    }
}

// פונקציה לשליחת טופס יצירת טיסה חדשה
async function submitFlight(event) {
    event.preventDefault();
    
    // בדיקה שכל השדות תקינים
    const form = event.target;
    const inputs = form.querySelectorAll('.form-input');
    let isValid = true;
    
    inputs.forEach(input => {
        // דילוג על שדות חישוב אוטומטי
        if (input.readOnly) return;
        
        const validationFunction = getValidationFunction(input.name);
        if (validationFunction && !validateField(input, validationFunction)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showErrorMessage('Please fix the errors in the form.');
        return;
    }
    
    // איסוף הנתונים מהטופס
    const formData = new FormData(form);
    
    // הכנת האובייקט לשליחה לשרת
    const flightData = {
        FlightNumber: formData.get('flightNumber').toUpperCase(),
        Origin: formData.get('origin').toUpperCase(),
        Destination: formData.get('destination').toUpperCase(),
        DepartureTime: new Date(formData.get('departureTime')).toISOString(),
        ArrivalTime: parseArrivalTime(formData.get('arrivalTime')),
        GateBoarding: formData.get('gate').toUpperCase(),
        Status: 'Scheduled',
        TicketPrice: parseFloat(formData.get('ticketPrice')),
        AircraftType: formData.get('aircraftType'),
        MaxPassengers: parseInt(formData.get('maxPassengers')),
        AvailableSeats: parseInt(formData.get('availableSeats'))
    };

    try {
        // שליחת הנתונים לשרת (כאן נשתמש בנתיב מיוחד שמוסיף את הטיסה לדאטה-בייס)
        const response = await fetch('/api/flights/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flightData)
        });

        if (response.ok) {
            showSuccessMessage('Flight successfully published!');
            form.reset();
            
            // רענון העמוד לאחר הצלחה כדי להציג את הטיסה החדשה
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to publish flight');
        }
    } catch (error) {
        showErrorMessage('Error: ' + error.message);
    }
}

// עזרה בפענוח זמן הגעה
function parseArrivalTime(arrivalTimeStr) {
    const [datePart, timePart] = arrivalTimeStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    
    // בניית אובייקט תאריך
    const arrivalDate = new Date(year, month - 1, day, hours, minutes);
    return arrivalDate.toISOString();
}

// בחירת פונקציית ולידציה לפי שם השדה
function getValidationFunction(fieldName) {
    switch (fieldName) {
        case 'flightNumber': return validateFlightNumber;
        case 'aircraftType': return validateAircraftType;
        case 'origin': 
        case 'destination': return validateIATACode;
        case 'departureTime': return validateDepartureTime;
        case 'flightDuration': return validateFlightDuration;
        case 'gate': return validateGate;
        default: return null;
    }
}

// הצגת הודעת הצלחה
function showSuccessMessage(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = '✅ ' + message;
    successDiv.style.display = 'flex';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

// הצגת הודעת שגיאה
function showErrorMessage(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// פונקציה לסינון הטיסות בטבלה
function filterFlights() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toUpperCase();
    const tbody = document.getElementById('flightTableBody');
    const rows = tbody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        let visible = false;
        const cells = rows[i].getElementsByTagName('td');
        
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent || cells[j].innerText;
            if (cellText.toUpperCase().indexOf(filter) > -1) {
                visible = true;
                break;
            }
        }
        
        rows[i].style.display = visible ? '' : 'none';
    }
}

// פונקציה לעדכון סטטוס טיסה
async function updateFlightStatus(flightId, newStatus) {
    try {
        const response = await fetch(`/api/flights/${flightId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showSuccessMessage(`Status updated to ${newStatus}`);
            
            // עדכון הצבע של תא הסטטוס
            const row = document.querySelector(`tr[data-id="${flightId}"]`);
            if (row) {
                const statusCell = row.cells[6]; // תא הסטטוס הוא ה-7
                statusCell.className = ''; // ניקוי כל הקלאסים
                statusCell.classList.add(`status-${newStatus.toLowerCase()}`);
                statusCell.textContent = newStatus;
            }
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status');
        }
    } catch (error) {
        showErrorMessage('Error: ' + error.message);
    }
}

// פונקציה למחיקת טיסה
async function deleteFlight(flightId) {
    if (!confirm('Are you sure you want to delete this flight?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/flights/${flightId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showSuccessMessage('Flight deleted successfully');
            
            // הסרת השורה מהטבלה
            const row = document.querySelector(`tr[data-id="${flightId}"]`);
            if (row) {
                row.remove();
            }
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete flight');
        }
    } catch (error) {
        showErrorMessage('Error: ' + error.message);
    }
}

// פונקציה לעריכת טיסה
function editFlight(flightId) {
    // כאן אפשר להוסיף לוגיקה לפתיחת חלון עריכה או מעבר לדף עריכה
    window.location.href = `/flights/edit/${flightId}`;
}