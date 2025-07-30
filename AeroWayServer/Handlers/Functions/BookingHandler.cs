using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using MySql.Data.MySqlClient;
using AeroWayServer.Core;
using AeroWayServer.Log;
using AeroWayServer.Security;

namespace AeroWayServer.Handlers.Functions
{
    public static class BookingHandler
    {
        public static string ProcessBooking(string messageContent, string clientId)
        {
            try
            {
                LogManager.Info($"Processing booking from client {clientId}", "BookingHandler");
                
                string[] parts = messageContent.Split('|');
                
                if (parts.Length < 4)
                {
                    LogManager.Warning("Invalid booking format", "BookingHandler");
                    return "BOOKING_FAILED:Invalid booking format";
                }
                
                int userId = int.Parse(parts[0]);
                int outboundFlightId = int.Parse(parts[1]);
                int returnFlightId = int.Parse(parts[2]);
                
                // Parse the total price sent from client (includes taxes)
                decimal clientTotalPrice = 0;
                if (parts.Length > 3 && decimal.TryParse(parts[3], out decimal parsedPrice))
                {
                    clientTotalPrice = parsedPrice;
                    LogManager.Info($"Using client-provided total price: ${clientTotalPrice}", "BookingHandler");
                }
                
                var passengers = new List<PassengerInfo>();
                
                // Start from index 4 since index 3 is now the total price
                for (int i = 4; i < parts.Length; i++)
                {
                    string[] passengerData = parts[i].Split(':');
                    if (passengerData.Length >= 7)
                    {
                        passengers.Add(new PassengerInfo
                        {
                            FirstName = passengerData[0],
                            LastName = passengerData[1],
                            DateOfBirth = DateTime.Parse(passengerData[2]),
                            Type = passengerData[3],
                            Gender = passengerData[4],
                            Nationality = passengerData[5],
                            PassportNumber = passengerData[6]
                        });
                    }
                    else if (passengerData.Length >= 4)
                    {
                        passengers.Add(new PassengerInfo
                        {
                            FirstName = passengerData[0],
                            LastName = passengerData[1],
                            DateOfBirth = DateTime.Parse(passengerData[2]),
                            Type = passengerData[3],
                            Gender = "Male",
                            Nationality = "Unknown",
                            PassportNumber = ""
                        });
                    }
                }
                
                if (passengers.Count == 0)
                {
                    return "BOOKING_FAILED:No passenger information provided";
                }
                
                int adults = passengers.Count(p => p.Type == "Adult");
                int children = passengers.Count(p => p.Type == "Child");
                int infants = passengers.Count(p => p.Type == "Infant");
                
                if (!ValidateBooking(userId, outboundFlightId, returnFlightId, adults + children))
                {
                    return "BOOKING_FAILED:Invalid booking parameters";
                }
                
                if (!CheckSeatAvailability(outboundFlightId, adults + children))
                {
                    return "BOOKING_FAILED:Not enough seats available on outbound flight";
                }
                
                if (returnFlightId > 0 && !CheckSeatAvailability(returnFlightId, adults + children))
                {
                    return "BOOKING_FAILED:Not enough seats available on return flight";
                }
                
                // Use client total price instead of calculating server-side
                decimal totalPrice = clientTotalPrice;
                
                // Fallback calculation if client price not provided or invalid
                if (totalPrice <= 0)
                {
                    LogManager.Warning("Client total price not provided or invalid, calculating server-side", "BookingHandler");
                    decimal outboundPrice = GetFlightPrice(outboundFlightId);
                    decimal returnPrice = returnFlightId > 0 ? GetFlightPrice(returnFlightId) : 0;
                    decimal flightSubtotal = (outboundPrice + returnPrice) * (adults + children);
                    decimal taxes = flightSubtotal * 0.18m; // 18% taxes
                    totalPrice = flightSubtotal + taxes;
                    LogManager.Info($"Server calculated price: Subtotal ${flightSubtotal}, Taxes ${taxes}, Total ${totalPrice}", "BookingHandler");
                }
                
                string bookingReference = GenerateBookingReference();
                
                int bookingId = CreateBooking(userId, outboundFlightId, returnFlightId, 
                                            adults, children, infants, totalPrice, bookingReference);
                
                if (bookingId > 0)
                {
                    foreach (var passenger in passengers)
                    {
                        AddPassenger(bookingId, passenger);
                    }
                    
                    UpdateSeatAvailability(outboundFlightId, adults + children);
                    if (returnFlightId > 0)
                    {
                        UpdateSeatAvailability(returnFlightId, adults + children);
                    }
                    
                    LogManager.Info($"Booking created successfully: {bookingReference} for user {userId} with total ${totalPrice}", "BookingHandler");
                    return $"BOOKING_SUCCESS:{bookingId}:{bookingReference}:{totalPrice}";
                }
                else
                {
                    return "BOOKING_FAILED:Failed to create booking";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error processing booking: {ex.Message}", "BookingHandler");
                return "BOOKING_FAILED:An error occurred during booking";
            }
        }
        
        public static string GetUserBookings(string messageContent, string clientId)
        {
            try
            {
                LogManager.Info($"Getting bookings for client {clientId}", "BookingHandler");
                
                if (!int.TryParse(messageContent, out int userId))
                {
                    return "GET_BOOKINGS_FAILED:Invalid user ID";
                }
                
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                string query = @"
                    SELECT b.BookingId, b.BookingReference, b.Adults, b.Children, b.Infants, 
                           b.TotalPrice, b.Status, b.BookingDate,
                           f1.FlightNumber as OutboundFlightNumber, f1.DepartureTime as OutboundDeparture,
                           f1.ArrivalTime as OutboundArrival,
                           o1.Code as OutboundOriginCode, o1.City as OutboundOriginCity,
                           d1.Code as OutboundDestCode, d1.City as OutboundDestCity,
                           a1.Model as OutboundAircraft,
                           f2.FlightNumber as ReturnFlightNumber, f2.DepartureTime as ReturnDeparture,
                           f2.ArrivalTime as ReturnArrival,
                           o2.Code as ReturnOriginCode, o2.City as ReturnOriginCity,
                           d2.Code as ReturnDestCode, d2.City as ReturnDestCity,
                           a2.Model as ReturnAircraft
                    FROM Bookings b
                    JOIN Flights f1 ON b.FlightId = f1.FlightId
                    JOIN Airports o1 ON f1.OriginAirportId = o1.AirportId
                    JOIN Airports d1 ON f1.DestinationAirportId = d1.AirportId
                    JOIN Aircraft a1 ON f1.AircraftId = a1.AircraftId
                    LEFT JOIN Flights f2 ON b.ReturnFlightId = f2.FlightId
                    LEFT JOIN Airports o2 ON f2.OriginAirportId = o2.AirportId
                    LEFT JOIN Airports d2 ON f2.DestinationAirportId = d2.AirportId
                    LEFT JOIN Aircraft a2 ON f2.AircraftId = a2.AircraftId
                    WHERE b.UserId = @userId
                    ORDER BY b.BookingDate DESC";
                
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@userId", userId);
                
                var response = new StringBuilder("GET_BOOKINGS_SUCCESS:");
                int count = 0;
                
                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    if (count > 0) response.Append("|");
                    
                    int bookingId = reader.GetInt32("BookingId");
                    
                    response.Append($"{bookingId}");
                    response.Append($",{reader.GetString("BookingReference")}");
                    response.Append($",{reader.GetInt32("Adults")}");
                    response.Append($",{reader.GetInt32("Children")}");
                    response.Append($",{reader.GetInt32("Infants")}");
                    response.Append($",{reader.GetDecimal("TotalPrice")}");
                    response.Append($",{reader.GetString("Status")}");
                    response.Append($",{reader.GetDateTime("BookingDate"):yyyy-MM-dd HH:mm}");
                    
                    response.Append($",{reader.GetString("OutboundFlightNumber")}");
                    response.Append($",{reader.GetDateTime("OutboundDeparture"):yyyy-MM-dd HH:mm}");
                    response.Append($",{reader.GetDateTime("OutboundArrival"):yyyy-MM-dd HH:mm}");
                    response.Append($",{reader.GetString("OutboundOriginCode")}");
                    response.Append($",{reader.GetString("OutboundOriginCity")}");
                    response.Append($",{reader.GetString("OutboundDestCode")}");
                    response.Append($",{reader.GetString("OutboundDestCity")}");
                    response.Append($",{reader.GetString("OutboundAircraft")}");
                    
                    if (!reader.IsDBNull(reader.GetOrdinal("ReturnFlightNumber")))
                    {
                        response.Append($",{reader.GetString("ReturnFlightNumber")}");
                        response.Append($",{reader.GetDateTime("ReturnDeparture"):yyyy-MM-dd HH:mm}");
                        response.Append($",{reader.GetDateTime("ReturnArrival"):yyyy-MM-dd HH:mm}");
                        response.Append($",{reader.GetString("ReturnOriginCode")}");
                        response.Append($",{reader.GetString("ReturnOriginCity")}");
                        response.Append($",{reader.GetString("ReturnDestCode")}");
                        response.Append($",{reader.GetString("ReturnDestCity")}");
                        response.Append($",{reader.GetString("ReturnAircraft")}");
                    }
                    else
                    {
                        response.Append(",,,,,,,,");
                    }
                    
                    count++;
                }
                reader.Close();
                
                if (count > 0)
                {
                    response.Append("|PASSENGERS:");
                    
                    string passengersQuery = @"
                        SELECT b.BookingId, p.FirstName, p.LastName, p.DateOfBirth, p.PassengerType,
                               p.Gender, p.Nationality, p.PassportNumber
                        FROM Bookings b
                        JOIN Passengers p ON b.BookingId = p.BookingId
                        WHERE b.UserId = @userId
                        ORDER BY b.BookingId, p.PassengerType, p.PassengerId";
                    
                    using var passengersCmd = new MySqlCommand(passengersQuery, connection);
                    passengersCmd.Parameters.AddWithValue("@userId", userId);
                    
                    using var passengersReader = passengersCmd.ExecuteReader();
                    bool firstPassenger = true;
                    
                    while (passengersReader.Read())
                    {
                        if (!firstPassenger) response.Append("~");
                        
                        response.Append($"{passengersReader.GetInt32("BookingId")}");
                        response.Append($"^{passengersReader.GetString("FirstName")}");
                        response.Append($"^{passengersReader.GetString("LastName")}");
                        response.Append($"^{passengersReader.GetDateTime("DateOfBirth"):yyyy-MM-dd}");
                        response.Append($"^{passengersReader.GetString("PassengerType")}");
                        response.Append($"^{passengersReader.GetString("Gender")}");
                        response.Append($"^{passengersReader.GetString("Nationality")}");
                        
                        string passportNumber = "";
                        int passportColumnIndex = passengersReader.GetOrdinal("PassportNumber");
                        if (!passengersReader.IsDBNull(passportColumnIndex))
                        {
                            passportNumber = passengersReader.GetString("PassportNumber");
                        }
                        response.Append($"^{passportNumber}");
                        
                        firstPassenger = false;
                    }
                }
                
                LogManager.Info($"Found {count} bookings for user {userId}", "BookingHandler");
                return response.ToString();
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error getting bookings: {ex.Message}", "BookingHandler");
                return "GET_BOOKINGS_FAILED:An error occurred while retrieving bookings";
            }
        }
        
