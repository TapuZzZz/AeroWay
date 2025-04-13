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
                    SendErrorResponse(context.Response, "Unauthorized access", 401);
                    return;
                }

                // Read request body
                string requestBody;
                using (var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding))
                {
                    requestBody = reader.ReadToEnd();
                }
                
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] DELETE API Raw Request: {requestBody}");
                
                // Parse form data from URL-encoded format
                var formData = ParseFormData(requestBody);
                
                foreach (var kvp in formData)
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Form Data: {kvp.Key} = {kvp.Value}");
                }
                
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
                
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Attempting to delete flight with ID: {flightId}");
                
                // Delete the flight from database
                bool success = DeleteFlightFromDatabase(flightId, connectionString);
                
                if (success)
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Successfully deleted flight with ID: {flightId}");
                    SendSuccessResponse(context.Response);
                }
                else
                {
                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Failed to delete flight with ID: {flightId}");
                    SendErrorResponse(context.Response, "Failed to delete flight", 500);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Error handling delete flight request: {ex.Message}");
                SendErrorResponse(context.Response, "Internal server error: " + ex.Message, 500);
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
                            Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Flight with ID {flightId} not found in database");
                            return false; // Flight doesn't exist
                        }
                    }
                    
                    // Begin a transaction to ensure atomicity
                    using (MySqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // First, delete any related records (for example, delete bookings related to this flight)
                            // Delete bookings (if the Bookings table exists and has a reference)
                            try
                            {
                                using (MySqlCommand deleteBookingsCmd = new MySqlCommand("DELETE FROM Bookings WHERE FlightId = @FlightId", connection, transaction))
                                {
                                    deleteBookingsCmd.Parameters.AddWithValue("@FlightId", flightId);
                                    deleteBookingsCmd.ExecuteNonQuery();
                                }
                                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Deleted bookings for flight ID {flightId}");
                            }
                            catch (MySqlException ex)
                            {
                                if (ex.Message.Contains("doesn't exist"))
                                {
                                    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] No Bookings table exists, continuing with flight deletion");
                                    // Table doesn't exist, which is fine, continue with flight deletion
                                }
                                else
                                {
                                    throw; // Re-throw other MySQL errors
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
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Transaction error: {ex.Message}");
                            transaction.Rollback();
                            throw;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Error deleting flight from database: {ex.Message}");
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