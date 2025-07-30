using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using AeroWayClient.Models;
using AeroWayClient.Services;
using AeroWayClient.Services.Core;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Controllers
{
    public class FlightController : Controller
    {
        private readonly FlightSearchService _flightSearchService;
        private readonly BookingService _bookingService;
        private readonly UserProfileService _userProfileService;

        public FlightController()
        {
            if (ServerConfigService.IsConfigured)
            {
                _flightSearchService = new FlightSearchService();
                _bookingService = new BookingService();
                _userProfileService = new UserProfileService();
            }
            else
            {
                _flightSearchService = new FlightSearchService("127.0.0.1", 8000);
                _bookingService = new BookingService("127.0.0.1", 8000);
                _userProfileService = new UserProfileService("127.0.0.1", 8000);
            }
        }

        public IActionResult Index()
        {
            return RedirectToAction("Index", "Home");
        }

        public IActionResult Search()
        {
            var model = new FlightSearchViewModel
            {
                DepartureDate = DateTime.Today.AddDays(1),
                Adults = 1
            };
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Search(FlightSearchViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            try
            {
                LogManager.Info($"Processing flight search request: {model.From} to {model.To}", "FlightController");

                var searchRequest = new FlightSearchService.FlightSearchRequest
                {
                    From = model.From,
                    To = model.To,
                    DepartureDate = model.DepartureDate.ToString("yyyy-MM-dd"),
                    ReturnDate = model.ReturnDate?.ToString("yyyy-MM-dd") ?? "",
                    TripType = model.TripType,
                    Adults = model.Adults,
                    Children = model.Children,
                    Infants = model.Infants
                };

                var searchResponse = await Task.Run(() => _flightSearchService.SearchFlights(searchRequest));

                if (!searchResponse.Success)
                {
                    ModelState.AddModelError(string.Empty, searchResponse.Message);
                    return View(model);
                }

                TempData["SearchParams"] = System.Text.Json.JsonSerializer.Serialize(model);

                var resultsModel = new FlightResultsViewModel
                {
                    SearchParams = model,
                    OutboundFlights = searchResponse.OutboundFlights,
                    ReturnFlights = searchResponse.ReturnFlights
                };

                TempData["FlightResults"] = System.Text.Json.JsonSerializer.Serialize(resultsModel);

                LogManager.Info($"Found {searchResponse.OutboundFlights.Count} outbound flights", "FlightController");
                
                return View("SearchResults", resultsModel);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error during flight search: {ex.Message}", "FlightController");
                ModelState.AddModelError(string.Empty, "An error occurred while searching for flights. Please try again.");
                return View(model);
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SelectFlightsPost(int outboundFlightId, int? returnFlightId)
        {
            try
            {
                LogManager.Info($"SelectFlightsPost called - Outbound: {outboundFlightId}, Return: {returnFlightId}", "FlightController");
                
                var searchParamsJson = TempData["SearchParams"]?.ToString();
                var resultsJson = TempData["FlightResults"]?.ToString();
                
                if (string.IsNullOrEmpty(searchParamsJson) || string.IsNullOrEmpty(resultsJson))
                {
                    LogManager.Error("Missing search params or flight results in TempData", "FlightController");
                    return RedirectToAction("Search");
                }
                
                TempData["SearchParams"] = searchParamsJson;
                TempData["FlightResults"] = resultsJson;
                
                var userIdString = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userIdString))
                {
                    LogManager.Info("User not authenticated, redirecting to login", "FlightController");
                    
                    TempData["SelectedOutboundFlightId"] = outboundFlightId;
                    if (returnFlightId.HasValue && returnFlightId.Value > 0)
                    {
                        TempData["SelectedReturnFlightId"] = returnFlightId.Value;
                    }
                    
                    TempData.Keep();
                    
                    return RedirectToAction("Login", "Account");
                }
                
                LogManager.Info("User authenticated, processing flight selection", "FlightController");
                
                var searchParams = System.Text.Json.JsonSerializer.Deserialize<FlightSearchViewModel>(searchParamsJson);
                var flightResults = System.Text.Json.JsonSerializer.Deserialize<FlightResultsViewModel>(resultsJson);
                
                if (searchParams == null || flightResults == null)
                {
                    LogManager.Error("Failed to deserialize search params or flight results", "FlightController");
                    return RedirectToAction("Search");
                }
                
                var selectedOutbound = flightResults.OutboundFlights.FirstOrDefault(f => f.FlightId == outboundFlightId);
                if (selectedOutbound == null)
                {
                    LogManager.Error($"Outbound flight {outboundFlightId} not found", "FlightController");
                    return RedirectToAction("Search");
                }
                
                FlightSearchService.FlightInfo? selectedReturn = null;
                if (searchParams.TripType == "roundtrip" && returnFlightId.HasValue && returnFlightId.Value > 0)
                {
                    selectedReturn = flightResults.ReturnFlights?.FirstOrDefault(f => f.FlightId == returnFlightId.Value);
                }
                
                HttpContext.Session.SetInt32("OutboundFlightId", outboundFlightId);
                if (returnFlightId.HasValue && returnFlightId.Value > 0)
                {
                    HttpContext.Session.SetInt32("ReturnFlightId", returnFlightId.Value);
                }
                
                TempData["SelectedOutboundFlight"] = System.Text.Json.JsonSerializer.Serialize(selectedOutbound);
                if (selectedReturn != null)
                {
                    TempData["SelectedReturnFlight"] = System.Text.Json.JsonSerializer.Serialize(selectedReturn);
                }
                
                var model = new PassengerDetailsViewModel
                {
                    Adults = searchParams.Adults,
                    Children = searchParams.Children,
                    Infants = searchParams.Infants,
                    TripType = searchParams.TripType
                };
                
                for (int i = 0; i < searchParams.Adults; i++)
                {
                    model.Passengers.Add(new PassengerDetails 
                    { 
                        PassengerType = "Adult",
                        PassengerNumber = i + 1
                    });
                }
                
                for (int i = 0; i < searchParams.Children; i++)
                {
                    model.Passengers.Add(new PassengerDetails 
                    { 
                        PassengerType = "Child",
                        PassengerNumber = searchParams.Adults + i + 1
                    });
                }
                
                for (int i = 0; i < searchParams.Infants; i++)
                {
                    model.Passengers.Add(new PassengerDetails 
                    { 
                        PassengerType = "Infant",
                        PassengerNumber = searchParams.Adults + searchParams.Children + i + 1
                    });
                }
                
                LogManager.Info("Redirecting to PassengerDetails", "FlightController");
                return View("PassengerDetails", model);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error in SelectFlightsPost: {ex.Message}", "FlightController");
                return RedirectToAction("Search");
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ConfirmBooking(PassengerDetailsViewModel model, decimal? TotalPrice)
        {
            if (!ModelState.IsValid)
            {
                TempData.Keep("SearchParams");
                TempData.Keep("SelectedOutboundFlight");
                TempData.Keep("SelectedReturnFlight");
                return View("PassengerDetails", model);
            }

            try
            {
                var userIdString = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    TempData["PassengerDetails"] = System.Text.Json.JsonSerializer.Serialize(model);
                    TempData["ReturnUrl"] = "/Flight/ConfirmBooking";
                    return RedirectToAction("Login", "Account");
                }

                var outboundFlightId = HttpContext.Session.GetInt32("OutboundFlightId");
                var returnFlightId = HttpContext.Session.GetInt32("ReturnFlightId");

                if (!outboundFlightId.HasValue)
                {
                    return RedirectToAction("Index");
                }

                // Calculate correct total price with taxes if not provided
                decimal finalTotalPrice = 0;
                if (TotalPrice.HasValue && TotalPrice.Value > 0)
                {
                    // Use the total price passed from the form (includes taxes)
                    finalTotalPrice = TotalPrice.Value;
                    LogManager.Info($"Using provided total price: ${finalTotalPrice}", "FlightController");
                }
                else
                {
                    // Fallback: calculate from flight data
                    LogManager.Warning("No total price provided, calculating from flight data", "FlightController");
                    
                    var outboundFlightJsonData = TempData["SelectedOutboundFlight"]?.ToString();
                    var returnFlightJsonData = TempData["SelectedReturnFlight"]?.ToString();
                    
                    decimal flightSubtotal = 0;
                    var passengerCount = model.Adults + model.Children;
                    
                    if (!string.IsNullOrEmpty(outboundFlightJsonData))
                    {
                        var outboundFlightData = System.Text.Json.JsonSerializer.Deserialize<FlightSearchService.FlightInfo>(outboundFlightJsonData);
                        if (outboundFlightData != null)
                        {
                            flightSubtotal += outboundFlightData.Price * passengerCount;
                        }
                    }
                    
                    if (!string.IsNullOrEmpty(returnFlightJsonData))
                    {
                        var returnFlightData = System.Text.Json.JsonSerializer.Deserialize<FlightSearchService.FlightInfo>(returnFlightJsonData);
                        if (returnFlightData != null)
                        {
                            flightSubtotal += returnFlightData.Price * passengerCount;
                        }
                    }
                    
                    // Add 18% taxes
                    var taxes = flightSubtotal * 0.18m;
                    finalTotalPrice = flightSubtotal + taxes;
                    
                    LogManager.Info($"Calculated total price: Subtotal ${flightSubtotal}, Taxes ${taxes}, Final ${finalTotalPrice}", "FlightController");
                }

                var bookingRequest = new BookingService.CreateBookingRequest
                {
                    UserId = userId,
                    OutboundFlightId = outboundFlightId.Value,
                    ReturnFlightId = returnFlightId ?? 0,
                    TotalPrice = finalTotalPrice, // Pass the correct total price with taxes
                    Passengers = model.Passengers.Select(p => new BookingService.PassengerInfo
                    {
                        FirstName = p.FirstName,
                        LastName = p.LastName,
                        DateOfBirth = p.DateOfBirth,
                        Type = p.PassengerType,
                        Gender = p.Gender,
                        Nationality = p.Nationality,
                        PassportNumber = p.PassportNumber
                    }).ToList()
                };

                LogManager.Info($"Creating booking with total price: ${finalTotalPrice}", "FlightController");

                var bookingResponse = await Task.Run(() => _bookingService.CreateBooking(bookingRequest));

                if (!bookingResponse.Success)
                {
                    ModelState.AddModelError(string.Empty, bookingResponse.Message);
                    TempData.Keep("SearchParams");
                    TempData.Keep("SelectedOutboundFlight");
                    TempData.Keep("SelectedReturnFlight");
                    return View("PassengerDetails", model);
                }

                var outboundFlightJson = TempData["SelectedOutboundFlight"]?.ToString();
                var returnFlightJson = TempData["SelectedReturnFlight"]?.ToString();
                
                FlightDetails? outboundFlightDetails = null;
                FlightDetails? returnFlightDetails = null;
                
                if (!string.IsNullOrEmpty(outboundFlightJson))
                {
                    var outboundFlightInfo = System.Text.Json.JsonSerializer.Deserialize<FlightSearchService.FlightInfo>(outboundFlightJson);
                    if (outboundFlightInfo != null)
                    {
                        outboundFlightDetails = new FlightDetails
                        {
                            FlightNumber = outboundFlightInfo.FlightNumber,
                            DepartureTime = outboundFlightInfo.DepartureTime,
                            ArrivalTime = outboundFlightInfo.ArrivalTime,
                            OriginCode = outboundFlightInfo.OriginCode,
                            OriginCity = outboundFlightInfo.OriginCity,
                            DestinationCode = outboundFlightInfo.DestinationCode,
                            DestinationCity = outboundFlightInfo.DestinationCity,
                            AircraftModel = outboundFlightInfo.AircraftModel,
                            Price = outboundFlightInfo.Price,
                            Duration = outboundFlightInfo.Duration
                        };
                    }
                }
                
                if (!string.IsNullOrEmpty(returnFlightJson))
                {
                    var returnFlightInfo = System.Text.Json.JsonSerializer.Deserialize<FlightSearchService.FlightInfo>(returnFlightJson);
                    if (returnFlightInfo != null)
                    {
                        returnFlightDetails = new FlightDetails
                        {
                            FlightNumber = returnFlightInfo.FlightNumber,
                            DepartureTime = returnFlightInfo.DepartureTime,
                            ArrivalTime = returnFlightInfo.ArrivalTime,
                            OriginCode = returnFlightInfo.OriginCode,
                            OriginCity = returnFlightInfo.OriginCity,
                            DestinationCode = returnFlightInfo.DestinationCode,
                            DestinationCity = returnFlightInfo.DestinationCity,
                            AircraftModel = returnFlightInfo.AircraftModel,
                            Price = returnFlightInfo.Price,
                            Duration = returnFlightInfo.Duration
                        };
                    }
                }

                HttpContext.Session.Remove("OutboundFlightId");
                HttpContext.Session.Remove("ReturnFlightId");
                
                var confirmationModel = new BookingConfirmationViewModel
                {
                    BookingId = bookingResponse.BookingId,
                    BookingReference = bookingResponse.BookingReference,
                    TotalPrice = finalTotalPrice, // Use the calculated total with taxes
                    ContactEmail = model.ContactEmail,
                    ContactPhone = model.ContactPhone,
                    BookingDate = DateTime.Now,
                    Status = "Confirmed",
                    Adults = model.Adults,
                    Children = model.Children,
                    Infants = model.Infants,
                    Passengers = model.Passengers,
                    OutboundFlight = outboundFlightDetails,
                    ReturnFlight = returnFlightDetails,
                    UserName = HttpContext.Session.GetString("UserName") ?? ""
                };

                LogManager.Info($"Booking confirmed with final total: ${finalTotalPrice}", "FlightController");

                return View("BookingConfirmation", confirmationModel);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error confirming booking: {ex.Message}", "FlightController");
                ModelState.AddModelError(string.Empty, "An error occurred while confirming your booking. Please try again.");
                TempData.Keep("SearchParams");
                TempData.Keep("SelectedOutboundFlight");
                TempData.Keep("SelectedReturnFlight");
                return View("PassengerDetails", model);
            }
        }

        public async Task<IActionResult> MyBookings()
        {
            try
            {
                var userIdString = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return RedirectToAction("Login", "Account");
                }

                var bookingsResponse = await Task.Run(() => _bookingService.GetUserBookings(userId));

                if (!bookingsResponse.Success)
                {
                    ViewBag.Error = bookingsResponse.Message;
                    return View(new List<BookingService.BookingInfo>());
                }

                return View(bookingsResponse.Bookings);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error retrieving bookings: {ex.Message}", "FlightController");
                ViewBag.Error = "An error occurred while retrieving your bookings.";
                return View(new List<BookingService.BookingInfo>());
            }
        }

        public async Task<IActionResult> BookingDetails(int id)
        {
            try
            {
                var userIdString = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return RedirectToAction("Login", "Account");
                }

                var bookingsResponse = await Task.Run(() => _bookingService.GetUserBookings(userId));
                
                if (!bookingsResponse.Success)
                {
                    TempData["Error"] = "Unable to retrieve booking details.";
                    return RedirectToAction("MyBookings");
                }

                var booking = bookingsResponse.Bookings.FirstOrDefault(b => b.BookingId == id);
                if (booking == null)
                {
                    TempData["Error"] = "Booking not found.";
                    return RedirectToAction("MyBookings");
                }

                return View(booking);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error retrieving booking details: {ex.Message}", "FlightController");
                TempData["Error"] = "An error occurred while retrieving booking details.";
                return RedirectToAction("MyBookings");
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult GetUserProfileData()
        {
            try
            {
                var userIdString = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return Json(new { success = false, message = "User not authenticated" });
                }

                LogManager.Info($"Getting profile data for user {userId}", "FlightController");

                var profileResponse = _userProfileService.GetUserProfile(userId);
                
                if (profileResponse.Success && profileResponse.Profile != null)
                {
                    LogManager.Info($"Profile data retrieved successfully for user {userId}", "FlightController");
                    
                    return Json(new 
                    { 
                        success = true, 
                        profile = new
                        {
                            userId = profileResponse.Profile.UserId,
                            email = profileResponse.Profile.Email,
                            phone = profileResponse.Profile.Phone,
                            firstName = profileResponse.Profile.FirstName,
                            lastName = profileResponse.Profile.LastName,
                            dateOfBirth = profileResponse.Profile.DateOfBirth,
                            gender = profileResponse.Profile.Gender,
                            nationality = profileResponse.Profile.Nationality
                        }
                    });
                }
                else
                {
                    LogManager.Warning($"Failed to retrieve profile for user {userId}: {profileResponse.Message}", "FlightController");
                    return Json(new { success = false, message = profileResponse.Message });
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error getting user profile data: {ex.Message}", "FlightController");
                return Json(new { success = false, message = "Server error occurred" });
            }
        }
    }
}