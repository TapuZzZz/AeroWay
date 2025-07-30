using System;
using System.Collections.Generic;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services.Core
{
    public static class ResponseParser
    {
        public class ParsedResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = "";
            public MessageType ResponseType { get; set; }
            public Dictionary<string, object> Data { get; set; } = new Dictionary<string, object>();
        }
        
        public static ParsedResponse Parse(string response)
        {
            LogManager.Debug($"Parsing response: {response?.Substring(0, Math.Min(50, response?.Length ?? 0))}...", "ResponseParser");
            
            if (string.IsNullOrEmpty(response))
            {
                LogManager.Warning("Received empty response", "ResponseParser");
                return new ParsedResponse 
                { 
                    Success = false, 
                    Message = "Empty response",
                    ResponseType = MessageType.Unknown
                };
            }
            
            // Login responses
            if (response.StartsWith("LOGIN_SUCCESS:"))
            {
                LogManager.Info("Parsing LOGIN_SUCCESS response", "ResponseParser");
                return ParseLoginSuccess(response);
            }
            else if (response.StartsWith("LOGIN_FAILED:"))
            {
                LogManager.Info("Parsing LOGIN_FAILED response", "ResponseParser");
                return ParseLoginFailed(response);
            }
            
            // Register responses
            else if (response.StartsWith("REGISTER_SUCCESS:"))
            {
                LogManager.Info("Parsing REGISTER_SUCCESS response", "ResponseParser");
                return ParseRegisterSuccess(response);
            }
            else if (response.StartsWith("REGISTER_FAILED:"))
            {
                LogManager.Info("Parsing REGISTER_FAILED response", "ResponseParser");
                return ParseRegisterFailed(response);
            }
            
            // Unknown response
            LogManager.Warning($"Unknown response format: {response}", "ResponseParser");
            return new ParsedResponse
            {
                Success = false,
                Message = $"Unknown response format: {response}",
                ResponseType = MessageType.Unknown
            };
        }
        
        private static ParsedResponse ParseLoginSuccess(string response)
        {
            var result = new ParsedResponse
            {
                Success = true,
                Message = "Login successful",
                ResponseType = MessageType.Login
            };
            
            string[] parts = response.Split(':');
            if (parts.Length >= 6)
            {
                result.Data["userId"] = parts[1];
                result.Data["sessionToken"] = parts[2];
                result.Data["firstName"] = parts[3];
                result.Data["lastName"] = parts[4];
                result.Data["email"] = parts[5];
                
                LogManager.Debug($"Parsed login data for user ID: {parts[1]}, email: {parts[5]}", "ResponseParser");
            }
            else
            {
                LogManager.Warning($"Login success response has unexpected format. Expected 6 parts, got {parts.Length}", "ResponseParser");
            }
            
            return result;
        }
        
        private static ParsedResponse ParseLoginFailed(string response)
        {
            string message = response.Replace("LOGIN_FAILED:", "");
            LogManager.Debug($"Login failed with message: {message}", "ResponseParser");
            
            return new ParsedResponse
            {
                Success = false,
                Message = message,
                ResponseType = MessageType.Login
            };
        }
        
        private static ParsedResponse ParseRegisterSuccess(string response)
        {
            string message = response.Replace("REGISTER_SUCCESS:", "");
            LogManager.Debug($"Registration successful with message: {message}", "ResponseParser");
            
            return new ParsedResponse
            {
                Success = true,
                Message = message,
                ResponseType = MessageType.Register
            };
        }
        
        private static ParsedResponse ParseRegisterFailed(string response)
        {
            string message = response.Replace("REGISTER_FAILED:", "");
            LogManager.Debug($"Registration failed with message: {message}", "ResponseParser");
            
            return new ParsedResponse
            {
                Success = false,
                Message = message,
                ResponseType = MessageType.Register
            };
        }
    }
}