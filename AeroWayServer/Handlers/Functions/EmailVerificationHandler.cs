using System;
using System.Text;
using System.Security.Cryptography;
using MySql.Data.MySqlClient;
using AeroWayServer.Core;
using AeroWayServer.Log;
using System.Net;
using System.Net.Mail;

namespace AeroWayServer.Handlers.Functions
{
    public static class EmailVerificationHandler
    {
        // Your SMTP Settings
        private const string SMTP_HOST = "smtp.gmail.com";
        private const int SMTP_PORT = 587;
        private const string SMTP_USER = "artyomkiselhof2007@gmail.com";
        private const string SMTP_PASS = "qwrt tcwn ftjf coul";
        private const string FROM_EMAIL = "AeroWay@support.com";
        private const string FROM_NAME = "AeroWay";
        
        // Your localhost URL
        private const string BASE_URL = "https://localhost:5050";
        
        // Generate verification token
        public static string GenerateVerificationToken()
        {
            using var rng = RandomNumberGenerator.Create();
            byte[] tokenBytes = new byte[32];
            rng.GetBytes(tokenBytes);
            return Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        }
        
        // Store verification token in database
        public static bool StoreVerificationToken(int userId, string token)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                // First, invalidate any existing tokens
                string invalidateQuery = "UPDATE EmailVerifications SET IsUsed = 1 WHERE UserId = @userId AND IsUsed = 0";
                using (var invalidateCmd = new MySqlCommand(invalidateQuery, connection))
                {
                    invalidateCmd.Parameters.AddWithValue("@userId", userId);
                    invalidateCmd.ExecuteNonQuery();
                }
                
                // Insert new token
                string query = @"INSERT INTO EmailVerifications (UserId, Token, CreatedDate, ExpiryDate, IsUsed) 
                               VALUES (@userId, @token, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), 0)";
                
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@userId", userId);
                command.Parameters.AddWithValue("@token", token);
                
