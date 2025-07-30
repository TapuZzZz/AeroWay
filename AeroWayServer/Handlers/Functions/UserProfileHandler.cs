using System;
using System.Text;
using MySql.Data.MySqlClient;
using AeroWayServer.Core;
using AeroWayServer.Log;
using AeroWayServer.Security;

namespace AeroWayServer.Handlers.Functions
{
    public static class UserProfileHandler
    {
        public static string GetUserProfile(string messageContent, string clientId)
        {
            try
            {
                LogManager.Info($"Getting user profile from client {clientId}", "UserProfileHandler");

                if (!int.TryParse(messageContent, out int userId))
                {
                    return "GET_PROFILE_FAILED:Invalid user ID";
                }

                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();

                // Get user details
                string userQuery = @"
                    SELECT u.UserId, u.FirstName, u.LastName, u.Email, u.Phone, 
                           u.DateOfBirth, u.Gender, u.Nationality, u.CreatedDate,
                           u.EmailVerified, u.EmailVerifiedDate, u.LastLoginDate,
                           COUNT(DISTINCT b.BookingId) as TotalBookings,
                           COUNT(DISTINCT CASE WHEN b.Status = 'Confirmed' THEN b.BookingId END) as ConfirmedBookings,
                           COUNT(DISTINCT CASE WHEN b.Status = 'Completed' THEN b.BookingId END) as CompletedBookings,
                           COALESCE(SUM(b.TotalPrice), 0) as TotalSpent
                    FROM Users u
                    LEFT JOIN Bookings b ON u.UserId = b.UserId
                    WHERE u.UserId = @userId
                    GROUP BY u.UserId";

                using var command = new MySqlCommand(userQuery, connection);
                command.Parameters.AddWithValue("@userId", userId);

                using var reader = command.ExecuteReader();
                if (reader.Read())
                {
                    var response = new StringBuilder("GET_PROFILE_SUCCESS:");

                    // Basic info
                    response.Append($"{reader.GetInt32("UserId")}");
                    response.Append($"|{reader.GetString("FirstName")}");
                    response.Append($"|{reader.GetString("LastName")}");
                    response.Append($"|{reader.GetString("Email")}");
                    response.Append($"|{reader.GetString("Phone")}");
                    response.Append($"|{reader.GetDateTime("DateOfBirth"):yyyy-MM-dd}");
                    response.Append($"|{reader.GetString("Gender")}");
                    response.Append($"|{reader.GetString("Nationality")}");
                    response.Append($"|{reader.GetDateTime("CreatedDate"):yyyy-MM-dd}");
                    response.Append($"|{reader.GetBoolean("EmailVerified")}");

                    // Statistics
                    response.Append($"|{reader.GetInt32("TotalBookings")}");
                    response.Append($"|{reader.GetInt32("ConfirmedBookings")}");
                    response.Append($"|{reader.GetInt32("CompletedBookings")}");
                    response.Append($"|{reader.GetDecimal("TotalSpent")}");

                    // Last login
                    if (!reader.IsDBNull(reader.GetOrdinal("LastLoginDate")))
                    {
                        response.Append($"|{reader.GetDateTime("LastLoginDate"):yyyy-MM-dd HH:mm}");
                    }
                    else
                    {
                        response.Append("|Never");
                    }

                    reader.Close();

                    // Get flight statistics
                    string flightStatsQuery = @"
                        SELECT 
                            COUNT(DISTINCT CASE WHEN b.Status IN ('Confirmed', 'Completed') THEN f.FlightId END) as TotalFlights,
                            COUNT(DISTINCT a.Country) as CountriesVisited,
                            COALESCE(SUM(
                                CASE WHEN b.Status IN ('Confirmed', 'Completed') 
                                THEN (
                                    SELECT SUM(
                                        6371 * 2 * ASIN(SQRT(
                                            POWER(SIN((d.Latitude - o.Latitude) * PI() / 180 / 2), 2) +
                                            COS(o.Latitude * PI() / 180) * COS(d.Latitude * PI() / 180) *
                                            POWER(SIN((d.Longitude - o.Longitude) * PI() / 180 / 2), 2)
                                        ))
                                    )
                                    FROM Flights fl
                                    JOIN Airports o ON fl.OriginAirportId = o.AirportId
                                    JOIN Airports d ON fl.DestinationAirportId = d.AirportId
                                    WHERE fl.FlightId = f.FlightId
                                )
                                END
                            ), 0) * 0.621371 as TotalMiles
                        FROM Bookings b
                        LEFT JOIN Flights f ON b.FlightId = f.FlightId OR b.ReturnFlightId = f.FlightId
                        LEFT JOIN Airports a ON f.DestinationAirportId = a.AirportId
                        WHERE b.UserId = @userId";

                    using var statsCmd = new MySqlCommand(flightStatsQuery, connection);
                    statsCmd.Parameters.AddWithValue("@userId", userId);

                    using var statsReader = statsCmd.ExecuteReader();
                    if (statsReader.Read())
                    {
                        response.Append($"|{statsReader.GetInt32("TotalFlights")}");
                        response.Append($"|{statsReader.GetInt32("CountriesVisited")}");
                        response.Append($"|{Math.Round(statsReader.GetDouble("TotalMiles"))}");
                    }
                    else
                    {
                        response.Append("|0|0|0");
                    }

                    LogManager.Info($"Profile retrieved successfully for user {userId}", "UserProfileHandler");
                    return response.ToString();
                }
                else
                {
                    return "GET_PROFILE_FAILED:User not found";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error getting user profile: {ex.Message}", "UserProfileHandler");
                return "GET_PROFILE_FAILED:An error occurred while retrieving profile";
            }
        }

        public static string UpdateUserProfile(string messageContent, string clientId)
        {
            try
            {
                LogManager.Info($"Updating user profile from client {clientId}", "UserProfileHandler");

                string[] parts = messageContent.Split('|');

                if (parts.Length < 8)
                {
                    return "UPDATE_PROFILE_FAILED:Invalid format";
                }

                int userId = int.Parse(parts[0]);
                string firstName = parts[1];
                string lastName = parts[2];
                string phone = parts[3];
                string dateOfBirth = parts[4];
                string gender = parts[5];
                string nationality = parts[6];
                string currentPassword = parts[7];

                // Validate inputs
                if (!ValidateProfileInputs(firstName, lastName, phone, dateOfBirth, gender, nationality))
                {
                    return "UPDATE_PROFILE_FAILED:Invalid input format";
                }

                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();

                // Verify current password
                string verifyQuery = "SELECT PasswordHash, Salt FROM Users WHERE UserId = @userId";
                using var verifyCmd = new MySqlCommand(verifyQuery, connection);
                verifyCmd.Parameters.AddWithValue("@userId", userId);

                using var reader = verifyCmd.ExecuteReader();
                if (!reader.Read())
                {
                    return "UPDATE_PROFILE_FAILED:User not found";
                }

                string storedHash = reader.GetString("PasswordHash");
                string salt = reader.GetString("Salt");
                reader.Close();

                // Verify password
                if (!VerifyPassword(currentPassword, storedHash, salt))
                {
                    LogManager.Warning($"Invalid password for profile update attempt by user {userId}", "UserProfileHandler");
                    return "UPDATE_PROFILE_FAILED:Invalid password";
                }

                // Update profile
                string updateQuery = @"
                    UPDATE Users 
                    SET FirstName = @firstName, 
                        LastName = @lastName, 
                        Phone = @phone, 
                        DateOfBirth = @dob, 
                        Gender = @gender, 
                        Nationality = @nationality
                    WHERE UserId = @userId";

                using var updateCmd = new MySqlCommand(updateQuery, connection);
                updateCmd.Parameters.AddWithValue("@firstName", firstName);
                updateCmd.Parameters.AddWithValue("@lastName", lastName);
                updateCmd.Parameters.AddWithValue("@phone", phone);
                updateCmd.Parameters.AddWithValue("@dob", dateOfBirth);
                updateCmd.Parameters.AddWithValue("@gender", gender);
                updateCmd.Parameters.AddWithValue("@nationality", nationality);
                updateCmd.Parameters.AddWithValue("@userId", userId);

                int rowsAffected = updateCmd.ExecuteNonQuery();

                if (rowsAffected > 0)
                {
                    LogManager.Info($"Profile updated successfully for user {userId}", "UserProfileHandler");
                    return "UPDATE_PROFILE_SUCCESS:Profile updated successfully";
                }
                else
                {
                    return "UPDATE_PROFILE_FAILED:Failed to update profile";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error updating profile: {ex.Message}", "UserProfileHandler");
                return "UPDATE_PROFILE_FAILED:An error occurred while updating profile";
            }
        }

        public static string GetRecentActivity(string messageContent, string clientId)
        {
            try
            {
                LogManager.Info($"Getting recent activity from client {clientId}", "UserProfileHandler");

                if (!int.TryParse(messageContent, out int userId))
                {
                    return "GET_ACTIVITY_FAILED:Invalid user ID";
                }

                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();

                // Get recent bookings and activities
                string query = @"
                    SELECT 
                        'Booking' as ActivityType,
                        CONCAT('Flight booked: ', o.City, ' → ', d.City, ' • Flight ', f.FlightNumber) as Description,
                        b.BookingDate as ActivityDate,
                        b.Status
                    FROM Bookings b
                    JOIN Flights f ON b.FlightId = f.FlightId
                    JOIN Airports o ON f.OriginAirportId = o.AirportId
                    JOIN Airports d ON f.DestinationAirportId = d.AirportId
                    WHERE b.UserId = @userId
                    ORDER BY b.BookingDate DESC
                    LIMIT 10";

                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@userId", userId);

                var response = new StringBuilder("GET_ACTIVITY_SUCCESS:");
                int count = 0;

                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    if (count > 0) response.Append("|");

                    response.Append($"{reader.GetString("ActivityType")}");
                    response.Append($",{reader.GetString("Description")}");
                    response.Append($",{reader.GetDateTime("ActivityDate"):yyyy-MM-dd HH:mm}");
                    response.Append($",{reader.GetString("Status")}");

                    count++;
                }

                LogManager.Info($"Found {count} activities for user {userId}", "UserProfileHandler");
                return response.ToString();
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error getting recent activity: {ex.Message}", "UserProfileHandler");
                return "GET_ACTIVITY_FAILED:An error occurred while retrieving activity";
            }
        }

        public static string DeleteUserAccount(string messageContent, string clientId)
        {
            try
            {
                LogManager.Info($"Processing delete account request from client: {clientId}", "UserProfileHandler");
                
                // Parse message content: userId|password
                string[] parts = messageContent.Split('|');
                
                if (parts.Length != 2)
                {
                    LogManager.Warning($"Invalid delete account message format from client {clientId}", "UserProfileHandler");
                    return "DELETE_ACCOUNT_FAILED:Invalid request format";
                }
                
                if (!int.TryParse(parts[0], out int userId))
                {
                    LogManager.Warning($"Invalid user ID format from client {clientId}", "UserProfileHandler");
                    return "DELETE_ACCOUNT_FAILED:Invalid user ID";
                }
                
                string password = parts[1];
                
                if (string.IsNullOrWhiteSpace(password))
                {
                    LogManager.Warning($"Empty password provided for account deletion from client {clientId}", "UserProfileHandler");
                    return "DELETE_ACCOUNT_FAILED:Password is required";
                }
                
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                using var transaction = connection.BeginTransaction();
                
                try
                {
                    // First, verify the user exists and password is correct
                    string getUserQuery = @"
                        SELECT UserId, PasswordHash, Salt, Email, FirstName, LastName 
                        FROM Users 
                        WHERE UserId = @userId AND IsActive = TRUE";
                    
                    using var getUserCmd = new MySqlCommand(getUserQuery, connection, transaction);
                    getUserCmd.Parameters.AddWithValue("@userId", userId);
                    
                    using var reader = getUserCmd.ExecuteReader();
                    if (!reader.Read())
                    {
                        LogManager.Warning($"User {userId} not found or inactive for deletion", "UserProfileHandler");
                        transaction.Rollback();
                        return "DELETE_ACCOUNT_FAILED:User not found or account already inactive";
                    }
                    
                    string storedHash = reader.GetString("PasswordHash");
                    string salt = reader.GetString("Salt");
                    string email = reader.GetString("Email");
                    string firstName = reader.GetString("FirstName");
                    string lastName = reader.GetString("LastName");
                    
                    reader.Close();
                    
                    // Verify password
                    if (!VerifyPassword(password, storedHash, salt))
                    {
                        LogManager.Warning($"Invalid password provided for account deletion - User {userId}", "UserProfileHandler");
                        transaction.Rollback();
                        return "DELETE_ACCOUNT_FAILED:Invalid password";
                    }
                    
                    LogManager.Info($"Password verified for user {userId} account deletion", "UserProfileHandler");
                    
                    // Check for active future bookings
                    string activeBookingsQuery = @"
                        SELECT COUNT(*) 
                        FROM Bookings b
                        INNER JOIN Flights f ON (b.FlightId = f.FlightId OR b.ReturnFlightId = f.FlightId)
                        WHERE b.UserId = @userId 
                        AND b.Status = 'Confirmed' 
                        AND f.DepartureTime > NOW()";
                    
                    using var activeBookingsCmd = new MySqlCommand(activeBookingsQuery, connection, transaction);
                    activeBookingsCmd.Parameters.AddWithValue("@userId", userId);
                    int activeBookings = Convert.ToInt32(activeBookingsCmd.ExecuteScalar());
                    
                    if (activeBookings > 0)
                    {
                        LogManager.Warning($"User {userId} has {activeBookings} active future bookings, cannot delete account", "UserProfileHandler");
                        transaction.Rollback();
                        return "DELETE_ACCOUNT_FAILED:Cannot delete account with active future bookings. Please cancel all future flights first.";
                    }
                    
                    LogManager.Info($"No active future bookings found for user {userId}, proceeding with deletion", "UserProfileHandler");
                    
                    // Delete in correct order (respecting foreign key constraints)
                    
                    // 1. Delete passengers (references bookings)
                    string deletePassengersQuery = @"
                        DELETE p FROM Passengers p 
                        INNER JOIN Bookings b ON p.BookingId = b.BookingId 
                        WHERE b.UserId = @userId";
                    
                    using var deletePassengersCmd = new MySqlCommand(deletePassengersQuery, connection, transaction);
                    deletePassengersCmd.Parameters.AddWithValue("@userId", userId);
                    int deletedPassengers = deletePassengersCmd.ExecuteNonQuery();
                    LogManager.Info($"Deleted {deletedPassengers} passenger records for user {userId}", "UserProfileHandler");
                    
                    // 2. Delete bookings
                    string deleteBookingsQuery = "DELETE FROM Bookings WHERE UserId = @userId";
                    using var deleteBookingsCmd = new MySqlCommand(deleteBookingsQuery, connection, transaction);
                    deleteBookingsCmd.Parameters.AddWithValue("@userId", userId);
                    int deletedBookings = deleteBookingsCmd.ExecuteNonQuery();
                    LogManager.Info($"Deleted {deletedBookings} booking records for user {userId}", "UserProfileHandler");
                    
                    // 3. Delete email verifications
                    string deleteEmailVerificationsQuery = "DELETE FROM EmailVerifications WHERE UserId = @userId";
                    using var deleteEmailCmd = new MySqlCommand(deleteEmailVerificationsQuery, connection, transaction);
                    deleteEmailCmd.Parameters.AddWithValue("@userId", userId);
                    int deletedEmailVerifications = deleteEmailCmd.ExecuteNonQuery();
                    LogManager.Info($"Deleted {deletedEmailVerifications} email verification records for user {userId}", "UserProfileHandler");
                    
                    // 4. Finally, delete the user account
                    string deleteUserQuery = "DELETE FROM Users WHERE UserId = @userId";
                    using var deleteUserCmd = new MySqlCommand(deleteUserQuery, connection, transaction);
                    deleteUserCmd.Parameters.AddWithValue("@userId", userId);
                    int deletedUsers = deleteUserCmd.ExecuteNonQuery();
                    
                    if (deletedUsers == 0)
                    {
                        LogManager.Error($"Failed to delete user {userId} - no rows affected", "UserProfileHandler");
                        transaction.Rollback();
                        return "DELETE_ACCOUNT_FAILED:Failed to delete user account";
                    }
                    
                    LogManager.Info($"Successfully deleted user account {userId}", "UserProfileHandler");
                    
                    // Commit the transaction
                    transaction.Commit();
                    
                    LogManager.Info($"Account deletion completed successfully for user {userId} ({firstName} {lastName}, {email})", "UserProfileHandler");
                    return "DELETE_ACCOUNT_SUCCESS:Your account has been permanently deleted. We're sorry to see you go!";
                }
                catch (Exception ex)
                {
                    LogManager.Error($"Error during account deletion transaction for user {userId}: {ex.Message}", "UserProfileHandler");
                    transaction.Rollback();
                    return "DELETE_ACCOUNT_FAILED:Database error occurred during account deletion";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error processing delete account request: {ex.Message}", "UserProfileHandler");
                return "DELETE_ACCOUNT_FAILED:Internal server error";
            }
        }

        private static bool ValidateProfileInputs(string firstName, string lastName, string phone,
            string dateOfBirth, string gender, string nationality)
        {
            if (!SqlInjectionPrevention.IsSafeForType(firstName, SqlInjectionPrevention.InputType.Name))
                return false;

            if (!SqlInjectionPrevention.IsSafeForType(lastName, SqlInjectionPrevention.InputType.Name))
                return false;

            if (!SqlInjectionPrevention.IsSafeForType(phone, SqlInjectionPrevention.InputType.Phone))
                return false;

            if (!SqlInjectionPrevention.IsSafeForType(dateOfBirth, SqlInjectionPrevention.InputType.Date))
                return false;

            if (!SqlInjectionPrevention.IsSafeForType(gender, SqlInjectionPrevention.InputType.Gender))
                return false;

            if (!SqlInjectionPrevention.IsSafeForType(nationality, SqlInjectionPrevention.InputType.Nationality))
                return false;

            return true;
        }

        private static bool VerifyPassword(string password, string storedHash, string salt)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                {
                    return false;
                }
                
                string saltedPassword = password + salt;
                using var sha256 = System.Security.Cryptography.SHA256.Create();
                byte[] hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
                string computedHash = Convert.ToBase64String(hashedBytes);

                return computedHash == storedHash;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error verifying password: {ex.Message}", "UserProfileHandler");
                return false;
            }
        }
    }
}