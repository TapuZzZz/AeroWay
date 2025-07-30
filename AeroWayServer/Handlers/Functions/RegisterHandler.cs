using System;
using System.Text.RegularExpressions;
using MySql.Data.MySqlClient;
using AeroWayServer.Core;
using AeroWayServer.Log;
using AeroWayServer.Security;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayServer.Handlers.Functions
{
    public static class RegisterHandler
    {
        public static string ProcessRegistration(string messageContent, string clientId)
        {
            try
            {
                string[] registerInfo = messageContent.Split(':');
                
                if (registerInfo.Length != 8)
                {
                    LogManager.Warning($"Invalid register format from client {clientId}", "RegisterHandler");
                    return "REGISTER_FAILED:Invalid format";
                }
                
                string firstName = registerInfo[0];
                string lastName = registerInfo[1];
                string email = registerInfo[2];
                string phone = registerInfo[3];
                string dateOfBirth = registerInfo[4];
                string gender = registerInfo[5];
                string nationality = registerInfo[6];
                string password = registerInfo[7];

                LogManager.Info($"Registration attempt - Email: {email}", "RegisterHandler");

                if (!ValidateRegistrationInputs(firstName, lastName, email, phone, dateOfBirth, gender, nationality, password))
                {
                    LogManager.Warning($"Registration failed security validation from client {clientId}", "RegisterHandler");
                    return "REGISTER_FAILED:Invalid input detected";
                }

                if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName) || 
                    string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                {
                    return "REGISTER_FAILED:Required fields are missing";
                }

                if (CheckEmailExists(email))
                {
                    LogManager.Warning($"Registration attempt with existing email '{email}' from client {clientId}", "RegisterHandler");
                    return "REGISTER_FAILED:Email already registered";
                }

                string salt = GenerateSalt();
                string passwordHash = HashPassword(password, salt);

                int userId = CreateUser(firstName, lastName, email, phone, dateOfBirth, gender, nationality, passwordHash, salt, clientId);
                
                if (userId > 0)
                {
                    // Generate and send verification email
                    string verificationToken = EmailVerificationHandler.GenerateVerificationToken();
                    bool tokenStored = EmailVerificationHandler.StoreVerificationToken(userId, verificationToken);
                    bool emailSent = false;
                    
                    if (tokenStored)
                    {
                        emailSent = EmailVerificationHandler.SendVerificationEmail(email, firstName, verificationToken);
                    }
                    
                    LogManager.Info($"New user registered successfully: {email} (ID: {userId}) from client {clientId}", "RegisterHandler");
                    
                    if (emailSent)
                    {
                        return $"REGISTER_SUCCESS:Account created successfully. Please check your email to verify your account. User ID: {userId}";
                    }
                    else
                    {
                        LogManager.Warning($"Failed to send verification email to {email}", "RegisterHandler");
                        return $"REGISTER_SUCCESS:Account created successfully. User ID: {userId}";
                    }
                }
                else
                {
                    LogManager.Error("Failed to create user in database", "RegisterHandler");
                    return "REGISTER_FAILED:Failed to create account";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error processing registration: {ex.Message}", "RegisterHandler");
                return "REGISTER_FAILED:An error occurred during registration";
            }
        }

        private static bool ValidateRegistrationInputs(string firstName, string lastName, string email, 
            string phone, string dateOfBirth, string gender, string nationality, string password)
        {
            if (!SqlInjectionPrevention.IsSafeForType(firstName, SqlInjectionPrevention.InputType.Name))
                return false;
            
            if (!SqlInjectionPrevention.IsSafeForType(lastName, SqlInjectionPrevention.InputType.Name))
                return false;
            
            if (!SqlInjectionPrevention.IsSafeForType(email, SqlInjectionPrevention.InputType.Email))
                return false;
            
            if (!string.IsNullOrWhiteSpace(phone) && !SqlInjectionPrevention.IsSafeForType(phone, SqlInjectionPrevention.InputType.Phone))
                return false;
            
            if (!string.IsNullOrWhiteSpace(dateOfBirth) && !SqlInjectionPrevention.IsSafeForType(dateOfBirth, SqlInjectionPrevention.InputType.Date))
                return false;
            
            if (!string.IsNullOrWhiteSpace(gender) && !SqlInjectionPrevention.IsSafeForType(gender, SqlInjectionPrevention.InputType.Gender))
                return false;
            
            if (!string.IsNullOrWhiteSpace(nationality) && !SqlInjectionPrevention.IsSafeForType(nationality, SqlInjectionPrevention.InputType.Nationality))
                return false;
            
            if (!SqlInjectionPrevention.IsSafeForType(password, SqlInjectionPrevention.InputType.Password))
                return false;
            
            return true;
        }

        private static bool CheckEmailExists(string email)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();

                string query = "SELECT COUNT(*) FROM Users WHERE Email = @email";
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@email", email);

                int count = Convert.ToInt32(command.ExecuteScalar());
                return count > 0;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error checking email existence: {ex.Message}", "RegisterHandler");
                return true;
            }
        }

        private static string GenerateSalt()
        {
            using var rng = RandomNumberGenerator.Create();
            byte[] saltBytes = new byte[32];
            rng.GetBytes(saltBytes);
            return Convert.ToBase64String(saltBytes);
        }

        private static string HashPassword(string password, string salt)
        {
            string saltedPassword = password + salt;
            using var sha256 = SHA256.Create();
            byte[] hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
            return Convert.ToBase64String(hashedBytes);
        }

        private static int CreateUser(string firstName, string lastName, string email, string phone, 
            string dateOfBirth, string gender, string nationality, string passwordHash, string salt, string clientId)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();

                string query = @"INSERT INTO Users (FirstName, LastName, Email, Phone, DateOfBirth, 
                               Gender, Nationality, PasswordHash, Salt, IsActive, EmailVerified, CreatedDate) 
                               VALUES (@firstName, @lastName, @email, @phone, @dateOfBirth, 
                               @gender, @nationality, @passwordHash, @salt, 1, 0, NOW());
                               SELECT LAST_INSERT_ID();";

                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@firstName", firstName);
                command.Parameters.AddWithValue("@lastName", lastName);
                command.Parameters.AddWithValue("@email", email);
                command.Parameters.AddWithValue("@phone", phone);
                command.Parameters.AddWithValue("@dateOfBirth", dateOfBirth);
                command.Parameters.AddWithValue("@gender", gender);
                command.Parameters.AddWithValue("@nationality", nationality);
                command.Parameters.AddWithValue("@passwordHash", passwordHash);
                command.Parameters.AddWithValue("@salt", salt);

                object result = command.ExecuteScalar();
                return Convert.ToInt32(result);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error creating user in database: {ex.Message}", "RegisterHandler");
                return 0;
            }
        }
    }
}