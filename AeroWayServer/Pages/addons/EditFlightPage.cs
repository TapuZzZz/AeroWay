using System;
using System.Text;
using System.Net;
using System.IO;
using MySql.Data.MySqlClient;
using AeroWayServer.utils;
using System.Collections.Generic;
using System.Text.Json;
using System.Globalization;

namespace AeroWayServer.Pages.addons
{
    public static class EditFlightPage
    {
        // Handle flight data fetch request
        public static void HandleGetFlightRequest(HttpListenerContext context, string connectionString)
        {
            // Set response headers
            context.Response.ContentType = "application/json";
            context.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
            context.Response.Headers.Add("Pragma", "no-cache");
            context.Response.Headers.Add("Expires", "0");
            
            // Get the client's IP address
            string clientIp = GetRealIpAddress(context);
            
            // Get the logged-in username
            string username = AdminLogIn.GetUsernameFromCookie(context.Request);
            
            try
            {
                // Check if user is authenticated
                if (!AdminLogIn.IsSessionAuthenticated(context))
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] 🚫 Unauthorized flight data request from IP: {clientIp}");
                    SendErrorResponse(context.Response, "Unauthorized access", 401);
                    return;
                }

                // Parse query string to get flight ID
                string flightIdStr = context.Request.QueryString["id"];
                if (string.IsNullOrEmpty(flightIdStr))
                {
                    SendErrorResponse(context.Response, "Flight ID is required", 400);
                    return;
                }
                
                // Parse flight ID
                if (!int.TryParse(flightIdStr, out int flightId))
                {
                    SendErrorResponse(context.Response, "Invalid Flight ID format", 400);
                    return;
                }
                
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] 🔍 API Request: Get Flight | ID: {flightId} | IP: {clientIp} | User: {username}");
                
                // Get flight data from database
                var flightData = GetFlightData(flightId, connectionString);
                
