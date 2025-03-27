using System;
using System.Text;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using AeroWayServer.utils;

namespace AeroWayServer.Pages
{
    public static class DashboardPage
    {
        private static readonly string _logFilePath = Path.Combine("log", "server_log.txt");
        
        public static string GenerateAdminHtml(Dictionary<string, SessionInfo> activeSessions, string connectionString)
        {
            StringBuilder html = new StringBuilder();

            int activeSessionsCount = activeSessions.Count;
            List<SessionInfo> sessions = new List<SessionInfo>(activeSessions.Values);
            List<string> logs = new List<string>();
            
            try
            {
                if (File.Exists(_logFilePath))
                {
                    string[] logLines = File.ReadAllLines(_logFilePath);
                    logs.AddRange(logLines.Reverse().Take(15));
                }
                else
                {
                    logs.Add("Log file not found. A new log file will be created when events occur.");
                }
            }
            catch (Exception ex)
            {
                logs.Add($"Error loading logs: {ex.Message}");
            }

            string lastUpdate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            
            // Get real-time system metrics
            SystemMetricsTracker.RecordMetrics(activeSessionsCount);
            var recentMetrics = SystemMetricsTracker.GetRecentMetrics(20);
            
            // Use the latest metrics for display
            double cpuUsage = 0;
            double memoryUsage = 0;
            int threadCount = 0;
            
            if (recentMetrics.Count > 0)
            {
                var latestMetric = recentMetrics.Last();
                cpuUsage = latestMetric.CpuUsage;
                memoryUsage = latestMetric.MemoryUsage;
                threadCount = latestMetric.ThreadCount;
            }
            
            // Generate JavaScript arrays for chart data
            string timeLabelsJs = string.Join(",", recentMetrics.Select(m => $"'{m.Timestamp:HH:mm:ss}'"));
            string cpuDataJs = string.Join(",", recentMetrics.Select(m => Math.Min(100, Math.Max(0, m.CpuUsage)).ToString("F1")));
            string memoryDataJs = string.Join(",", recentMetrics.Select(m => m.MemoryUsage.ToString("F1")));
            string threadDataJs = string.Join(",", recentMetrics.Select(m => m.ThreadCount));
            string sessionDataJs = string.Join(",", recentMetrics.Select(m => m.SessionCount));

            // Read CSS and JS contents directly
            string cssContent = File.Exists("wwwroot/css/Dashboard.css") 
                ? File.ReadAllText("wwwroot/css/Dashboard.css") 
                : "/* CSS file not found */";
            
            string jsContent = File.Exists("wwwroot/js/Dashboard.js") 
                ? File.ReadAllText("wwwroot/js/Dashboard.js") 
                : "// JavaScript file not found";

            html.Append($@"
            <!DOCTYPE html>
            <html lang=""en"">
            <head>
                <title>AeroWay Dashboard</title>
                <meta charset=""UTF-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                <script src=""https://cdn.jsdelivr.net/npm/chart.js""></script>
                <script src=""https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js""></script>
                <style>{cssContent}</style>
            </head>
            <body>
                <div class=""dashboard"">
                    <aside class=""sidebar"">
                        <div class=""logo"">
                            <span class=""logo-text"">AeroWay</span>
                            <span class=""logo-subtext"">Dashboard</span>
                        </div>
                        
                        <div class=""divider""></div>
                        
                        <div class=""sidebar-buttons"">
                            <div id=""serverStatus"" class=""sidebar-button status-active"" onclick=""toggleRefresh()"">
                                <span class=""status-icon"">🟢</span>
                                <span class=""status-text"">Server Active</span>
                            </div>
                            
                            <button class=""sidebar-button"" onclick=""toggleTheme()"">
                                <span id=""themeIcon"">🌞</span>
                                <span id=""themeText"">Switch Theme</span>
                            </button>

                            <button class=""sidebar-button"" onclick=""window.location.href='/database'"">
                                <span id=""themeIcon"">🗄️</span>
                                <span id=""themeText"">Database</span>
                            </button>

                            <button class=""sidebar-button"" onclick=""window.location.href='/flightmanager'"">
                                <span>✈️</span>
                                <span>Flight Manager</span>
                            </button>
                            
                            <div class=""sidebar-button"">
                                <span class=""status-icon"">🕒</span>
                                <span id=""lastUpdateTime"">{lastUpdate}</span>
                            </div>
                            
                            <form action=""/logout"" method=""GET"">
                                <button class=""sidebar-button danger"">
                                    <span>🚪</span>
                                    <span>Logout</span>
                                </button>
                            </form>
                        </div>
                    </aside>

                    <main class=""main-content"">
                        <div class=""stat-grid"">
                            <div class=""stat-card"">
                                <div class=""stat-title"">CPU Usage</div>
                                <div class=""stat-value"">{cpuUsage:F1}%</div>
                            </div>
                            <div class=""stat-card"">
                                <div class=""stat-title"">Memory Usage</div>
                                <div class=""stat-value"">{memoryUsage:F1} MB</div>
                            </div>
                            <div class=""stat-card"">
                                <div class=""stat-title"">Active Threads</div>
                                <div class=""stat-value"">{threadCount}</div>
                            </div>
                            <div class=""stat-card"">
                                <div class=""stat-title"">Active Sessions</div>
                                <div class=""stat-value"">{activeSessionsCount}</div>
                            </div>
                        </div>

                        <div class=""chart-container"">
                            <canvas id=""performanceChart"" style=""height: 300px;""></canvas>
                        </div>

                        <div style=""margin-bottom: 1.5rem;"">
                            <h2>Active Sessions</h2>
                            <table class=""sessions-table"">
                                <thead>
                                    <tr>
                                        <th>Session ID</th>
                                        <th>IP Address</th>
                                        <th>Duration</th>
                                        <th>Messages</th>
                                    </tr>
                                </thead>
                                <tbody>");

            if (sessions.Count == 0)
            {
                html.Append("<tr><td colspan='4' style='text-align: center; color: #94a3b8;'>No active sessions</td></tr>");
            }
            else
            {
                foreach (var session in sessions)
                {
                    html.Append($@"
                        <tr>
                            <td>{session.SessionId}</td>
                            <td>{session.ClientIP}</td>
                            <td>{session.GetDuration()}</td>
                            <td>{session.MessageCount}</td>
                        </tr>");
                }
            }

            html.Append(@"
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h2>Recent Logs</h2>
                            <div class=""log-container"">");

            foreach (var log in logs)
            {
                html.Append($"<div class=\"log-entry\">{log}</div>");
            }

            html.Append($@"
                            </div>
                        </div>
                    </main>
                </div>

                <script>
                    // Expose chart data to global scope for JavaScript initialization
                    window.timeLabels = [{timeLabelsJs}];
                    window.cpuData = [{cpuDataJs}];
                    window.memoryData = [{memoryDataJs}];
                    window.threadData = [{threadDataJs}];
                    window.sessionData = [{sessionDataJs}];
                </script>
                <script>{jsContent}</script>
            </body>
            </html>");

            return html.ToString();
        }
    }
}