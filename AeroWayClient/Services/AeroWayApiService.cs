using System;
using System.Collections.Generic;
using AeroWayClient.Services.Core;
using AeroWayClient.Services.Security;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services
{
    public class AeroWayApiService
    {
        private readonly string _serverHost;
        private readonly int _serverPort;

        public AeroWayApiService()
        {
            if (!ServerConfigService.IsConfigured)
            {
                throw new InvalidOperationException("Server not configured. Please configure server connection first.");
            }
            
            _serverHost = ServerConfigService.ServerHost;
            _serverPort = ServerConfigService.ServerPort;
            LogManager.Info($"AeroWayApiService initialized - Server: {_serverHost}:{_serverPort}", "AeroWayApiService");
        }
        
        public AeroWayApiService(string host, int port)
        {
            _serverHost = host;
            _serverPort = port;
            LogManager.Info($"AeroWayApiService initialized - Server: {host}:{port}", "AeroWayApiService");
        }

        public class LoginRequest
        {
            public string Email { get; set; } = "";
            public string Password { get; set; } = "";
        }

        public class RegisterRequest
        {
            public string FirstName { get; set; } = "";
            public string LastName { get; set; } = "";
            public string Email { get; set; } = "";
            public string Phone { get; set; } = "";
            public string DateOfBirth { get; set; } = "";
            public string Gender { get; set; } = "";
            public string Nationality { get; set; } = "";
            public string Password { get; set; } = "";
        }

        public class ApiResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = "";
            public Dictionary<string, object>? Data { get; set; }
        }

        public ApiResponse Login(LoginRequest request)
        {
            try
            {
                LogManager.Info($"Login attempt for user: {request.Email}", "AeroWayApiService");
                
                string message = MessageBuilder.BuildLoginMessage(request.Email, request.Password);
                LogManager.Debug($"Built login message: {message.Substring(0, Math.Min(30, message.Length))}...", "AeroWayApiService");
                
                string response = SendMessage(message);
                
                var parsed = ResponseParser.Parse(response);
                
                if (parsed.Success)
                {
                    LogManager.Info($"Login successful for user: {request.Email}", "AeroWayApiService");
                }
                else
                {
                    LogManager.Warning($"Login failed for user: {request.Email} - {parsed.Message}", "AeroWayApiService");
                }
                
                return new ApiResponse
                {
                    Success = parsed.Success,
                    Message = parsed.Message,
                    Data = parsed.Data
                };
            }
            catch (Exception ex)
            {
                LogManager.Error($"Login error for user {request.Email}: {ex.Message}", "AeroWayApiService");
                return new ApiResponse 
                { 
                    Success = false, 
                    Message = $"Login failed: {ex.Message}" 
                };
            }
        }

        public ApiResponse Register(RegisterRequest request)
        {
            try
            {
                LogManager.Info($"Registration attempt for email: {request.Email}", "AeroWayApiService");
                
                string message = MessageBuilder.BuildRegisterMessage(
                    request.FirstName, request.LastName, request.Email,
                    request.Phone, request.DateOfBirth, request.Gender,
                    request.Nationality, request.Password
                );
                LogManager.Debug("Built registration message", "AeroWayApiService");
                
                string response = SendMessage(message);
                
                var parsed = ResponseParser.Parse(response);
                
                if (parsed.Success)
                {
                    LogManager.Info($"Registration successful for email: {request.Email}", "AeroWayApiService");
                }
                else
                {
                    LogManager.Warning($"Registration failed for email: {request.Email} - {parsed.Message}", "AeroWayApiService");
                }
                
                return new ApiResponse
                {
                    Success = parsed.Success,
                    Message = parsed.Message,
                    Data = parsed.Data
                };
            }
            catch (Exception ex)
            {
                LogManager.Error($"Registration error for email {request.Email}: {ex.Message}", "AeroWayApiService");
                return new ApiResponse 
                { 
                    Success = false, 
                    Message = $"Registration failed: {ex.Message}" 
                };
            }
        }

        public ApiResponse VerifyEmail(string token)
        {
            try
            {
                LogManager.Info($"Email verification attempt with token", "AeroWayApiService");
                
                string message = $"VERIFY_EMAIL:{token}";
                LogManager.Debug("Built verification message", "AeroWayApiService");
                
                string response = SendMessage(message);
                
                if (response.StartsWith("VERIFY_SUCCESS:"))
                {
                    string[] parts = response.Split(':');
                    LogManager.Info("Email verification successful", "AeroWayApiService");
                    
                    return new ApiResponse
                    {
                        Success = true,
                        Message = parts.Length > 1 ? parts[1] : "Email verified successfully",
                        Data = parts.Length > 2 ? new Dictionary<string, object>
                        {
                            { "userId", parts[2] },
                            { "email", parts.Length > 3 ? parts[3] : "" },
                            { "firstName", parts.Length > 4 ? parts[4] : "" }
                        } : null
                    };
                }
                else if (response.StartsWith("VERIFY_FAILED:"))
                {
                    string failMessage = response.Replace("VERIFY_FAILED:", "");
                    LogManager.Warning($"Email verification failed: {failMessage}", "AeroWayApiService");
                    
                    return new ApiResponse
                    {
                        Success = false,
                        Message = failMessage
                    };
                }
                else
                {
                    LogManager.Error($"Unexpected verification response: {response}", "AeroWayApiService");
                    return new ApiResponse
                    {
                        Success = false,
                        Message = "Unexpected response from server"
                    };
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Email verification error: {ex.Message}", "AeroWayApiService");
                return new ApiResponse 
                { 
                    Success = false, 
                    Message = $"Verification failed: {ex.Message}" 
                };
            }
        }

        public ApiResponse ResendVerificationEmail(string email)
        {
            try
            {
                LogManager.Info($"Resend verification email request for: {email}", "AeroWayApiService");
                
                string message = $"RESEND_VERIFICATION:{email}";
                LogManager.Debug("Built resend verification message", "AeroWayApiService");
                
                string response = SendMessage(message);
                
                if (response.StartsWith("RESEND_SUCCESS:"))
                {
                    string successMessage = response.Replace("RESEND_SUCCESS:", "");
                    LogManager.Info($"Verification email resent successfully to {email}", "AeroWayApiService");
                    
                    return new ApiResponse
                    {
                        Success = true,
                        Message = successMessage
                    };
                }
                else if (response.StartsWith("RESEND_FAILED:"))
                {
                    string failMessage = response.Replace("RESEND_FAILED:", "");
                    LogManager.Warning($"Failed to resend verification email: {failMessage}", "AeroWayApiService");
                    
                    return new ApiResponse
                    {
                        Success = false,
                        Message = failMessage
                    };
                }
                else
                {
                    LogManager.Error($"Unexpected resend response: {response}", "AeroWayApiService");
                    return new ApiResponse
                    {
                        Success = false,
                        Message = "Unexpected response from server"
                    };
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Resend verification email error: {ex.Message}", "AeroWayApiService");
                return new ApiResponse 
                { 
                    Success = false, 
                    Message = $"Failed to resend email: {ex.Message}" 
                };
            }
        }

        private string SendMessage(string message)
        {
            LogManager.Debug("Creating new connection to server", "AeroWayApiService");
            
            using (var connection = new ConnectionProcessor(_serverHost, _serverPort))
            {
                if (!connection.Connect())
                {
                    LogManager.Error("Failed to connect to server", "AeroWayApiService");
                    throw new Exception("Failed to connect to server");
                }
                
                string response = connection.SendEncryptedMessage(message);
                LogManager.Debug("Received response from server", "AeroWayApiService");
                
                return response;
            }
        }
    }
}