        private static bool ValidateBooking(int userId, int outboundFlightId, int returnFlightId, int passengerCount)
        {
            if (userId <= 0 || outboundFlightId <= 0)
                return false;
                
            if (passengerCount < 1 || passengerCount > 19)
                return false;
                
            return true;
        }
        
        private static bool CheckSeatAvailability(int flightId, int requiredSeats)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                string query = "SELECT AvailableSeats FROM Flights WHERE FlightId = @flightId";
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@flightId", flightId);
                
                object result = command.ExecuteScalar();
                if (result != null)
                {
                    int availableSeats = Convert.ToInt32(result);
                    return availableSeats >= requiredSeats;
                }
                
                return false;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error checking seat availability: {ex.Message}", "BookingHandler");
                return false;
            }
        }
        
        private static decimal GetFlightPrice(int flightId)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                string query = "SELECT Price FROM Flights WHERE FlightId = @flightId";
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@flightId", flightId);
                
                object result = command.ExecuteScalar();
                return result != null ? Convert.ToDecimal(result) : 0;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error getting flight price: {ex.Message}", "BookingHandler");
                return 0;
            }
        }
        
        private static void UpdateSeatAvailability(int flightId, int seatsBooked)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                string query = @"UPDATE Flights 
                               SET AvailableSeats = AvailableSeats - @seats 
                               WHERE FlightId = @flightId";
                               
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@seats", seatsBooked);
                command.Parameters.AddWithValue("@flightId", flightId);
                
                command.ExecuteNonQuery();
                LogManager.Info($"Updated seat availability for flight {flightId}", "BookingHandler");
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error updating seat availability: {ex.Message}", "BookingHandler");
            }
        }
        
        private static string GenerateBookingReference()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var reference = new char[6];
            
            for (int i = 0; i < reference.Length; i++)
            {
                reference[i] = chars[random.Next(chars.Length)];
            }
            
            return "AW" + new string(reference);
        }
        
        private static int CreateBooking(int userId, int outboundFlightId, int returnFlightId,
                                       int adults, int children, int infants, 
                                       decimal totalPrice, string bookingReference)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                string query;
                if (returnFlightId > 0)
                {
                    query = @"INSERT INTO Bookings 
                           (UserId, BookingReference, FlightId, ReturnFlightId, 
                            Adults, Children, Infants, TotalPrice, Status) 
                           VALUES 
                           (@userId, @reference, @outbound, @return, 
                            @adults, @children, @infants, @price, 'Confirmed');
                           SELECT LAST_INSERT_ID();";
                }
                else
                {
                    query = @"INSERT INTO Bookings 
                           (UserId, BookingReference, FlightId, 
                            Adults, Children, Infants, TotalPrice, Status) 
                           VALUES 
                           (@userId, @reference, @outbound, 
                            @adults, @children, @infants, @price, 'Confirmed');
                           SELECT LAST_INSERT_ID();";
                }
                
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@userId", userId);
                command.Parameters.AddWithValue("@reference", bookingReference);
                command.Parameters.AddWithValue("@outbound", outboundFlightId);
                if (returnFlightId > 0)
                {
                    command.Parameters.AddWithValue("@return", returnFlightId);
                }
                command.Parameters.AddWithValue("@adults", adults);
                command.Parameters.AddWithValue("@children", children);
                command.Parameters.AddWithValue("@infants", infants);
                command.Parameters.AddWithValue("@price", totalPrice);
                
                object result = command.ExecuteScalar();
                return Convert.ToInt32(result);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error creating booking: {ex.Message}", "BookingHandler");
                return 0;
            }
        }
        
        private static void AddPassenger(int bookingId, PassengerInfo passenger)
        {
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                string query = @"INSERT INTO Passengers 
                               (BookingId, FirstName, LastName, DateOfBirth, PassengerType, Gender, Nationality, PassportNumber) 
                               VALUES (@bookingId, @firstName, @lastName, @dob, @type, @gender, @nationality, @passportNumber)";
                
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@bookingId", bookingId);
                command.Parameters.AddWithValue("@firstName", passenger.FirstName);
                command.Parameters.AddWithValue("@lastName", passenger.LastName);
                command.Parameters.AddWithValue("@dob", passenger.DateOfBirth);
                command.Parameters.AddWithValue("@type", passenger.Type);
                command.Parameters.AddWithValue("@gender", passenger.Gender);
                command.Parameters.AddWithValue("@nationality", passenger.Nationality);
                command.Parameters.AddWithValue("@passportNumber", string.IsNullOrEmpty(passenger.PassportNumber) ? DBNull.Value : passenger.PassportNumber);
                
                command.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error adding passenger: {ex.Message}", "BookingHandler");
            }
        }
        
        private class PassengerInfo
        {
            public string FirstName { get; set; } = "";
            public string LastName { get; set; } = "";
            public DateTime DateOfBirth { get; set; }
            public string Type { get; set; } = "";
            public string Gender { get; set; } = "";
            public string Nationality { get; set; } = "";
            public string PassportNumber { get; set; } = "";
        }
    }
}