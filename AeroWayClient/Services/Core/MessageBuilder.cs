using System;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services.Core
{
    public static class MessageBuilder
    {
        public static string BuildLoginMessage(string email, string password)
        {
            LogManager.Debug($"Building login message for email: {email}", "MessageBuilder");
            return $"LOGIN:{email}:{password}";
        }
        
        public static string BuildRegisterMessage(string firstName, string lastName, string email, 
            string phone, string dateOfBirth, string gender, string nationality, string password)
        {
            LogManager.Debug($"Building register message for email: {email}", "MessageBuilder");
            return $"REGISTER:{firstName}:{lastName}:{email}:{phone}:{dateOfBirth}:{gender}:{nationality}:{password}";
        }
        
        public static string BuildMessage(MessageType type, params string[] parameters)
        {
            LogManager.Debug($"Building message of type: {type}", "MessageBuilder");
            
            try
            {
                switch (type)
                {
                    case MessageType.Login:
                        if (parameters.Length != 2)
                        {
                            LogManager.Error($"Login requires 2 parameters, got {parameters.Length}", "MessageBuilder");
                            throw new ArgumentException("Login requires 2 parameters: email and password");
                        }
                        return BuildLoginMessage(parameters[0], parameters[1]);
                        
                    case MessageType.Register:
                        if (parameters.Length != 8)
                        {
                            LogManager.Error($"Register requires 8 parameters, got {parameters.Length}", "MessageBuilder");
                            throw new ArgumentException("Register requires 8 parameters");
                        }
                        return BuildRegisterMessage(parameters[0], parameters[1], parameters[2], 
                            parameters[3], parameters[4], parameters[5], parameters[6], parameters[7]);
                        
                    default:
                        LogManager.Error($"Unsupported message type: {type}", "MessageBuilder");
                        throw new NotSupportedException($"Message type {type} is not supported");
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error building message: {ex.Message}", "MessageBuilder");
                throw;
            }
        }
        
        public static MessageType IdentifyMessageType(string message)
        {
            if (string.IsNullOrEmpty(message))
            {
                LogManager.Debug("Empty message, returning Unknown type", "MessageBuilder");
                return MessageType.Unknown;
            }
                
            if (message.StartsWith("LOGIN:"))
            {
                LogManager.Debug("Identified message type: Login", "MessageBuilder");
                return MessageType.Login;
            }
                
            if (message.StartsWith("REGISTER:"))
            {
                LogManager.Debug("Identified message type: Register", "MessageBuilder");
                return MessageType.Register;
            }
                
            LogManager.Warning($"Unknown message type for message: {message.Substring(0, Math.Min(20, message.Length))}...", "MessageBuilder");
            return MessageType.Unknown;
        }
    }
}