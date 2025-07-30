using System;
using System.IO;
using System.Linq;

namespace AeroWayServer.Web.Pages
{
    public static class LockScreenPage
    {
        public static string GetHtml()
        {
            // Read CSS and JS contents directly - try multiple paths
            string cssContent = "";
            string jsContent = "";
            
            // Try different possible paths
            string[] cssPaths = {
                "AeroWayServer/Web/wwwroot/css/lockscreen.css",
                "wwwroot/css/lockscreen.css",
                "Web/wwwroot/css/lockscreen.css",
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "css", "lockscreen.css"),
                Path.Combine(Directory.GetCurrentDirectory(), "AeroWayServer", "Web", "wwwroot", "css", "lockscreen.css"),
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "css", "lockscreen.css")
            };
            
            string[] jsPaths = {
                "AeroWayServer/Web/wwwroot/js/lockscreen.js",
                "wwwroot/js/lockscreen.js",
                "Web/wwwroot/js/lockscreen.js",
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "js", "lockscreen.js"),
                Path.Combine(Directory.GetCurrentDirectory(), "AeroWayServer", "Web", "wwwroot", "js", "lockscreen.js"),
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "js", "lockscreen.js")
            };
            
            // Find CSS file
            foreach (string path in cssPaths)
            {
                if (File.Exists(path))
                {
                    cssContent = File.ReadAllText(path);
                    break;
                }
            }
            if (string.IsNullOrEmpty(cssContent))
                cssContent = "/* CSS file not found - checked paths: " + string.Join(", ", cssPaths) + " */";
            
            // Find JS file
            foreach (string path in jsPaths)
            {
                if (File.Exists(path))
                {
                    jsContent = File.ReadAllText(path);
                    break;
                }
            }
            if (string.IsNullOrEmpty(jsContent))
                jsContent = "// JavaScript file not found - checked paths: " + string.Join(", ", jsPaths);

            return $@"
            <!DOCTYPE html>
            <html lang=""en"">
            <head>
                <title>AeroWay - Server Locked</title>
                <meta charset=""UTF-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' rel='stylesheet'>
                <style>{cssContent}</style>
            </head>
            <body>
                <!-- Background Effects -->
                <div class='bg-grid' id='bgGrid'></div>
                <div class='bg-rays' id='bgRays'></div>

                <!-- Connection Status -->
                <div class='connection-badge' id='connectionBadge'>
                    <div class='connection-dot' id='connectionDot'></div>
                    <span id='connectionText'>LOCKED</span>
                </div>

                <!-- Lock Container -->
                <div class='lock-container' id='lockContainer'>
                    <div class='lock-icon-container'>
                        <div class='lock-icon' id='lockIcon'>🔒</div>
                    </div>

                    <div class='lock-status' id='lockStatus'>
                        <div class='lock-title'>SERVER LOCKED</div>
                        <div class='lock-subtitle' id='lockSubtitle'>ACCESS DENIED</div>
                        <div class='lock-description' id='lockDescription'>
                            The AeroWay server is currently locked and not accepting connections. 
                            Please wait for the system administrator to initialize the server.
                        </div>
                    </div>

                    <div class='security-warning' id='securityWarning'>
                        <div class='warning-icon'>⚠️</div>
                        <div>Unauthorized access attempts are monitored and logged</div>
                    </div>

                    <div class='status-monitor' id='statusMonitor'>
                        <div class='monitor-header' id='monitorHeader'>
                            <div class='monitor-title' id='monitorTitle'>System Monitor</div>
                            <div class='monitor-status' id='monitorStatus'>
                                <div class='monitor-dot' id='monitorDot'></div>
                                <span>MONITORING</span>
                            </div>
                        </div>
                        <div class='monitor-info' id='monitorInfo'>
                            <div class='monitor-item'>
                                <span class='monitor-label'>Last check:</span>
                                <span class='monitor-value' id='lastCheckValue'>--:--:--</span>
                            </div>
                            <div class='monitor-item'>
                                <span class='monitor-label'>Attempts:</span>
                                <span class='monitor-value' id='attemptsValue'>0</span>
                            </div>
                            <div class='monitor-item'>
                                <span class='monitor-label'>Status:</span>
                                <span class='monitor-value' id='statusValue'>LOCKED</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Unlocking Overlay -->
                <div class='unlocking-overlay' id='unlockingOverlay'>
                    <div class='unlock-message'>
                        <div class='unlock-icon'>✈️</div>
                        <div class='unlock-text'>SERVER UNLOCKED</div>
                        <div class='unlock-subtext'>Redirecting to Dashboard...</div>
                    </div>
                </div>

                <script>{jsContent}</script>
            </body>
            </html>";
        }
    }
}