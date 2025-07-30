function copyReference(reference) {
    const button = event.target.closest('.copy-btn');
    navigator.clipboard.writeText(reference).then(function() {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = '#10b981';
        button.style.color = 'white';
        button.style.borderColor = '#10b981';
        
        setTimeout(function() {
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.color = '';
            button.style.borderColor = '';
        }, 2000);
    });
}

class BookingReceiptConfirmation {
    constructor(bookingData) {
        this.booking = bookingData;
        this.vatRate = 0.18;
        this.receiptContainer = null;
    }

    generateReceiptNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `AW${this.booking.BookingId}${year}${month}${day}${random}`;
    }

    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    getCurrentDate() {
        const now = new Date();
        return {
            full: now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour12: false }),
            date: now.toLocaleDateString('en-GB'),
            time: now.toLocaleTimeString('en-GB', { hour12: false })
        };
    }

    calculateServiceDetails() {
        const totalPassengers = Math.max(1, (this.booking.Adults + this.booking.Children));
        let totalPriceWithVAT = parseFloat(this.booking.TotalPrice);
        
        if (typeof this.booking.TotalPrice === 'string') {
            totalPriceWithVAT = parseFloat(this.booking.TotalPrice.replace(/[^\d.]/g, '')) || 0;
        }
        
        const totalPriceExclVAT = totalPriceWithVAT / (1 + this.vatRate);
        const totalVATAmount = totalPriceWithVAT - totalPriceExclVAT;
        
        const basePriceExclVAT = totalPriceExclVAT / totalPassengers;
        const baseVATAmount = totalVATAmount / totalPassengers;
        const basePriceInclVAT = basePriceExclVAT + baseVATAmount;
        
        return {
            adults: {
                qty: this.booking.Adults,
                priceExclVAT: basePriceExclVAT,
                vatAmount: baseVATAmount,
                priceInclVAT: basePriceInclVAT,
                totalExclVAT: basePriceExclVAT * this.booking.Adults,
                totalVAT: baseVATAmount * this.booking.Adults,
                totalInclVAT: basePriceInclVAT * this.booking.Adults
            },
            children: {
                qty: this.booking.Children,
                priceExclVAT: basePriceExclVAT,
                vatAmount: baseVATAmount,
                priceInclVAT: basePriceInclVAT,
                totalExclVAT: basePriceExclVAT * this.booking.Children,
                totalVAT: baseVATAmount * this.booking.Children,
                totalInclVAT: basePriceInclVAT * this.booking.Children
            },
            totals: {
                subtotalExclVAT: totalPriceExclVAT,
                totalVAT: totalVATAmount,
                grandTotal: totalPriceWithVAT
            }
        };
    }

    extractFlightDetails() {
        const flights = {
            outbound: null,
            return: null
        };

        try {
            const flightSegments = document.querySelectorAll('.flight-segment');
            
            for (let i = 0; i < flightSegments.length; i++) {
                const segment = flightSegments[i];
                
                const flightNumber = segment.querySelector('.flight-number')?.textContent?.trim() || 'N/A';
                const aircraftElements = segment.querySelectorAll('.detail-value');
                const aircraft = aircraftElements[0]?.textContent?.trim() || 'N/A';
                const duration = segment.querySelector('.flight-duration')?.textContent?.trim() || 'N/A';
                
                const airportInfos = segment.querySelectorAll('.airport-info');
                let origin = 'N/A';
                let destination = 'N/A';
                let originCity = '';
                let destCity = '';
                let departureTime = 'N/A';
                let departureDate = 'N/A';
                let arrivalTime = 'N/A';
                let arrivalDate = 'N/A';
                
                if (airportInfos.length >= 2) {
                    const originCodeEl = airportInfos[0].querySelector('.airport-code');
                    const originCityEl = airportInfos[0].querySelector('.airport-city');
                    const departureTimeEl = airportInfos[0].querySelector('.flight-time');
                    const departureDateEl = airportInfos[0].querySelector('.flight-date');
                    
                    const destCodeEl = airportInfos[1].querySelector('.airport-code');
                    const destCityEl = airportInfos[1].querySelector('.airport-city');
                    const arrivalTimeEl = airportInfos[1].querySelector('.flight-time');
                    const arrivalDateEl = airportInfos[1].querySelector('.flight-date');
                    
                    if (originCodeEl) origin = originCodeEl.textContent.trim();
                    if (originCityEl) originCity = originCityEl.textContent.trim();
                    if (departureTimeEl) departureTime = departureTimeEl.textContent.trim();
                    if (departureDateEl) departureDate = departureDateEl.textContent.trim();
                    
                    if (destCodeEl) destination = destCodeEl.textContent.trim();
                    if (destCityEl) destCity = destCityEl.textContent.trim();
                    if (arrivalTimeEl) arrivalTime = arrivalTimeEl.textContent.trim();
                    if (arrivalDateEl) arrivalDate = arrivalDateEl.textContent.trim();
                }
                
                const flightData = {
                    number: flightNumber,
                    aircraft: aircraft,
                    origin: `${origin} (${originCity})`,
                    destination: `${destination} (${destCity})`,
                    duration: duration,
                    departureTime: departureTime,
                    departureDate: departureDate,
                    arrivalTime: arrivalTime,
                    arrivalDate: arrivalDate
                };
                
                if (i === 0) {
                    flights.outbound = flightData;
                } else {
                    flights.return = flightData;
                }
            }
        } catch (error) {
            console.error('Error extracting flight details:', error);
        }
        
        return flights;
    }

    extractPassengerDetails() {
        const passengers = [];
        
        // Country code to full name mapping
        const countryCodeMap = {
            'US': 'United States',
            'GB': 'United Kingdom',
            'CA': 'Canada',
            'IL': 'Israel',
            'DE': 'Germany',
            'FR': 'France',
            'AU': 'Australia',
            'JP': 'Japan',
            'IT': 'Italy',
            'ES': 'Spain'
        };
        
        try {
            const passengerItems = document.querySelectorAll('.passenger-item');
            
            for (let i = 0; i < passengerItems.length; i++) {
                const item = passengerItems[i];
                
                const nameElement = item.querySelector('.passenger-name');
                const detailsElement = item.querySelector('.passenger-details');
                
                let name = 'Passenger ' + (i + 1);
                let type = 'Adult';
                let dob = 'N/A';
                let gender = 'N/A';
                let nationality = 'N/A';
                let passport = 'N/A';
                
                // Extract name
                if (nameElement) {
                    const nameText = nameElement.textContent?.trim();
                    if (nameText && !nameText.includes('Passenger')) {
                        name = nameText;
                    }
                }
                
                if (detailsElement) {
                    const fullText = detailsElement.textContent || detailsElement.innerText || '';
                    console.log('Full passenger text:', fullText);
                    
                    // Parse the format: "Adult • May 29, 2013 • Female • US • Passport: 23423432"
                    const parts = fullText.split('•').map(part => part.trim());
                    
                    for (let j = 0; j < parts.length; j++) {
                        const part = parts[j].trim();
                        
                        // Check for passenger type (Adult, Child, Infant)
                        if (part.toLowerCase() === 'adult' || part.toLowerCase() === 'child' || part.toLowerCase() === 'infant') {
                            type = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                        }
                        // Check for date pattern (MMM dd, yyyy)
                        else if (part.match(/^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}$/)) {
                            dob = part;
                        }
                        // Check for gender
                        else if (['male', 'female', 'other', 'm', 'f'].some(g => 
                            part.toLowerCase() === g || part.toLowerCase() === g + 'ale')) {
                            gender = part;
                        }
                        // Check for country code (2 letters) - should come after gender
                        else if (part.length === 2 && /^[A-Z]{2}$/i.test(part) && gender !== 'N/A') {
                            nationality = countryCodeMap[part.toUpperCase()] || part.toUpperCase();
                        }
                        // Check for passport format
                        else if (part.toLowerCase().includes('passport:')) {
                            const passportMatch = part.match(/passport:\s*(\S+)/i);
                            if (passportMatch) {
                                passport = passportMatch[1];
                            }
                        }
                        // If it's not any of the above and we haven't found nationality yet, it might be nationality as full country name
                        else if (nationality === 'N/A' && part.length > 2 && !part.includes('passport')) {
                            // Check if it's a known country name or use as is
                            nationality = part;
                        }
                    }
                    
                    console.log(`Passenger ${i + 1}:`, { name, type, dob, gender, nationality, passport });
                }
                
                passengers.push({
                    name: name,
                    type: type,
                    dob: dob,
                    gender: gender,
                    nationality: nationality,
                    passport: passport === 'N/A' ? '-' : passport
                });
            }
            
            // Fallback if no passengers were extracted
            if (passengers.length === 0) {
                for (let i = 0; i < this.booking.Adults; i++) {
                    passengers.push({
                        name: `Adult Passenger ${i + 1}`,
                        type: 'Adult',
                        dob: 'N/A',
                        gender: 'N/A',
                        nationality: 'N/A',
                        passport: '-'
                    });
                }
                for (let i = 0; i < this.booking.Children; i++) {
                    passengers.push({
                        name: `Child Passenger ${i + 1}`,
                        type: 'Child',
                        dob: 'N/A',
                        gender: 'N/A',
                        nationality: 'N/A',
                        passport: '-'
                    });
                }
                for (let i = 0; i < this.booking.Infants; i++) {
                    passengers.push({
                        name: `Infant Passenger ${i + 1}`,
                        type: 'Infant',
                        dob: 'N/A',
                        gender: 'N/A',
                        nationality: 'N/A',
                        passport: '-'
                    });
                }
            }
        } catch (error) {
            console.error('Error extracting passenger details:', error);
            passengers.push({
                name: 'Booking Holder',
                type: 'Adult',
                dob: 'N/A',
                gender: 'N/A',
                nationality: 'N/A',
                passport: '-'
            });
        }
        
        return passengers;
    }

    extractBookingInfo() {
        // Extract booking info from the page
        let bookingId = this.booking.BookingId;
        let contactEmail = 'N/A';
        let bookingDate = new Date().toLocaleDateString('en-GB');
        
        try {
            // Try to find booking ID from the page
            const bookingIdElement = document.querySelector('[data-booking-id]') || 
                                   document.querySelector('.booking-id') ||
                                   document.querySelector('#booking-id');
            if (bookingIdElement) {
                const idText = bookingIdElement.textContent || bookingIdElement.getAttribute('data-booking-id');
                if (idText) {
                    bookingId = idText.replace('#', '').trim();
                }
            }
            
            // Try to find contact email
            const emailElement = document.querySelector('.email-confirmation span') ||
                                document.querySelector('[data-email]');
            if (emailElement) {
                const emailText = emailElement.textContent;
                const emailMatch = emailText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                if (emailMatch) {
                    contactEmail = emailMatch[1];
                }
            }
            
            // Try to find booking date
            const dateElements = document.querySelectorAll('*');
            for (const el of dateElements) {
                if (el.textContent && el.textContent.includes('Booked on:')) {
                    const dateMatch = el.textContent.match(/Booked on:\s*(.+)/);
                    if (dateMatch) {
                        bookingDate = dateMatch[1].trim();
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error extracting booking info:', error);
        }
        
        return {
            bookingId,
            contactEmail,
            bookingDate
        };
    }

    createReceiptHTML() {
        const receiptNumber = this.generateReceiptNumber();
        const currentDate = this.getCurrentDate();
        const serviceDetails = this.calculateServiceDetails();
        const bookingInfo = this.extractBookingInfo();
        
        const flightDetails = this.extractFlightDetails();
        const passengerDetails = this.extractPassengerDetails();
        
        return `
            <div class="receipt-container" id="receiptContainer">
                <div class="receipt-header">
                    <div class="receipt-brand">✈ AeroWay</div>
                    <div class="receipt-title">FLIGHT BOOKING INVOICE</div>
                    <div class="page-info">Page 1 of 1</div>
                </div>

                <div class="receipt-body">
                    <div style="text-align: center; margin-bottom: 20px; padding: 10px; background: #f8f9ff; border-radius: 8px;">
                        <h2 style="margin: 0; color: #2E5CD7; font-size: 14px;">BOOKING REFERENCE: <strong>${this.booking.BookingReference}</strong></h2>
                        <p style="margin: 5px 0 0 0; font-size: 9px; color: #666;">Invoice #${receiptNumber} | Issued: ${currentDate.full}</p>
                    </div>

                    <div class="receipt-info-grid">
                        <div class="info-section">
                            <h3>🏢 SUPPLIER DETAILS</h3>
                            <p><span class="info-label">Company:</span> AeroWay Aviation Ltd.</p>
                            <p><span class="info-label">Address:</span> Holtz, Tel Aviv, Israel</p>
                            <p><span class="info-label">Phone:</span> +972527500871</p>
                            <p><span class="info-label">Email:</span> support@aeroway.com</p>
                            <p><span class="info-label">VAT ID:</span> IL-330846114</p>
                        </div>

                        <div class="info-section">
                            <h3>👤 CUSTOMER DETAILS</h3>
                            <p><span class="info-label">Booking ID:</span> #${bookingInfo.bookingId}</p>
                            <p><span class="info-label">PNR:</span> ${this.booking.BookingReference}</p>
                            <p><span class="info-label">Issue Date:</span> ${currentDate.date}</p>
                            <p><span class="info-label">Status:</span> CONFIRMED & PAID</p>
                            <p><span class="info-label">Total Pax:</span> ${this.booking.Adults + this.booking.Children + this.booking.Infants}</p>
                        </div>
                    </div>

                    ${flightDetails.outbound ? `
                    <div class="service-section">
                        <h3 class="section-header">✈️ OUTBOUND FLIGHT</h3>
                        <table class="receipt-table" style="margin-bottom: 10px;">
                            <tr>
                                <td style="width: 20%; font-weight: bold;">Flight:</td>
                                <td style="width: 30%;">${flightDetails.outbound.number}</td>
                                <td style="width: 20%; font-weight: bold;">Aircraft:</td>
                                <td style="width: 30%;">${flightDetails.outbound.aircraft}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Route:</td>
                                <td>${flightDetails.outbound.origin} → ${flightDetails.outbound.destination}</td>
                                <td style="font-weight: bold;">Duration:</td>
                                <td>${flightDetails.outbound.duration}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Departure:</td>
                                <td>${flightDetails.outbound.departureDate} at ${flightDetails.outbound.departureTime}</td>
                                <td style="font-weight: bold;">Arrival:</td>
                                <td>${flightDetails.outbound.arrivalDate} at ${flightDetails.outbound.arrivalTime}</td>
                            </tr>
                        </table>
                    </div>
                    ` : ''}

                    ${flightDetails.return ? `
                    <div class="service-section">
                        <h3 class="section-header">🔄 RETURN FLIGHT</h3>
                        <table class="receipt-table" style="margin-bottom: 10px;">
                            <tr>
                                <td style="width: 20%; font-weight: bold;">Flight:</td>
                                <td style="width: 30%;">${flightDetails.return.number}</td>
                                <td style="width: 20%; font-weight: bold;">Aircraft:</td>
                                <td style="width: 30%;">${flightDetails.return.aircraft}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Route:</td>
                                <td>${flightDetails.return.origin} → ${flightDetails.return.destination}</td>
                                <td style="font-weight: bold;">Duration:</td>
                                <td>${flightDetails.return.duration}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Departure:</td>
                                <td>${flightDetails.return.departureDate} at ${flightDetails.return.departureTime}</td>
                                <td style="font-weight: bold;">Arrival:</td>
                                <td>${flightDetails.return.arrivalDate} at ${flightDetails.return.arrivalTime}</td>
                            </tr>
                        </table>
                    </div>
                    ` : ''}

                    <div class="service-section">
                        <h3 class="section-header">👥 PASSENGERS</h3>
                        <table class="receipt-table" style="margin-bottom: 10px;">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>PASSENGER NAME</th>
                                    <th>TYPE</th>
                                    <th>DATE OF BIRTH</th>
                                    <th>GENDER</th>
                                    <th>NATIONALITY</th>
                                    <th>PASSPORT</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${passengerDetails.slice(0, 5).map((passenger, index) => `
                                <tr>
                                    <td style="text-align: center;">${index + 1}</td>
                                    <td><strong>${passenger.name}</strong></td>
                                    <td>${passenger.type}</td>
                                    <td>${passenger.dob}</td>
                                    <td>${passenger.gender}</td>
                                    <td>${passenger.nationality}</td>
                                    <td>${passenger.passport}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="service-section">
                        <h3 class="section-header">💰 PRICE BREAKDOWN</h3>
                        <table class="receipt-table">
                            <thead>
                                <tr>
                                    <th>QTY</th>
                                    <th>DESCRIPTION</th>
                                    <th>UNIT PRICE</th>
                                    <th>SUBTOTAL</th>
                                    <th>VAT</th>
                                    <th>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${serviceDetails.adults.qty > 0 ? `
                                <tr>
                                    <td style="text-align: center;">${serviceDetails.adults.qty}</td>
                                    <td>Adult Flight Ticket${flightDetails.return ? ' (Round Trip)' : ' (One Way)'}</td>
                                    <td style="text-align: right;">${this.formatCurrency(serviceDetails.adults.priceExclVAT)}</td>
                                    <td style="text-align: right;">${this.formatCurrency(serviceDetails.adults.totalExclVAT)}</td>
                                    <td style="text-align: right;">${this.formatCurrency(serviceDetails.adults.totalVAT)}</td>
                                    <td style="text-align: right;">${this.formatCurrency(serviceDetails.adults.totalInclVAT)}</td>
                                </tr>
                                ` : ''}
                                ${serviceDetails.children.qty > 0 ? `
                                <tr>
                                    <td style="text-align: center;">${serviceDetails.children.qty}</td>
                                    <td>Child Flight Ticket${flightDetails.return ? ' (Round Trip)' : ' (One Way)'}</td>
                                    <td style="text-align: right;">${this.formatCurrency(serviceDetails.children.priceExclVAT)}</td>
                                    <td style="text-align: right;">${this.formatCurrency(serviceDetails.children.totalExclVAT)}</td>
                                    <td style="text-align: right;">${this.formatCurrency(serviceDetails.children.totalVAT)}</td>
                                    <td style="text-align: right;">${this.formatCurrency(serviceDetails.children.totalInclVAT)}</td>
                                </tr>
                                ` : ''}
                                ${this.booking.Infants > 0 ? `
                                <tr>
                                    <td style="text-align: center;">${this.booking.Infants}</td>
                                    <td>Infant (Lap Child) - No Seat Required</td>
                                    <td style="text-align: right;">$0.00</td>
                                    <td style="text-align: right;">$0.00</td>
                                    <td style="text-align: right;">$0.00</td>
                                    <td style="text-align: right;">$0.00</td>
                                </tr>
                                ` : ''}
                                <tr class="vat-row">
                                    <td colspan="3" style="text-align: right; font-weight: bold;">SUBTOTAL (Excl. VAT):</td>
                                    <td style="text-align: right; font-weight: bold;">${this.formatCurrency(serviceDetails.totals.subtotalExclVAT)}</td>
                                    <td style="text-align: right; font-weight: bold;">${this.formatCurrency(serviceDetails.totals.totalVAT)}</td>
                                    <td style="text-align: right; font-weight: bold;">${this.formatCurrency(serviceDetails.totals.grandTotal)}</td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="5" style="text-align: right; font-size: 10px;"><strong>🎯 GRAND TOTAL (Incl. 18% VAT) 🎯</strong></td>
                                    <td style="text-align: right; font-size: 12px;"><strong>${this.formatCurrency(serviceDetails.totals.grandTotal)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="margin: 15px 0; padding: 8px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
                        <p style="margin: 0; font-size: 8px; color: #856404;"><strong>📋 IMPORTANT NOTES:</strong></p>
                        <p style="margin: 2px 0; font-size: 8px; color: #856404;">• Please arrive at the FBO at least 30 minutes before departure • Valid government-issued photo ID required • Seat assignments will be confirmed at check-in • Infants travel on lap and do not require separate seating</p>
                    </div>

                    <div class="receipt-footer">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
                            <div>
                                <p class="footer-text"><strong>💳 PAYMENT INFO:</strong></p>
                                <p class="footer-text">Status: PAID IN FULL</p>
                                <p class="footer-text">Date: ${currentDate.full}</p>
                                <p class="footer-text">Method: Secure Processing</p>
                            </div>
                            <div>
                                <p class="footer-text"><strong>📞 SUPPORT:</strong></p>
                                <p class="footer-text">Email: support@aeroway.com</p>
                                <p class="footer-text">Phone: +972527500871</p>
                                <p class="footer-text">Website: www.aeroway.com</p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 10px;">
                            <div class="logo-text" style="color: #7C4DFF;">AeroWay</div>
                            <div class="website">Premium Private Aviation Services</div>
                            <p style="font-size: 7px; color: #999; margin: 5px 0 0 0;">This invoice was generated electronically and is valid without signature.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showAndPrint() {
        const existingReceipt = document.getElementById('receiptContainer');
        if (existingReceipt) {
            existingReceipt.remove();
        }

        const receiptHTML = this.createReceiptHTML();
        document.body.insertAdjacentHTML('beforeend', receiptHTML);
        
        const receiptContainer = document.getElementById('receiptContainer');
        receiptContainer.classList.add('show');
        
        receiptContainer.offsetHeight;
        
        setTimeout(() => {
            receiptContainer.focus();
            window.print();
            
            setTimeout(() => {
                receiptContainer.classList.remove('show');
                receiptContainer.remove();
            }, 1000);
        }, 200);
    }
}

// Extract booking data from the confirmation page
function extractBookingDataFromPage() {
    try {
        // Get booking reference
        const bookingRefElement = document.querySelector('.reference-number');
        let bookingRef = 'UNKNOWN';
        if (bookingRefElement) {
            const refText = bookingRefElement.textContent || bookingRefElement.innerText;
            if (refText) {
                bookingRef = refText.trim().split('\n')[0];
            }
        }
        
        // Get total price
        const totalPriceElement = document.querySelector('.price-item.total .amount');
        let totalPrice = '0';
        if (totalPriceElement) {
            const priceText = totalPriceElement.textContent || totalPriceElement.innerText;
            if (priceText) {
                totalPrice = priceText.replace(/[^\d.]/g, '') || '0';
            }
        }
        
        // Count passengers from passenger items
        const passengerItems = document.querySelectorAll('.passenger-item');
        let adults = 0;
        let children = 0;
        let infants = 0;
        
        for (let i = 0; i < passengerItems.length; i++) {
            const detailsText = (passengerItems[i].textContent || passengerItems[i].innerText).toLowerCase();
            if (detailsText.includes('adult')) {
                adults++;
            } else if (detailsText.includes('child')) {
                children++;
            } else if (detailsText.includes('infant')) {
                infants++;
            }
        }
        
        // Fallback: get from info highlight
        const infoHighlight = document.querySelector('.info-highlight p');
        if (infoHighlight && (adults === 0 && children === 0)) {
            const text = infoHighlight.textContent || infoHighlight.innerText;
            const adultMatch = text.match(/(\d+)\s+Adult/i);
            const childMatch = text.match(/(\d+)\s+Child/i);
            const infantMatch = text.match(/(\d+)\s+Infant/i);
            
            if (adultMatch) adults = parseInt(adultMatch[1]);
            if (childMatch) children = parseInt(childMatch[1]);
            if (infantMatch) infants = parseInt(infantMatch[1]);
        }
        
        // Get booking ID from URL or generate one
        const pathParts = window.location.pathname.split('/');
        const bookingId = pathParts[pathParts.length - 1] || Math.floor(Math.random() * 10000);
        
        return {
            BookingId: bookingId,
            BookingReference: bookingRef,
            TotalPrice: totalPrice,
            Adults: adults || 1,
            Children: children || 0,
            Infants: infants || 0
        };
    } catch (error) {
        console.error('Error extracting booking data:', error);
        return {
            BookingId: '1000',
            BookingReference: 'SAMPLE123',
            TotalPrice: '1000',
            Adults: 1,
            Children: 0,
            Infants: 0
        };
    }
}

// FIXED: Setup print handling to prevent double printing
function setupPrintHandling() {
    console.log('Setting up print handling...');
    
    // Find all potential print buttons and handle them ONCE
    const allButtons = document.querySelectorAll('button, .btn, a');
    
    allButtons.forEach(button => {
        // Skip if already handled
        if (button.dataset.printHandled === 'true') {
            return;
        }
        
        // Check if it's a print button by onclick attribute or text content
        const hasOnclick = button.getAttribute('onclick')?.includes('window.print');
        const buttonText = (button.textContent || button.innerText || '').toLowerCase();
        const isPrintButton = hasOnclick || buttonText.includes('print');
        
        if (isPrintButton) {
            console.log('Found print button:', button);
            
            // Mark as handled to prevent duplicate handlers
            button.dataset.printHandled = 'true';
            
            // Remove any existing onclick handlers
            button.removeAttribute('onclick');
            
            // Add single click handler
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Print button clicked - showing custom receipt');
                showAndPrintDetailed();
            });
        }
    });
}

// Show and print the detailed receipt
function showAndPrintDetailed() {
    // Prevent multiple simultaneous print operations
    if (window.printInProgress) {
        console.log('Print already in progress, ignoring...');
        return;
    }
    
    window.printInProgress = true;
    
    const bookingData = extractBookingDataFromPage();
    console.log('Booking data for print:', bookingData);
    
    const receipt = new BookingReceiptConfirmation(bookingData);
    receipt.showAndPrint();
    
    // Reset flag after print operation
    setTimeout(() => {
        window.printInProgress = false;
    }, 2000);
}

// Confetti effect on page load
function createConfetti() {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const size = Math.random() * 15 + 10;
        const delay = Math.random() * 3;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const opacity = Math.random() * 0.8 + 0.2;
        const rotation = Math.random() * 360;
        const duration = 3 + Math.random() * 2;
        const borderRadius = Math.random() > 0.5 ? '50%' : 'var(--border-radius)';
        
        confetti.style.cssText = 'position: fixed; width: ' + size + 'px; height: ' + size + 'px; background: ' + color + '; left: ' + left + '%; top: -20px; opacity: ' + opacity + '; transform: rotate(' + rotation + 'deg); animation: confettiFall ' + duration + 's linear ' + delay + 's; z-index: 1000; pointer-events: none; border-radius: ' + borderRadius + ';';
        
        document.body.appendChild(confetti);
        
        setTimeout(function() {
            confetti.remove();
        }, 5000 + delay * 1000);
    }
}

// Fireworks effect
function createFireworks() {
    const firework = document.createElement('div');
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.5;
    
    firework.style.cssText = 'position: fixed; width: 4px; height: 4px; background: #fbbf24; left: ' + x + 'px; top: ' + y + 'px; border-radius: 50%; pointer-events: none; z-index: 1000;';
    
    document.body.appendChild(firework);
    
    setTimeout(function() {
        firework.remove();
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            const angle = (i / 12) * Math.PI * 2;
            const velocity = Math.random() * 100 + 50;
            const colors = ['#10b981', '#3b82f6', '#f59e0b'];
            const particleColor = colors[Math.floor(Math.random() * 3)];
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;
            
            particle.style.cssText = 'position: fixed; width: 3px; height: 3px; background: ' + particleColor + '; left: ' + x + 'px; top: ' + y + 'px; border-radius: 50%; pointer-events: none; z-index: 1000; animation: particleMove 1s ease-out forwards; --dx: ' + dx + 'px; --dy: ' + dy + 'px;';
            
            document.body.appendChild(particle);
            setTimeout(function() {
                particle.remove();
            }, 1000);
        }
    }, 100);
}

