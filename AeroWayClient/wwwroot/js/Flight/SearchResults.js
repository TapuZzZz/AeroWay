$(document).ready(function() {
    var searchParams = window.searchParams || {};
    var selectedFlights = {
        outbound: null,
        return: null
    };
    
    var activeFilters = [];
    
    init();
    
    function init() {
        setupFlightSelection();
        setupFiltersAndSort();
        updateContinueButton();
    }
    
    function setupFlightSelection() {
        $(document).on('click', '.flight-card', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            if ($(this).find('.confirmation-overlay').length > 0) {
                return;
            }
            
            $('.confirmation-overlay').each(function() {
                var $overlay = $(this);
                $overlay.removeClass('show');
                setTimeout(function() {
                    $overlay.remove();
                }, 300);
            });
            
            var $card = $(this);
            var flightId = $card.data('flight-id');
            var flightType = $card.find('input[type="radio"]').attr('name') === 'outboundFlightId' ? 'outbound' : 'return';
            
            var $overlay = $('<div class="confirmation-overlay">' +
                '<div class="confirmation-content">' +
                    '<button class="confirm-btn" type="button"><i class="fas fa-check"></i> Confirm Selection</button>' +
                '</div>' +
            '</div>');
            
            $card.append($overlay);
            
            setTimeout(function() {
                $overlay.addClass('show');
            }, 10);
            
            $overlay.find('.confirm-btn').on('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                $overlay.removeClass('show');
                setTimeout(function() {
                    $overlay.remove();
                }, 300);
                
                var $successAnimation = $('<div class="success-animation">' +
                    '<div class="success-circle-anim">' +
                        '<svg class="success-checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">' +
                            '<circle class="success-checkmark__circle" cx="26" cy="26" r="25" fill="none"/>' +
                            '<path class="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>' +
                        '</svg>' +
                    '</div>' +
                '</div>');
                
                $card.append($successAnimation);
                
                setTimeout(function() {
                    $successAnimation.addClass('fade-out');
                    
                    setTimeout(function() {
                        $successAnimation.remove();
                        selectFlight($card, flightId, flightType);
                    }, 500);
                }, 1500);
                
                return false;
            });
            
            $overlay.on('click', function(e) {
                if (!$(e.target).hasClass('confirm-btn') && !$(e.target).parent().hasClass('confirm-btn')) {
                    e.stopPropagation();
                    $overlay.removeClass('show');
                    setTimeout(function() {
                        $overlay.remove();
                    }, 300);
                }
            });
        });
        
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.flight-card').length) {
                $('.confirmation-overlay').each(function() {
                    var $overlay = $(this);
                    $overlay.removeClass('show');
                    setTimeout(function() {
                        $overlay.remove();
                    }, 300);
                });
            }
        });
    }
    
    function selectFlight($card, flightId, flightType) {
        if (flightType === 'outbound') {
            $('.flight-section').first().find('.flight-card').removeClass('selected');
        } else {
            $('.flight-section').last().find('.flight-card').removeClass('selected');
        }
        
        $card.addClass('selected pulse');
        
        $card.find('input[type="radio"]').prop('checked', true);
        
        selectedFlights[flightType] = {
            id: flightId,
            price: parseFloat($card.data('price')),
            element: $card
        };
        
        updatePriceSummary();
        
        updateContinueButton();
        
        setTimeout(function() {
            $card.removeClass('pulse');
        }, 600);
    }
    
    function setupFiltersAndSort() {
        $(document).on('click', '.filter-pill', function() {
            var $pill = $(this);
            var filter = $pill.data('filter');
            
            $pill.toggleClass('active');
            
            if ($pill.hasClass('active')) {
                if (!activeFilters.includes(filter)) {
                    activeFilters.push(filter);
                }
            } else {
                activeFilters = activeFilters.filter(f => f !== filter);
            }
            
            applyFilters();
        });
        
        $(document).on('click', '.custom-select-trigger', function(e) {
            e.stopPropagation();
            var $dropdown = $(this).closest('.custom-select');
            $('.custom-select').not($dropdown).removeClass('open');
            $dropdown.toggleClass('open');
        });
        
        $(document).on('click', '.custom-option', function(e) {
            e.stopPropagation();
            var $option = $(this);
            var value = $option.data('value');
            var text = $option.text();
            var $dropdown = $option.closest('.custom-select');
            
            $dropdown.find('.custom-option').removeClass('selected');
            $option.addClass('selected');
            
            $dropdown.find('.custom-select-trigger span').text(text);
            
            $dropdown.removeClass('open');
            
            sortFlights(value);
        });
        
        $(document).on('click', function() {
            $('.custom-select').removeClass('open');
        });
    }
    
    function applyFilters() {
        var outboundVisibleCards = 0;
        var returnVisibleCards = 0;
        var outboundTotalCards = 0;
        var returnTotalCards = 0;
        
        $('.flight-section').first().find('.flight-card').each(function() {
            var $card = $(this);
            var departureTime = $card.data('departure');
            outboundTotalCards++;
            
            if (!departureTime) {
                return;
            }
            
            var hour = parseInt(departureTime.split(':')[0]);
            var shouldShow = true;
            
            if (activeFilters.length > 0) {
                shouldShow = false;
                activeFilters.forEach(function(filter) {
                    if (filter === 'morning' && hour >= 6 && hour < 12) shouldShow = true;
                    if (filter === 'afternoon' && hour >= 12 && hour < 18) shouldShow = true;
                    if (filter === 'evening' && hour >= 18 && hour < 24) shouldShow = true;
                    if (filter === 'night' && hour >= 0 && hour < 6) shouldShow = true;
                });
            }
            
            if (shouldShow) {
                $card.fadeIn(300);
                outboundVisibleCards++;
            } else {
                $card.fadeOut(300);
            }
        });
        
        if ($('.flight-section').length > 1) {
            $('.flight-section').last().find('.flight-card').each(function() {
                var $card = $(this);
                var departureTime = $card.data('departure');
                returnTotalCards++;
                
                if (!departureTime) {
                    return;
                }
                
                var hour = parseInt(departureTime.split(':')[0]);
                var shouldShow = true;
                
                if (activeFilters.length > 0) {
                    shouldShow = false;
                    activeFilters.forEach(function(filter) {
                        if (filter === 'morning' && hour >= 6 && hour < 12) shouldShow = true;
                        if (filter === 'afternoon' && hour >= 12 && hour < 18) shouldShow = true;
                        if (filter === 'evening' && hour >= 18 && hour < 24) shouldShow = true;
                        if (filter === 'night' && hour >= 0 && hour < 6) shouldShow = true;
                    });
                }
                
                if (shouldShow) {
                    $card.fadeIn(300);
                    returnVisibleCards++;
                } else {
                    $card.fadeOut(300);
                }
            });
        }
        
        if (outboundTotalCards === 0) {
            $('.no-results.outbound-no-flights').fadeIn(300);
            $('.no-filter-results.outbound-filter').fadeOut(300);
        } else if (activeFilters.length > 0 && outboundVisibleCards === 0) {
            $('.no-filter-results.outbound-filter').fadeIn(300);
            $('.no-results.outbound-no-flights').fadeOut(300);
        } else {
            $('.no-filter-results.outbound-filter').fadeOut(300);
            $('.no-results.outbound-no-flights').fadeOut(300);
        }
        
        if ($('.flight-section').length > 1) {
            if (returnTotalCards === 0) {
                $('.no-results.return-no-flights').fadeIn(300);
                $('.no-filter-results.return-filter').fadeOut(300);
            } else if (activeFilters.length > 0 && returnVisibleCards === 0) {
                $('.no-filter-results.return-filter').fadeIn(300);
                $('.no-results.return-no-flights').fadeOut(300);
            } else {
                $('.no-filter-results.return-filter').fadeOut(300);
                $('.no-results.return-no-flights').fadeOut(300);
            }
        }
    }
    
    function sortFlights(sortBy) {
        $('.flight-section').each(function() {
            var $section = $(this);
            var $cards = $section.find('.flight-card').toArray();
            
            $cards.sort(function(a, b) {
                var $a = $(a);
                var $b = $(b);
                
                switch(sortBy) {
                    case 'price':
                        return parseFloat($a.data('price')) - parseFloat($b.data('price'));
                    case 'duration':
                        return parseDuration($a.data('duration')) - parseDuration($b.data('duration'));
                    case 'departure':
                        var timeA = $a.data('departure') || '00:00';
                        var timeB = $b.data('departure') || '00:00';
                        return timeA.localeCompare(timeB);
                    default:
                        return 0;
                }
            });
            
            $cards.forEach(function(card) {
                $section.append(card);
            });
        });
    }
    
    function parseDuration(duration) {
        if (!duration) return 0;
        
        var parts = duration.split(' ');
        var minutes = 0;
        parts.forEach(function(part) {
            if (part.includes('h')) {
                minutes += parseInt(part) * 60;
            } else if (part.includes('m')) {
                minutes += parseInt(part);
            }
        });
        return minutes;
    }
    
    function updatePriceSummary() {
        var passengers = (searchParams.adults || 0) + (searchParams.children || 0);
        var outboundTotal = 0;
        var returnTotal = 0;
        
        if (selectedFlights.outbound) {
            outboundTotal = selectedFlights.outbound.price * passengers;
            $('#outboundPrice').text('$' + outboundTotal.toLocaleString());
        } else {
            $('#outboundPrice').text('--');
        }
        
        if (searchParams.tripType === 'roundtrip') {
            if (selectedFlights.return) {
                returnTotal = selectedFlights.return.price * passengers;
                $('#returnPrice').text('$' + returnTotal.toLocaleString());
            } else {
                $('#returnPrice').text('--');
            }
        }
        
        var subtotal = outboundTotal + returnTotal;
        var taxes = subtotal > 0 ? Math.round(subtotal * 0.18) : 0;
        var total = subtotal + taxes;
        
        if (taxes > 0) {
            $('#taxesPrice').text('$' + taxes.toLocaleString());
            $('#totalPrice').text('$' + total.toLocaleString());
        } else {
            $('#taxesPrice').text('--');
            $('#totalPrice').text('--');
        }
    }
    
    function updateContinueButton() {
        var $continueBtn = $('#continueBtn');
        var canContinue = false;
        
        if (searchParams.tripType === 'roundtrip') {
            canContinue = selectedFlights.outbound && selectedFlights.return;
        } else {
            canContinue = selectedFlights.outbound;
        }
        
        $continueBtn.prop('disabled', !canContinue);
        
        if (canContinue) {
            $continueBtn.html('Continue to Passenger Details <i class="fas fa-arrow-right"></i>');
        } else {
            $continueBtn.html('Select flights to continue <i class="fas fa-arrow-right"></i>');
        }
    }
    
    $('#continueBtn').click(function(e) {
        e.preventDefault();
        
        if (!$(this).prop('disabled')) {
            if (searchParams.tripType === 'roundtrip' && (!selectedFlights.outbound || !selectedFlights.return)) {
                alert('Please select both outbound and return flights');
                return false;
            }
            
            if (!selectedFlights.outbound) {
                alert('Please select an outbound flight');
                return false;
            }
            
            $('#flightSelectionForm').submit();
        }
        
        return false;
    });
});