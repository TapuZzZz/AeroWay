// PopupManager.js - Enhanced to handle Route Planning popup scrolling issue
document.addEventListener('DOMContentLoaded', function() {
    // Map action cards to their respective popups
    const cardModels = [
        { cardSelector: '.action-card.add-flight', popupId: 'addFlightPopup' },
        { cardSelector: '.action-card.route-planning', popupId: 'routePlanningPopup' },
        { cardSelector: '.action-card.weather-alerts', popupId: 'weatherAlertsPopup' },
        { cardSelector: '.action-card.crew-assignments', popupId: 'crewAssignmentsPopup' }
    ];
    
    // Setup popup opening and closing functionality
    cardModels.forEach(model => {
        const card = document.querySelector(model.cardSelector);
        const popup = document.getElementById(model.popupId);
        
        if (card && popup) {
            // Open popup when clicking on the card
            card.addEventListener('click', () => {
                openPopup(popup);
            });
            
            // Close popup when clicking the close button
            const closeBtn = popup.querySelector('.popup-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    closePopup(popup);
                });
            }
            
            // Close popup when clicking the cancel button
            const cancelBtn = popup.querySelector('.popup-btn-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    closePopup(popup);
                });
            }
            
            // Special handling for popups to prevent background scrolling
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    // תמיד נמנע מסגירה אוטומטית בלחיצה מחוץ לחלונית
                    e.stopPropagation();
                }
            });
            
            // Special handling for routePlanningPopup
            if (model.popupId === 'routePlanningPopup') {
                // Prevent scrolling inside of the map
                const popupBody = popup.querySelector('.popup-body');
                if (popupBody) {
                    popupBody.style.overflow = 'hidden';
                }
            }
        }
    });
    
    // Function to open popup
    function openPopup(popup) {
        popup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Special handling for routePlanningPopup
        if (popup.id === 'routePlanningPopup') {
            const popupContainer = popup.querySelector('.popup-container');
            if (popupContainer) {
                popupContainer.style.overflow = 'hidden';
            }
            
            const popupBody = popup.querySelector('.popup-body');
            if (popupBody) {
                popupBody.style.overflow = 'hidden';
                popupBody.style.padding = '0';
            }
            
            // הסרת אלמנט חיווי הגרירה
            const dragIndicator = popup.querySelector('.drag-indicator');
            if (dragIndicator) {
                dragIndicator.style.display = 'none';
            }
        }
    }
    
    // Function to close popup
    function closePopup(popup) {
        popup.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Adjust popup height on window resize - לוודא אחידות בגדלים
    window.addEventListener('resize', adjustPopupHeight);
    
    function adjustPopupHeight() {
        // וידוא גודל אחיד לכל החלוניות
        const popups = document.querySelectorAll('.popup-container');
        const windowHeight = window.innerHeight;
        const standardHeight = `${windowHeight * 0.85}px`;
        
        popups.forEach(popup => {
            // הגדר גובה אחיד לכל החלוניות
            popup.style.maxHeight = standardHeight;
            
            const popupId = popup.parentElement.id;
            
            // תמיד גודל אחיד, גם לחלונית תכנון מסלולים
            if (popupId === 'routePlanningPopup') {
                popup.style.overflow = 'hidden';
                
                // Make sure the popup body fills the available space
                const popupBody = popup.querySelector('.popup-body');
                if (popupBody) {
                    popupBody.style.height = 'calc(100% - 60px)'; // חסר גובה הכותרת
                    popupBody.style.minHeight = '500px';
                    popupBody.style.overflow = 'hidden';
                    popupBody.style.padding = '0';
                }
                
                // Make sure the map container fills the available space
                const mapContainer = popup.querySelector('.map-container');
                if (mapContainer) {
                    mapContainer.style.height = '100%';
                    mapContainer.style.width = '100%';
                }
            } 
        });
    }
    
    // Initial height adjustment
    adjustPopupHeight();
    
    // Expose popup management functions globally if needed
    window.popupManager = {
        openPopup: function(popupId) {
            const popup = document.getElementById(popupId);
            if (popup) openPopup(popup);
        },
        closePopup: function(popupId) {
            const popup = document.getElementById(popupId);
            if (popup) closePopup(popup);
        }
    };
});