using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AeroWayClient.Models
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [Display(Name = "Email")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Password is required")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = "";

        [Display(Name = "Remember me")]
        public bool RememberMe { get; set; }
    }

    public class RegisterViewModel : IValidatableObject
    {
        [Required(ErrorMessage = "First name is required")]
        [StringLength(30, ErrorMessage = "First name cannot exceed 30 characters", MinimumLength = 2)]
        [RegularExpression(@"^[a-zA-Z\s\u0590-\u05FF]+$", ErrorMessage = "First name can only contain letters (English or Hebrew)")]
        [Display(Name = "First Name")]
        public string FirstName { get; set; } = "";

        [Required(ErrorMessage = "Last name is required")]
        [StringLength(30, ErrorMessage = "Last name cannot exceed 30 characters", MinimumLength = 2)]
        [RegularExpression(@"^[a-zA-Z\s\u0590-\u05FF]+$", ErrorMessage = "Last name can only contain letters (English or Hebrew)")]
        [Display(Name = "Last Name")]
        public string LastName { get; set; } = "";

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [Display(Name = "Email")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Phone is required")]
        [RegularExpression(@"^\+[1-9]\d{6,14}$", ErrorMessage = "Phone number must start with + and include country code (e.g., +972501234567)")]
        [Display(Name = "Phone Number")]
        public string Phone { get; set; } = "";

        [Required(ErrorMessage = "Date of birth is required")]
        [DataType(DataType.Date)]
        [Display(Name = "Date of Birth")]
        public DateTime DateOfBirth { get; set; }

        [Required(ErrorMessage = "Gender is required")]
        [RegularExpression(@"^(Male|Female|Other)$", ErrorMessage = "Please select a valid gender")]
        [Display(Name = "Gender")]
        public string Gender { get; set; } = "";

        [Required(ErrorMessage = "Nationality is required")]
        [Display(Name = "Nationality")]
        public string Nationality { get; set; } = "";

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, ErrorMessage = "Password must be at least {2} characters long", MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$", ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = "";

        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = "";

        [Display(Name = "I agree to receive newsletters and marketing emails")]
        public bool MarketingOptIn { get; set; }

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

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (DateOfBirth > DateTime.Today)
            {
                yield return new ValidationResult("Date of birth cannot be in the future", new[] { nameof(DateOfBirth) });
            }
            else if (DateOfBirth.AddYears(18) > DateTime.Today)
            {
                yield return new ValidationResult("You must be at least 18 years old to register", new[] { nameof(DateOfBirth) });
            }
            else if (DateOfBirth.Year < 1900)
            {
                yield return new ValidationResult("Please enter a valid date of birth", new[] { nameof(DateOfBirth) });
            }
            
            // Validate phone number format more thoroughly
            if (!string.IsNullOrEmpty(Phone))
            {
                if (!Phone.StartsWith("+"))
                {
                    yield return new ValidationResult("Phone number must include country code starting with +", new[] { nameof(Phone) });
                }
                else if (Phone.Length < 8 || Phone.Length > 16)
                {
                    yield return new ValidationResult("Phone number length is invalid", new[] { nameof(Phone) });
                }
            }
        }
    }
}