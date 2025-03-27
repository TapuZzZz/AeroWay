using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using MySql.Data.MySqlClient;

namespace AeroWayServer.Pages.addons
{
    public static class AddFlightPage
    {
        public static string GenerateAddFlightHtml(string connectionString)
        {
            StringBuilder html = new StringBuilder();
            
            // Get airport codes for the dropdowns
            List<string> airportCodes = GetAirportCodes(connectionString);
            
            // Get aircraft models for the dropdown
            List<string> aircraftModels = GetAircraftModels(connectionString);
            
            // Generate the Add Flight HTML form
            html.Append(@"
            <div class=""add-flight-form"">
                <form id=""flightForm"" method=""post"" onsubmit=""return addFlight(event)"">
                    <div class=""form-row"">
                        <div class=""form-group"">
                            <label for=""flightNumber"">Flight Number</label>
                            <input type=""text"" id=""flightNumber"" name=""flightNumber"" placeholder=""AW123"" required>
                        </div>
                        
                        <div class=""form-group"">
                            <label for=""aircraft"">Aircraft</label>
                            <select id=""aircraft"" name=""aircraft"" required>
                                <option value="""" selected disabled>Select Aircraft</option>");
            
            // Add aircraft options
            foreach (var aircraft in aircraftModels)
            {
                html.Append($"<option value=\"{aircraft}\">{aircraft}</option>");
            }
            
            html.Append(@"
                            </select>
                        </div>
                    </div>

                    <div class=""form-row"">
                        <div class=""form-group"">
                            <label for=""origin"">Origin</label>
                            <select id=""origin"" name=""origin"" required>
                                <option value="""" selected disabled>Select Origin</option>");
            
            // Add origin airport options
            foreach (var airport in airportCodes)
            {
                html.Append($"<option value=\"{airport}\">{airport}</option>");
            }
            
            html.Append(@"
                            </select>
                        </div>
                        
                        <div class=""form-group"">
                            <label for=""destination"">Destination</label>
                            <select id=""destination"" name=""destination"" required>
                                <option value="""" selected disabled>Select Destination</option>");
            
            // Add destination airport options
            foreach (var airport in airportCodes)
            {
                html.Append($"<option value=\"{airport}\">{airport}</option>");
            }
            
            html.Append(@"
                            </select>
                        </div>
                    </div>
                    
                    <div class=""form-row"">
                        <div class=""form-group"">
                            <label for=""departureTime"">Departure Time</label>
                            <input type=""datetime-local"" id=""departureTime"" name=""departureTime"" required>
                        </div>
                        
                        <div class=""form-group"">
                            <label for=""arrivalTime"">Arrival Time</label>
                            <input type=""datetime-local"" id=""arrivalTime"" name=""arrivalTime"" required>
                        </div>
                    </div>
                    
                    <div class=""form-row"">
                        <div class=""form-group"">
                            <label for=""gate"">Gate</label>
                            <input type=""text"" id=""gate"" name=""gate"" placeholder=""A1"">
                        </div>
                        
                        <div class=""form-group"">
                            <label for=""terminal"">Terminal</label>
                            <input type=""text"" id=""terminal"" name=""terminal"" placeholder=""T3"">
                        </div>
                        
                        <div class=""form-group"">
                            <label for=""status"">Status</label>
                            <select id=""status"" name=""status"" required>
                                <option value=""Scheduled"" selected>Scheduled</option>
                                <option value=""Boarding"">Boarding</option>
                                <option value=""Departed"">Departed</option>
                                <option value=""Arrived"">Arrived</option>
                                <option value=""Delayed"">Delayed</option>
                                <option value=""Cancelled"">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class=""form-section-title"">Pricing and Seating</div>
                    
                    <div class=""form-row"">
                        <div class=""form-group"">
                            <label for=""economyPrice"">Economy Price ($)</label>
                            <input type=""number"" id=""economyPrice"" name=""economyPrice"" min=""0"" step=""0.01"" placeholder=""299.99"" required>
                        </div>
                        
                        <div class=""form-group"">
                            <label for=""businessPrice"">Business Price ($)</label>
                            <input type=""number"" id=""businessPrice"" name=""businessPrice"" min=""0"" step=""0.01"" placeholder=""699.99"" required>
                        </div>
                        
                        <div class=""form-group"">
                            <label for=""firstClassPrice"">First Class Price ($)</label>
                            <input type=""number"" id=""firstClassPrice"" name=""firstClassPrice"" min=""0"" step=""0.01"" placeholder=""1299.99"">
                        </div>
                    </div>
                    
                    <div class=""form-row"">
                        <div class=""form-group"">
                            <label for=""economySeats"">Economy Seats</label>
                            <input type=""number"" id=""economySeats"" name=""economySeats"" min=""0"" placeholder=""180"" required>
                        </div>
                        
                        <div class=""form-group"">
                            <label for=""businessSeats"">Business Seats</label>
                            <input type=""number"" id=""businessSeats"" name=""businessSeats"" min=""0"" placeholder=""24"" required>
                        </div>
                        
                        <div class=""form-group"">
                            <label for=""firstClassSeats"">First Class Seats</label>
                            <input type=""number"" id=""firstClassSeats"" name=""firstClassSeats"" min=""0"" placeholder=""8"" required>
                        </div>
                    </div>
                    
                    <div class=""form-row"">
                        <div class=""form-group full-width"">
                            <label for=""availableSeats"">Available Seats (Initial)</label>
                            <input type=""number"" id=""availableSeats"" name=""availableSeats"" min=""0"" placeholder=""212"" required>
                            <small>Total seats will be calculated automatically</small>
                        </div>
                    </div>
                    
                    <div class=""form-actions"">
                        <button type=""button"" class=""popup-btn-cancel"" onclick=""window.popupManager.closePopup('addFlightPopup')"">Cancel</button>
                        <button type=""submit"" class=""popup-btn-submit"">Add Flight</button>
                    </div>
                    
                    <div id=""formMessages"" class=""form-messages""></div>
                </form>
            </div>");
            
            return html.ToString();
        }
        
        // Method to add a new flight to the database
        public static bool AddFlight(MySqlConnection connection, string flightNumber, string origin, string destination, 
            DateTime departureTime, DateTime arrivalTime, string gate, string terminal, string aircraft, 
            string status, decimal economyPrice, decimal businessPrice, decimal? firstClassPrice, 
            int economySeats, int businessSeats, int firstClassSeats, int availableSeats)
        {
            try
            {
                // Calculate total seats
                int totalSeats = economySeats + businessSeats + firstClassSeats;
                
                // Current timestamp
                string timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                
                // Create SQL query
                string query = @"
                    INSERT INTO Flights (
                        FlightNumber, Origin, Destination, DepartureTime, ArrivalTime, 
                        Gate, Terminal, Aircraft, Status, 
                        EconomyPrice, BusinessPrice, FirstClassPrice, 
                        EconomySeats, BusinessSeats, FirstClassSeats, 
                        TotalSeats, AvailableSeats, CreatedAt, UpdatedAt
                    ) VALUES (
                        @FlightNumber, @Origin, @Destination, @DepartureTime, @ArrivalTime,
                        @Gate, @Terminal, @Aircraft, @Status,
                        @EconomyPrice, @BusinessPrice, @FirstClassPrice,
                        @EconomySeats, @BusinessSeats, @FirstClassSeats,
                        @TotalSeats, @AvailableSeats, @CreatedAt, @UpdatedAt
                    );";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    // Add parameters to prevent SQL injection
                    command.Parameters.AddWithValue("@FlightNumber", flightNumber);
                    command.Parameters.AddWithValue("@Origin", origin);
                    command.Parameters.AddWithValue("@Destination", destination);
                    command.Parameters.AddWithValue("@DepartureTime", departureTime);
                    command.Parameters.AddWithValue("@ArrivalTime", arrivalTime);
                    command.Parameters.AddWithValue("@Gate", gate);
                    command.Parameters.AddWithValue("@Terminal", terminal);
                    command.Parameters.AddWithValue("@Aircraft", aircraft);
                    command.Parameters.AddWithValue("@Status", status);
                    command.Parameters.AddWithValue("@EconomyPrice", economyPrice);
                    command.Parameters.AddWithValue("@BusinessPrice", businessPrice);
                    command.Parameters.AddWithValue("@FirstClassPrice", firstClassPrice.HasValue ? (object)firstClassPrice.Value : DBNull.Value);
                    command.Parameters.AddWithValue("@EconomySeats", economySeats);
                    command.Parameters.AddWithValue("@BusinessSeats", businessSeats);
                    command.Parameters.AddWithValue("@FirstClassSeats", firstClassSeats);
                    command.Parameters.AddWithValue("@TotalSeats", totalSeats);
                    command.Parameters.AddWithValue("@AvailableSeats", availableSeats);
                    command.Parameters.AddWithValue("@CreatedAt", timestamp);
                    command.Parameters.AddWithValue("@UpdatedAt", timestamp);
                    
                    // Execute the query
                    int rowsAffected = command.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding flight: {ex.Message}");
                return false;
            }
        }
        
        // Method to get airport codes from the database
        private static List<string> GetAirportCodes(string connectionString)
        {
            List<string> airportCodes = new List<string>
            {
                "TLV", "JFK", "LHR", "CDG", "DXB", 
                "SIN", "HND", "SYD", "GRU", "CPT", 
                "LAX", "SVO", "BKK", "MEX", "EZE"
            };
            
            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    string query = @"
                    SELECT DISTINCT Origin FROM Flights
                    UNION
                    SELECT DISTINCT Destination FROM Flights
                    ORDER BY 1";
                    
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            airportCodes.Clear();
                            while (reader.Read())
                            {
                                string code = reader.GetString(0);
                                if (!string.IsNullOrEmpty(code))
                                {
                                    airportCodes.Add(code);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching airport codes: {ex.Message}");
                // Fall back to default codes if query fails
            }
            
            return airportCodes;
        }
        
        // Method to get aircraft models from the database
        private static List<string> GetAircraftModels(string connectionString)
        {
            List<string> aircraftModels = new List<string>
            {
                "Boeing 737-800", 
                "Boeing 777-300ER", 
                "Boeing 787-9", 
                "Airbus A320neo", 
                "Airbus A330-300", 
                "Airbus A350-900",
                "Embraer E190"
            };
            
            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    string query = @"
                    SELECT DISTINCT Aircraft 
                    FROM Flights 
                    WHERE Aircraft IS NOT NULL AND Aircraft != ''
                    ORDER BY Aircraft";
                    
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            aircraftModels.Clear();
                            while (reader.Read())
                            {
                                string aircraft = reader.GetString(0);
                                if (!string.IsNullOrEmpty(aircraft))
                                {
                                    aircraftModels.Add(aircraft);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching aircraft models: {ex.Message}");
                // Fall back to default models if query fails
            }
            
            return aircraftModels;
        }
    }
}