// Success sound effect with Apple Pay sound
function playSuccessSound() {
    const audio = new Audio('/images/sound/Apple_Pay.mp3');
    audio.volume = 0.7;
    
    const playSound = function() {
        audio.play()
            .then(function() {
                console.log('Success sound played successfully!');
            })
            .catch(function(error) {
                console.log('Auto-play blocked, will try on user interaction:', error);
                
                const playOnInteraction = function() {
                    audio.play()
                        .then(function() {
                            console.log('Success sound played after user interaction!');
                            document.removeEventListener('click', playOnInteraction);
                            document.removeEventListener('keydown', playOnInteraction);
                            document.removeEventListener('touchstart', playOnInteraction);
                        })
                        .catch(function(err) {
                            console.log('Sound play failed:', err);
                        });
                };
                
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('keydown', playOnInteraction, { once: true });
                document.addEventListener('touchstart', playOnInteraction, { once: true });
            });
    };
    
    if (audio.readyState >= 2) {
        playSound();
    } else {
        audio.addEventListener('canplay', playSound, { once: true });
        audio.load();
    }
}

// Enhanced page load effects with sound
function initializePageEffects() {
    playSuccessSound();
    setTimeout(createConfetti, 300);
    
    for (let i = 0; i < 5; i++) {
        setTimeout(function() {
            createFireworks();
        }, 500 + i * 300);
    }
}

