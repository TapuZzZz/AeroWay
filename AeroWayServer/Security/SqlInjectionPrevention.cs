using System;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using AeroWayServer.Log;

namespace AeroWayServer.Security
{
    public static class SqlInjectionPrevention
    {
        private static readonly HashSet<char> DangerousCharacters = new HashSet<char>
        {
            ';', '\'', '"', '-', '/', '*', '\\', '\0', '\n', '\r', '\x1a'
        };

        public static bool IsSafe(string input)
        {
            if (string.IsNullOrEmpty(input))
                return true;

            foreach (char c in input)
            {
                if (DangerousCharacters.Contains(c))
                {
                    LogManager.Warning($"Dangerous character '{c}' detected in input", "SqlSecurity");
                    return false;
                }
            }

            string lowerInput = input.ToLower();
            string[] dangerousKeywords = { "--", "/*", "*/", "xp_", "sp_", "exec ", "execute " };
            
            foreach (string keyword in dangerousKeywords)
            {
                if (lowerInput.Contains(keyword))
                {
                    LogManager.Warning($"SQL keyword '{keyword}' detected in input", "SqlSecurity");
                    return false;
                }
            }

            return true;
        }

        public static bool IsSafeForType(string input, InputType inputType)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                LogManager.Warning($"Empty input for type {inputType}", "SqlSecurity");
                return false;
            }

            bool result = false;
            
            switch (inputType)
            {
                case InputType.Username:
                    result = Regex.IsMatch(input, @"^[a-zA-Z0-9_]{3,50}$");
                    break;

                case InputType.Password:
                    result = input.Length >= 6 && input.Length <= 100;
                    break;

                case InputType.Email:
                    result = Regex.IsMatch(input, @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
                    break;

                case InputType.Phone:
                    result = Regex.IsMatch(input, @"^[0-9\s\-\+\(\)]{7,20}$");
                    break;

                case InputType.Number:
                    result = Regex.IsMatch(input, @"^\d+$");
                    break;

                case InputType.AlphaNumeric:
                    result = Regex.IsMatch(input, @"^[a-zA-Z0-9]+$");
                    break;

                case InputType.Name:
                    result = Regex.IsMatch(input, @"^[a-zA-Z\s\-']{1,100}$");
                    break;

                case InputType.Date:
                    result = DateTime.TryParse(input, out _);
                    break;

                case InputType.Gender:
                    result = Regex.IsMatch(input, @"^(M|F|Male|Female|Other)$", RegexOptions.IgnoreCase);
                    break;

                case InputType.Nationality:
                    result = Regex.IsMatch(input, @"^[a-zA-Z\s]{2,50}$");
                    break;

                default:
                    LogManager.Warning($"Unknown input type: {inputType}", "SqlSecurity");
                    result = false;
                    break;
            }

            if (!result)
            {
                LogManager.Warning($"Invalid format for {inputType}: '{input}'", "SqlSecurity");
            }
            
            return result;
        }

        public enum InputType
        {
            Username,
            Password,
            Email,
            Phone,
            Number,
            AlphaNumeric,
            Name,
            Date,
            Gender,
            Nationality
        }

        public static string Sanitize(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            LogManager.Warning("Using Sanitize() - consider using SQL parameters instead!", "SqlSecurity");
            
            string sanitized = input.Replace("'", "''");
            
            sanitized = Regex.Replace(sanitized, @"[;""\\/*\-]{2,}", " ");
            sanitized = Regex.Replace(sanitized, @"(--|\*\/|\/\*)", " ");
            
            if (sanitized != input)
            {
                LogManager.Info("Input was sanitized", "SqlSecurity");
            }
            
            return sanitized.Trim();
        }

        public static bool ContainsSuspiciousCharacters(string input)
        {
            if (string.IsNullOrEmpty(input))
                return false;

            foreach (char c in input)
            {
                if (DangerousCharacters.Contains(c))
                    return true;
            }
            
            return false;
        }
    }
}