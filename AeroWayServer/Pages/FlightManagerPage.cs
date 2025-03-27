using System;
using System.Text;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Data;
using System.Text.Json;
using MySql.Data.MySqlClient;
using AeroWayServer.utils;
using AeroWayServer.Pages.addons;

namespace AeroWayServer.Pages
{
    public static class FlightManagerPage
    {
        public static string GenerateFlightManagerHtml(string connectionString)
        {
            StringBuilder html = new StringBuilder();
            string lastUpdate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

            // קריאת כל תוכן ה-CSS וה-JS באופן מרוכז ויעיל
            StringBuilder cssBuilder = new StringBuilder();
            cssBuilder.Append(ReadFileContent("wwwroot/css/FlightManager.css", "/* CSS file not found */"));
            
            // קריאת כל קבצי התוספים מהתיקייה
            if (Directory.Exists("wwwroot/css/addons"))
            {
                foreach (string cssFile in Directory.GetFiles("wwwroot/css/addons", "*.css"))
                {
                    cssBuilder.Append(File.ReadAllText(cssFile));
                }
            }
            
            StringBuilder jsBuilder = new StringBuilder();
            jsBuilder.Append(ReadFileContent("wwwroot/js/FlightManager.js", "// JavaScript file not found"));
            
            if (Directory.Exists("wwwroot/js/addons"))
            {
                foreach (string jsFile in Directory.GetFiles("wwwroot/js/addons", "*.js"))
                {
                    jsBuilder.Append(File.ReadAllText(jsFile));
                }
            }

            // HTML header
            html.Append(@"
            <!DOCTYPE html>
            <html lang=""en"">
            <head>
                <title>AeroWay Flight Manager</title>
                <meta charset=""UTF-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                <link href=""https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap"" rel=""stylesheet"">
                <style>");
            
            html.Append(cssBuilder.ToString());
            
            html.Append(@"
                </style>
            </head>
            <body>
                <div class=""dashboard"">
                    <aside class=""sidebar"">
                        <div class=""logo"">
                            <span class=""logo-text"">AeroWay</span>
                            <span class=""logo-subtext"">FLIGHT MANAGER</span>
                        </div>
                        
                        <div class=""divider""></div>
                        
                        <div class=""sidebar-buttons"">
                            <div id=""refreshStatus"" class=""sidebar-button status-active"" onclick=""toggleRefresh()"">
                                <span class=""status-icon"">🔄</span>
                                <span class=""status-text"">Auto Refresh</span>
                            </div>

                            <button class=""sidebar-button"" onclick=""toggleTheme()"">
                                <span id=""themeIcon"">🌞</span>
                                <span id=""themeText"">Light Mode</span>
                            </button>

                            <button class=""sidebar-button"" onclick=""window.location.href='/dashboard'"">
                                <span>📊</span>
                                <span>Dashboard</span>
                            </button>

                            <button class=""sidebar-button"" onclick=""window.location.href='/database'"">
                                <span>🗄️</span>
                                <span>Database</span>
                            </button>
                            
                            <div class=""sidebar-button"">
                                <span class=""status-icon"">🕒</span>
                                <span id=""lastUpdateTime"">");
            
            html.Append(lastUpdate);
            
            html.Append(@"</span>
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
                        <div class=""page-header"">
                            <div class=""page-title"">
                                <span class=""page-header-icon"">✈️</span>
                                <h1>Manage Flights</h1>
                            </div>
                        </div>
                        
                        <!-- Action Cards Section -->
                        <div class=""action-cards"">
                            <div class=""action-card add-flight"">
                                <div class=""action-icon"">✈️</div>
                                <div class=""action-title"">Add New Flight</div>
                                <div class=""action-subtitle"">Create and publish new flight routes</div>
                            </div>
                            
                            <div class=""action-card route-planning"">
                                <div class=""action-icon"">🗺️</div>
                                <div class=""action-title"">Route Planning</div>
                                <div class=""action-subtitle"">Optimize flight paths and connections</div>
                            </div>
                            
                            <div class=""action-card weather-alerts"">
                                <div class=""action-icon"">🌦️</div>
                                <div class=""action-title"">Weather Alerts</div>
                                <div class=""action-subtitle"">Monitor weather conditions for flights</div>
                            </div>
                            
                            <div class=""action-card crew-assignments"">
                                <div class=""action-icon"">👨‍✈️</div>
                                <div class=""action-title"">Crew Assignments</div>
                                <div class=""action-subtitle"">Schedule pilots and cabin crew</div>
                            </div>
                        </div>
                        
                        <!-- Flight Table -->
                        <div class=""flights-table-container"">");
            
            // Get flight statistics
            var stats = GetFlightStatistics(connectionString);
            
            html.Append(@"
                            <div class=""flights-table-header"">
                                <div class=""flight-stats"">");
            
            // Updated stats format with more compact design
            html.Append($@"
                                    <div class=""stat-item total"">
                                        <span class=""stat-icon"">🌎</span>
                                        <span class=""stat-value"">{stats.Total}</span>
                                        <span class=""stat-label"">Total</span>
                                    </div>
                                    <div class=""stat-item scheduled"">
                                        <span class=""stat-icon"">🕒</span>
                                        <span class=""stat-value"">{stats.Scheduled}</span>
                                        <span class=""stat-label"">Scheduled</span>
                                    </div>
                                    <div class=""stat-item boarding"">
                                        <span class=""stat-icon"">🧳</span>
                                        <span class=""stat-value"">{stats.Boarding}</span>
                                        <span class=""stat-label"">Boarding</span>
                                    </div>
                                    <div class=""stat-item departed"">
                                        <span class=""stat-icon"">🛫</span>
                                        <span class=""stat-value"">{stats.Departed}</span>
                                        <span class=""stat-label"">Departed</span>
                                    </div>
                                    <div class=""stat-item arrived"">
                                        <span class=""stat-icon"">🛬</span>
                                        <span class=""stat-value"">{stats.Arrived}</span>
                                        <span class=""stat-label"">Arrived</span>
                                    </div>
                                    <div class=""stat-item delayed"">
                                        <span class=""stat-icon"">⏰</span>
                                        <span class=""stat-value"">{stats.Delayed}</span>
                                        <span class=""stat-label"">Delayed</span>
                                    </div>
                                    <div class=""stat-item cancelled"">
                                        <span class=""stat-icon"">❌</span>
                                        <span class=""stat-value"">{stats.Cancelled}</span>
                                        <span class=""stat-label"">Cancelled</span>
                                    </div>
                                </div>
                                
                                <div class=""flight-search"">
                                    <span class=""search-icon"">🔍</span>
                                    <input type=""text"" class=""search-input"" placeholder=""Search flights..."" id=""flightSearchInput"">
                                    <button class=""clear-search"" id=""clearSearch""></button>
                                </div>
                            </div>
                            
                            <div class=""flights-table-wrapper"">
                                <table class=""flights-table"">
                                    <thead>
                                        <tr>
                                            <th>Flight Number</th>
                                            <th>Origin</th>
                                            <th>Destination</th>
                                            <th>Departure Time</th>
                                            <th>Arrival Time</th>
                                            <th>Gate</th>
                                            <th>Ticket Price</th>
                                            <th>Available / Total</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>");
            
            // Generate flight rows
            html.Append(GenerateFlightRows(connectionString));
            
            html.Append(@"
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                </div>");
                
            // הוספת תבניות HTML למודלים הקופצים מהקבצים החדשים
            html.Append(GeneratePopupModels(connectionString));
                
            html.Append(@"
                <script>");
                
            html.Append(jsBuilder.ToString());
                
            html.Append(@"
                </script>
            </body>
            </html>");

            return html.ToString();
        }
        
        // פונקציה שקוראת קובץ ומחזירה את התוכן שלו או הודעת ברירת מחדל
        private static string ReadFileContent(string path, string defaultMessage)
        {
            return File.Exists(path) ? File.ReadAllText(path) : defaultMessage;
        }
        
        private static string GetImageAsBase64(string path)
        {
            try
            {
                if (File.Exists(path))
                {
                    byte[] imageBytes = File.ReadAllBytes(path);
                    return Convert.ToBase64String(imageBytes);
                }
                return "";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading image: {ex.Message}");
                return "";
            }
        }
        
        // Updated GeneratePopupModels function to use the new addon modules
        private static string GeneratePopupModels(string connectionString)
        {
            StringBuilder popupHtml = new StringBuilder();
            
            // Add Flight Popup
            popupHtml.Append(@"
            <!-- Add Flight Modal -->
            <div id=""addFlightPopup"" class=""popup-overlay"">
                <div class=""popup-container"">
                    <div class=""popup-header"">
                        <div class=""popup-title"">
                            <span>✈️</span>
                            <span>Add New Flight</span>
                        </div>
                        <button class=""popup-close""></button>
                    </div>
                    <div class=""popup-body"">");
            
            // Load Add Flight HTML from AddFlightPage.cs
            popupHtml.Append(AddFlightPage.GenerateAddFlightHtml(connectionString));
            
            popupHtml.Append(@"
                    </div>
                </div>
            </div>");
            
            // Route Planning Modal
            popupHtml.Append(@"
            <!-- Route Planning Modal -->
            <div id=""routePlanningPopup"" class=""popup-overlay"">
                <div class=""popup-container"">
                    <div class=""popup-header"">
                        <div class=""popup-title"">
                            <span>🗺️</span>
                            <span>Route Planning</span>
                        </div>
                        <button class=""popup-close""></button>
                    </div>
                    <div class=""popup-body"">");
            
            // Load Route Planning HTML from RoutePlanningPage.cs
            popupHtml.Append(RoutePlanningPage.GenerateRoutePlanningHtml(connectionString));
            
            popupHtml.Append(@"
                    </div>
                </div>
            </div>");
            
            // Weather Alerts Modal
            popupHtml.Append(@"
            <!-- Weather Alerts Modal -->
            <div id=""weatherAlertsPopup"" class=""popup-overlay"">
                <div class=""popup-container"">
                    <div class=""popup-header"">
                        <div class=""popup-title"">
                            <span>🌦️</span>
                            <span>Weather Alerts</span>
                        </div>
                        <button class=""popup-close""></button>
                    </div>
                    <div class=""popup-body"" style=""padding: 0; margin: 0; overflow: hidden;"">");
            
            // Load Weather Alerts HTML from WeatherAlertsPage.cs
            popupHtml.Append(WeatherAlertsPage.GenerateWeatherAlertsHtml(connectionString));
            
            popupHtml.Append(@"
                    </div>
                </div>
            </div>");
                        
            // Crew Assignments Popup
            popupHtml.Append(@"
            <!-- Crew Assignments Modal -->
            <div id=""crewAssignmentsPopup"" class=""popup-overlay"">
                <div class=""popup-container"">
                    <div class=""popup-header"">
                        <div class=""popup-title"">
                            <span>👨‍✈️</span>
                            <span>Crew Assignments</span>
                        </div>
                        <button class=""popup-close""></button>
                    </div>
                    <div class=""popup-body"">");
                    
            // Load Crew Assignments HTML from CrewAssignmentsPage.cs
            //popupHtml.Append(CrewAssignmentsPage.GenerateCrewAssignmentsHtml(connectionString));
            
            popupHtml.Append(@"
                    </div>
                </div>
            </div>");

            // Get departed flights and all non-scheduled flights for the map
            var departedFlights = RoutePlanningPage.GetDepartedFlights(connectionString);
            var allFlights = RoutePlanningPage.GetAllNonScheduledFlights(connectionString);

            // Add script to initialize flight routes with all the data
            popupHtml.Append($@"
            <script>
                document.addEventListener('DOMContentLoaded', function() {{
                    // Store all flights data
                    window.allFlightsData = {JsonSerializer.Serialize(allFlights)};
                    
                    // Store departed flights data for backward compatibility
                    window.departedFlightsData = {JsonSerializer.Serialize(departedFlights)};
                }});
            </script>
            ");
            
            return popupHtml.ToString();
        }

        // Generate flight table rows
        private static string GenerateFlightRows(string connectionString)
        {
            StringBuilder rowsHtml = new StringBuilder();
            
            try
            {
                // Fetch flights from database
                List<Flight> flights = GetFlightsFromDatabase(connectionString);
                
                if (flights.Count > 0)
                {
                    foreach (var flight in flights)
                    {
                        // Format dates
                        string departureTime = flight.DepartureTime.ToString("dd/MM/yyyy HH:mm");
                        string arrivalTime = flight.ArrivalTime.ToString("dd/MM/yyyy HH:mm");
                        
                        // Status badge class
                        string statusClass = GetStatusClass(flight.Status);
                        
                        // Calculate ticket price (using economy price for display)
                        decimal ticketPrice = flight.EconomyPrice;
                        
                        // Calculate available seats
                        string availableSeats = $"{flight.AvailableSeats} / {flight.TotalSeats}";
                        
                        rowsHtml.Append($@"
                        <tr>
                            <td class=""flight-number"">{flight.FlightNumber}</td>
                            <td>{flight.Origin}</td>
                            <td>{flight.Destination}</td>
                            <td>{departureTime}</td>
                            <td>{arrivalTime}</td>
                            <td>{flight.Gate ?? "-"}</td>
                            <td>${ticketPrice:F2}</td>
                            <td>{availableSeats}</td>
                            <td><span class=""status-badge {statusClass}"">{flight.Status}</span></td>
                            <td class=""actions"">
                                <button class=""action-btn edit"" title=""Edit"" onclick=""editFlight({flight.Id})"">✏️</button>
                                <button class=""action-btn delete"" title=""Delete"" data-flight-id=""{flight.Id}"">🗑️</button>
                            </td>
                        </tr>");
                    }
                }
                else
                {
                    // No flights found
                    rowsHtml.Append(@"
                    <tr>
                        <td colspan=""10"" class=""no-data"">No flights found. Add your first flight to get started.</td>
                    </tr>");
                }
            }
            catch (Exception ex)
            {
                // Error loading flights
                rowsHtml.Append($@"
                <tr>
                    <td colspan=""10"" class=""error-data"">Error loading flights: {ex.Message}</td>
                </tr>");
                
            }
            
            return rowsHtml.ToString();
        }
        
        // Get status class for styling
        private static string GetStatusClass(string status)
        {
            return status.ToLower() switch
            {
                "scheduled" => "scheduled",
                "boarding" => "boarding",
                "departed" => "departed",
                "arrived" => "arrived",
                "delayed" => "delayed",
                "cancelled" => "cancelled",
                _ => "scheduled"
            };
        }
        
        // Get flight statistics
        private static FlightStats GetFlightStatistics(string connectionString)
        {
            FlightStats stats = new FlightStats();
            
            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    // Fixed SQL query with backticks around column names to avoid keyword issues
                    string query = @"
                    SELECT 
                        COUNT(*) as `Total`,
                        SUM(CASE WHEN Status = 'Scheduled' THEN 1 ELSE 0 END) as `ScheduledCount`,
                        SUM(CASE WHEN Status = 'Boarding' THEN 1 ELSE 0 END) as `BoardingCount`,
                        SUM(CASE WHEN Status = 'Departed' THEN 1 ELSE 0 END) as `DepartedCount`,
                        SUM(CASE WHEN Status = 'Arrived' THEN 1 ELSE 0 END) as `ArrivedCount`,
                        SUM(CASE WHEN Status = 'Delayed' THEN 1 ELSE 0 END) as `DelayedCount`,
                        SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) as `CancelledCount`
                    FROM 
                        `Flights`";
                    
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                stats.Total = reader.GetInt32("Total");
                                stats.Scheduled = reader.GetInt32("ScheduledCount");
                                stats.Boarding = reader.GetInt32("BoardingCount");
                                stats.Departed = reader.GetInt32("DepartedCount");
                                stats.Arrived = reader.GetInt32("ArrivedCount");
                                stats.Delayed = reader.GetInt32("DelayedCount");
                                stats.Cancelled = reader.GetInt32("CancelledCount");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching flight statistics: {ex.Message}");
                // Default values for display
                stats.Total = -999;
                stats.Scheduled = -999;
                stats.Boarding = -999;
                stats.Departed = -999;
                stats.Arrived = -999;
                stats.Delayed = -999;
                stats.Cancelled = -999;
            }
            
            return stats;
        }
        
        // Get flights from database
        private static List<Flight> GetFlightsFromDatabase(string connectionString)
        {
            List<Flight> flights = new List<Flight>();
            
            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    string query = @"
                    SELECT
                        ID,
                        FlightNumber,
                        Origin,
                        Destination,
                        DepartureTime,
                        ArrivalTime,
                        Gate,
                        Terminal,
                        Aircraft,
                        Status,
                        EconomyPrice,
                        BusinessPrice,
                        FirstClassPrice,
                        EconomySeats,
                        BusinessSeats,
                        FirstClassSeats,
                        (EconomySeats + BusinessSeats + FirstClassSeats) AS TotalSeats,
                        AvailableSeats,
                        CreatedAt,
                        UpdatedAt
                    FROM
                        `Flights`
                    ORDER BY
                        DepartureTime ASC";
                    
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Flight flight = new Flight
                                {
                                    Id = reader.GetInt32("ID"),
                                    FlightNumber = reader.GetString("FlightNumber"),
                                    Origin = reader.GetString("Origin"),
                                    Destination = reader.GetString("Destination"),
                                    DepartureTime = reader.GetDateTime("DepartureTime"),
                                    ArrivalTime = reader.GetDateTime("ArrivalTime"),
                                    Gate = reader.IsDBNull(reader.GetOrdinal("Gate")) ? null : reader.GetString("Gate"),
                                    Terminal = reader.IsDBNull(reader.GetOrdinal("Terminal")) ? null : reader.GetString("Terminal"),
                                    Aircraft = reader.IsDBNull(reader.GetOrdinal("Aircraft")) ? string.Empty : reader.GetString("Aircraft"),
                                    Status = reader.GetString("Status"),
                                    EconomyPrice = reader.GetDecimal("EconomyPrice"),
                                    BusinessPrice = reader.GetDecimal("BusinessPrice"),
                                    FirstClassPrice = reader.IsDBNull(reader.GetOrdinal("FirstClassPrice")) ? (decimal?)null : reader.GetDecimal("FirstClassPrice"),
                                    EconomySeats = reader.GetInt32("EconomySeats"),
                                    BusinessSeats = reader.GetInt32("BusinessSeats"),
                                    FirstClassSeats = reader.GetInt32("FirstClassSeats"),
                                    TotalSeats = reader.GetInt32("TotalSeats"),
                                    AvailableSeats = reader.GetInt32("AvailableSeats"),
                                    CreatedAt = reader.GetDateTime("CreatedAt"),
                                    UpdatedAt = reader.GetDateTime("UpdatedAt")
                                };
                                
                                flights.Add(flight);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching flights: {ex.Message}");
                // Return empty list if there's an error
            }
            
            return flights;
        }
    }
    
    // Class to hold flight statistics
    public class FlightStats
    {
        public int Total { get; set; }
        public int Scheduled { get; set; }
        public int Boarding { get; set; }
        public int Departed { get; set; }
        public int Arrived { get; set; }
        public int Delayed { get; set; }
        public int Cancelled { get; set; }
    }
    
    // Flight model class to hold flight data
    public class Flight
    {
        public int Id { get; set; }
        public required string FlightNumber { get; set; }
        public required string Origin { get; set; }
        public required string Destination { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }
        public string? Gate { get; set; }
        public string? Terminal { get; set; }
        public string Aircraft { get; set; } = string.Empty;
        public required string Status { get; set; }
        public decimal EconomyPrice { get; set; }
        public decimal BusinessPrice { get; set; }
        public decimal? FirstClassPrice { get; set; }
        public int EconomySeats { get; set; }
        public int BusinessSeats { get; set; }
        public int FirstClassSeats { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}