class BookingReceipt {
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
            const outboundSegment = document.querySelector('.flight-segment');
            if (outboundSegment) {
                const flightNumber = outboundSegment.querySelector('.flight-number')?.textContent?.trim() || 'N/A';
                const aircraft = outboundSegment.querySelector('.detail-value')?.textContent?.trim() || 'N/A';
                const duration = outboundSegment.querySelector('.flight-duration')?.textContent?.trim() || 'N/A';
                
                const airportInfos = outboundSegment.querySelectorAll('.airport-info');
                const origin = airportInfos[0]?.querySelector('.airport-code')?.textContent?.trim() || 'N/A';
                const destination = airportInfos[1]?.querySelector('.airport-code')?.textContent?.trim() || 'N/A';
                const originCity = airportInfos[0]?.querySelector('.airport-city')?.textContent?.trim() || '';
                const destCity = airportInfos[1]?.querySelector('.airport-city')?.textContent?.trim() || '';
                
                const departureTime = airportInfos[0]?.querySelector('.flight-time')?.textContent?.trim() || 'N/A';
                const departureDate = airportInfos[0]?.querySelector('.flight-date')?.textContent?.trim() || 'N/A';
                const arrivalTime = airportInfos[1]?.querySelector('.flight-time')?.textContent?.trim() || 'N/A';
                const arrivalDate = airportInfos[1]?.querySelector('.flight-date')?.textContent?.trim() || 'N/A';

                flights.outbound = {
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
            }

            const allSegments = document.querySelectorAll('.flight-segment');
            if (allSegments.length > 1) {
                const returnSegment = allSegments[1];
                const flightNumber = returnSegment.querySelector('.flight-number')?.textContent?.trim() || 'N/A';
                const aircraft = returnSegment.querySelector('.detail-value')?.textContent?.trim() || 'N/A';
                const duration = returnSegment.querySelector('.flight-duration')?.textContent?.trim() || 'N/A';
                
                const airportInfos = returnSegment.querySelectorAll('.airport-info');
                const origin = airportInfos[0]?.querySelector('.airport-code')?.textContent?.trim() || 'N/A';
                const destination = airportInfos[1]?.querySelector('.airport-code')?.textContent?.trim() || 'N/A';
                const originCity = airportInfos[0]?.querySelector('.airport-city')?.textContent?.trim() || '';
                const destCity = airportInfos[1]?.querySelector('.airport-city')?.textContent?.trim() || '';
                
                const departureTime = airportInfos[0]?.querySelector('.flight-time')?.textContent?.trim() || 'N/A';
                const departureDate = airportInfos[0]?.querySelector('.flight-date')?.textContent?.trim() || 'N/A';
                const arrivalTime = airportInfos[1]?.querySelector('.flight-time')?.textContent?.trim() || 'N/A';
                const arrivalDate = airportInfos[1]?.querySelector('.flight-date')?.textContent?.trim() || 'N/A';

                flights.return = {
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
            
            passengerItems.forEach((item, index) => {
                const nameElement = item.querySelector('.passenger-name');
                const typeElement = item.querySelector('.passenger-type-badge');
                const detailsElement = item.querySelector('.passenger-details');
                
                let name = 'Passenger ' + (index + 1);
                let type = 'Adult';
                let dob = 'N/A';
                let gender = 'N/A';
                let nationality = 'N/A';
                let passport = 'N/A';
                
                if (nameElement) {
                    const nameText = nameElement.textContent?.trim();
                    if (nameText && !nameText.includes('Passenger')) {
                        name = nameText;
                    }
                }
                
                if (typeElement) {
                    type = typeElement.textContent?.trim().replace(/[^a-zA-Z]/g, '') || 'Adult';
                }
                
                if (detailsElement) {
                    const detailItems = detailsElement.querySelectorAll('.passenger-detail-item');
                    
                    detailItems.forEach((detail, detailIndex) => {
                        const text = detail.textContent?.trim();
                        if (text) {
                            // Check if it's a date (like "Jan 15, 1990")
                            if (text.match(/\w{3}\s+\d{1,2},\s+\d{4}/)) {
                                dob = text;
                            }
                            // Check if it's gender
                            else if (['Male', 'Female', 'Other', 'M', 'F'].some(g => 
                                text.toLowerCase().includes(g.toLowerCase()))) {
                                gender = text;
                            }
                            // Check if it's a country code (2 letters) or country name
                            else if (text.length === 2 && /^[A-Z]{2}$/.test(text)) {
                                nationality = countryCodeMap[text] || text;
                            }
                            // If it's not date or gender, and it's not empty, treat as nationality
                            else if (detailIndex === 2 || (!dob.includes('N/A') && !gender.includes('N/A') && detailIndex > 1)) {
                                if (text.length === 2 && /^[A-Z]{2}$/.test(text)) {
                                    nationality = countryCodeMap[text] || text;
                                } else {
                                    nationality = text;
                                }
                            }
                            // Fallback: if we have 3+ items and haven't assigned nationality yet
                            else if (detailItems.length >= 3 && nationality === 'N/A' && detailIndex === detailItems.length - 1) {
                                if (text.length === 2 && /^[A-Z]{2}$/.test(text)) {
                                    nationality = countryCodeMap[text] || text;
                                } else {
                                    nationality = text;
                                }
                            }
                        }
                    });
                    
                    // Alternative approach: look for specific patterns in the passenger details container
                    const allDetailsText = detailsElement.textContent || '';
                    const textParts = allDetailsText.split('•').map(part => part.trim()).filter(part => part);
                    
                    if (textParts.length >= 3) {
                        // Usually the order is: Date of Birth, Gender, Nationality
                        textParts.forEach((part, partIndex) => {
                            if (part.match(/\w{3}\s+\d{1,2},\s+\d{4}/)) {
                                dob = part;
                            } else if (['Male', 'Female', 'Other', 'M', 'F'].some(g => 
                                part.toLowerCase().includes(g.toLowerCase()))) {
                                gender = part;
                            } else if (partIndex === 2 || (partIndex > 1 && nationality === 'N/A')) {
                                nationality = part;
                            }
                        });
                    }
                }
                
                // Look for passport information
                const passportInfo = item.querySelector('.passenger-info-row');
                if (passportInfo && passportInfo.textContent?.includes('Passport:')) {
                    const passportMatch = passportInfo.textContent.match(/Passport:\s*(\S+)/);
                    if (passportMatch) {
                        passport = passportMatch[1];
                    }
                }
                
                passengers.push({
                    name: name,
                    type: type,
                    dob: dob,
                    gender: gender,
                    nationality: nationality,
                    passport: passport === 'N/A' ? '-' : passport
                });
            });
            
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

    createReceiptHTML() {
        const receiptNumber = this.generateReceiptNumber();
        const currentDate = this.getCurrentDate();
        const serviceDetails = this.calculateServiceDetails();
        
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
                            <p><span class="info-label">Booking ID:</span> #${this.booking.BookingId}</p>
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

function getBookingData() {
    try {
        const bookingDataElement = document.getElementById('bookingData');
        if (bookingDataElement) {
            const data = JSON.parse(bookingDataElement.textContent);
            console.log('Booking data from JSON:', data);
            return data;
        }
        console.log('No booking data element found, extracting from page');
        return extractBookingDataFromPage();
    } catch (error) {
        console.error('Error getting booking data:', error);
        return extractBookingDataFromPage();
    }
}

function extractBookingDataFromPage() {
    try {
        const bookingRef = document.querySelector('.ref-badge')?.textContent?.trim() || 'UNKNOWN';
        const totalPriceElement = document.querySelector('.total-price');
        let totalPrice = '0';
        
        if (totalPriceElement) {
            totalPrice = totalPriceElement.textContent.replace(/[^\d.]/g, '') || '0';
        }
        
        const summaryItems = document.querySelectorAll('.summary-item');
        let adults = 0, children = 0, infants = 0;
        
        summaryItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes('adult')) {
                const match = text.match(/(\d+)/);
                adults = match ? parseInt(match[1]) : 0;
            } else if (text.includes('child')) {
                const match = text.match(/(\d+)/);
                children = match ? parseInt(match[1]) : 0;
            } else if (text.includes('infant')) {
                const match = text.match(/(\d+)/);
                infants = match ? parseInt(match[1]) : 0;
            }
        });
        
        if (adults === 0 && children === 0) {
            const passengerCards = document.querySelectorAll('.passenger-item');
            passengerCards.forEach(card => {
                const badge = card.querySelector('.passenger-type-badge');
                if (badge) {
                    const type = badge.textContent.toLowerCase();
                    if (type.includes('adult')) adults++;
                    else if (type.includes('child')) children++;
                    else if (type.includes('infant')) infants++;
                }
            });
        }
        
        const pathParts = window.location.pathname.split('/');
        const bookingId = pathParts[pathParts.length - 1] || Math.floor(Math.random() * 10000);
        
        const extractedData = {
            BookingId: bookingId,
            BookingReference: bookingRef,
            TotalPrice: totalPrice,
            Adults: adults || 1,
            Children: children || 0,
            Infants: infants || 0
        };
        
        console.log('Extracted booking data:', extractedData);
        return extractedData;
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

function setupPrintHandling() {
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
    });
}

function enhancePassengerCards() {
    const passengerCards = document.querySelectorAll('.passenger-item');
    
    passengerCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 200);
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
                
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 2px 10px var(--shadow-color)';
        });
    });
}

function enhanceActionButtons() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Booking details page loaded');
    
    const bookingData = getBookingData();
    console.log('Final booking data:', bookingData);
    
    setupPrintHandling();
    
    const printButton = document.getElementById('printReceiptBtn');
    if (printButton) {
        printButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Print button clicked');
            const receipt = new BookingReceipt(bookingData);
            receipt.showAndPrint();
        });
        console.log('Print button event listener attached');
    } else {
        console.warn('Print button not found');
    }
    
    setTimeout(enhancePassengerCards, 100);
    enhanceActionButtons();
    
    document.documentElement.style.scrollBehavior = 'smooth';
    
    if (!document.getElementById('rippleStyles')) {
        const style = document.createElement('style');
        style.id = 'rippleStyles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('All enhancements initialized');
});