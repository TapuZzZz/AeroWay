using System;
using System.Text;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using MySql.Data.MySqlClient;

namespace AeroWayServer.Pages.addons
{
    public static class RoutePlanningPage
    {
        public static string GenerateRoutePlanningHtml(string connectionString)
        {
            StringBuilder html = new StringBuilder();
            
            // Prepare base64 images for maps
            string darkMapImageBase64 = GetImageAsBase64("wwwroot/img/WorldMapDark.png");
            string lightMapImageBase64 = GetImageAsBase64("wwwroot/img/WorldMapLight.png");
            
            // Generate the Route Planning HTML
            html.Append($@"
            <div class=""map-container"">
                <!-- Map Images -->
                <img id=""darkMapImage"" class=""world-map-image dark-map"" 
                    src=""data:image/png;base64,{darkMapImageBase64}"" 
                    alt=""World Map"">
                    
                <img id=""lightMapImage"" class=""world-map-image light-map"" 
                    src=""data:image/png;base64,{lightMapImageBase64}"" 
                    style=""display: none;"" 
                    alt=""World Map"">
                
                <!-- Airport Points with Tooltip Structure -->
                <div class=""airport-points-container"">
                    <!-- Tel Aviv Ben Gurion, Israel -->
                    <div class=""airport-point"" data-code=""TLV"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Tel Aviv Ben Gurion</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">TLV</span>
                                <span class=""tooltip-country"">• Israel</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- New York JFK, USA -->
                    <div class=""airport-point"" data-code=""JFK"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">New York JFK</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">JFK</span>
                                <span class=""tooltip-country"">• USA</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- London Heathrow, UK -->
                    <div class=""airport-point"" data-code=""LHR"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">London Heathrow</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">LHR</span>
                                <span class=""tooltip-country"">• UK</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Paris Charles de Gaulle, France -->
                    <div class=""airport-point"" data-code=""CDG"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Paris Charles de Gaulle</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">CDG</span>
                                <span class=""tooltip-country"">• France</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dubai International, UAE -->
                    <div class=""airport-point"" data-code=""DXB"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Dubai International</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">DXB</span>
                                <span class=""tooltip-country"">• UAE</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Singapore Changi, Singapore -->
                    <div class=""airport-point"" data-code=""SIN"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Singapore Changi</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">SIN</span>
                                <span class=""tooltip-country"">• Singapore</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tokyo Haneda, Japan -->
                    <div class=""airport-point"" data-code=""HND"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Tokyo Haneda</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">HND</span>
                                <span class=""tooltip-country"">• Japan</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sydney Kingsford Smith, Australia -->
                    <div class=""airport-point"" data-code=""SYD"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Sydney Kingsford Smith</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">SYD</span>
                                <span class=""tooltip-country"">• Australia</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- São Paulo Guarulhos, Brazil -->
                    <div class=""airport-point"" data-code=""GRU"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">São Paulo Guarulhos</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">GRU</span>
                                <span class=""tooltip-country"">• Brazil</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cape Town International, South Africa -->
                    <div class=""airport-point"" data-code=""CPT"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Cape Town International</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">CPT</span>
                                <span class=""tooltip-country"">• South Africa</span>
                            </div>
                        </div>
                    </div>

                    <!-- Buenos Aires Ezeiza, Argentina -->
                    <div class=""airport-point"" data-code=""EZE"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Buenos Aires Ezeiza</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">EZE</span>
                                <span class=""tooltip-country"">• Argentina</span>
                            </div>
                        </div>
                    </div>

                    <!-- Los Angeles International, USA -->
                    <div class=""airport-point"" data-code=""LAX"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Los Angeles International</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">LAX</span>
                                <span class=""tooltip-country"">• USA</span>
                            </div>
                        </div>
                    </div>

                    <!-- Moscow Sheremetyevo, Russia -->
                    <div class=""airport-point"" data-code=""SVO"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Moscow Sheremetyevo</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">SVO</span>
                                <span class=""tooltip-country"">• Russia</span>
                            </div>
                        </div>
                    </div>

                    <!-- Bangkok Suvarnabhumi, Thailand -->
                    <div class=""airport-point"" data-code=""BKK"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Bangkok Suvarnabhumi</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">BKK</span>
                                <span class=""tooltip-country"">• Thailand</span>
                            </div>
                        </div>
                    </div>

                    <!-- Mexico City Benito Juárez, Mexico -->
                    <div class=""airport-point"" data-code=""MEX"">
                        <div class=""airport-dot""></div>
                        <div class=""airport-tooltip"">
                            <span class=""tooltip-title"">Mexico City Benito Juárez</span>
                            <div class=""tooltip-code-container"">
                                <span class=""tooltip-code"">MEX</span>
                                <span class=""tooltip-country"">• Mexico</span>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                <!-- Copyright Information -->
                <div class=""map-attribution"">Map data © 2025 AeroWay</div>
            </div>
            
            <!-- Error Message with Modern SVG Warning Icon -->
            <div class=""screen-too-small"">
                <div class=""warning-icon-container"">
                    <svg class=""warning-icon-svg"" viewBox=""0 0 100 100"" xmlns=""http://www.w3.org/2000/svg"">
                        <circle class=""warning-circle"" cx=""50"" cy=""50"" r=""45""/>
                        <text class=""warning-mark"" x=""50"" y=""70"" text-anchor=""middle"" font-size=""60"" font-weight=""bold"">!</text>
                    </svg>
                </div>
                <h2>Incompatible Screen Size</h2>
                <p>For optimal viewing, please use a screen with at least 1280x720 resolution. This application is designed for MacBook Pro 16-inch and similar displays.</p>
                <button class=""screen-too-small-button"" onclick=""window.popupManager.closePopup('routePlanningPopup')"">Close</button>
            </div>");
            
            return html.ToString();
        }
        
        // Helper method to get images as base64
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
        
        // Get departed flights for route visualization
        public static List<FlightRoute> GetDepartedFlights(string connectionString)
        {
            List<FlightRoute> departedFlights = new List<FlightRoute>();
            
            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    string query = @"
                    SELECT
                        FlightNumber,
                        Origin,
                        Destination,
                        Status,
                        Aircraft,
                        DepartureTime,
                        ArrivalTime
                    FROM
                        `Flights`
                    WHERE
                        Status = 'Departed'
                    ORDER BY
                        DepartureTime DESC";
                    
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                FlightRoute flight = new FlightRoute
                                {
                                    FlightNumber = reader.GetString("FlightNumber"),
                                    Origin = reader.GetString("Origin"),
                                    Destination = reader.GetString("Destination"),
                                    Status = reader.GetString("Status"),
                                    Aircraft = reader.IsDBNull(reader.GetOrdinal("Aircraft")) ? null : reader.GetString("Aircraft"),
                                    DepartureTime = reader.GetDateTime("DepartureTime"),
                                    ArrivalTime = reader.GetDateTime("ArrivalTime")
                                };
                                
                                departedFlights.Add(flight);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching departed flights: {ex.Message}");
            }
            
            return departedFlights;
        }
        
