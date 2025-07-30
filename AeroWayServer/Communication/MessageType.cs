using System;
using AeroWayServer.Log;

namespace AeroWayServer.Communication
{
    public enum MessageType
    {
        Unknown = 0,
        Login = 1,
        Register = 2,
        FlightSearch = 3,
        Booking = 4,
        GetBookings = 5,
        VerifyEmail = 6,
        ResendVerification = 7,
        GetProfile = 8,
        UpdateProfile = 9,
        GetActivity = 10,
        DeleteAccount = 11
    }
    
    public static class MessageTypeIdentifier
    {
        public static MessageType IdentifyMessageType(string message)
        {
            try
            {
                if (string.IsNullOrEmpty(message))
                {
                    LogManager.Warning("Empty message received", "MessageTypeIdentifier");
                    return MessageType.Unknown;
                }
                
                string[] parts = message.Split(new char[] { ':' }, 2);
                
                if (parts.Length < 2)
                {
                    LogManager.Warning($"Invalid message format: {message}", "MessageTypeIdentifier");
                    return MessageType.Unknown;
                }
                
                string typePrefix = parts[0].ToUpper();
                MessageType detectedType;
                
                switch (typePrefix)
                {
                    case "LOGIN":
                        detectedType = MessageType.Login;
                        break;
                    case "REGISTER":
                        detectedType = MessageType.Register;
                        break;
                    case "SEARCH_FLIGHTS":
                        detectedType = MessageType.FlightSearch;
                        break;
                    case "CREATE_BOOKING":
                        detectedType = MessageType.Booking;
                        break;
                    case "GET_BOOKINGS":
                        detectedType = MessageType.GetBookings;
                        break;
                    case "VERIFY_EMAIL":
                        detectedType = MessageType.VerifyEmail;
                        break;
                    case "RESEND_VERIFICATION":
                        detectedType = MessageType.ResendVerification;
                        break;
                    case "GET_PROFILE":
                        detectedType = MessageType.GetProfile;
                        break;
                    case "UPDATE_PROFILE":
                        detectedType = MessageType.UpdateProfile;
                        break;
                    case "GET_ACTIVITY":
                        detectedType = MessageType.GetActivity;
                        break;
                    case "DELETE_ACCOUNT":
                        detectedType = MessageType.DeleteAccount;
                        break;
                    default:
                        LogManager.Warning($"Unknown message type: {typePrefix}", "MessageTypeIdentifier");
                        detectedType = MessageType.Unknown;
                        break;
                }
                
                LogManager.Debug($"Message identified as type: {detectedType}", "MessageTypeIdentifier");
                return detectedType;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error identifying message type: {ex.Message}", "MessageTypeIdentifier");
                return MessageType.Unknown;
            }
        }
        
        public static string ExtractMessageContent(string message)
        {
            try
            {
                if (string.IsNullOrEmpty(message))
                {
                    return string.Empty;
                }
                
                string[] parts = message.Split(new char[] { ':' }, 2);
                
                if (parts.Length < 2)
                {
                    LogManager.Warning($"Cannot extract content from message: {message}", "MessageTypeIdentifier");
                    return message;
                }
                
                return parts[1];
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error extracting message content: {ex.Message}", "MessageTypeIdentifier");
                return string.Empty;
            }
        }
    }
}