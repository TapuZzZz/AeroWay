using System;
using System.Text;
using System.Net;
using System.IO;
using MySql.Data.MySqlClient;
using AeroWayServer.utils;
using System.Collections.Generic;

namespace AeroWayServer.Pages.addons
{
    public static class DeleteFlightPage
    {
        // Handle DELETE API request
        public static void HandleDeleteFlightRequest(HttpListenerContext context, string connectionString)
        {
            // Set response headers
            context.Response.ContentType = "application/json";
            context.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
            context.Response.Headers.Add("Pragma", "no-cache");
            context.Response.Headers.Add("Expires", "0");
            
            // Get the client's IP address (fixed to properly show the actual IP)
            string clientIp = context.Request.RemoteEndPoint.Address.ToString();
            
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
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] 🚫 Unauthorized delete flight attempt from IP: {clientIp}");
                    SendErrorResponse(context.Response, "Unauthorized access", 401);
                    return;
                }

                // Read request body
                string requestBody;
                using (var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding))
                {
                    requestBody = reader.ReadToEnd();
                }
                
                // Parse form data from URL-encoded format
                var formData = ParseFormData(requestBody);
                
                // Check if flightId is provided
                if (!formData.ContainsKey("flightId") || string.IsNullOrEmpty(formData["flightId"]))
                {
                    SendErrorResponse(context.Response, "Flight ID is required", 400);
                    return;
                }
                
                // Get flight ID from form data
                if (!int.TryParse(formData["flightId"], out int flightId))
                {
                    SendErrorResponse(context.Response, "Invalid Flight ID format", 400);
                    return;
                }
                
                // Check if deletion reason is provided
                if (!formData.ContainsKey("reason") || string.IsNullOrEmpty(formData["reason"]))
                {
                    SendErrorResponse(context.Response, "Deletion reason is required", 400);
                    return;
                }
                
                // Get deletion reason
                string deletionReason = formData["reason"];
                
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] 🗑️ API Request: Delete Flight | IP: {clientIp}");
                
                // Get flight details for logging
                var flightDetails = GetFlightBasicInfo(flightId, connectionString);
                string flightInfo = flightDetails != null 
                    ? $"Flight {flightDetails.FlightNumber} ({flightDetails.Origin} → {flightDetails.Destination}) deleted by {clientIp}. Reason: {deletionReason}" 
                    : $"Flight ID {flightId} (not found) deletion attempted by {clientIp}";
                
                // Delete the flight from database
                bool success = DeleteFlightFromDatabase(flightId, connectionString);
                
                if (success)
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ✅ {flightInfo}");
                    SendSuccessResponse(context.Response);
                }
                else
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ❌ Failed to delete flight ID {flightId} | IP: {clientIp}");
                    SendErrorResponse(context.Response, "Failed to delete flight", 500);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ❌ Error handling delete flight request from {clientIp}: {ex.Message}");
                SendErrorResponse(context.Response, "Internal server error", 500);
            }
        }
        
        // Parse form data from URL-encoded format
        private static Dictionary<string, string> ParseFormData(string formData)
        {
            var result = new Dictionary<string, string>();
            
            // Handle empty input
            if (string.IsNullOrWhiteSpace(formData))
            {
                return result;
            }
            
            // Split form data by '&'
            string[] pairs = formData.Split('&');
            
            foreach (string pair in pairs)
            {
                // Skip empty pairs
                if (string.IsNullOrWhiteSpace(pair))
                {
                    continue;
                }
                
                // Split key-value pair by '='
                int indexOfEquals = pair.IndexOf('=');
                if (indexOfEquals > 0)
                {
                    string key = WebUtility.UrlDecode(pair.Substring(0, indexOfEquals));
                    string value = WebUtility.UrlDecode(pair.Substring(indexOfEquals + 1));
                    
                    result[key] = value;
                }
                else if (indexOfEquals == -1)
                {
                    // Handle cases where the value is empty
                    result[WebUtility.UrlDecode(pair)] = string.Empty;
                }
            }
            
            return result;
        }
        
        // Get basic flight info for logging
        private static FlightBasicInfo? GetFlightBasicInfo(int flightId, string connectionString)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    string query = @"
                        SELECT 
                            FlightNumber, 
                            Origin, 
                            Destination
                        FROM Flights 
                        WHERE ID = @FlightId";
                    
                    using (MySqlCommand cmd = new MySqlCommand(query, connection))
                    {
                        cmd.Parameters.AddWithValue("@FlightId", flightId);
                        
                        using (MySqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new FlightBasicInfo
                                {
                                    FlightNumber = reader.GetString("FlightNumber"),
                                    Origin = reader.GetString("Origin"),
                                    Destination = reader.GetString("Destination")
                                };
                            }
                        }
                    }
                }
                
                return null;
            }
            catch
            {
                return null;
            }
        }
        
        // Simple class to hold basic flight info
        private class FlightBasicInfo
        {
            public required string FlightNumber { get; set; }
            public required string Origin { get; set; }
            public required string Destination { get; set; }
        }
        
        // Delete flight from database
        private static bool DeleteFlightFromDatabase(int flightId, string connectionString)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    // First, check if the flight exists
                    using (MySqlCommand checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Flights WHERE ID = @FlightId", connection))
                    {
                        checkCmd.Parameters.AddWithValue("@FlightId", flightId);
                        
                        long count = (long)checkCmd.ExecuteScalar();
                        
                        if (count == 0)
                        {
                            return false; // Flight doesn't exist
                        }
                    }
                    
                    // Begin a transaction to ensure atomicity
                    using (MySqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // First, delete any related records
                            try
                            {
                                using (MySqlCommand deleteBookingsCmd = new MySqlCommand("DELETE FROM Bookings WHERE FlightId = @FlightId", connection, transaction))
                                {
                                    deleteBookingsCmd.Parameters.AddWithValue("@FlightId", flightId);
                                    deleteBookingsCmd.ExecuteNonQuery();
                                }
                            }
                            catch (MySqlException ex)
                            {
                                if (!ex.Message.Contains("doesn't exist"))
                                {
                                    throw;
                                }
                            }
                            
                            // Delete any crew assignments if that table exists
                            try
                            {
                                using (MySqlCommand deleteCrewCmd = new MySqlCommand("DELETE FROM CrewAssignments WHERE FlightId = @FlightId", connection, transaction))
                                {
                                    deleteCrewCmd.Parameters.AddWithValue("@FlightId", flightId);
                                    deleteCrewCmd.ExecuteNonQuery();
                                }
                            }
                            catch (MySqlException ex)
                            {
                                if (!ex.Message.Contains("doesn't exist"))
                                {
                                    throw;
                                }
                            }
                            
                            // Finally, delete the flight
                            using (MySqlCommand deleteFlightCmd = new MySqlCommand("DELETE FROM Flights WHERE ID = @FlightId", connection, transaction))
                            {
                                deleteFlightCmd.Parameters.AddWithValue("@FlightId", flightId);
                                
                                int rowsAffected = deleteFlightCmd.ExecuteNonQuery();
                                
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
            catch (Exception)
            {
                return false;
            }
        }
        
        // Send success response
        private static void SendSuccessResponse(HttpListenerResponse response)
        {
            string jsonResponse = "{\"success\":true,\"message\":\"Flight deleted successfully\"}";
            byte[] buffer = Encoding.UTF8.GetBytes(jsonResponse);
            
            response.StatusCode = 200;
            response.ContentLength64 = buffer.Length;
            
            response.OutputStream.Write(buffer, 0, buffer.Length);
        }
        
        // Send error response
        private static void SendErrorResponse(HttpListenerResponse response, string message, int statusCode)
        {
            string jsonResponse = $"{{\"success\":false,\"message\":\"{message}\"}}";
            byte[] buffer = Encoding.UTF8.GetBytes(jsonResponse);
            
            response.StatusCode = statusCode;
            response.ContentLength64 = buffer.Length;
            
            response.OutputStream.Write(buffer, 0, buffer.Length);
        }
    }
}