        // Get all non-scheduled flights for visualization
        public static List<FlightRoute> GetAllNonScheduledFlights(string connectionString)
        {
            List<FlightRoute> allFlights = new List<FlightRoute>();
            
            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    string query = @"
                    SELECT
                        FlightNumber,
                        Origin,
                        Destination,
                        Status,
                        Aircraft,
                        DepartureTime,
                        ArrivalTime
                    FROM
                        `Flights`
                    WHERE
                        Status != 'Scheduled'
                    ORDER BY
                        DepartureTime DESC";
                    
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                FlightRoute flight = new FlightRoute
                                {
                                    FlightNumber = reader.GetString("FlightNumber"),
                                    Origin = reader.GetString("Origin"),
                                    Destination = reader.GetString("Destination"),
                                    Status = reader.GetString("Status"),
                                    Aircraft = reader.IsDBNull(reader.GetOrdinal("Aircraft")) ? null : reader.GetString("Aircraft"),
                                    DepartureTime = reader.GetDateTime("DepartureTime"),
                                    ArrivalTime = reader.GetDateTime("ArrivalTime")
                                };
                                
                                allFlights.Add(flight);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching all flights: {ex.Message}");
            }
            
            return allFlights;
        }
    }
    
    // Class to hold flight route data
    public class FlightRoute
    {
        public string? FlightNumber { get; set; }
        public string? Origin { get; set; }
        public string? Destination { get; set; }
        public string? Status { get; set; }
        public string? Aircraft { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }
    }
}