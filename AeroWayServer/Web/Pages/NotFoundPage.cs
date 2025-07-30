using System;

namespace AeroWayServer.Web.Pages
{
    public static class NotFoundPage
    {
        public static string GetHtml()
        {
            return $@"
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <title>AeroWay - 404 Not Found</title>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' rel='stylesheet'>
                <style>
                    :root {{
                        --primary-blue: #3b82f6;
                        --secondary-purple: #8b5cf6;
                        --accent-cyan: #06b6d4;
                        --accent-pink: #ec4899;
                        --bg-dark: #0f1419;
                        --bg-card: #1a1a2e;
                        --text-primary: #ffffff;
                        --text-secondary: #a3a3a3;
                        --text-muted: #6b7280;
                    }}

                    * {{
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }}

                    body {{
                        font-family: 'Inter', sans-serif;
                        background: linear-gradient(135deg, var(--bg-dark) 0%, #16213e 50%, #0f3460 100%) !important;
                        background-attachment: fixed !important;
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

                    .bg-stars {{
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: 
                            radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
                            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.2), transparent),
                            radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.4), transparent),
                            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.2), transparent),
                            radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.3), transparent);
                        background-repeat: repeat;
                        background-size: 200px 100px;
                        animation: starsMove 20s linear infinite;
                        z-index: 0;
                    }}

                    @keyframes starsMove {{
                        from {{ transform: translateY(0); }}
                        to {{ transform: translateY(-100px); }}
                    }}

                    .bg-nebula {{
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: 
                            radial-gradient(ellipse at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                            radial-gradient(ellipse at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                            radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 70%);
                        animation: nebulaFloat 12s ease-in-out infinite;
                        z-index: 1;
                    }}

                    @keyframes nebulaFloat {{
                        0%, 100% {{ transform: translate(0, 0) rotate(0deg); }}
                        33% {{ transform: translate(30px, -30px) rotate(1deg); }}
                        66% {{ transform: translate(-20px, 20px) rotate(-1deg); }}
                    }}

                    .bg-grid {{
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: 
                            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
                        background-size: 50px 50px;
                        animation: gridPulse 4s ease-in-out infinite;
                        z-index: 2;
                    }}

                    @keyframes gridPulse {{
                        0%, 100% {{ opacity: 0.3; }}
                        50% {{ opacity: 0.6; }}
                    }}

                    .error-container {{
                        position: relative;
                        z-index: 10;
                        background: var(--bg-card);
                        border: 2px solid var(--primary-blue);
                        border-radius: 20px;
                        padding: 48px;
                        text-align: center;
                        box-shadow: 
                            0 0 50px rgba(59, 130, 246, 0.2),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1),
                            0 20px 40px rgba(0, 0, 0, 0.4);
                        max-width: 700px;
                        width: 90%;
                        backdrop-filter: blur(15px);
                        animation: containerFloat 6s ease-in-out infinite;
                    }}

                    @keyframes containerFloat {{
                        0%, 100% {{ 
                            transform: translateY(0px);
                            box-shadow: 
                                0 0 50px rgba(59, 130, 246, 0.2),
                                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                                0 20px 40px rgba(0, 0, 0, 0.4);
                        }}
                        50% {{ 
                            transform: translateY(-10px);
                            box-shadow: 
                                0 0 70px rgba(59, 130, 246, 0.3),
                                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                                0 30px 60px rgba(0, 0, 0, 0.5);
                        }}
                    }}

                    .spacecraft-container {{
                        position: relative;
                        margin-bottom: 32px;
                    }}

                    .spacecraft {{
                        font-size: 80px;
                        animation: spacecraftFloat 4s ease-in-out infinite;
                        filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
                        position: relative;
                        z-index: 3;
                    }}

                    @keyframes spacecraftFloat {{
                        0%, 100% {{ 
                            transform: translateY(0px) rotate(0deg); 
                            filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
                        }}
                        25% {{ 
                            transform: translateY(-8px) rotate(2deg); 
                            filter: drop-shadow(0 0 25px rgba(139, 92, 246, 0.6));
                        }}
                        50% {{ 
                            transform: translateY(-15px) rotate(0deg); 
                            filter: drop-shadow(0 0 30px rgba(6, 182, 212, 0.7));
                        }}
                        75% {{ 
                            transform: translateY(-8px) rotate(-2deg); 
                            filter: drop-shadow(0 0 25px rgba(236, 72, 153, 0.6));
                        }}
                    }}

                    .exhaust {{
                        position: absolute;
                        bottom: -10px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 20px;
                        height: 30px;
                        background: linear-gradient(to bottom, 
                            rgba(59, 130, 246, 0.8) 0%,
                            rgba(139, 92, 246, 0.6) 50%,
                            transparent 100%);
                        border-radius: 50% 50% 10px 10px;
                        animation: exhaustFlicker 0.3s ease-in-out infinite alternate;
                    }}

                    @keyframes exhaustFlicker {{
                        0% {{ 
                            opacity: 0.8; 
                            transform: translateX(-50%) scaleY(1);
                            background: linear-gradient(to bottom, 
                                rgba(59, 130, 246, 0.8) 0%,
                                rgba(139, 92, 246, 0.6) 50%,
                                transparent 100%);
                        }}
                        100% {{ 
                            opacity: 1; 
                            transform: translateX(-50%) scaleY(1.2);
                            background: linear-gradient(to bottom, 
                                rgba(6, 182, 212, 0.9) 0%,
                                rgba(236, 72, 153, 0.7) 50%,
                                transparent 100%);
                        }}
                    }}

                    .error-code {{
                        font-size: 120px;
                        font-weight: 900;
                        background: linear-gradient(135deg, var(--primary-blue), var(--secondary-purple), var(--accent-cyan));
                        background-clip: text;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        line-height: 1;
                        margin-bottom: 20px;
                        animation: codeGlow 3s ease-in-out infinite;
                        position: relative;
                    }}

                    @keyframes codeGlow {{
                        0%, 100% {{ 
                            filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
                            transform: scale(1);
                        }}
                        50% {{ 
                            filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.7));
                            transform: scale(1.02);
                        }}
                    }}

                    .error-title {{
                        font-size: 32px;
                        font-weight: 700;
                        color: var(--text-primary);
                        margin-bottom: 16px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        animation: titleShimmer 4s ease-in-out infinite;
                    }}

                    @keyframes titleShimmer {{
                        0%, 100% {{ color: var(--text-primary); }}
                        50% {{ color: var(--primary-blue); }}
                    }}

                    .error-message {{
                        font-size: 18px;
                        color: var(--text-secondary);
                        margin-bottom: 32px;
                        line-height: 1.6;
                        max-width: 500px;
                        margin-left: auto;
                        margin-right: auto;
                    }}

                    .error-details {{
                        background: rgba(59, 130, 246, 0.1);
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        border-radius: 10px;
                        padding: 16px;
                        margin: 24px 0;
                        font-family: 'Monaco', 'Menlo', monospace;
                        font-size: 12px;
                        text-align: left;
                        color: var(--accent-cyan);
                        position: relative;
                        overflow: hidden;
                    }}

                    .error-details::before {{
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.2), transparent);
                        animation: detailsScan 4s ease-in-out infinite;
                    }}

                    @keyframes detailsScan {{
                        0% {{ left: -100%; }}
                        50% {{ left: -100%; }}
                        100% {{ left: 100%; }}
                    }}

                    .navigation-buttons {{
                        display: flex;
                        gap: 16px;
                        justify-content: center;
                        flex-wrap: wrap;
                        margin-top: 32px;
                    }}

                    .btn {{
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 24px;
                        background: linear-gradient(135deg, var(--primary-blue), var(--secondary-purple));
                        color: white;
                        text-decoration: none;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        border: none;
                        cursor: pointer;
                        position: relative;
                        overflow: hidden;
                    }}

                    .btn::before {{
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                        transition: left 0.5s;
                    }}

                    .btn:hover {{
                        transform: translateY(-2px);
                        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
                    }}

                    .btn:hover::before {{
                        left: 100%;
                    }}

                    .btn.secondary {{
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }}

                    .btn.secondary:hover {{
                        background: rgba(255, 255, 255, 0.2);
                        box-shadow: 0 10px 25px rgba(255, 255, 255, 0.1);
                    }}

                    .status-info {{
                        background: rgba(139, 92, 246, 0.1);
                        border: 1px solid rgba(139, 92, 246, 0.3);
                        border-radius: 10px;
                        padding: 16px;
                        margin: 24px 0;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font-size: 14px;
                        color: var(--secondary-purple);
                    }}

                    .status-icon {{
                        font-size: 20px;
                        animation: statusPulse 2s ease-in-out infinite;
                    }}

                    @keyframes statusPulse {{
                        0%, 100% {{ opacity: 0.7; }}
                        50% {{ opacity: 1; }}
                    }}

                    @media (max-width: 768px) {{
                        .error-container {{
                            margin: 20px;
                            padding: 32px 24px;
                        }}

                        .error-code {{
                            font-size: 80px;
                        }}

                        .error-title {{
                            font-size: 24px;
                        }}

                        .spacecraft {{
                            font-size: 60px;
                        }}

                        .navigation-buttons {{
                            flex-direction: column;
                        }}

                        .btn {{
                            justify-content: center;
                        }}
                    }}

                    /* Particle system */
                    .particle {{
                        position: absolute;
                        background: rgba(59, 130, 246, 0.6);
                        border-radius: 50%;
                        pointer-events: none;
                        animation: particleFloat 3s linear infinite;
                    }}

                    @keyframes particleFloat {{
                        0% {{
                            transform: translateY(100vh) scale(0);
                            opacity: 0;
                        }}
                        10% {{
                            opacity: 1;
                        }}
                        90% {{
                            opacity: 1;
                        }}
                        100% {{
                            transform: translateY(-10vh) scale(1);
                            opacity: 0;
                        }}
                    }}
                </style>
            </head>
            <body>
                <div class='bg-stars'></div>
                <div class='bg-nebula'></div>
                <div class='bg-grid'></div>
                
                <div class='error-container'>
                    <div class='spacecraft-container'>
                        <div class='spacecraft'>🛸</div>
                        <div class='exhaust'></div>
                    </div>
                    
                    <div class='error-code'>404</div>
                    <div class='error-title'>Page Not Found</div>
                    <div class='error-message'>
                        The requested page has gone off-radar. It might have been moved, deleted, or never existed in our airspace.
                    </div>
                    
                    <div class='status-info'>
                        <div class='status-icon'>🌐</div>
                        <div>AeroWay Navigation System is operational</div>
                    </div>
                    
                    <div class='error-details'>
                        ERROR: Resource not found in AeroWay navigation system<br>
                        STATUS: Lost in digital airspace<br>
                        TIMESTAMP: {DateTime.Now:yyyy-MM-dd HH:mm:ss}<br>
                        SUGGESTION: Return to base or try alternative routes
                    </div>
                    
                    <div class='navigation-buttons'>
                        <a href='/dashboard' class='btn'>
                            🏠 Return to Dashboard
                        </a>
                        <button onclick='history.back()' class='btn secondary'>
                            ← Go Back
                        </button>
                        <button onclick='window.location.reload()' class='btn secondary'>
                            🔄 Retry
                        </button>
                    </div>
                </div>

                <script>
                    // Interactive particle system
                    function createParticle() {{
                        const particle = document.createElement('div');
                        particle.className = 'particle';
                        
                        const size = Math.random() * 4 + 2;
                        particle.style.width = size + 'px';
                        particle.style.height = size + 'px';
                        particle.style.left = Math.random() * 100 + '%';
                        particle.style.animationDelay = Math.random() * 3 + 's';
                        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
                        
                        document.body.appendChild(particle);
                        
                        setTimeout(() => {{
                            particle.remove();
                        }}, 5000);
                    }}

                    // Create particles periodically
                    setInterval(createParticle, 300);

                    // Mouse interaction with background
                    document.addEventListener('mousemove', (e) => {{
                        const nebula = document.querySelector('.bg-nebula');
                        const x = e.clientX / window.innerWidth;
                        const y = e.clientY / window.innerHeight;
                        
                        nebula.style.transform = `translate(${{x * 20}}px, ${{y * 20}}px)`;
                    }});

                    // Spacecraft interaction
                    const spacecraft = document.querySelector('.spacecraft');
                    spacecraft.addEventListener('click', () => {{
                        spacecraft.style.animation = 'none';
                        spacecraft.style.transform = 'scale(1.2) rotate(360deg)';
                        
                        setTimeout(() => {{
                            spacecraft.style.animation = 'spacecraftFloat 4s ease-in-out infinite';
                            spacecraft.style.transform = '';
                        }}, 1000);
                    }});

                    // Dynamic color changes
                    let colorPhase = 0;
                    setInterval(() => {{
                        colorPhase += 0.02;
                        const hue = Math.sin(colorPhase) * 30 + 220;
                        document.documentElement.style.setProperty('--primary-blue', `hsl(${{hue}}, 70%, 60%)`);
                    }}, 100);

                    // Add typing effect to error message
                    const errorMessage = document.querySelector('.error-message');
                    const originalText = errorMessage.textContent;
                    errorMessage.textContent = '';
                    
                    let i = 0;
                    function typeWriter() {{
                        if (i < originalText.length) {{
                            errorMessage.textContent += originalText.charAt(i);
                            i++;
                            setTimeout(typeWriter, 50);
                        }}
                    }}
                    
                    setTimeout(typeWriter, 1000);
                </script>
            </body>
            </html>";
        }
    }
}