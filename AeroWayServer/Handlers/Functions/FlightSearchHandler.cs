using System;
using System.Collections.Generic;
using System.Linq;
using MySql.Data.MySqlClient;
using AeroWayServer.Core;
using AeroWayServer.Log;
using AeroWayServer.Security;

namespace AeroWayServer.Handlers.Functions
{
    public static class FlightSearchHandler
    {
        public static string ProcessFlightSearch(string messageContent, string clientId)
        {
            try
            {
                LogManager.Info($"Processing flight search from client {clientId}", "FlightSearchHandler");
                
                string[] parts = messageContent.Split(':');
                
                if (parts.Length < 8)
                {
                    LogManager.Warning("Invalid search format", "FlightSearchHandler");
                    return "SEARCH_FAILED:Invalid search format";
                }
                
                string from = ExtractAirportCode(parts[0]);
                string to = ExtractAirportCode(parts[1]);
                string departDate = parts[2];
                string returnDate = parts[3];
                string tripType = parts[4];
                int adults = int.Parse(parts[5]);
                int children = int.Parse(parts[6]);
                int infants = int.Parse(parts[7]);
                
                if (string.IsNullOrEmpty(from) || string.IsNullOrEmpty(to))
                {
                    return "SEARCH_FAILED:Invalid airports";
                }
                
                if (from == to)
                {
                    return "SEARCH_FAILED:Origin and destination cannot be the same";
                }
                
                if (!DateTime.TryParse(departDate, out DateTime departureDate))
                {
                    return "SEARCH_FAILED:Invalid departure date";
                }
                
                if (departureDate.Date < DateTime.Today)
                {
                    return "SEARCH_FAILED:Departure date cannot be in the past";
                }
                
                int totalPassengers = adults + children;
                if (totalPassengers < 1 || totalPassengers > 19)
                {
                    return "SEARCH_FAILED:Invalid passenger count";
                }
                
                var outboundFlights = SearchFlights(from, to, departureDate, totalPassengers);
                LogManager.Info($"Found {outboundFlights.Count} outbound flights", "FlightSearchHandler");
                
                List<FlightInfo>? returnFlights = null;
                if (tripType.ToLower() == "roundtrip" && !string.IsNullOrEmpty(returnDate))
                {
                    if (!DateTime.TryParse(returnDate, out DateTime returnDateTime))
                    {
                        return "SEARCH_FAILED:Invalid return date";
                    }
                    
                    if (returnDateTime <= departureDate)
                    {
                        return "SEARCH_FAILED:Return date must be after departure date";
                    }
                    
                    returnFlights = SearchFlights(to, from, returnDateTime, totalPassengers);
                    LogManager.Info($"Found {returnFlights.Count} return flights", "FlightSearchHandler");
                }
                
                return FormatSearchResponse(outboundFlights, returnFlights, adults, children, infants);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error processing flight search: {ex.Message}", "FlightSearchHandler");
                return "SEARCH_FAILED:An error occurred during search";
            }
        }
        
        private static string ExtractAirportCode(string location)
        {
            int startIndex = location.IndexOf('(');
            int endIndex = location.IndexOf(')');
            
            if (startIndex > 0 && endIndex > startIndex)
            {
                return location.Substring(startIndex + 1, endIndex - startIndex - 1);
            }
            
            return location;
        }
        
