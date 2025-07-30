using Microsoft.AspNetCore.Mvc;
using AeroWayClient.Services;
using AeroWayClient.Models;

namespace AeroWayClient.Controllers
{
    public class EmailVerificationController : Controller
    {
        private readonly AeroWayApiService _apiService;

        public EmailVerificationController()
        {
            _apiService = new AeroWayApiService();
        }

        public IActionResult Verify(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return RedirectToAction("Error");
            }

            var model = new EmailVerificationViewModel
            {
                Token = token,
                Status = VerificationStatus.Pending
            };

            return View(model);
        }

        [HttpPost]
        public IActionResult ProcessVerification(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return Json(new { success = false, message = "Invalid token" });
            }

            try
            {
                var response = _apiService.VerifyEmail(token);
                
                if (response.Success)
                {
                    return Json(new 
                    { 
                        success = true, 
                        message = "Email verified successfully!",
                        redirectUrl = Url.Action("Login", "Account")
                    });
                }
                else
                {
                    return Json(new 
                    { 
                        success = false, 
                        message = response.Message 
                    });
                }
            }
            catch (Exception)
            {
                return Json(new 
                { 
                    success = false, 
                    message = "An error occurred. Please try again." 
                });
            }
        }

        public IActionResult Success()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View();
        }

        public IActionResult Resend()
        {
            return View();
        }

        [HttpPost]
        public IActionResult ResendEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return Json(new { success = false, message = "Email is required" });
            }

            try
            {
                var response = _apiService.ResendVerificationEmail(email);
                
                return Json(new 
                { 
                    success = response.Success, 
                    message = response.Message 
                });
            }
            catch (Exception)
            {
                return Json(new 
                { 
                    success = false, 
                    message = "An error occurred. Please try again." 
                });
            }
        }
    }
}