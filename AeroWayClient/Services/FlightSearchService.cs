using System;
using System.Collections.Generic;
using AeroWayClient.Services.Core;
using AeroWayClient.Services.Security;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services
{
    public class FlightSearchService
    {
        private readonly string _serverHost;
        private readonly int _serverPort;

        public FlightSearchService()
        {
            if (!ServerConfigService.IsConfigured)
            {
                throw new InvalidOperationException("Server not configured. Please configure server connection first.");
            }
            
            _serverHost = ServerConfigService.ServerHost;
            _serverPort = ServerConfigService.ServerPort;
            LogManager.Info($"FlightSearchService initialized - Server: {_serverHost}:{_serverPort}", "FlightSearchService");
        }
        
        public FlightSearchService(string host, int port)
        {
            _serverHost = host;
            _serverPort = port;
            LogManager.Info($"FlightSearchService initialized - Server: {host}:{port}", "FlightSearchService");
        }

        public class FlightSearchRequest
        {
            public string From { get; set; } = "";
            public string To { get; set; } = "";
            public string DepartureDate { get; set; } = "";
            public string ReturnDate { get; set; } = "";
            public string TripType { get; set; } = "oneway";
            public int Adults { get; set; } = 1;
            public int Children { get; set; } = 0;
            public int Infants { get; set; } = 0;
        }

        public class FlightInfo
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

        public class FlightSearchResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = "";
            public List<FlightInfo> OutboundFlights { get; set; } = new List<FlightInfo>();
            public List<FlightInfo>? ReturnFlights { get; set; }
            public int Adults { get; set; }
            public int Children { get; set; }
            public int Infants { get; set; }
        }

        public FlightSearchResponse SearchFlights(FlightSearchRequest request)
        {
            try
            {
                LogManager.Info($"Searching flights from {request.From} to {request.To} on {request.DepartureDate}", "FlightSearchService");
                
                string message = BuildSearchMessage(request);
                LogManager.Debug($"Built search message: {message}", "FlightSearchService");
                
                string response = SendMessage(message);
                LogManager.Debug($"Received raw response: {response}", "FlightSearchService");
                
                var result = ParseSearchResponse(response);
                
                if (result.Success)
                {
                    LogManager.Info($"Found {result.OutboundFlights.Count} outbound flights", "FlightSearchService");
                    if (result.ReturnFlights != null)
                    {
                        LogManager.Info($"Found {result.ReturnFlights.Count} return flights", "FlightSearchService");
                    }
                }
                else
                {
                    LogManager.Warning($"Flight search failed: {result.Message}", "FlightSearchService");
                }
                
                return result;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Flight search error: {ex.Message}", "FlightSearchService");
                return new FlightSearchResponse 
                { 
                    Success = false, 
                    Message = $"Search failed: {ex.Message}" 
                };
            }
        }

        private string BuildSearchMessage(FlightSearchRequest request)
        {
            return $"SEARCH_FLIGHTS:{request.From}:{request.To}:{request.DepartureDate}:{request.ReturnDate}:" +
                   $"{request.TripType}:{request.Adults}:{request.Children}:{request.Infants}";
        }

        private string SendMessage(string message)
        {
            LogManager.Debug("Creating new connection to server", "FlightSearchService");
            
            using (var connection = new ConnectionProcessor(_serverHost, _serverPort))
            {
                if (!connection.Connect())
                {
                    LogManager.Error("Failed to connect to server", "FlightSearchService");
                    throw new Exception("Failed to connect to server");
                }
                
                string response = connection.SendEncryptedMessage(message);
                LogManager.Debug("Received response from server", "FlightSearchService");
                
                return response;
            }
        }

        private FlightSearchResponse ParseSearchResponse(string response)
        {
            var result = new FlightSearchResponse();
            
            try
            {
                LogManager.Debug($"Starting to parse response: {response.Substring(0, Math.Min(100, response.Length))}...", "FlightSearchService");
                
                if (response.StartsWith("SEARCH_SUCCESS:"))
                {
                    result.Success = true;
                    result.Message = "Search completed successfully";
                    
                    string data = response.Substring("SEARCH_SUCCESS:".Length);
                    LogManager.Debug($"Data after prefix removal: {data.Substring(0, Math.Min(100, data.Length))}...", "FlightSearchService");
                    
                    string[] sections = data.Split('|');
                    LogManager.Debug($"Found {sections.Length} sections in response", "FlightSearchService");
                    
                    if (sections.Length > 0 && sections[0].StartsWith("PASSENGERS:"))
                    {
                        string passengerData = sections[0].Substring("PASSENGERS:".Length);
                        string[] passengerParts = passengerData.Split(':');
                        
                        if (passengerParts.Length >= 3)
                        {
                            if (int.TryParse(passengerParts[0], out int adults))
                                result.Adults = adults;
                            if (int.TryParse(passengerParts[1], out int children))
                                result.Children = children;
                            if (int.TryParse(passengerParts[2], out int infants))
                                result.Infants = infants;
                                
                            LogManager.Debug($"Parsed passengers: {adults} adults, {children} children, {infants} infants", "FlightSearchService");
                        }
                    }
                    
                    if (sections.Length > 0 && sections[0] == "NO_FLIGHTS")
                    {
                        LogManager.Info("Server returned NO_FLIGHTS", "FlightSearchService");
                        return result;
                    }
                    
                    for (int i = 0; i < sections.Length; i++)
                    {
                        if (sections[i] == "OUTBOUND:" || sections[i].StartsWith("OUTBOUND:"))
                        {
                            LogManager.Debug($"Found OUTBOUND section at index {i}", "FlightSearchService");
                            
                            int j = i + 1;
                            while (j < sections.Length && !sections[j].StartsWith("RETURN:"))
                            {
                                var flight = ParseFlightData(sections[j]);
                                if (flight != null)
                                {
                                    result.OutboundFlights.Add(flight);
                                    LogManager.Debug($"Added outbound flight: {flight.FlightNumber}", "FlightSearchService");
                                }
                                j++;
                            }
                        }
                        else if (sections[i] == "RETURN:" || sections[i].StartsWith("RETURN:"))
                        {
                            LogManager.Debug($"Found RETURN section at index {i}", "FlightSearchService");
                            
                            if (result.ReturnFlights == null)
                                result.ReturnFlights = new List<FlightInfo>();
                            
                            int j = i + 1;
                            while (j < sections.Length)
                            {
                                var flight = ParseFlightData(sections[j]);
                                if (flight != null)
                                {
                                    result.ReturnFlights.Add(flight);
                                    LogManager.Debug($"Added return flight: {flight.FlightNumber}", "FlightSearchService");
                                }
                                j++;
                            }
                        }
                    }
                    
                    LogManager.Info($"Successfully parsed {result.OutboundFlights.Count} outbound flights", "FlightSearchService");
                }
                else if (response.StartsWith("SEARCH_FAILED:"))
                {
                    result.Success = false;
                    result.Message = response.Substring("SEARCH_FAILED:".Length);
                    LogManager.Warning($"Search failed: {result.Message}", "FlightSearchService");
                }
                else
                {
                    result.Success = false;
                    result.Message = "Unexpected response format";
                    LogManager.Error($"Unexpected response format: {response}", "FlightSearchService");
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing search response: {ex.Message}", "FlightSearchService");
                result.Success = false;
                result.Message = "Error parsing search results";
            }
            
            return result;
        }

        private FlightInfo? ParseFlightData(string flightData)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(flightData))
                {
                    LogManager.Debug("Empty flight data, skipping", "FlightSearchService");
                    return null;
                }
                
                LogManager.Debug($"Parsing flight data: {flightData}", "FlightSearchService");
                
                string[] parts = flightData.Split(',');
                
                if (parts.Length < 12)
                {
                    LogManager.Warning($"Invalid flight data format, expected 12 parts but got {parts.Length}: {flightData}", "FlightSearchService");
                    return null;
                }
                
                var flight = new FlightInfo
                {
                    FlightId = int.Parse(parts[0]),
                    FlightNumber = parts[1],
                    OriginCode = parts[2],
                    OriginCity = parts[3],
                    DestinationCode = parts[4],
                    DestinationCity = parts[5],
                    DepartureTime = DateTime.Parse(parts[6]),
                    ArrivalTime = DateTime.Parse(parts[7]),
                    Price = decimal.Parse(parts[8]),
                    AvailableSeats = int.Parse(parts[9]),
                    Duration = parts[10],
                    AircraftModel = parts[11]
                };
                
                LogManager.Debug($"Successfully parsed flight {flight.FlightNumber}", "FlightSearchService");
                return flight;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing flight data '{flightData}': {ex.Message}", "FlightSearchService");
                return null;
            }
        }
    }
}