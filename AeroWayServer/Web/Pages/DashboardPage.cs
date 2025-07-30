using System;

namespace AeroWayServer.Web.Pages
{
    public static class DashboardPage
    {
        public static string GetHtml()
        {
            return $@"
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <title>AeroWay Dashboard</title>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' rel='stylesheet'>
                <style>
                    :root {{
                        --primary-blue: #3b82f6;
                        --secondary-purple: #8b5cf6;
                        --accent-cyan: #06b6d4;
                        --accent-pink: #ec4899;
                        --success-green: #10b981;
                        --warning-yellow: #f59e0b;
                        --danger-red: #ef4444;
                        --bg-dark: #0f1419;
                        --bg-card: #1a1a2e;
                        --bg-surface: #16213e;
                        --text-primary: #ffffff;
                        --text-secondary: #a3a3a3;
                        --text-muted: #6b7280;
                        --border: #2d3748;
                    }}

                    * {{
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }}

                    body {{
                        font-family: 'Inter', sans-serif;
                        background: linear-gradient(135deg, var(--bg-dark) 0%, #16213e 50%, #0f3460 100%);
                        background-attachment: fixed;
                        color: var(--text-primary);
                        min-height: 100vh;
                        position: relative;
                        overflow-x: hidden;
                    }}

                    /* Background Effects */
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
                        animation: gridMove 20s linear infinite;
                        z-index: 0;
                    }}

                    @keyframes gridMove {{
                        0% {{ transform: translate(0, 0); }}
                        100% {{ transform: translate(50px, 50px); }}
                    }}

                    .bg-particles {{
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 1;
                    }}

                    /* Navigation Header */
                    .nav-header {{
                        position: relative;
                        z-index: 100;
                        background: rgba(26, 26, 46, 0.8);
                        backdrop-filter: blur(20px);
                        border-bottom: 1px solid var(--border);
                        padding: 20px 0;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    }}

                    .nav-container {{
                        max-width: 1400px;
                        margin: 0 auto;
                        padding: 0 24px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }}

                    .logo {{
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font-size: 24px;
                        font-weight: 800;
                        background: linear-gradient(135deg, var(--primary-blue), var(--secondary-purple));
                        background-clip: text;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }}

                    .logo-icon {{
                        font-size: 32px;
                        filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
                        animation: logoFloat 3s ease-in-out infinite;
                    }}

                    @keyframes logoFloat {{
                        0%, 100% {{ transform: translateY(0); }}
                        50% {{ transform: translateY(-5px); }}
                    }}

                    .nav-links {{
                        display: flex;
                        gap: 8px;
                    }}

                    .nav-link {{
                        padding: 10px 20px;
                        color: var(--text-secondary);
                        text-decoration: none;
                        border-radius: 10px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }}

                    .nav-link:hover {{
                        color: var(--text-primary);
                        background: rgba(59, 130, 246, 0.1);
                    }}

                    .nav-link.active {{
                        color: var(--primary-blue);
                        background: rgba(59, 130, 246, 0.2);
                    }}