                int result = command.ExecuteNonQuery();
                return result > 0;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error storing verification token: {ex.Message}", "EmailVerificationHandler");
                return false;
            }
        }
        
        // Send verification email
        public static bool SendVerificationEmail(string email, string firstName, string token)
        {
            try
            {
                string verificationUrl = $"{BASE_URL}/verify-email?token={token}";
                
                string subject = "Verify Your AeroWay Account";
                string body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;'>
                        <div style='background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                            <div style='text-align: center; margin-bottom: 30px;'>
                                <h1 style='color: #3b82f6; margin: 0; font-size: 32px;'>AeroWay</h1>
                            </div>
                            
                            <h2 style='color: #333; font-size: 24px; margin-bottom: 20px;'>Welcome to AeroWay, {firstName}!</h2>
                            
                            <p style='color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 25px;'>
                                Thank you for creating an account with us. To complete your registration and start booking flights, 
                                please verify your email address by clicking the button below.
                            </p>
                            
                            <div style='text-align: center; margin: 35px 0;'>
                                <a href='{verificationUrl}' 
                                   style='background-color: #3b82f6; color: white; padding: 14px 30px; 
                                          text-decoration: none; border-radius: 5px; display: inline-block; 
                                          font-size: 16px; font-weight: bold;'>
                                    Verify Email Address
                                </a>
                            </div>
                            
                            <div style='background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                                <p style='color: #666; font-size: 14px; margin: 0; word-break: break-all;'>
                                    Or copy and paste this link into your browser:<br>
                                    <span style='color: #3b82f6;'>{verificationUrl}</span>
                                </p>
                            </div>
                            
                            <p style='color: #999; font-size: 14px; text-align: center; margin-top: 30px;'>
                                This link will expire in 24 hours for security reasons.
                            </p>
                            
                            <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                            
                            <p style='color: #999; font-size: 12px; text-align: center; margin: 0;'>
                                If you didn't create an account with AeroWay, please ignore this email.
                            </p>
                        </div>
                        
                        <p style='color: #999; font-size: 12px; text-align: center; margin-top: 20px;'>
                            © 2025 AeroWay. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>";
                
                using var client = new SmtpClient(SMTP_HOST, SMTP_PORT)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(SMTP_USER, SMTP_PASS),
                    Timeout = 10000 // 10 seconds timeout
                };
                
                var message = new MailMessage
                {
                    From = new MailAddress(FROM_EMAIL, FROM_NAME),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                
                message.To.Add(email);
                
                client.Send(message);
                LogManager.Info($"Verification email sent to {email}", "EmailVerificationHandler");
                return true;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error sending verification email: {ex.Message}", "EmailVerificationHandler");
                return false;
            }
        }
        
        // Verify token
        public static string ProcessEmailVerification(string token, string clientId)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                // Check if token exists and is valid
                string query = @"SELECT ev.UserId, u.Email, u.FirstName 
                               FROM EmailVerifications ev
                               JOIN Users u ON ev.UserId = u.UserId
                               WHERE ev.Token = @token 
                               AND ev.IsUsed = 0 
                               AND ev.ExpiryDate > NOW()";
                
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@token", token);
                
                using var reader = command.ExecuteReader();
                if (reader.Read())
                {
                    int userId = reader.GetInt32("UserId");
                    string email = reader.GetString("Email");
                    string firstName = reader.GetString("FirstName");
                    reader.Close();
                    
                    // Mark token as used
                    string updateTokenQuery = "UPDATE EmailVerifications SET IsUsed = 1, UsedDate = NOW() WHERE Token = @token";
                    using (var updateTokenCmd = new MySqlCommand(updateTokenQuery, connection))
                    {
                        updateTokenCmd.Parameters.AddWithValue("@token", token);
                        updateTokenCmd.ExecuteNonQuery();
                    }
                    
                    // Update user as verified
                    string updateUserQuery = "UPDATE Users SET EmailVerified = 1, EmailVerifiedDate = NOW() WHERE UserId = @userId";
                    using (var updateUserCmd = new MySqlCommand(updateUserQuery, connection))
                    {
                        updateUserCmd.Parameters.AddWithValue("@userId", userId);
                        updateUserCmd.ExecuteNonQuery();
                    }
                    
                    LogManager.Info($"Email verified successfully for user {email} (ID: {userId})", "EmailVerificationHandler");
                    return $"VERIFY_SUCCESS:Email verified successfully:{userId}:{email}:{firstName}";
                }
                else
                {
                    LogManager.Warning($"Invalid or expired verification token from client {clientId}", "EmailVerificationHandler");
                    return "VERIFY_FAILED:Invalid or expired verification link";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error processing email verification: {ex.Message}", "EmailVerificationHandler");
                return "VERIFY_FAILED:An error occurred during verification";
            }
        }
        
        // Resend verification email
        public static string ResendVerificationEmail(string email, string clientId)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                // Get user details
                string query = "SELECT UserId, FirstName, EmailVerified FROM Users WHERE Email = @email";
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@email", email);
                
                using var reader = command.ExecuteReader();
                if (reader.Read())
                {
                    int userId = reader.GetInt32("UserId");
                    string firstName = reader.GetString("FirstName");
                    bool emailVerified = reader.GetBoolean("EmailVerified");
                    reader.Close();
                    
                    if (emailVerified)
                    {
                        return "RESEND_FAILED:Email already verified";
                    }
                    
                    // Generate new token
                    string token = GenerateVerificationToken();
                    
                    // Store token
                    if (StoreVerificationToken(userId, token))
                    {
                        // Send email
                        if (SendVerificationEmail(email, firstName, token))
                        {
                            LogManager.Info($"Verification email resent to {email}", "EmailVerificationHandler");
                            return "RESEND_SUCCESS:Verification email sent successfully";
                        }
                        else
                        {
                            return "RESEND_FAILED:Failed to send email";
                        }
                    }
                    else
                    {
                        return "RESEND_FAILED:Failed to generate verification token";
                    }
                }
                else
                {
                    return "RESEND_FAILED:Email not found";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error resending verification email: {ex.Message}", "EmailVerificationHandler");
                return "RESEND_FAILED:An error occurred";
            }
        }
    }
}