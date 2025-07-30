using System;
using AeroWayServer.Communication;
using AeroWayServer.Log;
using AeroWayServer.Handlers.Functions;

namespace AeroWayServer.Handlers
{
    public static class MessageHandler
    {
        public static string HandleMessage(MessageType messageType, string messageContent, string clientId)
        {
            try
            {
                LogManager.Info($"Handling message of type: {messageType} from client: {clientId}", "MessageHandler");
                
                switch (messageType)
                {
                    case MessageType.Login:
                        return LoginHandler.ProcessLogin(messageContent, clientId);
                    
                    case MessageType.Register:
                        return RegisterHandler.ProcessRegistration(messageContent, clientId);
                        
                    case MessageType.FlightSearch:
                        return FlightSearchHandler.ProcessFlightSearch(messageContent, clientId);
                        
                    case MessageType.Booking:
                        return BookingHandler.ProcessBooking(messageContent, clientId);
                        
                    case MessageType.GetBookings:
                        return BookingHandler.GetUserBookings(messageContent, clientId);
                        
                    case MessageType.VerifyEmail:
                        return EmailVerificationHandler.ProcessEmailVerification(messageContent, clientId);
                        
                    case MessageType.ResendVerification:
                        return EmailVerificationHandler.ResendVerificationEmail(messageContent, clientId);
                        
                    case MessageType.GetProfile:
                        return UserProfileHandler.GetUserProfile(messageContent, clientId);
                        
                    case MessageType.UpdateProfile:
                        return UserProfileHandler.UpdateUserProfile(messageContent, clientId);
                        
                    case MessageType.GetActivity:
                        return UserProfileHandler.GetRecentActivity(messageContent, clientId);
                        
                    case MessageType.DeleteAccount:
                        return UserProfileHandler.DeleteUserAccount(messageContent, clientId);
                    
                    case MessageType.Unknown:
                    default:
                        LogManager.Warning($"Received unknown message type from client {clientId}", "MessageHandler");
                        return "ERROR:Unknown message type or invalid format";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error handling message: {ex.Message}", "MessageHandler");
                return $"ERROR:Internal server error: {ex.Message}";
            }
        }
    }
}