                    .logout-btn {{
                        padding: 10px 20px;
                        background: linear-gradient(135deg, var(--danger-red), #dc2626);
                        color: white;
                        text-decoration: none;
                        border-radius: 10px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }}

                    .logout-btn:hover {{
                        transform: translateY(-2px);
                        box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
                    }}

                    /* Main Dashboard */
                    .dashboard-container {{
                        position: relative;
                        z-index: 10;
                        max-width: 1400px;
                        margin: 0 auto;
                        padding: 32px 24px;
                    }}

                    /* Welcome Section */
                    .welcome-section {{
                        background: var(--bg-card);
                        border: 1px solid var(--border);
                        border-radius: 20px;
                        padding: 32px;
                        margin-bottom: 32px;
                        position: relative;
                        overflow: hidden;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    }}

                    .welcome-section::before {{
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
                        animation: welcomeSweep 8s ease-in-out infinite;
                    }}

                    @keyframes welcomeSweep {{
                        0% {{ left: -100%; }}
                        100% {{ left: 100%; }}
                    }}

                    .welcome-content {{
                        position: relative;
                        z-index: 2;
                    }}

                    .welcome-title {{
                        font-size: 32px;
                        font-weight: 700;
                        margin-bottom: 8px;
                        background: linear-gradient(135deg, var(--primary-blue), var(--secondary-purple));
                        background-clip: text;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }}

                    .welcome-subtitle {{
                        font-size: 18px;
                        color: var(--text-secondary);
                    }}

                    .server-status {{
                        position: absolute;
                        top: 32px;
                        right: 32px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid var(--success-green);
                        border-radius: 12px;
                        padding: 12px 20px;
                        animation: statusPulse 2s ease-in-out infinite;
                    }}

                    @keyframes statusPulse {{
                        0%, 100% {{ opacity: 0.8; }}
                        50% {{ opacity: 1; }}
                    }}

                    .status-dot {{
                        width: 12px;
                        height: 12px;
                        background: var(--success-green);
                        border-radius: 50%;
                        animation: statusBlink 1s ease-in-out infinite;
                    }}

                    @keyframes statusBlink {{
                        0%, 100% {{ opacity: 1; box-shadow: 0 0 10px var(--success-green); }}
                        50% {{ opacity: 0.5; box-shadow: 0 0 5px var(--success-green); }}
                    }}

                    /* Stats Grid */
                    .stats-grid {{
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 24px;
                        margin-bottom: 32px;
                    }}

                    .stat-card {{
                        background: var(--bg-card);
                        border: 1px solid var(--border);
                        border-radius: 16px;
                        padding: 24px;
                        position: relative;
                        overflow: hidden;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    }}

                    .stat-card:hover {{
                        transform: translateY(-4px);
                        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
                        border-color: var(--primary-blue);
                    }}

                    .stat-card::before {{
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 2px;
                        background: linear-gradient(90deg, var(--primary-blue), var(--secondary-purple), var(--accent-cyan));
                        animation: statGradient 3s ease-in-out infinite;
                    }}

                    @keyframes statGradient {{
                        0%, 100% {{ transform: translateX(-100%); }}
                        50% {{ transform: translateX(100%); }}
                    }}

                    .stat-icon {{
                        width: 48px;
                        height: 48px;
                        background: linear-gradient(135deg, var(--primary-blue), var(--secondary-purple));
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        margin-bottom: 16px;
                        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                    }}

                    .stat-value {{
                        font-size: 36px;
                        font-weight: 800;
                        margin-bottom: 4px;
                        background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
                        background-clip: text;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }}

                    .stat-label {{
                        font-size: 14px;
                        color: var(--text-secondary);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }}

                    .stat-change {{
                        position: absolute;
                        top: 24px;
                        right: 24px;
                        font-size: 12px;
                        font-weight: 600;
                        padding: 4px 8px;
                        border-radius: 6px;
                    }}

                    .stat-change.positive {{
                        background: rgba(16, 185, 129, 0.2);
                        color: var(--success-green);
                    }}

                    .stat-change.negative {{
                        background: rgba(239, 68, 68, 0.2);
                        color: var(--danger-red);
                    }}

                    /* Flight Activity Section */
                    .section {{
                        background: var(--bg-card);
                        border: 1px solid var(--border);
                        border-radius: 20px;
                        padding: 32px;
                        margin-bottom: 32px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    }}

                    .section-header {{
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 24px;
                    }}

                    .section-title {{
                        font-size: 24px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }}

                    .section-icon {{
                        font-size: 28px;
                        filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
                    }}

                    .view-all-btn {{
                        padding: 8px 16px;
                        background: rgba(59, 130, 246, 0.1);
                        color: var(--primary-blue);
                        text-decoration: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        border: 1px solid rgba(59, 130, 246, 0.3);
                    }}

                    .view-all-btn:hover {{
                        background: rgba(59, 130, 246, 0.2);
                        transform: translateY(-2px);
                    }}

                    /* Flight Table */
                    .flight-table {{
                        width: 100%;
                        border-collapse: collapse;
                    }}

                    .flight-table th {{
                        text-align: left;
                        padding: 12px;
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--text-secondary);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        border-bottom: 1px solid var(--border);
                    }}

                    .flight-table td {{
                        padding: 16px 12px;
                        border-bottom: 1px solid rgba(45, 55, 72, 0.5);
                    }}

                    .flight-table tr:last-child td {{
                        border-bottom: none;
                    }}

                    .flight-table tr:hover {{
                        background: rgba(59, 130, 246, 0.05);
                    }}