                if (flightData == null)
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ❌ Flight not found | ID: {flightId} | User: {username} | IP: {clientIp}");
                    SendErrorResponse(context.Response, "Flight not found", 404);
                    return;
                }
                
                // Convert flight data to JSON and send response
                string jsonResponse = JsonSerializer.Serialize(flightData, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = true
                });
                
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ✅ Flight data retrieved | ID: {flightId} | Flight Number: {flightData.FlightNumber} | User: {username}");
                
                SendJsonResponse(context.Response, jsonResponse, 200);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ❌ Error handling get flight request from {username} ({clientIp}): {ex.Message}");
                SendErrorResponse(context.Response, "Internal server error", 500);
            }
        }
        
        // Handle flight update request
        public static void HandleUpdateFlightRequest(HttpListenerContext context, string connectionString)
        {
            // Set response headers
            context.Response.ContentType = "application/json";
            context.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
            context.Response.Headers.Add("Pragma", "no-cache");
            context.Response.Headers.Add("Expires", "0");
            
            // Get the client's IP address
            string clientIp = GetRealIpAddress(context);
            
            // Get the logged-in username
            string username = AdminLogIn.GetUsernameFromCookie(context.Request);
            
            try
            {
                // Verify it's a POST request
                if (context.Request.HttpMethod != "POST")
                {
                    SendErrorResponse(context.Response, "Method not allowed", 405);
                    return;
                }
                
                // Check if user is authenticated
                if (!AdminLogIn.IsSessionAuthenticated(context))
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] 🚫 Unauthorized flight update attempt from IP: {clientIp}");
                    SendErrorResponse(context.Response, "Unauthorized access", 401);
                    return;
                }

                // Read request body
                string requestBody;
                using (var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding))
                {
                    requestBody = reader.ReadToEnd();
                }
                
                // Deserialize the flight data
                FlightUpdateModel? updatedFlight;
                try
                {
                    updatedFlight = JsonSerializer.Deserialize<FlightUpdateModel>(requestBody, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ❌ Invalid flight data format: {ex.Message}");
                    SendErrorResponse(context.Response, "Invalid flight data format", 400);
                    return;
                }
                
                if (updatedFlight == null)
                {
                    SendErrorResponse(context.Response, "Invalid flight data", 400);
                    return;
                }
                
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] 📝 API Request: Update Flight | ID: {updatedFlight.Id} | IP: {clientIp} | User: {username}");
                
                // Validate the flight data
                var validationResult = ValidateFlightData(updatedFlight);
                if (!validationResult.IsValid)
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ❌ Validation failed: {validationResult.ErrorMessage} | User: {username} | IP: {clientIp}");
                    SendErrorResponse(context.Response, validationResult.ErrorMessage, 400);
                    return;
                }
                
                // Get current flight data for comparison and validation
                var currentFlight = GetFlightData(updatedFlight.Id, connectionString);
                if (currentFlight == null)
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ❌ Flight not found | ID: {updatedFlight.Id} | User: {username} | IP: {clientIp}");
                    SendErrorResponse(context.Response, "Flight not found", 404);
                    return;
                }
                
                // Check if the flight status allows modification
                if (IsFlightInFinalState(currentFlight) && updatedFlight.Status != currentFlight.Status)
                {
                    string errorMessage = $"Cannot modify flight with status '{currentFlight.Status}' to a different status";
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ⚠️ Status change not allowed | Flight: {currentFlight.FlightNumber} | Status: {currentFlight.Status} | User: {username}");
                    SendErrorResponse(context.Response, errorMessage, 403);
                    return;
                }
                
                // Update the flight in the database
                bool success = UpdateFlightInDatabase(updatedFlight, connectionString);
                
                if (success)
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ✅ Flight updated | ID: {updatedFlight.Id} | Flight: {updatedFlight.FlightNumber} | User: {username}");
                    
                    // Send success response
                    SendSuccessResponse(context.Response, "Flight updated successfully");
                }
                else
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ❌ Failed to update flight | ID: {updatedFlight.Id} | User: {username} | IP: {clientIp}");
                    SendErrorResponse(context.Response, "Failed to update flight", 500);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ❌ Error handling update flight request from {username} ({clientIp}): {ex.Message}");
                SendErrorResponse(context.Response, "Internal server error", 500);
            }
        }
        
        // Validation class for flight data
        private class ValidationResult
        {
            public bool IsValid { get; set; }
            public string ErrorMessage { get; set; } = "";
            
            public ValidationResult(bool isValid, string errorMessage = "")
            {
                IsValid = isValid;
                ErrorMessage = errorMessage;
            }
        }
        
        // Validate flight data
        private static ValidationResult ValidateFlightData(FlightUpdateModel flight)
        {
            // Check required fields
            if (string.IsNullOrWhiteSpace(flight.FlightNumber))
                return new ValidationResult(false, "Flight number is required");
                
            if (string.IsNullOrWhiteSpace(flight.Origin))
                return new ValidationResult(false, "Origin is required");
                
            if (string.IsNullOrWhiteSpace(flight.Destination))
                return new ValidationResult(false, "Destination is required");
                
            if (string.IsNullOrWhiteSpace(flight.DepartureTime))
                return new ValidationResult(false, "Departure time is required");
                
            if (string.IsNullOrWhiteSpace(flight.ArrivalTime))
                return new ValidationResult(false, "Arrival time is required");
                
            if (string.IsNullOrWhiteSpace(flight.Status))
                return new ValidationResult(false, "Status is required");
                
            if (string.IsNullOrWhiteSpace(flight.Aircraft))
                return new ValidationResult(false, "Aircraft is required");
            
            // Flight number format (alphanumeric)
            if (!System.Text.RegularExpressions.Regex.IsMatch(flight.FlightNumber, @"^[A-Za-z0-9]+$"))
                return new ValidationResult(false, "Flight number must contain only letters and numbers");
                
            // Origin and destination format (3 uppercase letters)
            if (!System.Text.RegularExpressions.Regex.IsMatch(flight.Origin, @"^[A-Z]{3}$"))
                return new ValidationResult(false, "Origin must be a 3-letter airport code (uppercase)");
                
            if (!System.Text.RegularExpressions.Regex.IsMatch(flight.Destination, @"^[A-Z]{3}$"))
                return new ValidationResult(false, "Destination must be a 3-letter airport code (uppercase)");
                
            // Origin and destination cannot be the same
            if (flight.Origin == flight.Destination)
                return new ValidationResult(false, "Origin and destination cannot be the same");
                
            // Validate dates
            DateTime departureTime, arrivalTime;
            
            if (!DateTime.TryParse(flight.DepartureTime, out departureTime))
                return new ValidationResult(false, "Invalid departure time format");
                
            if (!DateTime.TryParse(flight.ArrivalTime, out arrivalTime))
                return new ValidationResult(false, "Invalid arrival time format");
                
            // Departure time must be before arrival time
            if (departureTime >= arrivalTime)
                return new ValidationResult(false, "Arrival time must be after departure time");
                
            // Validate status
            string[] validStatuses = { "Scheduled", "Boarding", "Departed", "Arrived", "Delayed", "Cancelled" };
            if (!Array.Exists(validStatuses, s => s == flight.Status))
                return new ValidationResult(false, "Invalid status value");
                
            // Validate prices (must be positive)
            if (flight.EconomyPrice <= 0)
                return new ValidationResult(false, "Economy price must be positive");
                
            if (flight.BusinessPrice <= 0)
                return new ValidationResult(false, "Business price must be positive");
                
            if (flight.FirstClassPrice.HasValue && flight.FirstClassPrice <= 0)
                return new ValidationResult(false, "First class price must be positive");
                
            // Business price should be higher than economy price
            if (flight.BusinessPrice <= flight.EconomyPrice)
                return new ValidationResult(false, "Business price should be higher than economy price");
                
            // First class price should be higher than business price (if provided)
            if (flight.FirstClassPrice.HasValue && flight.FirstClassPrice <= flight.BusinessPrice)
                return new ValidationResult(false, "First class price should be higher than business price");
                
            // Validate seats (must be non-negative)
            if (flight.EconomySeats < 0)
                return new ValidationResult(false, "Economy seats cannot be negative");
                
            if (flight.BusinessSeats < 0)
                return new ValidationResult(false, "Business seats cannot be negative");
                
            if (flight.FirstClassSeats < 0)
                return new ValidationResult(false, "First class seats cannot be negative");
                
            if (flight.AvailableSeats < 0)
                return new ValidationResult(false, "Available seats cannot be negative");
                
            // Total seats calculation
            int totalSeats = flight.EconomySeats + flight.BusinessSeats + flight.FirstClassSeats;
            
            // Available seats cannot exceed total seats
            if (flight.AvailableSeats > totalSeats)
                return new ValidationResult(false, $"Available seats ({flight.AvailableSeats}) cannot exceed total seats ({totalSeats})");
                
            // All validations passed
            return new ValidationResult(true);
        }
        
        // Check if flight is in a state that shouldn't be changed
        private static bool IsFlightInFinalState(FlightData flight)
        {
            return flight.Status == "Departed" || flight.Status == "Arrived" || flight.Status == "Cancelled";
        }
        
        // Get flight data from database
        private static FlightData? GetFlightData(int flightId, string connectionString)
        {
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
                            AvailableSeats,
                            (EconomySeats + BusinessSeats + FirstClassSeats) AS TotalSeats,
                            CreatedAt,
                            UpdatedAt
                        FROM Flights 
                        WHERE ID = @FlightId";
                    
                    using (MySqlCommand cmd = new MySqlCommand(query, connection))
                    {
                        cmd.Parameters.AddWithValue("@FlightId", flightId);
                        
                        using (MySqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new FlightData
                                {
                                    Id = reader.GetInt32("ID"),
                                    FlightNumber = reader.GetString("FlightNumber"),
                                    Origin = reader.GetString("Origin"),
                                    Destination = reader.GetString("Destination"),
                                    DepartureTime = reader.GetDateTime("DepartureTime").ToString("yyyy-MM-ddTHH:mm"),
                                    ArrivalTime = reader.GetDateTime("ArrivalTime").ToString("yyyy-MM-ddTHH:mm"),
                                    Gate = reader.IsDBNull(reader.GetOrdinal("Gate")) ? "" : reader.GetString("Gate"),
                                    Terminal = reader.IsDBNull(reader.GetOrdinal("Terminal")) ? "" : reader.GetString("Terminal"),
                                    Aircraft = reader.IsDBNull(reader.GetOrdinal("Aircraft")) ? "" : reader.GetString("Aircraft"),
                                    Status = reader.GetString("Status"),
                                    EconomyPrice = reader.GetDecimal("EconomyPrice"),
                                    BusinessPrice = reader.GetDecimal("BusinessPrice"),
                                    FirstClassPrice = reader.IsDBNull(reader.GetOrdinal("FirstClassPrice")) ? null : (decimal?)reader.GetDecimal("FirstClassPrice"),
                                    EconomySeats = reader.GetInt32("EconomySeats"),
                                    BusinessSeats = reader.GetInt32("BusinessSeats"),
                                    FirstClassSeats = reader.GetInt32("FirstClassSeats"),
                                    TotalSeats = reader.GetInt32("TotalSeats"),
                                    AvailableSeats = reader.GetInt32("AvailableSeats"),
                                    StatusClass = GetStatusClass(reader.GetString("Status"))
                                };
                            }
                        }
                    }
                }
                
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching flight data: {ex.Message}");
                return null;
            }
        }
        
        // Update flight in database
        private static bool UpdateFlightInDatabase(FlightUpdateModel flight, string connectionString)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    using (MySqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Parse dates
                            DateTime departureTime = DateTime.Parse(flight.DepartureTime);
                            DateTime arrivalTime = DateTime.Parse(flight.ArrivalTime);
                            
                            string query = @"
                                UPDATE Flights 
                                SET 
                                    FlightNumber = @FlightNumber,
                                    Origin = @Origin,
                                    Destination = @Destination,
                                    DepartureTime = @DepartureTime,
                                    ArrivalTime = @ArrivalTime,
                                    Gate = @Gate,
                                    Terminal = @Terminal,
                                    Aircraft = @Aircraft,
                                    Status = @Status,
                                    EconomyPrice = @EconomyPrice,
                                    BusinessPrice = @BusinessPrice,
                                    FirstClassPrice = @FirstClassPrice,
                                    EconomySeats = @EconomySeats,
                                    BusinessSeats = @BusinessSeats,
                                    FirstClassSeats = @FirstClassSeats,
                                    AvailableSeats = @AvailableSeats,
                                    UpdatedAt = CURRENT_TIMESTAMP
                                WHERE ID = @FlightId";
                            
                            using (MySqlCommand cmd = new MySqlCommand(query, connection, transaction))
                            {
                                cmd.Parameters.AddWithValue("@FlightId", flight.Id);
                                cmd.Parameters.AddWithValue("@FlightNumber", flight.FlightNumber);
                                cmd.Parameters.AddWithValue("@Origin", flight.Origin);
                                cmd.Parameters.AddWithValue("@Destination", flight.Destination);
                                cmd.Parameters.AddWithValue("@DepartureTime", departureTime);
                                cmd.Parameters.AddWithValue("@ArrivalTime", arrivalTime);
                                cmd.Parameters.AddWithValue("@Gate", string.IsNullOrEmpty(flight.Gate) ? DBNull.Value : (object)flight.Gate);
                                cmd.Parameters.AddWithValue("@Terminal", string.IsNullOrEmpty(flight.Terminal) ? DBNull.Value : (object)flight.Terminal);
                                cmd.Parameters.AddWithValue("@Aircraft", flight.Aircraft);
                                cmd.Parameters.AddWithValue("@Status", flight.Status);
                                cmd.Parameters.AddWithValue("@EconomyPrice", flight.EconomyPrice);
                                cmd.Parameters.AddWithValue("@BusinessPrice", flight.BusinessPrice);
                                cmd.Parameters.AddWithValue("@FirstClassPrice", flight.FirstClassPrice.HasValue ? (object)flight.FirstClassPrice.Value : DBNull.Value);
                                cmd.Parameters.AddWithValue("@EconomySeats", flight.EconomySeats);
                                cmd.Parameters.AddWithValue("@BusinessSeats", flight.BusinessSeats);
                                cmd.Parameters.AddWithValue("@FirstClassSeats", flight.FirstClassSeats);
                                cmd.Parameters.AddWithValue("@AvailableSeats", flight.AvailableSeats);
                                
                                int rowsAffected = cmd.ExecuteNonQuery();
                                
                                if (rowsAffected > 0)
                                {
                                    transaction.Commit();
                                    return true;
                                }
                                else
                                {
                                    transaction.Rollback();
                                    return false;
                                }
                            }
                        }
                        catch (Exception)
                        {
                            transaction.Rollback();
                            throw;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating flight: {ex.Message}");
                return false;
            }
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
        
        // Get real IP address of client
        private static string GetRealIpAddress(HttpListenerContext context)
        {
            // Check if the request has X-Forwarded-For header (commonly used by proxies)
            string? forwardedFor = context.Request.Headers["X-Forwarded-For"];
            
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                // X-Forwarded-For can contain multiple IPs separated by commas
                // The leftmost IP is typically the original client
                string[] addresses = forwardedFor.Split(',');
                if (addresses.Length > 0)
                {
                    return addresses[0].Trim();
                }
            }
            
            // Check other common headers
            string? realIp = context.Request.Headers["X-Real-IP"];
            if (!string.IsNullOrEmpty(realIp))
            {
                return realIp;
            }
            
            // Get the remote endpoint's address
            string remoteIp = context.Request.RemoteEndPoint.Address.ToString();
            
            // If it's localhost (::1 or 127.0.0.1), get the actual machine IP
            if (remoteIp == "::1" || remoteIp == "127.0.0.1")
            {
                try
                {
                    // Get the host name
                    string hostName = System.Net.Dns.GetHostName();
                    
                    // Get host addresses
                    System.Net.IPAddress[] addresses = System.Net.Dns.GetHostAddresses(hostName);
                    
                    // Find IPv4 address that's not loopback
                    foreach (System.Net.IPAddress address in addresses)
                    {
                        if (address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork &&
                            !System.Net.IPAddress.IsLoopback(address))
                        {
                            return address.ToString();
                        }
                    }
                }
                catch
                {
                    // Fall back to the remote endpoint if there's an error
                    return remoteIp;
                }
            }
            
            return remoteIp;
        }
        
        // Send success JSON response
        private static void SendSuccessResponse(HttpListenerResponse response, string message)
        {
            string jsonResponse = $"{{\"success\":true,\"message\":\"{message}\"}}";
            SendJsonResponse(response, jsonResponse, 200);
        }
        
        // Send error JSON response
        private static void SendErrorResponse(HttpListenerResponse response, string message, int statusCode)
        {
            string jsonResponse = $"{{\"success\":false,\"message\":\"{message}\"}}";
            SendJsonResponse(response, jsonResponse, statusCode);
        }
        
        // Send JSON response with specified status code
        private static void SendJsonResponse(HttpListenerResponse response, string jsonContent, int statusCode)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(jsonContent);
            
            response.StatusCode = statusCode;
            response.ContentType = "application/json";
            response.ContentLength64 = buffer.Length;
            
            response.OutputStream.Write(buffer, 0, buffer.Length);
        }
    }
    
    // Flight data model for sending to client
    public class FlightData
    {
        public int Id { get; set; }
        public required string FlightNumber { get; set; }
        public required string Origin { get; set; }
        public required string Destination { get; set; }
        public required string DepartureTime { get; set; }
        public required string ArrivalTime { get; set; }
        public string Gate { get; set; } = "";
        public string Terminal { get; set; } = "";
        public string Aircraft { get; set; } = "";
        public required string Status { get; set; }
        public string StatusClass { get; set; } = "";
        public decimal EconomyPrice { get; set; }
        public decimal BusinessPrice { get; set; }
        public decimal? FirstClassPrice { get; set; }
        public int EconomySeats { get; set; }
        public int BusinessSeats { get; set; }
        public int FirstClassSeats { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
    }
    
    // Flight update model for receiving from client
    public class FlightUpdateModel
    {
        public int Id { get; set; }
        public required string FlightNumber { get; set; }
        public required string Origin { get; set; }
        public required string Destination { get; set; }
        public required string DepartureTime { get; set; }
        public required string ArrivalTime { get; set; }
        public string Gate { get; set; } = "";
        public string Terminal { get; set; } = "";
        public string Aircraft { get; set; } = "";
        public required string Status { get; set; }
        public decimal EconomyPrice { get; set; }
        public decimal BusinessPrice { get; set; }
        public decimal? FirstClassPrice { get; set; }
        public int EconomySeats { get; set; }
        public int BusinessSeats { get; set; }
        public int FirstClassSeats { get; set; }
        public int AvailableSeats { get; set; }
    }
}