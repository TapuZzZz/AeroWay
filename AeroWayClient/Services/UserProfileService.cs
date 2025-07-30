using System;
using AeroWayClient.Services.Core;
using AeroWayClient.Services.Security;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services
{
    public class UserProfileService
    {
        private readonly string _serverHost;
        private readonly int _serverPort;

        public UserProfileService()
        {
            if (!ServerConfigService.IsConfigured)
            {
                throw new InvalidOperationException("Server not configured. Please configure server connection first.");
            }
            
            _serverHost = ServerConfigService.ServerHost;
            _serverPort = ServerConfigService.ServerPort;
            LogManager.Info($"UserProfileService initialized - Server: {_serverHost}:{_serverPort}", "UserProfileService");
        }
        
        public UserProfileService(string host, int port)
        {
            _serverHost = host;
            _serverPort = port;
            LogManager.Info($"UserProfileService initialized - Server: {host}:{port}", "UserProfileService");
        }

        public class UserProfile
        {
            public int UserId { get; set; }
            public string FirstName { get; set; } = "";
            public string LastName { get; set; } = "";
            public string Email { get; set; } = "";
            public string Phone { get; set; } = "";
            public DateTime DateOfBirth { get; set; }
            public string Gender { get; set; } = "";
            public string Nationality { get; set; } = "";
            public DateTime CreatedDate { get; set; }
            public bool EmailVerified { get; set; }
            public int TotalBookings { get; set; }
            public int ConfirmedBookings { get; set; }
            public int CompletedBookings { get; set; }
            public decimal TotalSpent { get; set; }
            public string LastLoginDate { get; set; } = "";
            public int TotalFlights { get; set; }
            public int CountriesVisited { get; set; }
            public long TotalMiles { get; set; }
        }

        public class ProfileResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = "";
            public UserProfile? Profile { get; set; }
        }

        public class UpdateProfileRequest
        {
            public int UserId { get; set; }
            public string FirstName { get; set; } = "";
            public string LastName { get; set; } = "";
            public string Phone { get; set; } = "";
            public DateTime DateOfBirth { get; set; }
            public string Gender { get; set; } = "";
            public string Nationality { get; set; } = "";
            public string CurrentPassword { get; set; } = "";
        }

        public class UpdateProfileResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = "";
        }

        public class DeleteAccountRequest
        {
            public int UserId { get; set; }
            public string CurrentPassword { get; set; } = "";
        }

        public class DeleteAccountResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = "";
        }

        public class ActivityItem
        {
            public string Type { get; set; } = "";
            public string Description { get; set; } = "";
            public DateTime ActivityDate { get; set; }
            public string Status { get; set; } = "";
        }

        public class ActivityResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = "";
            public List<ActivityItem> Activities { get; set; } = new List<ActivityItem>();
        }

        public ProfileResponse GetUserProfile(int userId)
        {
            try
            {
                LogManager.Info($"Getting profile for user {userId}", "UserProfileService");
                
                string message = $"GET_PROFILE:{userId}";
                string response = SendMessage(message);
                
                return ParseProfileResponse(response);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error getting user profile: {ex.Message}", "UserProfileService");
                return new ProfileResponse 
                { 
                    Success = false, 
                    Message = $"Failed to get profile: {ex.Message}" 
                };
            }
        }

        public UpdateProfileResponse UpdateProfile(UpdateProfileRequest request)
        {
            try
            {
                LogManager.Info($"Updating profile for user {request.UserId}", "UserProfileService");
                
                string message = $"UPDATE_PROFILE:{request.UserId}|{request.FirstName}|{request.LastName}|" +
                               $"{request.Phone}|{request.DateOfBirth:yyyy-MM-dd}|{request.Gender}|" +
                               $"{request.Nationality}|{request.CurrentPassword}";
                
                string response = SendMessage(message);
                
                return ParseUpdateResponse(response);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error updating profile: {ex.Message}", "UserProfileService");
                return new UpdateProfileResponse 
                { 
                    Success = false, 
                    Message = $"Failed to update profile: {ex.Message}" 
                };
            }
        }

        public DeleteAccountResponse DeleteAccount(DeleteAccountRequest request)
        {
            try
            {
                LogManager.Info($"Deleting account for user {request.UserId}", "UserProfileService");
                
                string message = $"DELETE_ACCOUNT:{request.UserId}|{request.CurrentPassword}";
                
                string response = SendMessage(message);
                
                return ParseDeleteAccountResponse(response);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error deleting account: {ex.Message}", "UserProfileService");
                return new DeleteAccountResponse 
                { 
                    Success = false, 
                    Message = $"Failed to delete account: {ex.Message}" 
                };
            }
        }

        public ActivityResponse GetRecentActivity(int userId)
        {
            try
            {
                LogManager.Info($"Getting recent activity for user {userId}", "UserProfileService");
                
                string message = $"GET_ACTIVITY:{userId}";
                string response = SendMessage(message);
                
                return ParseActivityResponse(response);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error getting recent activity: {ex.Message}", "UserProfileService");
                return new ActivityResponse 
                { 
                    Success = false, 
                    Message = $"Failed to get activity: {ex.Message}" 
                };
            }
        }

        private string SendMessage(string message)
        {
            LogManager.Debug("Creating new connection to server", "UserProfileService");
            
            using (var connection = new ConnectionProcessor(_serverHost, _serverPort))
            {
                if (!connection.Connect())
                {
                    LogManager.Error("Failed to connect to server", "UserProfileService");
                    throw new Exception("Failed to connect to server");
                }
                
                string response = connection.SendEncryptedMessage(message);
                LogManager.Debug("Received response from server", "UserProfileService");
                
                return response;
            }
        }

        private ProfileResponse ParseProfileResponse(string response)
        {
            var result = new ProfileResponse();
            
            try
            {
                if (response.StartsWith("GET_PROFILE_SUCCESS:"))
                {
                    result.Success = true;
                    result.Message = "Profile retrieved successfully";
                    
                    string data = response.Substring("GET_PROFILE_SUCCESS:".Length);
                    string[] parts = data.Split('|');
                    
                    if (parts.Length >= 18)
                    {
                        result.Profile = new UserProfile
                        {
                            UserId = int.Parse(parts[0]),
                            FirstName = parts[1],
                            LastName = parts[2],
                            Email = parts[3],
                            Phone = parts[4],
                            DateOfBirth = DateTime.Parse(parts[5]),
                            Gender = parts[6],
                            Nationality = parts[7],
                            CreatedDate = DateTime.Parse(parts[8]),
                            EmailVerified = bool.Parse(parts[9]),
                            TotalBookings = int.Parse(parts[10]),
                            ConfirmedBookings = int.Parse(parts[11]),
                            CompletedBookings = int.Parse(parts[12]),
                            TotalSpent = decimal.Parse(parts[13]),
                            LastLoginDate = parts[14],
                            TotalFlights = int.Parse(parts[15]),
                            CountriesVisited = int.Parse(parts[16]),
                            TotalMiles = long.Parse(parts[17])
                        };
                    }
                }
                else if (response.StartsWith("GET_PROFILE_FAILED:"))
                {
                    result.Success = false;
                    result.Message = response.Substring("GET_PROFILE_FAILED:".Length);
                }
                else
                {
                    result.Success = false;
                    result.Message = "Unexpected response format";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing profile response: {ex.Message}", "UserProfileService");
                result.Success = false;
                result.Message = "Error parsing profile data";
            }
            
            return result;
        }

        private UpdateProfileResponse ParseUpdateResponse(string response)
        {
            var result = new UpdateProfileResponse();
            
            try
            {
                if (response.StartsWith("UPDATE_PROFILE_SUCCESS:"))
                {
                    result.Success = true;
                    result.Message = response.Substring("UPDATE_PROFILE_SUCCESS:".Length);
                }
                else if (response.StartsWith("UPDATE_PROFILE_FAILED:"))
                {
                    result.Success = false;
                    result.Message = response.Substring("UPDATE_PROFILE_FAILED:".Length);
                }
                else
                {
                    result.Success = false;
                    result.Message = "Unexpected response format";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing update response: {ex.Message}", "UserProfileService");
                result.Success = false;
                result.Message = "Error parsing response";
            }
            
            return result;
        }

        private DeleteAccountResponse ParseDeleteAccountResponse(string response)
        {
            var result = new DeleteAccountResponse();
            
            try
            {
                if (response.StartsWith("DELETE_ACCOUNT_SUCCESS:"))
                {
                    result.Success = true;
                    result.Message = response.Substring("DELETE_ACCOUNT_SUCCESS:".Length);
                }
                else if (response.StartsWith("DELETE_ACCOUNT_FAILED:"))
                {
                    result.Success = false;
                    result.Message = response.Substring("DELETE_ACCOUNT_FAILED:".Length);
                }
                else
                {
                    result.Success = false;
                    result.Message = "Unexpected response format";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing delete account response: {ex.Message}", "UserProfileService");
                result.Success = false;
                result.Message = "Error parsing response";
            }
            
            return result;
        }

        private ActivityResponse ParseActivityResponse(string response)
        {
            var result = new ActivityResponse();
            
            try
            {
                if (response.StartsWith("GET_ACTIVITY_SUCCESS:"))
                {
                    result.Success = true;
                    result.Message = "Activity retrieved successfully";
                    
                    string data = response.Substring("GET_ACTIVITY_SUCCESS:".Length);
                    if (!string.IsNullOrEmpty(data))
                    {
                        string[] activities = data.Split('|');
                        
                        foreach (string activityData in activities)
                        {
                            string[] parts = activityData.Split(',');
                            if (parts.Length >= 4)
                            {
                                result.Activities.Add(new ActivityItem
                                {
                                    Type = parts[0],
                                    Description = parts[1],
                                    ActivityDate = DateTime.Parse(parts[2]),
                                    Status = parts[3]
                                });
                            }
                        }
                    }
                }
                else if (response.StartsWith("GET_ACTIVITY_FAILED:"))
                {
                    result.Success = false;
                    result.Message = response.Substring("GET_ACTIVITY_FAILED:".Length);
                }
                else
                {
                    result.Success = false;
                    result.Message = "Unexpected response format";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing activity response: {ex.Message}", "UserProfileService");
                result.Success = false;
                result.Message = "Error parsing activity data";
            }
            
            return result;
        }
    }
}