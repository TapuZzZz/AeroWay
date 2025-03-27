using System;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using MySql.Data.MySqlClient;

namespace AeroWayServer.utils
{
    public static class AdminLogIn
    {
        private static readonly TimeSpan TokenValidityPeriod = TimeSpan.FromHours(8);
        
        // Main authentication method that verifies user credentials
        public static bool AuthenticateUser(string username, string password, HttpListenerResponse response, string connectionString, Action<string> logAction)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    
                    // Hash the password for security
                    string passwordHash = HashString(password);
                    
                    // Query to find the user and check if they are an admin
                    string query = "SELECT COUNT(*) FROM Users WHERE Username = @Username AND PasswordHash = @PasswordHash AND IsAdmin = true";
                    
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Username", username);
                        command.Parameters.AddWithValue("@PasswordHash", passwordHash);
                        
                        int count = Convert.ToInt32(command.ExecuteScalar());
                        
                        // If we found a matching admin user, return true
                        if (count > 0)
                        {
                            // Update last login time
                            UpdateLastLogin(connection, username);
                            
                            // Set authentication cookie
                            SetAuthCookie(response, username);
                            
                            logAction($"🔐 User '{username}' authenticated successfully as admin");
                            return true;
                        }
                    }
                }
                
                logAction($"❌ Failed login attempt for user '{username}'");
                return false;
            }
            catch (Exception ex)
            {
                logAction($"❌ Authentication error: {ex.Message}");
                return false;
            }
        }

        // Update the last login timestamp in the database
        private static void UpdateLastLogin(MySqlConnection connection, string username)
        {
            try
            {
                string query = "UPDATE Users SET LastLogin = @LastLogin WHERE Username = @Username";
                
                using (var command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@LastLogin", DateTime.Now);
                    command.Parameters.AddWithValue("@Username", username);
                    
                    command.ExecuteNonQuery();
                }
            }
            catch (Exception)
            {
                // Exception is handled in the calling method
                throw;
            }
        }

        // Check if the session is authenticated
        public static bool IsSessionAuthenticated(HttpListenerContext context)
        {
            return ValidateAuthCookie(context.Request);
        }

        // Read form data from a POST request
        public static (string username, string password) ReadLoginForm(HttpListenerContext context)
        {
            string username = "";
            string password = "";
            
            using (var reader = new StreamReader(context.Request.InputStream, 
                                               context.Request.ContentEncoding))
            {
                string formData = reader.ReadToEnd();
                string[] pairs = formData.Split('&');
                
                foreach (string pair in pairs)
                {
                    string[] keyValue = pair.Split('=');
                    if (keyValue.Length == 2)
                    {
                        string key = HttpUtility.UrlDecode(keyValue[0]);
                        string value = HttpUtility.UrlDecode(keyValue[1]);
                        
                        if (key == "username")
                            username = value;
                        else if (key == "password")
                            password = value;
                    }
                }
            }
            
            return (username, password);
        }

        // Generate a secure session token
        private static string GenerateSessionToken(string username)
        {
            // Create a unique token combining username, timestamp, and a random value
            string timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            string randomValue = Guid.NewGuid().ToString("N");
            
            string tokenData = $"{username}|{timestamp}|{randomValue}";
            
            // Hash the token data for security
            using (var sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(tokenData));
                string hashedToken = BitConverter.ToString(bytes).Replace("-", "").ToLower();
                
                // Return the final token
                return $"{username}:{timestamp}:{hashedToken}";
            }
        }
        
        // Set the authentication cookie in the response
        private static void SetAuthCookie(HttpListenerResponse response, string username)
        {
            string token = GenerateSessionToken(username);
            
            // Create a secure cookie
            Cookie authCookie = new Cookie("AeroWayAuth", token, "/")
            {
                Expires = DateTime.Now.Add(TokenValidityPeriod),
                HttpOnly = true // Prevents JavaScript access
            };
            
            response.Cookies.Add(authCookie);
        }
        
        // Validate the authentication cookie from the request
        private static bool ValidateAuthCookie(HttpListenerRequest request)
        {
            Cookie? authCookie = request.Cookies["AeroWayAuth"];
            
            if (authCookie == null || string.IsNullOrEmpty(authCookie.Value))
                return false;
                
            // Parse the token
            string[] tokenParts = authCookie.Value.Split(':');
            if (tokenParts.Length != 3)
                return false;
                
            string username = tokenParts[0];
            string timestamp = tokenParts[1];
            
            // Check if the token has expired
            if (DateTime.TryParseExact(timestamp, "yyyyMMddHHmmss", null, 
                System.Globalization.DateTimeStyles.None, out DateTime tokenTime))
            {
                if (DateTime.UtcNow - tokenTime > TokenValidityPeriod)
                    return false; // Token has expired
            }
            else
            {
                return false; // Invalid timestamp format
            }
            
            // At this point, the token is valid
            return true;
        }
        
        // Get the username from a valid authentication cookie
        public static string GetUsernameFromCookie(HttpListenerRequest request)
        {
            Cookie? authCookie = request.Cookies["AeroWayAuth"];
            
            if (authCookie == null || string.IsNullOrEmpty(authCookie.Value))
                return string.Empty;
                
            string[] tokenParts = authCookie.Value.Split(':');
            if (tokenParts.Length != 3)
                return string.Empty;
                
            return tokenParts[0]; // The username part
        }
        
        // Logout method to clear cookies
        public static void Logout(HttpListenerResponse response)
        {
            // Create an expired cookie to replace the auth cookie
            var cookie = new Cookie("AeroWayAuth", "", "/")
            {
                Expires = DateTime.Now.AddDays(-1) // Set expiration in the past
            };
            
            // Add the cookie to the response
            response.Cookies.Add(cookie);
        }

        // Hash a string using SHA-256
        public static string HashString(string input)
        {
            using var sha256 = SHA256.Create();
            byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }
    }
}