using System;

namespace AeroWayServer.Web.Pages
{
    public static class SecurityViolationPage
    {
        public static string GetHtml(string attemptedPath, string clientIP)
        {
            string timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            
            return $@"
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <title>AeroWay - Security Violation</title>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' rel='stylesheet'>
                <style>
                    :root {{
                        --danger-red: #dc2626;
                        --danger-orange: #ea580c;
                        --bg-dark: #0a0a0a;
                        --bg-card: #111111;
                        --text-primary: #ffffff;
                        --text-secondary: #a3a3a3;
                        --border-danger: #dc2626;
                    }}

                    * {{
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        user-select: none;
                    }}

                    body {{
                        font-family: 'Inter', sans-serif;
                        background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a1a1a 100%);
                        color: var(--text-primary);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: hidden;
                        margin: 0 !important;
                        padding: 0 !important;
                    }}

                    .bg-grid {{
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: 
                            linear-gradient(rgba(220, 38, 38, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px);
                        background-size: 50px 50px;
                        animation: gridPulse 4s ease-in-out infinite;
                        z-index: 0;
                    }}

                    @keyframes gridPulse {{
                        0%, 100% {{ opacity: 0.3; }}
                        50% {{ opacity: 0.6; }}
                    }}

                    .bg-rays {{
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        width: 200%;
                        height: 200%;
                        transform: translate(-50%, -50%) rotate(0deg);
                        background: conic-gradient(
                            from 0deg at 50% 50%,
                            transparent 0deg,
                            rgba(220, 38, 38, 0.1) 10deg,
                            transparent 20deg,
                            rgba(234, 88, 12, 0.1) 30deg,
                            transparent 40deg,
                            rgba(220, 38, 38, 0.1) 50deg,
                            transparent 60deg
                        );
                        animation: rayRotate 30s linear infinite;
                        z-index: 1;
                    }}

                    @keyframes rayRotate {{
                        from {{ transform: translate(-50%, -50%) rotate(0deg); }}
                        to {{ transform: translate(-50%, -50%) rotate(360deg); }}
                    }}

                    .violation-container {{
                        position: relative;
                        z-index: 10;
                        background: var(--bg-card);
                        border: 2px solid var(--danger-red);
                        border-radius: 20px;
                        padding: 48px;
                        text-align: center;
                        box-shadow: 
                            0 0 50px rgba(220, 38, 38, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1),
                            0 20px 40px rgba(0, 0, 0, 0.8);
                        animation: violationPulse 3s ease-in-out infinite;
                        max-width: 450px;
                        width: 90%;
                        backdrop-filter: blur(10px);
                    }}

                    @keyframes violationPulse {{
                        0%, 100% {{ 
                            box-shadow: 
                                0 0 50px rgba(220, 38, 38, 0.3),
                                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                                0 20px 40px rgba(0, 0, 0, 0.8);
                        }}
                        50% {{ 
                            box-shadow: 
                                0 0 80px rgba(220, 38, 38, 0.5),
                                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                                0 25px 50px rgba(0, 0, 0, 0.9);
                        }}
                    }}

                    .warning-icon {{
                        font-size: 80px;
                        margin-bottom: 24px;
                        animation: warningShake 0.6s ease-in-out infinite alternate;
                        filter: drop-shadow(0 0 20px rgba(220, 38, 38, 0.5));
                    }}

                    @keyframes warningShake {{
                        0% {{ transform: rotate(-5deg) scale(1); }}
                        100% {{ transform: rotate(5deg) scale(1.05); }}
                    }}

                    .violation-title {{
                        font-size: 32px;
                        font-weight: 900;
                        color: var(--danger-red);
                        margin-bottom: 16px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                        animation: titleBlink 1.5s ease-in-out infinite;
                    }}

                    @keyframes titleBlink {{
                        0%, 70% {{ opacity: 1; color: var(--danger-red); }}
                        85% {{ opacity: 0.7; color: #ff4444; }}
                        100% {{ opacity: 1; color: var(--danger-red); }}
                    }}

                    .violation-subtitle {{
                        font-size: 20px;
                        font-weight: 600;
                        color: var(--danger-orange);
                        margin-bottom: 24px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        animation: subtitlePulse 2s ease-in-out infinite;
                    }}

                    @keyframes subtitlePulse {{
                        0%, 100% {{ opacity: 1; }}
                        50% {{ opacity: 0.8; }}
                    }}

                    .violation-details {{
                        background: rgba(220, 38, 38, 0.1);
                        border: 1px solid rgba(220, 38, 38, 0.2);
                        border-radius: 12px;
                        padding: 20px;
                        margin: 24px 0;
                        font-family: 'Monaco', 'Menlo', monospace;
                        font-size: 14px;
                        text-align: left;
                        position: relative;
                        overflow: hidden;
                    }}

                    .violation-details::before {{
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.2), transparent);
                        animation: detailsScan 3s ease-in-out infinite;
                    }}

                    @keyframes detailsScan {{
                        0% {{ left: -100%; }}
                        50% {{ left: -100%; }}
                        100% {{ left: 100%; }}
                    }}

                    .detail-row {{
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        padding: 4px 0;
                        border-bottom: 1px solid rgba(220, 38, 38, 0.2);
                        position: relative;
                        z-index: 2;
                    }}

                    .detail-row:last-child {{
                        border-bottom: none;
                        margin-bottom: 0;
                    }}

                    .detail-label {{
                        color: var(--text-secondary);
                        font-weight: 500;
                    }}

                    .detail-value {{
                        color: var(--danger-red);
                        font-weight: 700;
                        animation: valueFlicker 2s ease-in-out infinite;
                    }}

                    @keyframes valueFlicker {{
                        0%, 90% {{ opacity: 1; }}
                        95% {{ opacity: 0.7; }}
                        100% {{ opacity: 1; }}
                    }}

                    .security-warning {{
                        background: rgba(234, 88, 12, 0.15);
                        border: 1px solid var(--danger-orange);
                        border-radius: 8px;
                        padding: 16px;
                        margin: 20px 0;
                        font-size: 14px;
                        color: var(--danger-orange);
                        text-align: center;
                        animation: warningPulse 3s ease-in-out infinite;
                    }}

                    @keyframes warningPulse {{
                        0%, 100% {{ background: rgba(234, 88, 12, 0.15); }}
                        50% {{ background: rgba(234, 88, 12, 0.25); }}
                    }}

                    .redirect-notice {{
                        font-size: 16px;
                        color: var(--text-secondary);
                        margin-top: 24px;
                        font-weight: 500;
                    }}

                    .countdown {{
                        color: var(--danger-red);
                        font-weight: 700;
                        font-size: 18px;
                        animation: countdownPulse 1s ease-in-out infinite;
                    }}

                    @keyframes countdownPulse {{
                        0%, 100% {{ transform: scale(1); }}
                        50% {{ transform: scale(1.1); }}
                    }}

                    /* Connection Badge Style - Similar to Lockscreen */
                    .connection-badge {{
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: var(--bg-card);
                        border: 1px solid var(--danger-red);
                        border-radius: 20px;
                        padding: 8px 16px;
                        font-size: 11px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        z-index: 20;
                        animation: badgePulse 2s ease-in-out infinite;
                        box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
                    }}

                    @keyframes badgePulse {{
                        0%, 100% {{ 
                            box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
                        }}
                        50% {{ 
                            box-shadow: 0 0 30px rgba(220, 38, 38, 0.5);
                        }}
                    }}

                    .connection-dot {{
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: var(--danger-red);
                        animation: connectionBlink 1s ease-in-out infinite;
                    }}

                    @keyframes connectionBlink {{
                        0%, 50% {{ opacity: 1; }}
                        51%, 100% {{ opacity: 0.3; }}
                    }}

                    .glitch-effect {{
                        position: relative;
                        animation: gentleGlow 4s ease-in-out infinite;
                    }}

                    .glitch-effect::before,
                    .glitch-effect::after {{
                        content: attr(data-text);
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }}

                    .glitch-effect::before {{
                        animation: subtlePulse1 6s ease-in-out infinite;
                        color: #ff4444;
                        z-index: -1;
                    }}

                    .glitch-effect::after {{
                        animation: subtlePulse2 8s ease-in-out infinite;
                        color: #ff6666;
                        z-index: -1;
                    }}

                    @keyframes gentleGlow {{
                        0%, 100% {{
                            text-shadow: 
                                0 0 10px rgba(220, 38, 38, 0.3),
                                0 0 20px rgba(220, 38, 38, 0.2);
                            transform: scale(1);
                        }}
                        50% {{
                            text-shadow: 
                                0 0 15px rgba(220, 38, 38, 0.5),
                                0 0 25px rgba(220, 38, 38, 0.3);
                            transform: scale(1.02);
                        }}
                    }}

                    @keyframes subtlePulse1 {{
                        0%, 90%, 100% {{ 
                            opacity: 0;
                            transform: translate(0);
                        }}
                        95% {{ 
                            opacity: 0.3;
                            transform: translate(-1px, 0);
                        }}
                    }}

                    @keyframes subtlePulse2 {{
                        0%, 85%, 100% {{ 
                            opacity: 0;
                            transform: translate(0);
                        }}
                        90% {{ 
                            opacity: 0.2;
                            transform: translate(1px, 0);
                        }}
                    }}

                    @media (max-width: 768px) {{
                        .violation-container {{
                            margin: 20px;
                            padding: 32px 24px;
                        }}

                        .violation-title {{
                            font-size: 24px;
                        }}

                        .warning-icon {{
                            font-size: 60px;
                        }}

                        .detail-row {{
                            flex-direction: column;
                            gap: 4px;
                        }}

                        .connection-badge {{
                            top: 16px;
                            right: 16px;
                        }}
                    }}
                </style>
            </head>
            <body>
                <div class='bg-grid'></div>
                <div class='bg-rays'></div>
                
                <!-- Connection Badge Style - Similar to Lockscreen -->
                <div class='connection-badge' id='connectionBadge'>
                    <div class='connection-dot' id='connectionDot'></div>
                    <span id='connectionText'>BREACH DETECTED</span>
                </div>
                
                <div class='violation-container'>
                    <div class='warning-icon'>🚨</div>
                    
                    <div class='violation-title glitch-effect' data-text='Security Violation'>Security Violation</div>
                    <div class='violation-subtitle'>Unauthorized Access Attempt</div>
                    
                    <div class='violation-details'>
                        <div class='detail-row'>
                            <span class='detail-label'>Attempted Path:</span>
                            <span class='detail-value'>{attemptedPath}</span>
                        </div>
                        <div class='detail-row'>
                            <span class='detail-label'>Client IP:</span>
                            <span class='detail-value'>{clientIP}</span>
                        </div>
                        <div class='detail-row'>
                            <span class='detail-label'>Server Status:</span>
                            <span class='detail-value'>LOCKED</span>
                        </div>
                        <div class='detail-row'>
                            <span class='detail-label'>Threat Level:</span>
                            <span class='detail-value'>HIGH</span>
                        </div>
                        <div class='detail-row'>
                            <span class='detail-label'>Timestamp:</span>
                            <span class='detail-value'>{timestamp}</span>
                        </div>
                    </div>
                    
                    <div class='security-warning'>
                        ⚠️ Access to protected resources is denied while the server is locked.
                        <br>This incident has been logged and monitored.
                        <br><strong>Continued attempts may result in IP blocking.</strong>
                    </div>
                    
                    <div class='redirect-notice'>
                        Redirecting to lock screen in <span class='countdown' id='countdown'>15</span> seconds...
                    </div>
                </div>

                <script>
                    let countdown = 15;
                    const countdownEl = document.getElementById('countdown');
                    
                    const timer = setInterval(() => {{
                        countdown--;
                        countdownEl.textContent = countdown;
                        
                        if (countdown <= 0) {{
                            clearInterval(timer);
                            window.location.href = '/';
                        }}
                    }}, 1000);

                    // Enhanced security - disable common bypass attempts
                    document.addEventListener('contextmenu', e => {{
                        e.preventDefault();
                        showViolationAlert();
                        return false;
                    }});

                    document.addEventListener('keydown', e => {{
                        if (e.keyCode === 123 || 
                            (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
                            (e.ctrlKey && e.keyCode === 85) ||
                            (e.ctrlKey && e.shiftKey && e.keyCode === 67) ||
                            (e.ctrlKey && e.shiftKey && e.keyCode === 74)) {{
                            e.preventDefault();
                            showViolationAlert();
                            return false;
                        }}
                    }});

                    document.addEventListener('selectstart', e => e.preventDefault());
                    document.addEventListener('dragstart', e => e.preventDefault());

                    function showViolationAlert() {{
                        const container = document.querySelector('.violation-container');
                        container.style.animation = 'none';
                        container.style.transform = 'scale(0.95)';
                        container.style.filter = 'hue-rotate(180deg)';
                        
                        setTimeout(() => {{
                            container.style.animation = 'violationPulse 2s ease-in-out infinite';
                            container.style.transform = 'scale(1)';
                            container.style.filter = 'none';
                        }}, 300);
                    }}

                    // Add random glitch effects
                    setInterval(() => {{
                        const glitchElements = document.querySelectorAll('.detail-value');
                        const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
                        
                        randomElement.style.animation = 'none';
                        setTimeout(() => {{
                            randomElement.style.animation = 'valueFlicker 2s ease-in-out infinite';
                        }}, 100);
                    }}, 3000);

                    // Dynamic background intensity
                    setInterval(() => {{
                        const intensity = 0.3 + Math.sin(Date.now() * 0.001) * 0.15;
                        document.querySelector('.bg-grid').style.opacity = intensity;
                    }}, 100);

                    // Connection status animation
                    const connectionDot = document.getElementById('connectionDot');
                    const connectionBadge = document.getElementById('connectionBadge');
                    
                    // Pulse effect on badge
                    setInterval(() => {{
                        connectionBadge.style.animation = 'none';
                        setTimeout(() => {{
                            connectionBadge.style.animation = 'badgePulse 2s ease-in-out infinite';
                        }}, 100);
                    }}, 5000);
                </script>
            </body>
            </html>";
        }
    }
}