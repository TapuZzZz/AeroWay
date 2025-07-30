using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using AeroWayClient.Services.Core;
using AeroWayClient.Services.Security;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services
{
    public class BookingService
    {
        private readonly string _serverHost;
        private readonly int _serverPort;

        public BookingService()
        {
            if (!ServerConfigService.IsConfigured)
            {
                throw new InvalidOperationException("Server not configured. Please configure server connection first.");
            }
            
            _serverHost = ServerConfigService.ServerHost;
            _serverPort = ServerConfigService.ServerPort;
            LogManager.Info($"BookingService initialized - Server: {_serverHost}:{_serverPort}", "BookingService");
        }
        
        public BookingService(string host, int port)
        {
            _serverHost = host;
            _serverPort = port;
            LogManager.Info($"BookingService initialized - Server: {host}:{port}", "BookingService");
        }

        public class CreateBookingRequest
        {
            public int UserId { get; set; }
            public int OutboundFlightId { get; set; }
            public int ReturnFlightId { get; set; }
            public decimal TotalPrice { get; set; } // Add total price to the request
            public List<PassengerInfo> Passengers { get; set; } = new List<PassengerInfo>();
        }

        public class PassengerInfo
        {
            public string FirstName { get; set; } = "";
            public string LastName { get; set; } = "";
            public DateTime DateOfBirth { get; set; }
            public string Type { get; set; } = "Adult";
            public string Gender { get; set; } = "";
            public string Nationality { get; set; } = "";
            public string PassportNumber { get; set; } = "";
        }

        public class CreateBookingResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = "";
            public int BookingId { get; set; }
            public string BookingReference { get; set; } = "";
            public decimal TotalPrice { get; set; }
        }

        public class PassengerDetails
        {
            public string FirstName { get; set; } = "";
            public string LastName { get; set; } = "";
            public DateTime DateOfBirth { get; set; }
            public string PassengerType { get; set; } = "";
            public string Gender { get; set; } = "";
            public string Nationality { get; set; } = "";
            public string PassportNumber { get; set; } = "";
        }

        public class BookingInfo
        {
            public int BookingId { get; set; }
            public string BookingReference { get; set; } = "";
            public int Adults { get; set; }
            public int Children { get; set; }
            public int Infants { get; set; }
            public decimal TotalPrice { get; set; }
            public string Status { get; set; } = "";
            public DateTime BookingDate { get; set; }
            
            public string OutboundFlightNumber { get; set; } = "";
            public DateTime OutboundDeparture { get; set; }
            public DateTime OutboundArrival { get; set; }
            public string OutboundOriginCode { get; set; } = "";
            public string OutboundOriginCity { get; set; } = "";
            public string OutboundDestCode { get; set; } = "";
            public string OutboundDestCity { get; set; } = "";
            public string OutboundAircraft { get; set; } = "";
            
            public string? ReturnFlightNumber { get; set; }
            public DateTime? ReturnDeparture { get; set; }
            public DateTime? ReturnArrival { get; set; }
            public string? ReturnOriginCode { get; set; }
            public string? ReturnOriginCity { get; set; }
            public string? ReturnDestCode { get; set; }
            public string? ReturnDestCity { get; set; }
            public string? ReturnAircraft { get; set; }
            
            public List<PassengerDetails> Passengers { get; set; } = new List<PassengerDetails>();
        }

        public class GetBookingsResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = "";
            public List<BookingInfo> Bookings { get; set; } = new List<BookingInfo>();
        }

        public CreateBookingResponse CreateBooking(CreateBookingRequest request)
        {
            try
            {
                LogManager.Info($"Creating booking for user {request.UserId} with total price ${request.TotalPrice}", "BookingService");
                
                string message = BuildBookingMessage(request);
                LogManager.Debug($"Built booking message with total price ${request.TotalPrice}", "BookingService");
                
                string response = SendMessage(message);
                
                var result = ParseBookingResponse(response);
                
                // Ensure the response includes the correct total price
                if (result.Success)
                {
                    result.TotalPrice = request.TotalPrice;
                    LogManager.Info($"Booking created successfully: {result.BookingReference} with total ${request.TotalPrice}", "BookingService");
                }
                else
                {
                    LogManager.Warning($"Booking creation failed: {result.Message}", "BookingService");
                }
                
                return result;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Booking creation error: {ex.Message}", "BookingService");
                return new CreateBookingResponse 
                { 
                    Success = false, 
                    Message = $"Booking failed: {ex.Message}" 
                };
            }
        }

        public GetBookingsResponse GetUserBookings(int userId)
        {
            try
            {
                LogManager.Info($"Getting bookings for user {userId}", "BookingService");
                
                string message = $"GET_BOOKINGS:{userId}";
                
                string response = SendMessage(message);
                
                var result = ParseGetBookingsResponse(response);
                
                if (result.Success)
                {
                    LogManager.Info($"Retrieved {result.Bookings.Count} bookings for user {userId}", "BookingService");
                }
                else
                {
                    LogManager.Warning($"Failed to get bookings: {result.Message}", "BookingService");
                }
                
                return result;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error getting bookings: {ex.Message}", "BookingService");
                return new GetBookingsResponse 
                { 
                    Success = false, 
                    Message = $"Failed to retrieve bookings: {ex.Message}" 
                };
            }
        }

        private string BuildBookingMessage(CreateBookingRequest request)
        {
            // Include the total price in the message to the server
            var message = new StringBuilder($"CREATE_BOOKING:{request.UserId}|{request.OutboundFlightId}|{request.ReturnFlightId}|{request.TotalPrice}");
            
            foreach (var passenger in request.Passengers)
            {
                message.Append($"|{passenger.FirstName}:{passenger.LastName}:{passenger.DateOfBirth:yyyy-MM-dd}:{passenger.Type}:{passenger.Gender}:{passenger.Nationality}:{passenger.PassportNumber}");
            }
            
            LogManager.Debug($"Built message with total price: {request.TotalPrice}", "BookingService");
            return message.ToString();
        }

        private string SendMessage(string message)
        {
            LogManager.Debug("Creating new connection to server", "BookingService");
            
            using (var connection = new ConnectionProcessor(_serverHost, _serverPort))
            {
                if (!connection.Connect())
                {
                    LogManager.Error("Failed to connect to server", "BookingService");
                    throw new Exception("Failed to connect to server");
                }
                
                string response = connection.SendEncryptedMessage(message);
                LogManager.Debug("Received response from server", "BookingService");
                
                return response;
            }
        }

        private CreateBookingResponse ParseBookingResponse(string response)
        {
            var result = new CreateBookingResponse();
            
            try
            {
                if (response.StartsWith("BOOKING_SUCCESS:"))
                {
                    result.Success = true;
                    result.Message = "Booking created successfully";
                    
                    string data = response.Substring("BOOKING_SUCCESS:".Length);
                    string[] parts = data.Split(':');
                    
                    if (parts.Length >= 3)
                    {
                        result.BookingId = int.Parse(parts[0]);
                        result.BookingReference = parts[1];
                        // Don't parse total price from response, use the one from request
                        // result.TotalPrice = decimal.Parse(parts[2]);
                    }
                }
                else if (response.StartsWith("BOOKING_FAILED:"))
                {
                    result.Success = false;
                    result.Message = response.Substring("BOOKING_FAILED:".Length);
                }
                else
                {
                    result.Success = false;
                    result.Message = "Unexpected response format";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing booking response: {ex.Message}", "BookingService");
                result.Success = false;
                result.Message = "Error parsing booking response";
            }
            
            return result;
        }

        private GetBookingsResponse ParseGetBookingsResponse(string response)
        {
            var result = new GetBookingsResponse();
            
            try
            {
                if (response.StartsWith("GET_BOOKINGS_SUCCESS:"))
                {
                    result.Success = true;
                    result.Message = "Bookings retrieved successfully";
                    
                    string data = response.Substring("GET_BOOKINGS_SUCCESS:".Length);
                    if (!string.IsNullOrEmpty(data))
                    {
                        string[] mainParts = data.Split('|');
                        
                        var bookingsData = new List<string>();
                        var passengerData = "";
                        
                        foreach (string part in mainParts)
                        {
                            if (part.StartsWith("PASSENGERS:"))
                            {
                                passengerData = part.Substring("PASSENGERS:".Length);
                            }
                            else if (!string.IsNullOrEmpty(part))
                            {
                                bookingsData.Add(part);
                            }
                        }
                        
                        foreach (string bookingDataStr in bookingsData)
                        {
                            var booking = ParseBookingInfo(bookingDataStr);
                            if (booking != null)
                            {
                                result.Bookings.Add(booking);
                            }
                        }
                        
                        if (!string.IsNullOrEmpty(passengerData))
                        {
                            ParseAndAssignPassengers(passengerData, result.Bookings);
                        }
                    }
                }
                else if (response.StartsWith("GET_BOOKINGS_FAILED:"))
                {
                    result.Success = false;
                    result.Message = response.Substring("GET_BOOKINGS_FAILED:".Length);
                }
                else
                {
                    result.Success = false;
                    result.Message = "Unexpected response format";
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing bookings response: {ex.Message}", "BookingService");
                result.Success = false;
                result.Message = "Error parsing bookings response";
            }
            
            return result;
        }

        private BookingInfo? ParseBookingInfo(string bookingData)
        {
            try
            {
                string[] parts = bookingData.Split(',');
                
                if (parts.Length < 16)
                {
                    LogManager.Warning($"Invalid booking data format: {bookingData}", "BookingService");
                    return null;
                }
                
                var booking = new BookingInfo
                {
                    BookingId = int.Parse(parts[0]),
                    BookingReference = parts[1],
                    Adults = int.Parse(parts[2]),
                    Children = int.Parse(parts[3]),
                    Infants = int.Parse(parts[4]),
                    TotalPrice = decimal.Parse(parts[5]),
                    Status = parts[6],
                    BookingDate = DateTime.Parse(parts[7]),
                    
                    OutboundFlightNumber = parts[8],
                    OutboundDeparture = DateTime.Parse(parts[9]),
                    OutboundArrival = DateTime.Parse(parts[10]),
                    OutboundOriginCode = parts[11],
                    OutboundOriginCity = parts[12],
                    OutboundDestCode = parts[13],
                    OutboundDestCity = parts[14],
                    OutboundAircraft = parts[15]
                };
                
                if (parts.Length >= 24 && !string.IsNullOrEmpty(parts[16]))
                {
                    booking.ReturnFlightNumber = parts[16];
                    booking.ReturnDeparture = DateTime.Parse(parts[17]);
                    booking.ReturnArrival = DateTime.Parse(parts[18]);
                    booking.ReturnOriginCode = parts[19];
                    booking.ReturnOriginCity = parts[20];
                    booking.ReturnDestCode = parts[21];
                    booking.ReturnDestCity = parts[22];
                    booking.ReturnAircraft = parts[23];
                }
                
                return booking;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing booking info: {ex.Message}", "BookingService");
                return null;
            }
        }
        
        private void ParseAndAssignPassengers(string passengerData, List<BookingInfo> bookings)
        {
            try
            {
                if (string.IsNullOrEmpty(passengerData))
                    return;
                
                string[] passengers = passengerData.Split('~');
                
                foreach (string passengerInfo in passengers)
                {
                    if (string.IsNullOrEmpty(passengerInfo))
                        continue;
                    
                    string[] passengerParts = passengerInfo.Split('^');
                    
                    if (passengerParts.Length >= 8)
                    {
                        int bookingId = int.Parse(passengerParts[0]);
                        string firstName = passengerParts[1];
                        string lastName = passengerParts[2];
                        DateTime dateOfBirth = DateTime.Parse(passengerParts[3]);
                        string passengerType = passengerParts[4];
                        string gender = passengerParts[5];
                        string nationality = passengerParts[6];
                        string passportNumber = passengerParts[7];
                        
                        var booking = bookings.FirstOrDefault(b => b.BookingId == bookingId);
                        if (booking != null)
                        {
                            booking.Passengers.Add(new PassengerDetails
                            {
                                FirstName = firstName,
                                LastName = lastName,
                                DateOfBirth = dateOfBirth,
                                PassengerType = passengerType,
                                Gender = gender,
                                Nationality = nationality,
                                PassportNumber = passportNumber
                            });
                        }
                    }
                }
                
                LogManager.Info($"Parsed passengers for {bookings.Count} bookings", "BookingService");
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing passengers: {ex.Message}", "BookingService");
            }
        }
    }
}