// Setup print handling for window.beforeprint
function setupPrintEventHandling() {
    window.addEventListener('beforeprint', function() {
        console.log('Print dialog opening...');
    });
    
    window.addEventListener('afterprint', function() {
        console.log('Print dialog closed');
        const receipts = document.querySelectorAll('.receipt-container');
        receipts.forEach(receipt => {
            if (receipt.classList.contains('show')) {
                receipt.remove();
            }
        });
        // Reset print flag
        window.printInProgress = false;
    });
}

// Trigger effects on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Booking confirmation page loaded');
    
    // Initialize print flag
    window.printInProgress = false;
    
    // Wait a bit for page to fully load before setting up print handling
    setTimeout(function() {
        setupPrintHandling();
        setupPrintEventHandling();
    }, 500);
    
    setTimeout(initializePageEffects, 200);
});

// Fallback for window load
window.addEventListener('load', function() {
    if (!window.effectsInitialized) {
        window.effectsInitialized = true;
        setTimeout(initializePageEffects, 100);
    }
    
    // Ensure print handling is set up
    setTimeout(function() {
        setupPrintHandling();
        setupPrintEventHandling();
    }, 1000);
});

// Optional: Add sound to copy button success
const originalCopyReference = copyReference;
copyReference = function(reference) {
    originalCopyReference(reference);
    
    const clickAudio = new Audio('/images/sound/Apple_Pay.mp3');
    clickAudio.volume = 0.3;
    clickAudio.play().catch(function() {});
};