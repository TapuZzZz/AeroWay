using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using AeroWayClient.Services;

namespace AeroWayClient.Models
{
    public class FlightSearchViewModel
    {
        [Required(ErrorMessage = "Please select departure location")]
        public string From { get; set; } = "";
        
        [Required(ErrorMessage = "Please select destination")]
        public string To { get; set; } = "";
        
        [Required(ErrorMessage = "Please select departure date")]
        [DataType(DataType.Date)]
        public DateTime DepartureDate { get; set; }
        
        [DataType(DataType.Date)]
        public DateTime? ReturnDate { get; set; }
        
        [Required]
        public string TripType { get; set; } = "oneway";
        
        [Range(1, 9, ErrorMessage = "At least 1 adult is required")]
        public int Adults { get; set; } = 1;
        
        [Range(0, 8, ErrorMessage = "Children must be between 0 and 8")]
        public int Children { get; set; } = 0;
        
        [Range(0, 4, ErrorMessage = "Infants must be between 0 and 4")]
        public int Infants { get; set; } = 0;
        
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (TripType == "roundtrip" && ReturnDate.HasValue)
            {
                if (ReturnDate.Value < DepartureDate)
                {
                    yield return new ValidationResult(
                        "Return date must be after departure date",
                        new[] { nameof(ReturnDate) }
                    );
                }
            }
            
            if (Adults + Children + Infants > 9)
            {
                yield return new ValidationResult(
                    "Total number of passengers cannot exceed 9",
                    new[] { nameof(Adults) }
                );
            }
            
            if (DepartureDate < DateTime.Today)
            {
                yield return new ValidationResult(
                    "Departure date cannot be in the past",
                    new[] { nameof(DepartureDate) }
                );
            }
        }
    }
    
    public class FlightResultsViewModel
    {
        public FlightSearchViewModel SearchParams { get; set; } = new FlightSearchViewModel();
        public List<FlightSearchService.FlightInfo> OutboundFlights { get; set; } = new List<FlightSearchService.FlightInfo>();
        public List<FlightSearchService.FlightInfo>? ReturnFlights { get; set; }
        
        public string GetSearchSummary()
        {
            var passengers = new List<string>();
            
            if (SearchParams.Adults > 0)
                passengers.Add($"{SearchParams.Adults} Adult{(SearchParams.Adults > 1 ? "s" : "")}");
                
            if (SearchParams.Children > 0)
                passengers.Add($"{SearchParams.Children} Child{(SearchParams.Children > 1 ? "ren" : "")}");
                
            if (SearchParams.Infants > 0)
                passengers.Add($"{SearchParams.Infants} Infant{(SearchParams.Infants > 1 ? "s" : "")}");
                
            return string.Join(", ", passengers);
        }
    }
}