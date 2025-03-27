using AeroWayClientMVC.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace AeroWayClientMVC.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private static MessageModel? _messageModel;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            // Initialize message model if needed
            if (_messageModel == null)
            {
                _messageModel = new MessageModel();
                _messageModel.StartSession();
            }
            
            return View();
        }
        
        public IActionResult Flights()
        {
            ViewData["Title"] = "Flights";
            return View();
        }
        
        public IActionResult Destinations()
        {
            ViewData["Title"] = "Destinations";
            return View();
        }
        
        public IActionResult Services()
        {
            ViewData["Title"] = "Services";
            return View();
        }
        
        public IActionResult Contact()
        {
            ViewData["Title"] = "Contact Us";
            return View();
        }
        
        public IActionResult About()
        {
            ViewData["Title"] = "About Us";
            return View();
        }
        
        public IActionResult FAQ()
        {
            ViewData["Title"] = "FAQ";
            return View();
        }

        [HttpPost]
        public IActionResult SendMessage(string message)
        {
            if (_messageModel == null)
            {
                ViewBag.ResponseMessage = "❌ Session not started.";
            }
            else
            {
                _messageModel.SendMessage(message);
                ViewBag.ResponseMessage = $"📤 Sent: {message}";
            }

            return View("Index");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}