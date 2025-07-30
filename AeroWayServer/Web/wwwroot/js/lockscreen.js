class AeroWayLockScreen {
    constructor() {
        this.isLocked = true;
        this.checkInterval = 1000;
        this.attemptCount = 0;
        
        this.initElements();
        this.startMonitoring();
        this.setupSecurity();
    }

    initElements() {
        this.lockContainer = document.getElementById('lockContainer');
        this.lockIcon = document.getElementById('lockIcon');
        this.lockStatus = document.getElementById('lockStatus');
        this.lockSubtitle = document.getElementById('lockSubtitle');
        this.lockDescription = document.getElementById('lockDescription');
        
        this.connectionBadge = document.getElementById('connectionBadge');
        this.connectionDot = document.getElementById('connectionDot');
        this.connectionText = document.getElementById('connectionText');
        
        this.monitorDot = document.getElementById('monitorDot');
        this.monitorHeader = document.getElementById('monitorHeader');
        this.monitorTitle = document.getElementById('monitorTitle');
        this.monitorStatus = document.getElementById('monitorStatus');
        this.monitorInfo = document.getElementById('monitorInfo');
        this.statusMonitor = document.getElementById('statusMonitor');
        this.securityWarning = document.getElementById('securityWarning');
        
        this.lastCheckValue = document.getElementById('lastCheckValue');
        this.attemptsValue = document.getElementById('attemptsValue');
        this.statusValue = document.getElementById('statusValue');
        
        this.unlockingOverlay = document.getElementById('unlockingOverlay');
        this.bgGrid = document.getElementById('bgGrid');
        this.bgRays = document.getElementById('bgRays');
    }

    startMonitoring() {
        console.log('🔒 AeroWay Lock Screen - Security Active');
        this.checkServerStatus();
    }

    async checkServerStatus() {
        const now = new Date();
        this.attemptCount++;
        
        const timeStr = now.toTimeString().split(' ')[0];
        this.lastCheckValue.textContent = timeStr;
        this.attemptsValue.textContent = this.attemptCount.toString();
        this.statusValue.textContent = this.isLocked ? 'LOCKED' : 'UNLOCKED';

        try {
            const response = await fetch(window.location.href, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            if (response.ok) {
                const responseText = await response.text();
                
                if (this.isDashboardResponse(responseText)) {
                    if (this.isLocked) {
                        this.unlockServer();
                        return;
                    }
                }
                
                this.updateConnectionStatus(true);
            } else {
                this.updateConnectionStatus(false);
            }

        } catch (error) {
            this.updateConnectionStatus(false);
            console.log('Status check failed:', error.message);
        }

        setTimeout(() => this.checkServerStatus(), this.checkInterval);
    }

    isDashboardResponse(html) {
        const dashboardIndicators = [
            'dashboard',
            'Welcome to AeroWay',
            'Server Status: ONLINE',
            'AeroWay Dashboard',
            'management console',
            'server active'
        ];
        
        const lockIndicators = [
            'SERVER LOCKED',
            'ACCESS DENIED',
            'Server Locked',
            'lock-container',
            'Unauthorized access'
        ];
        
        const hasDashboard = dashboardIndicators.some(indicator => 
            html.toLowerCase().includes(indicator.toLowerCase())
        );
        
        const hasLock = lockIndicators.some(indicator => 
            html.toLowerCase().includes(indicator.toLowerCase())
        );
        
        return hasDashboard && !hasLock;
    }

    unlockServer() {
        this.isLocked = false;
        console.log('🔓 Server unlocked! Initiating smooth unlock sequence...');
        this.startSmoothUnlockSequence();
    }

    startSmoothUnlockSequence() {
        // Pre-load the dashboard to avoid delay
        const preloadFrame = document.createElement('iframe');
        preloadFrame.style.display = 'none';
        preloadFrame.src = '/dashboard';
        document.body.appendChild(preloadFrame);

        // Phase 1: Initial lock icon animation (immediate)
        this.lockIcon.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        this.lockIcon.classList.add('unlocking');
        
        // Smooth icon change after 300ms
        setTimeout(() => {
            this.lockIcon.textContent = '🔓';
        }, 300);
        
        // Phase 2: Start color transitions (after 600ms)
        setTimeout(() => {
            // Add transition to all elements that will change
            const elementsToTransition = [
                document.body,
                this.bgGrid,
                this.bgRays,
                this.lockContainer,
                this.lockStatus,
                this.connectionBadge,
                this.statusMonitor,
                this.securityWarning
            ];
            
            elementsToTransition.forEach(el => {
                if (el) {
                    el.style.transition = 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
                }
            });
            
            // Apply unlocked classes
            document.body.classList.add('unlocked');
            this.bgGrid.classList.add('unlocked');
            this.bgRays.classList.add('unlocked');
            this.lockContainer.classList.add('unlocked');
            this.lockStatus.classList.add('unlocked');
            this.connectionBadge.classList.add('unlocked');
            this.statusMonitor.classList.add('unlocked');
            this.securityWarning.classList.add('unlocked');
            
            // Smooth text transitions
            this.animateTextChange(this.lockSubtitle, 'ACCESS GRANTED');
            this.animateTextChange(this.lockDescription, 'Server authentication successful. Preparing dashboard interface...');
            
            // Update monitor elements
            this.monitorDot.classList.add('active');
            this.monitorHeader.classList.add('unlocked');
            this.monitorTitle.classList.add('unlocked');
            this.monitorStatus.classList.add('unlocked');
            this.monitorInfo.classList.add('unlocked');
            
            // Update monitor values with animation
            document.querySelectorAll('.monitor-value').forEach(el => {
                el.style.transition = 'all 0.8s ease';
                el.classList.add('unlocked');
            });
            
            this.animateTextChange(this.statusValue, 'UNLOCKED');
            this.updateConnectionStatus(true, 'AUTHENTICATED');
            
        }, 600);

        // Phase 3: Show overlay smoothly (after 2000ms)
        setTimeout(() => {
            this.unlockingOverlay.style.display = 'flex';
            this.unlockingOverlay.style.opacity = '0';
            
            // Force reflow
            this.unlockingOverlay.offsetHeight;
            
            // Fade in overlay
            this.unlockingOverlay.style.transition = 'opacity 0.6s ease-out';
            this.unlockingOverlay.style.opacity = '1';
            this.unlockingOverlay.classList.add('active');
            
            // Phase 4: Redirect (after overlay fully visible)
            setTimeout(() => {
                // Remove preload frame
                if (preloadFrame.parentNode) {
                    preloadFrame.remove();
                }
                
                // Smooth redirect
                window.location.href = '/dashboard';
            }, 2000);
            
        }, 2000);
    }

    animateTextChange(element, newText) {
        if (!element) return;
        
        // Fade out
        element.style.transition = 'opacity 0.3s ease-out';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.textContent = newText;
            element.classList.add('unlocked');
            
            // Fade in
            element.style.transition = 'opacity 0.5s ease-in';
            element.style.opacity = '1';
        }, 300);
    }

    redirectToDashboard() {
        window.location.href = '/dashboard';
    }

    updateConnectionStatus(connected, text = null) {
        if (connected) {
            if (!this.isLocked) {
                this.connectionDot.style.transition = 'all 0.5s ease';
                this.connectionDot.classList.add('connected');
            }
            this.connectionText.style.transition = 'opacity 0.3s ease';
            this.connectionText.style.opacity = '0';
            
            setTimeout(() => {
                this.connectionText.textContent = text || 'MONITORING';
                this.connectionText.style.opacity = '1';
            }, 300);
        } else {
            this.connectionDot.classList.remove('connected');
            this.connectionText.textContent = 'OFFLINE';
        }
    }

    setupSecurity() {
        const showSecurityViolation = () => {
            this.lockContainer.style.animation = 'none';
            this.lockContainer.style.transform = 'scale(0.95)';
            this.lockContainer.style.filter = 'hue-rotate(180deg)';
            
            setTimeout(() => {
                this.lockContainer.style.animation = 'lockPulse 3s ease-in-out infinite';
                this.lockContainer.style.transform = 'scale(1)';
                this.lockContainer.style.filter = 'none';
            }, 300);
        };

        document.addEventListener('contextmenu', e => {
            e.preventDefault();
            showSecurityViolation();
            return false;
        });

        document.addEventListener('keydown', e => {
            if ((e.keyCode >= 112 && e.keyCode <= 123) || 
                e.ctrlKey || e.altKey || (e.ctrlKey && e.shiftKey)) {
                e.preventDefault();
                showSecurityViolation();
                return false;
            }
        });

        document.addEventListener('selectstart', e => e.preventDefault());
        document.addEventListener('dragstart', e => e.preventDefault());
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for smoother transitions
    const style = document.createElement('style');
    style.textContent = `
        /* Smooth transition helpers */
        .unlocking-overlay {
            opacity: 0;
            transition: opacity 0.6s ease-out !important;
        }
        
        .unlocking-overlay.active {
            opacity: 1;
        }
        
        /* Preload animation */
        @keyframes smoothUnlock {
            0% { transform: scale(1) rotate(0deg); }
            100% { transform: scale(1) rotate(360deg); }
        }
        
        .lock-icon.unlocking {
            animation: smoothUnlock 1.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* Text fade transitions */
        .fade-transition {
            transition: opacity 0.3s ease !important;
        }
    `;
    document.head.appendChild(style);
    
    new AeroWayLockScreen();
});