        private static List<FlightInfo> SearchFlights(string originCode, string destCode, DateTime date, int requiredSeats)
        {
            var flights = new List<FlightInfo>();
            
            try
            {
                using var connection = new MySqlConnection(ConnectionListener.GetConnectionString());
                connection.Open();
                
                string query = @"
                    SELECT f.FlightId, f.FlightNumber, f.DepartureTime, f.ArrivalTime, 
                           f.Price, f.AvailableSeats,
                           o.Code as OriginCode, o.City as OriginCity,
                           d.Code as DestCode, d.City as DestCity,
                           a.Model as AircraftModel, a.MaxPassengers
                    FROM Flights f
                    JOIN Airports o ON f.OriginAirportId = o.AirportId
                    JOIN Airports d ON f.DestinationAirportId = d.AirportId
                    JOIN Aircraft a ON f.AircraftId = a.AircraftId
                    WHERE o.Code = @originCode 
                    AND d.Code = @destCode
                    AND DATE(f.DepartureTime) = @date
                    AND f.AvailableSeats >= @seats
                    AND f.Status = 'Scheduled'
                    ORDER BY f.DepartureTime";
                
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@originCode", originCode);
                command.Parameters.AddWithValue("@destCode", destCode);
                command.Parameters.AddWithValue("@date", date.Date);
                command.Parameters.AddWithValue("@seats", requiredSeats);
                
                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    var flight = new FlightInfo
                    {
                        FlightId = reader.GetInt32("FlightId"),
                        FlightNumber = reader.GetString("FlightNumber"),
                        OriginCode = reader.GetString("OriginCode"),
                        OriginCity = reader.GetString("OriginCity"),
                        DestinationCode = reader.GetString("DestCode"),
                        DestinationCity = reader.GetString("DestCity"),
                        DepartureTime = reader.GetDateTime("DepartureTime"),
                        ArrivalTime = reader.GetDateTime("ArrivalTime"),
                        Price = reader.GetDecimal("Price"),
                        AvailableSeats = reader.GetInt32("AvailableSeats"),
                        AircraftModel = reader.GetString("AircraftModel")
                    };
                    
                    TimeSpan duration = flight.ArrivalTime - flight.DepartureTime;
                    flight.Duration = $"{(int)duration.TotalHours}h {duration.Minutes}m";
                    
                    flights.Add(flight);
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error searching flights: {ex.Message}", "FlightSearchHandler");
            }
            
            return flights;
        }
        
        private static string FormatSearchResponse(List<FlightInfo> outboundFlights, List<FlightInfo>? returnFlights, int adults, int children, int infants)
        {
            try
            {
                var response = new System.Text.StringBuilder("SEARCH_SUCCESS:");
                
                response.Append($"PASSENGERS:{adults}:{children}:{infants}|");
                
                if (outboundFlights.Count == 0 && (returnFlights == null || returnFlights.Count == 0))
                {
                    return "SEARCH_SUCCESS:NO_FLIGHTS";
                }
                
                response.Append("OUTBOUND:");
                for (int i = 0; i < outboundFlights.Count; i++)
                {
                    var flight = outboundFlights[i];
                    
                    if (i > 0) response.Append("|");
                    
                    response.Append($"{flight.FlightId}");
                    response.Append($",{flight.FlightNumber}");
                    response.Append($",{flight.OriginCode}");
                    response.Append($",{flight.OriginCity}");
                    response.Append($",{flight.DestinationCode}");
                    response.Append($",{flight.DestinationCity}");
                    response.Append($",{flight.DepartureTime:yyyy-MM-dd HH:mm}");
                    response.Append($",{flight.ArrivalTime:yyyy-MM-dd HH:mm}");
                    response.Append($",{flight.Price}");
                    response.Append($",{flight.AvailableSeats}");
                    response.Append($",{flight.Duration}");
                    response.Append($",{flight.AircraftModel}");
                }
                
                if (returnFlights != null && returnFlights.Count > 0)
                {
                    response.Append("|RETURN:");
                    
                    for (int i = 0; i < returnFlights.Count; i++)
                    {
                        var flight = returnFlights[i];
                        
                        if (i > 0) response.Append("|");
                        
                        response.Append($"{flight.FlightId}");
                        response.Append($",{flight.FlightNumber}");
                        response.Append($",{flight.OriginCode}");
                        response.Append($",{flight.OriginCity}");
                        response.Append($",{flight.DestinationCode}");
                        response.Append($",{flight.DestinationCity}");
                        response.Append($",{flight.DepartureTime:yyyy-MM-dd HH:mm}");
                        response.Append($",{flight.ArrivalTime:yyyy-MM-dd HH:mm}");
                        response.Append($",{flight.Price}");
                        response.Append($",{flight.AvailableSeats}");
                        response.Append($",{flight.Duration}");
                        response.Append($",{flight.AircraftModel}");
                    }
                }
                
                return response.ToString();
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error formatting search response: {ex.Message}", "FlightSearchHandler");
                return "SEARCH_FAILED:Error formatting results";
            }
        }
        
        private class FlightInfo
        {
            public int FlightId { get; set; }
            public string FlightNumber { get; set; } = "";
            public string OriginCode { get; set; } = "";
            public string OriginCity { get; set; } = "";
            public string DestinationCode { get; set; } = "";
            public string DestinationCity { get; set; } = "";
            public DateTime DepartureTime { get; set; }
            public DateTime ArrivalTime { get; set; }
            public decimal Price { get; set; }
            public int AvailableSeats { get; set; }
            public string Duration { get; set; } = "";
            public string AircraftModel { get; set; } = "";
        }
    }
}