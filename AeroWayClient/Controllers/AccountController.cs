using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using AeroWayClient.Services;
using AeroWayClient.Models;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Controllers
{
    public class AccountController : Controller
    {
        private readonly AeroWayApiService _apiService;
        private readonly UserProfileService _profileService;

        public AccountController()
        {
            _apiService = new AeroWayApiService();
            _profileService = new UserProfileService();
        }

        public IActionResult Login()
        {
            if (!string.IsNullOrEmpty(HttpContext.Session.GetString("UserId")))
            {
                return RedirectToAction("Index", "Home");
            }

            ViewBag.ShowReturnMessage = false;
            
            if (TempData.ContainsKey("ReturnUrl") && TempData["ReturnUrl"]?.ToString()?.Contains("/Flight/SelectFlights") == true)
            {
                ViewBag.ShowReturnMessage = true;
                TempData.Keep();
            }
            
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var request = new AeroWayApiService.LoginRequest
            {
                Email = model.Email,
                Password = model.Password
            };

            var response = _apiService.Login(request);

            if (response.Success && response.Data != null)
            {
                HttpContext.Session.SetString("UserId", response.Data["userId"].ToString() ?? "");
                HttpContext.Session.SetString("UserEmail", response.Data["email"].ToString() ?? "");
                HttpContext.Session.SetString("UserName", $"{response.Data["firstName"]} {response.Data["lastName"]}");
                HttpContext.Session.SetString("SessionToken", response.Data["sessionToken"].ToString() ?? "");

                if (TempData.ContainsKey("SelectedOutboundFlightId"))
                {
                    LogManager.Info("Found flight selection in TempData, redirecting back to flight selection", "AccountController");
                    
                    var outboundFlightId = Convert.ToInt32(TempData["SelectedOutboundFlightId"]);
                    var returnFlightId = TempData.ContainsKey("SelectedReturnFlightId") ? 
                        Convert.ToInt32(TempData["SelectedReturnFlightId"]) : (int?)null;
                    
                    ViewBag.OutboundFlightId = outboundFlightId;
                    ViewBag.ReturnFlightId = returnFlightId;
                    
                    TempData.Keep();
                    
                    return View("~/Views/Flight/RedirectToSelectFlights.cshtml");
                }
                
                TempData.Clear();
                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError("", response.Message);
            return View(model);
        }

        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            model.FirstName = CapitalizeFirstLetter(model.FirstName?.Trim() ?? "");
            model.LastName = CapitalizeFirstLetter(model.LastName?.Trim() ?? "");

            var request = new AeroWayApiService.RegisterRequest
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                Email = model.Email,
                Phone = model.Phone,
                DateOfBirth = model.DateOfBirth.ToString("yyyy-MM-dd"),
                Gender = model.Gender,
                Nationality = model.Nationality,
                Password = model.Password
            };

            var response = _apiService.Register(request);

            if (response.Success)
            {
                TempData["SuccessMessage"] = "Registration successful! Please check your email to verify your account before logging in.";
                return RedirectToAction("Login");
            }

            ModelState.AddModelError("", response.Message);
            return View(model);
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            TempData.Clear();
            return RedirectToAction("Index", "Home");
        }

        public IActionResult Profile()
        {
            var userIdString = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
            {
                return RedirectToAction("Login");
            }

            var profileResponse = _profileService.GetUserProfile(userId);
            
            if (!profileResponse.Success || profileResponse.Profile == null)
            {
                TempData["Error"] = profileResponse.Message;
                return RedirectToAction("Index", "Home");
            }

            var activityResponse = _profileService.GetRecentActivity(userId);
            ViewBag.RecentActivity = activityResponse.Activities;

            return View(profileResponse.Profile);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult UpdateProfile(UserProfileService.UpdateProfileRequest model)
        {
            var userIdString = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
            {
                return RedirectToAction("Login");
            }

            model.UserId = userId;
            model.FirstName = CapitalizeFirstLetter(model.FirstName?.Trim() ?? "");
            model.LastName = CapitalizeFirstLetter(model.LastName?.Trim() ?? "");

            var response = _profileService.UpdateProfile(model);
            
            if (response.Success)
            {
                HttpContext.Session.SetString("UserName", $"{model.FirstName} {model.LastName}");
                
                TempData["Success"] = response.Message;
            }
            else
            {
                TempData["Error"] = response.Message;
            }

            return RedirectToAction("Profile");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult DeleteAccount(string CurrentPassword)
        {
            var userIdString = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
            {
                TempData["Error"] = "User session not found. Please log in again.";
                return RedirectToAction("Login");
            }

            if (string.IsNullOrWhiteSpace(CurrentPassword))
            {
                TempData["Error"] = "Current password is required to delete your account.";
                return RedirectToAction("Profile");
            }

            try
            {
                LogManager.Info($"Processing account deletion request for user {userId}", "AccountController");

                var deleteRequest = new UserProfileService.DeleteAccountRequest
                {
                    UserId = userId,
                    CurrentPassword = CurrentPassword
                };

                var response = _profileService.DeleteAccount(deleteRequest);

                if (response.Success)
                {
                    LogManager.Info($"Account successfully deleted for user {userId}", "AccountController");
                    
                    HttpContext.Session.Clear();
                    TempData.Clear();
                    
                    TempData["AccountDeleted"] = true;
                    TempData["DeleteMessage"] = "Your account has been permanently deleted. We're sorry to see you go!";
                    
                    return RedirectToAction("AccountDeleted");
                }
                else
                {
                    LogManager.Warning($"Account deletion failed for user {userId}: {response.Message}", "AccountController");
                    TempData["Error"] = response.Message;
                    return RedirectToAction("Profile");
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error processing account deletion for user {userId}: {ex.Message}", "AccountController");
                TempData["Error"] = "An unexpected error occurred while deleting your account. Please try again or contact support.";
                return RedirectToAction("Profile");
            }
        }

        public IActionResult AccountDeleted()
        {
            if (!TempData.ContainsKey("AccountDeleted"))
            {
                return RedirectToAction("Index", "Home");
            }

            ViewBag.DeleteMessage = TempData["DeleteMessage"]?.ToString() ?? "Your account has been deleted.";
            TempData.Clear();
            
            return View();
        }

        public IActionResult Settings()
        {
            var userIdString = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdString))
            {
                return RedirectToAction("Login");
            }

            return View();
        }

        private string CapitalizeFirstLetter(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
            
            return char.ToUpper(input[0]) + input.Substring(1).ToLower();
        }

        private bool IsLocalUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return false;
            }

            if (url[0] == '/')
            {
                if (url.Length == 1)
                {
                    return true;
                }

                if (url[1] != '/' && url[1] != '\\')
                {
                    return true;
                }

                return false;
            }

            if (url[0] == '~' && url.Length > 1 && url[1] == '/')
            {
                return true;
            }

            return false;
        }
    }
}