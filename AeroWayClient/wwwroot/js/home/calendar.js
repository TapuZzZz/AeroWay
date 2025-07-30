// Enhanced Calendar functionality with improved date range selection and auto-flow
function initCustomCalendars() {
    const departDateInput = document.getElementById('departDate');
    const returnDateInput = document.getElementById('returnDate');
    const departCalendar = document.getElementById('departCalendar');
    const returnCalendar = document.getElementById('returnCalendar');
    const departDateContainer = document.getElementById('departDateContainer');
    const returnDateContainer = document.getElementById('returnDateContainer');
    const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
    const returnDateWrapper = document.querySelector('.return-date');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // State management
    const calendarState = {
        departDate: null,
        returnDate: null,
        currentDepartMonth: today.getMonth(),
        currentDepartYear: today.getFullYear(),
        currentReturnMonth: today.getMonth(),
        currentReturnYear: today.getFullYear(),
        isSelectingReturn: false
    };
    
    // Initialize calendars with enhanced features
    function initializeCalendar(calendarEl, isReturnCalendar) {
        // Add info section
        if (!calendarEl.querySelector('.calendar-info-section')) {
            const infoSection = document.createElement('div');
            infoSection.className = 'calendar-info-section';
            infoSection.innerHTML = `
                <div class="trip-duration" style="display: none;">
                    <div class="duration-item">
                        <span class="duration-label">Departure</span>
                        <span class="duration-value" id="${isReturnCalendar ? 'return' : 'depart'}DepartInfo">-</span>
                    </div>
                    <div class="duration-divider"></div>
                    <div class="duration-item">
                        <span class="duration-label">Return</span>
                        <span class="duration-value" id="${isReturnCalendar ? 'return' : 'depart'}ReturnInfo">-</span>
                    </div>
                    <div class="duration-divider"></div>
                    <div class="duration-item">
                        <span class="duration-label">Duration</span>
                        <span class="duration-value" id="${isReturnCalendar ? 'return' : 'depart'}DurationInfo">-</span>
                    </div>
                </div>
            `;
            calendarEl.insertBefore(infoSection, calendarEl.querySelector('.calendar-footer'));
        }
        
        // Enhanced footer
        const footer = calendarEl.querySelector('.calendar-footer');
        if (footer) {
            footer.innerHTML = `
                <button class="today-btn" type="button">
                    <i class="fas fa-calendar-day"></i> Today
                </button>
                <div class="calendar-actions">
                    <button class="clear-btn" type="button">Clear</button>
                </div>
            `;
            
            // Today button handler
            footer.querySelector('.today-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                
                if (isReturnCalendar) {
                    // For return calendar, ensure today is after departure
                    if (calendarState.departDate && now <= calendarState.departDate) {
                        // Set to day after departure
                        const minReturn = new Date(calendarState.departDate);
                        minReturn.setDate(minReturn.getDate() + 1);
                        handleDateSelect(calendarEl, minReturn, true);
                    } else {
                        handleDateSelect(calendarEl, now, true);
                    }
                } else {
                    handleDateSelect(calendarEl, now, false);
                }
            });
            
            // Clear button handler
            footer.querySelector('.clear-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                if (isReturnCalendar) {
                    calendarState.returnDate = null;
                    returnDateInput.value = '';
                } else {
                    calendarState.departDate = null;
                    departDateInput.value = '';
                    // Also clear return if departure is cleared
                    calendarState.returnDate = null;
                    returnDateInput.value = '';
                }
                
                updateAllCalendars();
            });
        }
    }
    
    // Initialize both calendars
    initializeCalendar(departCalendar, false);
    initializeCalendar(returnCalendar, true);
    
    // Setup calendars
    setupCalendar(departCalendar, calendarState.currentDepartMonth, calendarState.currentDepartYear, false);
    setupCalendar(returnCalendar, calendarState.currentReturnMonth, calendarState.currentReturnYear, true);
    
    // Open calendars with smart focus and z-index fix
    departDateContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        hideAllDropdowns();
        departCalendar.classList.toggle('active');
        calendarState.isSelectingReturn = false;
        
        // Add/remove calendar-active class for z-index fix
        if (departCalendar.classList.contains('active')) {
            departDateContainer.parentElement.classList.add('calendar-active');
        } else {
            departDateContainer.parentElement.classList.remove('calendar-active');
        }
    });
    
    returnDateContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Block if no departure date
        if (!calendarState.departDate) {
            showDateError(returnDateContainer, "Please select departure date first");
            // Focus on departure date input
            departDateContainer.click();
            return;
        }
        
        hideAllDropdowns();
        returnCalendar.classList.toggle('active');
        calendarState.isSelectingReturn = true;
        
        // Add/remove calendar-active class for z-index fix
        if (returnCalendar.classList.contains('active')) {
            returnDateContainer.parentElement.classList.add('calendar-active');
        } else {
            returnDateContainer.parentElement.classList.remove('calendar-active');
        }
        
        // Navigate to departure month
        const departMonth = calendarState.departDate.getMonth();
        const departYear = calendarState.departDate.getFullYear();
        setupCalendar(returnCalendar, departMonth, departYear, true);
    });
    
    // Trip type toggle
    tripTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'oneway') {
                returnDateWrapper.style.display = 'none';
                calendarState.returnDate = null;
                returnDateInput.value = '';
            } else {
                returnDateWrapper.style.display = 'flex';
            }
            updateAllCalendars();
        });
    });
    
    // Calendar navigation
    function addNavigationListeners(calendarEl, isReturnCalendar) {
        const prevBtn = calendarEl.querySelector('.prev-month');
        const nextBtn = calendarEl.querySelector('.next-month');
        
        if (prevBtn && !prevBtn.hasAttribute('data-initialized')) {
            prevBtn.setAttribute('data-initialized', 'true');
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateMonth(calendarEl, -1, isReturnCalendar);
            });
        }
        
        if (nextBtn && !nextBtn.hasAttribute('data-initialized')) {
            nextBtn.setAttribute('data-initialized', 'true');
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateMonth(calendarEl, 1, isReturnCalendar);
            });
        }
    }
    
    function navigateMonth(calendarEl, direction, isReturnCalendar) {
        if (isReturnCalendar) {
            calendarState.currentReturnMonth += direction;
            if (calendarState.currentReturnMonth < 0) {
                calendarState.currentReturnMonth = 11;
                calendarState.currentReturnYear--;
            } else if (calendarState.currentReturnMonth > 11) {
                calendarState.currentReturnMonth = 0;
                calendarState.currentReturnYear++;
            }
            setupCalendar(calendarEl, calendarState.currentReturnMonth, calendarState.currentReturnYear, true);
        } else {
            calendarState.currentDepartMonth += direction;
            if (calendarState.currentDepartMonth < 0) {
                calendarState.currentDepartMonth = 11;
                calendarState.currentDepartYear--;
            } else if (calendarState.currentDepartMonth > 11) {
                calendarState.currentDepartMonth = 0;
                calendarState.currentDepartYear++;
            }
            setupCalendar(calendarEl, calendarState.currentDepartMonth, calendarState.currentDepartYear, false);
        }
    }
    
    // Setup calendar with enhanced visualization
    function setupCalendar(calendarEl, month, year, isReturnCalendar) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        calendarEl.querySelector('.current-month').textContent = `${months[month]} ${year}`;
        
        // Update navigation button states
        const prevBtn = calendarEl.querySelector('.prev-month');
        const now = new Date();
        const currentMonth = new Date(year, month, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Disable previous button if we're at current month
        if (currentMonth <= thisMonth) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        const daysContainer = calendarEl.querySelector('.calendar-days');
        daysContainer.innerHTML = '';
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day other-month disabled';
            dayEl.textContent = daysInPrevMonth - i;
            daysContainer.appendChild(dayEl);
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            
            // Mark today
            if (date.getTime() === today.getTime()) {
                dayEl.classList.add('today');
            }
            
            // Disable past dates
            if (date < today) {
                dayEl.classList.add('disabled');
            } else if (isReturnCalendar && calendarState.departDate && date <= calendarState.departDate) {
                // For return calendar, disable dates before or on departure
                dayEl.classList.add('disabled');
            } else {
                // Add click handler for valid dates
                dayEl.addEventListener('click', () => {
                    handleDateSelect(calendarEl, date, isReturnCalendar);
                });
            }
            
            // Apply selection classes
            if (calendarState.departDate && date.getTime() === calendarState.departDate.getTime()) {
                dayEl.classList.add('selected', 'departure-date');
            }
            
            if (calendarState.returnDate && date.getTime() === calendarState.returnDate.getTime()) {
                dayEl.classList.add('selected', 'return-date');
            }
            
            // Apply range classes
            if (calendarState.departDate && calendarState.returnDate) {
                if (date > calendarState.departDate && date < calendarState.returnDate) {
                    dayEl.classList.add('in-range');
                }
                
                if (date.getTime() === calendarState.departDate.getTime()) {
                    dayEl.classList.add('range-start');
                }
                
                if (date.getTime() === calendarState.returnDate.getTime()) {
                    dayEl.classList.add('range-end');
                }
            }
            
            daysContainer.appendChild(dayEl);
        }
        
        // Next month days
        const totalCells = daysContainer.children.length;
        const remainingCells = 42 - totalCells; // 6 rows * 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day other-month disabled';
            dayEl.textContent = day;
            daysContainer.appendChild(dayEl);
        }
        
        // Add navigation listeners
        addNavigationListeners(calendarEl, isReturnCalendar);
        
        // Update info section
        updateTripInfo(calendarEl);
    }
    
    // Handle date selection with validation and auto-flow
    function handleDateSelect(calendarEl, date, isReturnCalendar) {
        if (isReturnCalendar) {
            // Validate return date
            if (calendarState.departDate && date <= calendarState.departDate) {
                // Show visual feedback
                showDateError(calendarEl, "Return date must be after departure");
                return;
            }
            
            calendarState.returnDate = new Date(date);
            returnDateInput.value = formatDateForDisplay(date);
            
            // Auto close return calendar after selection - מהר יותר!
            setTimeout(() => {
                returnCalendar.classList.remove('active');
                returnDateContainer.parentElement.classList.remove('calendar-active');
            }, 150); // הורדתי מ-300 ל-150
        } else {
            // Handle departure date
            calendarState.departDate = new Date(date);
            departDateInput.value = formatDateForDisplay(date);
            
            // Clear return date if it's now invalid
            if (calendarState.returnDate && calendarState.returnDate <= date) {
                calendarState.returnDate = null;
                returnDateInput.value = '';
            }
            
            // Close departure calendar - מהר יותר!
            setTimeout(() => {
                departCalendar.classList.remove('active');
                departDateContainer.parentElement.classList.remove('calendar-active');
                
                // Auto-open return calendar for round trip
                const roundTripSelected = document.querySelector('input[name="TripType"][value="roundtrip"]')?.checked ?? true;
                
                if (roundTripSelected && !calendarState.returnDate) {
                    setTimeout(() => {
                        returnCalendar.classList.add('active');
                        returnDateContainer.parentElement.classList.add('calendar-active');
                        
                        // *** כאן התיקון העיקרי! ***
                        // תמיד פתח על אותו חודש של תאריך היציאה
                        const departMonth = date.getMonth();
                        const departYear = date.getFullYear();
                        
                        // אבל אם תאריך היציאה הוא אחרי ה-20 בחודש, פתח חודש הבא
                        let targetMonth = departMonth;
                        let targetYear = departYear;
                        
                        if (date.getDate() > 20) {
                            targetMonth = departMonth + 1;
                            if (targetMonth > 11) {
                                targetMonth = 0;
                                targetYear = departYear + 1;
                            }
                        }
                        
                        calendarState.currentReturnMonth = targetMonth;
                        calendarState.currentReturnYear = targetYear;
                        setupCalendar(returnCalendar, targetMonth, targetYear, true);
                        
                        // Focus animation - מהר יותר!
                        returnDateContainer.style.transform = 'scale(1.02)';
                        setTimeout(() => {
                            returnDateContainer.style.transform = 'scale(1)';
                        }, 200); // הורדתי מ-300 ל-200
                    }, 200); // הורדתי מ-400 ל-200
                }
            }, 150); // הורדתי מ-300 ל-150
        }
        
        updateAllCalendars();
    }
    
    // Update all calendars with current state
    function updateAllCalendars() {
        const month1 = calendarState.currentDepartMonth;
        const year1 = calendarState.currentDepartYear;
        const month2 = calendarState.currentReturnMonth;
        const year2 = calendarState.currentReturnYear;
        
        setupCalendar(departCalendar, month1, year1, false);
        setupCalendar(returnCalendar, month2, year2, true);
    }
    
    // Update trip info display
    function updateTripInfo(calendarEl) {
        const tripDuration = calendarEl.querySelector('.trip-duration');
        if (!tripDuration) return;
        
        if (calendarState.departDate && calendarState.returnDate) {
            tripDuration.style.display = 'flex';
            
            const departInfo = calendarEl.querySelector('[id$="DepartInfo"]');
            const returnInfo = calendarEl.querySelector('[id$="ReturnInfo"]');
            const durationInfo = calendarEl.querySelector('[id$="DurationInfo"]');
            
            if (departInfo) departInfo.textContent = formatDateShort(calendarState.departDate);
            if (returnInfo) returnInfo.textContent = formatDateShort(calendarState.returnDate);
            
            // Calculate duration
            const duration = Math.round((calendarState.returnDate - calendarState.departDate) / (1000 * 60 * 60 * 24));
            if (durationInfo) {
                if (duration === 0) {
                    durationInfo.textContent = 'Same day';
                } else {
                    durationInfo.textContent = `${duration} ${duration === 1 ? 'day' : 'days'}`;
                }
            }
        } else {
            tripDuration.style.display = 'none';
        }
    }
    
    // Show date selection error
    function showDateError(container, message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'date-error';
        errorEl.textContent = message;
        
        container.style.position = 'relative';
        container.appendChild(errorEl);
        
        setTimeout(() => {
            errorEl.remove();
        }, 2000);
    }
    
    // Helper functions
    function formatDateForDisplay(date) {
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    function formatDateShort(date) {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    function hideAllDropdowns() {
        document.querySelectorAll('.custom-dropdown.active, .custom-calendar.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        // Remove calendar-active classes
        document.querySelectorAll('.calendar-active').forEach(el => {
            el.classList.remove('calendar-active');
        });
    }
    
    // Close calendars on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.date-wrapper')) {
            departCalendar.classList.remove('active');
            returnCalendar.classList.remove('active');
            // Remove calendar-active classes
            document.querySelectorAll('.calendar-active').forEach(el => {
                el.classList.remove('calendar-active');
            });
        }
    });
    
    // Prevent calendar close on internal clicks
    departCalendar.addEventListener('click', (e) => e.stopPropagation());
    returnCalendar.addEventListener('click', (e) => e.stopPropagation());
    
    // Add shake animation if not exists
    if (!document.querySelector('#calendarAnimations')) {
        const style = document.createElement('style');
        style.id = 'calendarAnimations';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(-50%); }
                25% { transform: translateX(-55%); }
                75% { transform: translateX(-45%); }
            }
        `;
        document.head.appendChild(style);
    }
}