                    .flight-number {{
                        font-weight: 600;
                        color: var(--primary-blue);
                    }}

                    .flight-status {{
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                    }}

                    .flight-status.on-time {{
                        background: rgba(16, 185, 129, 0.2);
                        color: var(--success-green);
                    }}

                    .flight-status.delayed {{
                        background: rgba(245, 158, 11, 0.2);
                        color: var(--warning-yellow);
                    }}

                    .flight-status.boarding {{
                        background: rgba(59, 130, 246, 0.2);
                        color: var(--primary-blue);
                    }}

                    .status-dot {{
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: currentColor;
                    }}

                    /* Quick Actions */
                    .quick-actions {{
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    }}

                    .action-card {{
                        background: var(--bg-surface);
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        padding: 20px;
                        text-align: center;
                        text-decoration: none;
                        color: var(--text-primary);
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }}

                    .action-card::before {{
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.1));
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }}

                    .action-card:hover {{
                        transform: translateY(-4px);
                        border-color: var(--primary-blue);
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                    }}

                    .action-card:hover::before {{
                        opacity: 1;
                    }}

                    .action-icon {{
                        font-size: 36px;
                        margin-bottom: 12px;
                        filter: drop-shadow(0 0 10px currentColor);
                    }}

                    .action-title {{
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 4px;
                    }}

                    .action-desc {{
                        font-size: 12px;
                        color: var(--text-secondary);
                    }}

                    /* System Info */
                    .system-info {{
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 16px;
                    }}

                    .info-item {{
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 16px;
                        background: var(--bg-surface);
                        border-radius: 10px;
                        border: 1px solid var(--border);
                    }}

                    .info-icon {{
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, var(--primary-blue), var(--secondary-purple));
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                    }}

                    .info-content {{
                        flex: 1;
                    }}

                    .info-label {{
                        font-size: 12px;
                        color: var(--text-secondary);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-bottom: 2px;
                    }}

                    .info-value {{
                        font-size: 18px;
                        font-weight: 600;
                    }}

                    /* Responsive */
                    @media (max-width: 768px) {{
                        .nav-container {{
                            flex-direction: column;
                            gap: 16px;
                        }}

                        .server-status {{
                            position: relative;
                            top: auto;
                            right: auto;
                            margin-top: 16px;
                        }}

                        .stats-grid {{
                            grid-template-columns: 1fr;
                        }}

                        .quick-actions {{
                            grid-template-columns: 1fr;
                        }}

                        .flight-table {{
                            font-size: 14px;
                        }}

                        .flight-table th,
                        .flight-table td {{
                            padding: 8px;
                        }}
                    }}
                </style>
            </head>
            <body>
                <div class='bg-grid'></div>
                <div class='bg-particles' id='particles'></div>

                <!-- Navigation Header -->
                <nav class='nav-header'>
                    <div class='nav-container'>
                        <div class='logo'>
                            <span class='logo-icon'>✈️</span>
                            <span>AeroWay Dashboard</span>
                        </div>
                        
                        <div class='nav-links'>
                            <a href='/dashboard' class='nav-link active'>Dashboard</a>
                            <a href='/flightmanager' class='nav-link'>Flight Manager</a>
                            <a href='/database' class='nav-link'>Database</a>
                        </div>
                        
                        <a href='/logout' class='logout-btn'>
                            <span>🔒</span>
                            <span>Lock Server</span>
                        </a>
                    </div>
                </nav>

                <!-- Main Dashboard Content -->
                <div class='dashboard-container'>
                    <!-- Welcome Section -->
                    <div class='welcome-section'>
                        <div class='welcome-content'>
                            <h1 class='welcome-title'>Welcome to AeroWay Control Center</h1>
                            <p class='welcome-subtitle'>Monitor and manage your aviation operations in real-time</p>
                        </div>
                        <div class='server-status'>
                            <div class='status-dot'></div>
                            <span>Server Online</span>
                        </div>
                    </div>

                    <!-- Stats Grid -->
                    <div class='stats-grid'>
                        <div class='stat-card'>
                            <div class='stat-icon'>✈️</div>
                            <div class='stat-value'>42</div>
                            <div class='stat-label'>Active Flights</div>
                            <div class='stat-change positive'>+12%</div>
                        </div>
                        
                        <div class='stat-card'>
                            <div class='stat-icon'>👥</div>
                            <div class='stat-value'>1,847</div>
                            <div class='stat-label'>Passengers Today</div>
                            <div class='stat-change positive'>+8%</div>
                        </div>
                        
                        <div class='stat-card'>
                            <div class='stat-icon'>📍</div>
                            <div class='stat-value'>23</div>
                            <div class='stat-label'>Active Gates</div>
                            <div class='stat-change negative'>-4%</div>
                        </div>
                        
                        <div class='stat-card'>
                            <div class='stat-icon'>⏱️</div>
                            <div class='stat-value'>94%</div>
                            <div class='stat-label'>On-Time Performance</div>
                            <div class='stat-change positive'>+2%</div>
                        </div>
                    </div>

                    <!-- Recent Flights -->
                    <div class='section'>
                        <div class='section-header'>
                            <h2 class='section-title'>
                                <span class='section-icon'>🛫</span>
                                Recent Flight Activity
                            </h2>
                            <a href='/flightmanager' class='view-all-btn'>View All Flights →</a>
                        </div>
                        
                        <table class='flight-table'>
                            <thead>
                                <tr>
                                    <th>Flight</th>
                                    <th>Route</th>
                                    <th>Departure</th>
                                    <th>Status</th>
                                    <th>Gate</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class='flight-number'>AW-1234</td>
                                    <td>Tel Aviv → New York</td>
                                    <td>14:30</td>
                                    <td><span class='flight-status boarding'><span class='status-dot'></span>Boarding</span></td>
                                    <td>A12</td>
                                </tr>
                                <tr>
                                    <td class='flight-number'>AW-5678</td>
                                    <td>London → Tel Aviv</td>
                                    <td>15:45</td>
                                    <td><span class='flight-status on-time'><span class='status-dot'></span>On Time</span></td>
                                    <td>B7</td>
                                </tr>
                                <tr>
                                    <td class='flight-number'>AW-9012</td>
                                    <td>Tel Aviv → Paris</td>
                                    <td>16:20</td>
                                    <td><span class='flight-status delayed'><span class='status-dot'></span>Delayed</span></td>
                                    <td>C3</td>
                                </tr>
                                <tr>
                                    <td class='flight-number'>AW-3456</td>
                                    <td>Berlin → Tel Aviv</td>
                                    <td>17:00</td>
                                    <td><span class='flight-status on-time'><span class='status-dot'></span>On Time</span></td>
                                    <td>A5</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Quick Actions -->
                    <div class='section'>
                        <div class='section-header'>
                            <h2 class='section-title'>
                                <span class='section-icon'>⚡</span>
                                Quick Actions
                            </h2>
                        </div>
                        
                        <div class='quick-actions'>
                            <a href='/flightmanager' class='action-card'>
                                <div class='action-icon'>➕</div>
                                <div class='action-title'>Add Flight</div>
                                <div class='action-desc'>Schedule new flight</div>
                            </a>
                            
                            <a href='/database' class='action-card'>
                                <div class='action-icon'>🔍</div>
                                <div class='action-title'>Search Database</div>
                                <div class='action-desc'>Query flight records</div>
                            </a>
                            
                            <a href='#' class='action-card'>
                                <div class='action-icon'>📊</div>
                                <div class='action-title'>Generate Report</div>
                                <div class='action-desc'>Export analytics</div>
                            </a>
                            
                            <a href='#' class='action-card'>
                                <div class='action-icon'>⚙️</div>
                                <div class='action-title'>Settings</div>
                                <div class='action-desc'>Configure system</div>
                            </a>
                        </div>
                    </div>

                    <!-- System Information -->
                    <div class='section'>
                        <div class='section-header'>
                            <h2 class='section-title'>
                                <span class='section-icon'>💻</span>
                                System Information
                            </h2>
                        </div>
                        
                        <div class='system-info'>
                            <div class='info-item'>
                                <div class='info-icon'>🖥️</div>
                                <div class='info-content'>
                                    <div class='info-label'>Server Version</div>
                                    <div class='info-value'>AeroWay v2.4.1</div>
                                </div>
                            </div>
                            
                            <div class='info-item'>
                                <div class='info-icon'>⏰</div>
                                <div class='info-content'>
                                    <div class='info-label'>Uptime</div>
                                    <div class='info-value'>7d 14h 32m</div>
                                </div>
                            </div>
                            
                            <div class='info-item'>
                                <div class='info-icon'>💾</div>
                                <div class='info-content'>
                                    <div class='info-label'>Database Size</div>
                                    <div class='info-value'>384 MB</div>
                                </div>
                            </div>
                            
                            <div class='info-item'>
                                <div class='info-icon'>📡</div>
                                <div class='info-content'>
                                    <div class='info-label'>API Requests</div>
                                    <div class='info-value'>12,847</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <script>
                    // Particle System
                    class ParticleSystem {{
                        constructor() {{
                            this.canvas = document.createElement('canvas');
                            this.ctx = this.canvas.getContext('2d');
                            this.particles = [];
                            this.init();
                        }}

                        init() {{
                            const container = document.getElementById('particles');
                            container.appendChild(this.canvas);
                            this.resize();
                            window.addEventListener('resize', () => this.resize());
                            
                            // Create particles
                            for (let i = 0; i < 50; i++) {{
                                this.particles.push({{
                                    x: Math.random() * this.canvas.width,
                                    y: Math.random() * this.canvas.height,
                                    vx: (Math.random() - 0.5) * 0.5,
                                    vy: (Math.random() - 0.5) * 0.5,
                                    size: Math.random() * 2 + 1,
                                    opacity: Math.random() * 0.5 + 0.2
                                }});
                            }}
                            
                            this.animate();
                        }}

                        resize() {{
                            this.canvas.width = window.innerWidth;
                            this.canvas.height = window.innerHeight;
                        }}

                        animate() {{
                            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                            
                            this.particles.forEach(particle => {{
                                particle.x += particle.vx;
                                particle.y += particle.vy;
                                
                                if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
                                if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
                                
                                this.ctx.beginPath();
                                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                                this.ctx.fillStyle = `rgba(59, 130, 246, ${{particle.opacity}})`;
                                this.ctx.fill();
                            }});
                            
                            // Connect nearby particles
                            this.particles.forEach((p1, i) => {{
                                this.particles.slice(i + 1).forEach(p2 => {{
                                    const dx = p1.x - p2.x;
                                    const dy = p1.y - p2.y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    
                                    if (distance < 150) {{
                                        this.ctx.beginPath();
                                        this.ctx.moveTo(p1.x, p1.y);
                                        this.ctx.lineTo(p2.x, p2.y);
                                        this.ctx.strokeStyle = `rgba(59, 130, 246, ${{(150 - distance) / 150 * 0.2}})`;
                                        this.ctx.stroke();
                                    }}
                                }});
                            }});
                            
                            requestAnimationFrame(() => this.animate());
                        }}
                    }}

                    // Initialize particle system
                    new ParticleSystem();

                    // Animate numbers
                    function animateValue(element, start, end, duration) {{
                        const range = end - start;
                        const startTime = performance.now();
                        
                        function update(currentTime) {{
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            const current = Math.floor(start + range * progress);
                            
                            element.textContent = current.toLocaleString();
                            
                            if (progress < 1) {{
                                requestAnimationFrame(update);
                            }}
                        }}
                        
                        requestAnimationFrame(update);
                    }}

                    // Animate stats on load
                    document.addEventListener('DOMContentLoaded', () => {{
                        const statValues = document.querySelectorAll('.stat-value');
                        statValues.forEach(stat => {{
                            const value = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
                            if (!isNaN(value)) {{
                                animateValue(stat, 0, value, 1500);
                            }}
                        }});
                    }});

                    // Add hover effects to cards
                    const cards = document.querySelectorAll('.stat-card, .action-card');
                    cards.forEach(card => {{
                        card.addEventListener('mouseenter', function(e) {{
                            const rect = this.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            
                            this.style.transform = `translateY(-4px) rotateX(${{(y - rect.height / 2) / 10}}deg) rotateY(${{(x - rect.width / 2) / 10}}deg)`;
                        }});
                        
                        card.addEventListener('mouseleave', function() {{
                            this.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
                        }});
                    }});

                    // Live time update
                    function updateTime() {{
                        const now = new Date();
                        const timeString = now.toLocaleTimeString('en-US', {{ 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit' 
                        }});
                        
                        // Update any time displays if needed
                        requestAnimationFrame(updateTime);
                    }}
                    updateTime();
                </script>
            </body>
            </html>";
        }
    }
}