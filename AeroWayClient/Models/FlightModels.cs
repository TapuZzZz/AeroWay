using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AeroWayClient.Models
{
    public class PassengerDetailsViewModel
    {
        public int Adults { get; set; }
        public int Children { get; set; }
        public int Infants { get; set; }
        public string TripType { get; set; } = "";
        
        public List<PassengerDetails> Passengers { get; set; } = new List<PassengerDetails>();
        
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string ContactEmail { get; set; } = "";
        
        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number")]
        public string ContactPhone { get; set; } = "";
        
        public string AlternativePhone { get; set; } = "";
        
        [Required(ErrorMessage = "You must accept the terms and conditions")]
        public bool AcceptTerms { get; set; }
        
        public int TotalPassengers => Adults + Children + Infants;
        public int SeatedPassengers => Adults + Children;
        public bool HasInfants => Infants > 0;
        public bool IsRoundTrip => TripType == "roundtrip";
        
        public List<string> AvailableGenders { get; } = new List<string>
        {
            "Male",
            "Female",
            "Other"
        };
        
        public List<string> CommonNationalities { get; } = new List<string>
        {
            "Israeli",
            "American",
            "British",
            "Canadian",
            "French",
            "German",
            "Italian",
            "Spanish",
            "Australian",
            "Japanese",
            "Chinese",
            "Indian",
            "Brazilian",
            "Mexican",
            "Russian",
            "South African",
            "Other"
        };
    }
    
    public class PassengerDetails
    {
        [Required(ErrorMessage = "First name is required")]
        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        [RegularExpression(@"^[a-zA-Z\s\u0590-\u05FF]+$", ErrorMessage = "First name can only contain letters")]
        [Display(Name = "First Name")]
        public string FirstName { get; set; } = "";
        
        [Required(ErrorMessage = "Last name is required")]
        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        [RegularExpression(@"^[a-zA-Z\s\u0590-\u05FF]+$", ErrorMessage = "Last name can only contain letters")]
        [Display(Name = "Last Name")]
        public string LastName { get; set; } = "";
        
        [Required(ErrorMessage = "Date of birth is required")]
        [DataType(DataType.Date)]
        [Display(Name = "Date of Birth")]
        public DateTime DateOfBirth { get; set; }
        
        [Required(ErrorMessage = "Gender is required")]
        [RegularExpression(@"^(Male|Female|Other)$", ErrorMessage = "Please select a valid gender")]
        [Display(Name = "Gender")]
        public string Gender { get; set; } = "";
        
        [Required]
        public string PassengerType { get; set; } = "Adult";
        
        public int PassengerNumber { get; set; }
        
        [StringLength(20, ErrorMessage = "Passport number cannot exceed 20 characters")]
        [Display(Name = "Passport Number")]
        public string PassportNumber { get; set; } = "";
        
        [Required(ErrorMessage = "Nationality is required")]
        [Display(Name = "Nationality")]
        public string Nationality { get; set; } = "";
        
        public string FullName => $"{FirstName} {LastName}";
        
        public int Age
        {
            get
            {
                var today = DateTime.Today;
                var age = today.Year - DateOfBirth.Year;
                if (DateOfBirth.Date > today.AddYears(-age)) age--;
                return age;
            }
        }
        
        public bool IsAdult => Age >= 18;
        public bool IsChild => Age >= 2 && Age < 18;
        public bool IsInfant => Age < 2;
        
        public string PassengerTypeIcon
        {
            get
            {
                return PassengerType switch
                {
                    "Adult" => "fa-user",
                    "Child" => "fa-child",
                    "Infant" => "fa-baby",
                    _ => "fa-user"
                };
            }
        }
        
        public string PassengerTypeBadgeClass => PassengerType.ToLower();
        
        public bool IsPassportRequired => PassengerType != "Infant" || !string.IsNullOrEmpty(PassportNumber);
    }
    
    public class BookingConfirmationViewModel
    {
        public int BookingId { get; set; }
        public string BookingReference { get; set; } = "";
        public decimal TotalPrice { get; set; }
        public string ContactEmail { get; set; } = "";
        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = "";
        
        public int Adults { get; set; }
        public int Children { get; set; }
        public int Infants { get; set; }
        
        public List<PassengerDetails> Passengers { get; set; } = new List<PassengerDetails>();
        
        public FlightDetails? OutboundFlight { get; set; }
        public FlightDetails? ReturnFlight { get; set; }
        
        public string UserName { get; set; } = "";
        public string ContactPhone { get; set; } = "";
        
        public int TotalPassengers => Adults + Children + Infants;
        public int SeatedPassengers => Adults + Children;
        public bool HasInfants => Infants > 0;
        public bool IsRoundTrip => ReturnFlight != null;
        
        public decimal OutboundFlightTotal => OutboundFlight?.Price * SeatedPassengers ?? 0;
        public decimal ReturnFlightTotal => ReturnFlight?.Price * SeatedPassengers ?? 0;
        public decimal CalculatedTotal => OutboundFlightTotal + ReturnFlightTotal;
    }
    
    public class FlightDetails
    {
        public string FlightNumber { get; set; } = "";
        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }
        public string OriginCode { get; set; } = "";
        public string OriginCity { get; set; } = "";
        public string DestinationCode { get; set; } = "";
        public string DestinationCity { get; set; } = "";
        public string AircraftModel { get; set; } = "";
        public decimal Price { get; set; }
        public string Duration { get; set; } = "";
        
        public TimeSpan FlightDuration
        {
            get
            {
                return ArrivalTime - DepartureTime;
            }
        }
        
        public string FormattedDuration
        {
            get
            {
                var duration = FlightDuration;
                return $"{duration.Hours}h {duration.Minutes}m";
            }
        }
        
        public string Route => $"{OriginCode} → {DestinationCode}";
        public string FullRoute => $"{OriginCity} ({OriginCode}) → {DestinationCity} ({DestinationCode})";
        
        public bool IsDepartureSoon => DepartureTime <= DateTime.Now.AddHours(24);
        public bool HasDeparted => DepartureTime <= DateTime.Now;
        public bool HasArrived => ArrivalTime <= DateTime.Now;
        
        public string FlightStatus
        {
            get
            {
                if (HasArrived) return "Arrived";
                if (HasDeparted) return "In Flight";
                if (IsDepartureSoon) return "Departing Soon";
                return "Scheduled";
            }
        }
        
        public string StatusBadgeClass
        {
            get
            {
                return FlightStatus switch
                {
                    "Arrived" => "badge-success",
                    "In Flight" => "badge-warning",
                    "Departing Soon" => "badge-info",
                    "Scheduled" => "badge-secondary",
                    _ => "badge-secondary"
                };
            }
        }
    }
}