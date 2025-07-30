using System;
using MySql.Data.MySqlClient;
using AeroWayServer.Core;
using AeroWayServer.Log;
using AeroWayServer.Security;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayServer.Handlers.Functions
{
    public static class LoginHandler
    {
        public static string ProcessLogin(string messageContent, string clientId)
        {
            try
            {
                string[] loginInfo = messageContent.Split(':');
                
                if (loginInfo.Length != 2)
                {
                    LogManager.Warning($"Invalid login format from client {clientId}", "LoginHandler");
                    return "LOGIN_FAILED:Invalid login format. Use LOGIN:email:password";
                }
                
                string email = loginInfo[0];
                string password = loginInfo[1];
                
                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                {
                    LogManager.Warning($"Empty credentials from client {clientId}", "LoginHandler");
                    return "LOGIN_FAILED:Email and password are required";
                }

                if (!SqlInjectionPrevention.IsSafeForType(email, SqlInjectionPrevention.InputType.Email))
                {
                    LogManager.Warning($"Invalid email format from client {clientId}", "LoginHandler");
                    return "LOGIN_FAILED:Invalid email format";
                }

                if (!SqlInjectionPrevention.IsSafeForType(password, SqlInjectionPrevention.InputType.Password))
                {
                    LogManager.Warning($"Invalid password format from client {clientId}", "LoginHandler");
                    return "LOGIN_FAILED:Invalid password format";
                }

                var userData = GetUserFromDatabase(email);
                
                if (userData == null)
                {
                    LogManager.Warning($"Login attempt for non-existent email '{email}' from client {clientId}", "LoginHandler");
                    return "LOGIN_FAILED:Invalid email or password";
                }

                bool passwordValid = VerifyPassword(password, userData.PasswordHash, userData.Salt);
                
                if (!passwordValid)
                {
                    LogManager.Warning($"Invalid password for user '{email}' from client {clientId}", "LoginHandler");
                    return "LOGIN_FAILED:Invalid email or password";
                }

                if (!userData.IsActive)
                {
                    LogManager.Warning($"Login attempt for inactive account '{email}' from client {clientId}", "LoginHandler");
                    return "LOGIN_FAILED:Account is inactive. Please contact support";
                }

                if (!userData.EmailVerified)
                {
                    LogManager.Warning($"Login attempt with unverified email '{email}' from client {clientId}", "LoginHandler");
                    return "LOGIN_FAILED:Please verify your email before logging in";
                }

                UpdateLastLogin(userData.UserId, clientId);
                
                string sessionToken = GenerateSessionToken();

                LogManager.Info($"User '{email}' logged in successfully from client {clientId}", "LoginHandler");
                
                return $"LOGIN_SUCCESS:{userData.UserId}:{sessionToken}:{userData.FirstName}:{userData.LastName}:{userData.Email}";
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error processing login: {ex.Message}", "LoginHandler");
                return "LOGIN_FAILED:An error occurred during login";
            }
        }

        private class UserData
        {
            public int UserId { get; set; }
            public string FirstName { get; set; } = "";
            public string LastName { get; set; } = "";
            public string Email { get; set; } = "";
            public string PasswordHash { get; set; } = "";
            public string Salt { get; set; } = "";
            public bool IsActive { get; set; }
            public bool EmailVerified { get; set; }
        }

        private static UserData? GetUserFromDatabase(string email)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();

                string query = @"SELECT UserId, FirstName, LastName, Email, PasswordHash, Salt, 
                                IsActive, EmailVerified 
                                FROM Users 
                                WHERE Email = @email";

                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@email", email);

                using var reader = command.ExecuteReader();
                if (reader.Read())
                {
                    return new UserData
                    {
                        UserId = reader.GetInt32("UserId"),
                        FirstName = reader.GetString("FirstName"),
                        LastName = reader.GetString("LastName"),
                        Email = reader.GetString("Email"),
                        PasswordHash = reader.GetString("PasswordHash"),
                        Salt = reader.GetString("Salt"),
                        IsActive = reader.GetBoolean("IsActive"),
                        EmailVerified = reader.GetBoolean("EmailVerified")
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Database error in GetUserFromDatabase: {ex.Message}", "LoginHandler");
                return null;
            }
        }

        private static bool VerifyPassword(string password, string storedHash, string salt)
        {
            try
            {
                string saltedPassword = password + salt;
                using var sha256 = SHA256.Create();
                byte[] hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
                string computedHash = Convert.ToBase64String(hashedBytes);
                
                return computedHash == storedHash;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error verifying password: {ex.Message}", "LoginHandler");
                return false;
            }
        }

        private static void UpdateLastLogin(int userId, string clientId)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();

                string query = @"UPDATE Users 
                                SET LastLoginDate = NOW()
                                WHERE UserId = @userId";

                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@userId", userId);
                command.ExecuteNonQuery();

                LogManager.Info($"Updated last login for user {userId}", "LoginHandler");
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error updating last login: {ex.Message}", "LoginHandler");
            }
        }

        private static string GenerateSessionToken()
        {
            using var rng = RandomNumberGenerator.Create();
            byte[] tokenData = new byte[32];
            rng.GetBytes(tokenData);
            return Convert.ToBase64String(tokenData);
        }
    }
}