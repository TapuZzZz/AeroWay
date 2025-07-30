using System;
using System.Collections.Generic;
using System.Linq;
using MySql.Data.MySqlClient;
using AeroWayServer.Core;
using AeroWayServer.Log;

namespace AeroWayServer.Database
{
    public static class DatabaseInitializer
    {
        private static readonly Dictionary<string, string> TableCreationScripts = new Dictionary<string, string>
        {
            ["Users"] = @"
                CREATE TABLE IF NOT EXISTS Users (
                    UserId INT AUTO_INCREMENT PRIMARY KEY,
                    FirstName VARCHAR(50) NOT NULL,
                    LastName VARCHAR(50) NOT NULL,
                    Email VARCHAR(100) UNIQUE NOT NULL,
                    Phone VARCHAR(20) NOT NULL,
                    DateOfBirth DATE NOT NULL,
                    Gender ENUM('Male', 'Female', 'Other') NOT NULL,
                    Nationality VARCHAR(50) NOT NULL,
                    PasswordHash VARCHAR(256) NOT NULL,
                    Salt VARCHAR(256) NOT NULL,
                    IsActive BOOLEAN DEFAULT TRUE,
                    EmailVerified BOOLEAN DEFAULT FALSE,
                    EmailVerifiedDate DATETIME NULL,
                    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    LastLoginDate DATETIME,
                    INDEX idx_email (Email),
                    INDEX idx_active (IsActive),
                    INDEX idx_email_verified (EmailVerified)
                )",
                
            ["EmailVerifications"] = @"
                CREATE TABLE IF NOT EXISTS EmailVerifications (
                    VerificationId INT AUTO_INCREMENT PRIMARY KEY,
                    UserId INT NOT NULL,
                    Token VARCHAR(100) NOT NULL UNIQUE,
                    CreatedDate DATETIME NOT NULL,
                    ExpiryDate DATETIME NOT NULL,
                    IsUsed BOOLEAN DEFAULT FALSE,
                    UsedDate DATETIME NULL,
                    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
                    INDEX idx_token (Token),
                    INDEX idx_user_used (UserId, IsUsed),
                    INDEX idx_expiry (ExpiryDate)
                )",
                
            ["Aircraft"] = @"
                CREATE TABLE IF NOT EXISTS Aircraft (
                    AircraftId INT AUTO_INCREMENT PRIMARY KEY,
                    Model VARCHAR(100) NOT NULL UNIQUE,
                    Category ENUM('Ultra Long Range', 'Super Mid-Size', 'Light Jet') NOT NULL,
                    MaxPassengers INT NOT NULL,
                    RangeNM INT NOT NULL,
                    CruiseSpeedMPH INT NOT NULL,
                    MaxAltitudeFt INT NOT NULL,
                    INDEX idx_category (Category)
                )",
                
            ["Airports"] = @"
                CREATE TABLE IF NOT EXISTS Airports (
                    AirportId INT AUTO_INCREMENT PRIMARY KEY,
                    Code VARCHAR(10) NOT NULL UNIQUE,
                    Name VARCHAR(100) NOT NULL,
                    City VARCHAR(50) NOT NULL,
                    Country VARCHAR(50) NOT NULL,
                    Latitude DECIMAL(10, 8),
                    Longitude DECIMAL(11, 8),
                    INDEX idx_code (Code),
                    INDEX idx_city (City)
                )",
                
            ["Flights"] = @"
                CREATE TABLE IF NOT EXISTS Flights (
                    FlightId INT AUTO_INCREMENT PRIMARY KEY,
                    FlightNumber VARCHAR(20) NOT NULL,
                    AircraftId INT NOT NULL,
                    OriginAirportId INT NOT NULL,
                    DestinationAirportId INT NOT NULL,
                    DepartureTime DATETIME NOT NULL,
                    ArrivalTime DATETIME NOT NULL,
                    Price DECIMAL(10, 2) NOT NULL,
                    AvailableSeats INT NOT NULL,
                    Status ENUM('Scheduled', 'Cancelled') DEFAULT 'Scheduled',
                    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (AircraftId) REFERENCES Aircraft(AircraftId),
                    FOREIGN KEY (OriginAirportId) REFERENCES Airports(AirportId),
                    FOREIGN KEY (DestinationAirportId) REFERENCES Airports(AirportId),
                    INDEX idx_flight_number (FlightNumber),
                    INDEX idx_route_date (OriginAirportId, DestinationAirportId, DepartureTime),
                    INDEX idx_status (Status)
                )",
                
            ["Bookings"] = @"
                CREATE TABLE IF NOT EXISTS Bookings (
                    BookingId INT AUTO_INCREMENT PRIMARY KEY,
                    UserId INT NOT NULL,
                    BookingReference VARCHAR(20) NOT NULL UNIQUE,
                    FlightId INT NOT NULL,
                    ReturnFlightId INT NULL,
                    Adults INT NOT NULL DEFAULT 1,
                    Children INT NOT NULL DEFAULT 0,
                    Infants INT NOT NULL DEFAULT 0,
                    TotalPrice DECIMAL(10, 2) NOT NULL,
                    BookingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    Status ENUM('Confirmed', 'Cancelled') DEFAULT 'Confirmed',
                    FOREIGN KEY (UserId) REFERENCES Users(UserId),
                    FOREIGN KEY (FlightId) REFERENCES Flights(FlightId),
                    FOREIGN KEY (ReturnFlightId) REFERENCES Flights(FlightId),
                    INDEX idx_user (UserId),
                    INDEX idx_booking_ref (BookingReference),
                    INDEX idx_booking_date (BookingDate)
                )",
                
            ["Passengers"] = @"
                CREATE TABLE IF NOT EXISTS Passengers (
                    PassengerId INT AUTO_INCREMENT PRIMARY KEY,
                    BookingId INT NOT NULL,
                    FirstName VARCHAR(50) NOT NULL,
                    LastName VARCHAR(50) NOT NULL,
                    DateOfBirth DATE NOT NULL,
                    PassengerType ENUM('Adult', 'Child', 'Infant') NOT NULL,
                    Gender ENUM('Male', 'Female', 'Other') NOT NULL,
                    Nationality VARCHAR(50) NOT NULL,
                    PassportNumber VARCHAR(20),
                    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
                    INDEX idx_booking (BookingId)
                )"
        };

        public static bool InitializeDatabase(string server, string user, string password, string database)
        {
            try
            {
                LogManager.Info("Starting database initialization...", "DatabaseInitializer");
                
                string connectionString = $"server={server};user={user};password={password};database={database};";
                using var connection = new MySqlConnection(connectionString);
                connection.Open();
                
                string[] tableOrder = { "Users", "EmailVerifications", "Aircraft", "Airports", "Flights", "Bookings", "Passengers" };
                
                foreach (string tableName in tableOrder)
                {
                    if (!TableExists(connection, tableName))
                    {
                        LogManager.Info($"Table '{tableName}' does not exist. Creating...", "DatabaseInitializer");
                        CreateTable(connection, tableName, TableCreationScripts[tableName]);
                    }
                    else
                    {
                        LogManager.Info($"Table '{tableName}' already exists", "DatabaseInitializer");
                        if (tableName == "Passengers")
                        {
                            UpdatePassengersTable(connection);
                        }
                    }
                }
                
                InsertAircraftData(connection);
                InsertAirportData(connection);
                
                GenerateOptimizedFlightSchedule(connection);
                
                CleanupExpiredTokens(connection);
                
                LogManager.Info("Database initialization completed successfully", "DatabaseInitializer");
                return true;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Database initialization failed: {ex.Message}", "DatabaseInitializer");
                return false;
            }
        }

        private static void UpdatePassengersTable(MySqlConnection connection)
        {
            try
            {
                var columnsToAdd = new Dictionary<string, string>
                {
                    ["Gender"] = "ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Male'",
                    ["Nationality"] = "VARCHAR(50) NOT NULL DEFAULT 'Unknown'",
                    ["PassportNumber"] = "VARCHAR(20) NULL"
                };

                foreach (var column in columnsToAdd)
                {
                    if (!ColumnExists(connection, "Passengers", column.Key))
                    {
                        LogManager.Info($"Adding column '{column.Key}' to Passengers table", "DatabaseInitializer");
                        string alterQuery = $"ALTER TABLE Passengers ADD COLUMN {column.Key} {column.Value}";
                        using var command = new MySqlCommand(alterQuery, connection);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error updating Passengers table: {ex.Message}", "DatabaseInitializer");
            }
        }

        private static bool ColumnExists(MySqlConnection connection, string tableName, string columnName)
        {
            try
            {
                string query = @"SELECT COUNT(*) 
                               FROM information_schema.columns 
                               WHERE table_schema = DATABASE() 
                               AND table_name = @tableName 
                               AND column_name = @columnName";
                
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@tableName", tableName);
                command.Parameters.AddWithValue("@columnName", columnName);
                
                int count = Convert.ToInt32(command.ExecuteScalar());
                return count > 0;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error checking if column '{columnName}' exists in table '{tableName}': {ex.Message}", "DatabaseInitializer");
                return false;
            }
        }

        private static bool TableExists(MySqlConnection connection, string tableName)
        {
            try
            {
                string query = @"SELECT COUNT(*) 
                               FROM information_schema.tables 
                               WHERE table_schema = DATABASE() 
                               AND table_name = @tableName";
                
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@tableName", tableName);
                
                int count = Convert.ToInt32(command.ExecuteScalar());
                return count > 0;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error checking if table '{tableName}' exists: {ex.Message}", "DatabaseInitializer");
                return false;
            }
        }

        private static void CreateTable(MySqlConnection connection, string tableName, string createScript)
        {
            try
            {
                using var command = new MySqlCommand(createScript, connection);
                command.ExecuteNonQuery();
                LogManager.Info($"Table '{tableName}' created successfully", "DatabaseInitializer");
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error creating table '{tableName}': {ex.Message}", "DatabaseInitializer");
                throw;
            }
        }

        private static void InsertAircraftData(MySqlConnection connection)
        {
            try
            {
                string checkQuery = "SELECT COUNT(*) FROM Aircraft";
                using (var checkCmd = new MySqlCommand(checkQuery, connection))
                {
                    if (Convert.ToInt32(checkCmd.ExecuteScalar()) > 0)
                    {
                        LogManager.Info("Aircraft data already exists", "DatabaseInitializer");
                        return;
                    }
                }

                LogManager.Info("Inserting aircraft data...", "DatabaseInitializer");

                string insertQuery = @"
                    INSERT INTO Aircraft (Model, Category, MaxPassengers, RangeNM, CruiseSpeedMPH, MaxAltitudeFt) VALUES
                    ('Gulfstream G700', 'Ultra Long Range', 19, 7500, 710, 51000),
                    ('Bombardier Global 7500', 'Ultra Long Range', 17, 7700, 716, 51000),
                    ('Dassault Falcon 8X', 'Ultra Long Range', 16, 6450, 685, 51000),
                    ('Embraer Praetor 600', 'Super Mid-Size', 12, 4018, 590, 45000),
                    ('Cessna Citation Longitude', 'Super Mid-Size', 12, 3500, 548, 45000),
                    ('Pilatus PC-24', 'Light Jet', 10, 2000, 440, 45000)";

                using var command = new MySqlCommand(insertQuery, connection);
                command.ExecuteNonQuery();
                
                LogManager.Info("Aircraft data inserted successfully", "DatabaseInitializer");
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error inserting aircraft data: {ex.Message}", "DatabaseInitializer");
            }
        }

        private static void InsertAirportData(MySqlConnection connection)
        {
            try
            {
                string checkQuery = "SELECT COUNT(*) FROM Airports";
                using (var checkCmd = new MySqlCommand(checkQuery, connection))
                {
                    if (Convert.ToInt32(checkCmd.ExecuteScalar()) > 0)
                    {
                        LogManager.Info("Airport data already exists", "DatabaseInitializer");
                        return;
                    }
                }

                LogManager.Info("Inserting airport data...", "DatabaseInitializer");

                string insertQuery = @"
                    INSERT INTO Airports (Code, Name, City, Country, Latitude, Longitude) VALUES
                    ('TLV', 'Ben Gurion Airport', 'Tel Aviv', 'Israel', 32.0055, 34.8854),
                    ('JFK', 'John F. Kennedy International', 'New York', 'USA', 40.6413, -73.7781),
                    ('LHR', 'Heathrow Airport', 'London', 'UK', 51.4700, -0.4543),
                    ('CDG', 'Charles de Gaulle Airport', 'Paris', 'France', 49.0097, 2.5479),
                    ('FCO', 'Leonardo da Vinci Airport', 'Rome', 'Italy', 41.8003, 12.2389),
                    ('DXB', 'Dubai International Airport', 'Dubai', 'UAE', 25.2532, 55.3657),
                    ('LAX', 'Los Angeles International', 'Los Angeles', 'USA', 33.9425, -118.4081),
                    ('SIN', 'Changi Airport', 'Singapore', 'Singapore', 1.3644, 103.9915),
                    ('HND', 'Haneda Airport', 'Tokyo', 'Japan', 35.5494, 139.7798),
                    ('SYD', 'Sydney Airport', 'Sydney', 'Australia', -33.9461, 151.1772)";

                using var command = new MySqlCommand(insertQuery, connection);
                command.ExecuteNonQuery();
                
                LogManager.Info("Airport data inserted successfully", "DatabaseInitializer");
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error inserting airport data: {ex.Message}", "DatabaseInitializer");
            }
        }

        private static void GenerateOptimizedFlightSchedule(MySqlConnection connection)
        {
            try
            {
                LogManager.Info("Checking flight schedule for next 60 days...", "DatabaseInitializer");

                DateTime todayStart = DateTime.Today;
                DateTime endDate = todayStart.AddDays(60);

                string existingCountQuery = @"SELECT COUNT(*) FROM Flights 
                                            WHERE DepartureTime >= @startDate 
                                            AND DepartureTime < @endDate";
                
                using (var countCmd = new MySqlCommand(existingCountQuery, connection))
                {
                    countCmd.Parameters.AddWithValue("@startDate", todayStart);
                    countCmd.Parameters.AddWithValue("@endDate", endDate);
                    int existingFlights = Convert.ToInt32(countCmd.ExecuteScalar());
                    
                    if (existingFlights > 30000)
                    {
                        LogManager.Info($"Found {existingFlights} existing flights for next 60 days. Skipping generation.", "DatabaseInitializer");
                        return;
                    }
                    else if (existingFlights > 0)
                    {
                        LogManager.Info($"Found {existingFlights} existing flights. Adding missing flights only.", "DatabaseInitializer");
                    }
                }

                string lastFlightNumberQuery = "SELECT FlightNumber FROM Flights ORDER BY FlightId DESC LIMIT 1";
                int flightNumberCounter = 1;
                
                using (var lastCmd = new MySqlCommand(lastFlightNumberQuery, connection))
                {
                    var result = lastCmd.ExecuteScalar();
                    if (result != null)
                    {
                        string? lastFlightNumber = result.ToString();
                        if (!string.IsNullOrEmpty(lastFlightNumber) && lastFlightNumber.StartsWith("AW") && int.TryParse(lastFlightNumber.Substring(2), out int lastNumber))
                        {
                            flightNumberCounter = (lastNumber % 9999) + 1;
                            if (flightNumberCounter > 9999)
                            {
                                flightNumberCounter = 1;
                            }
                        }
                    }
                }

                var aircraft = GetAircraftData(connection);
                var airports = GetAirportData(connection);
                var routes = GetAllPossibleRoutes(airports);

                Random rand = new Random();
                int flightsGenerated = 0;

                for (int day = 0; day < 60; day++)
                {
                    DateTime flightDate = todayStart.AddDays(day);
                    
                    foreach (var route in routes)
                    {
                        string checkExistingQuery = @"SELECT COUNT(*) FROM Flights f
                                                    JOIN Airports o ON f.OriginAirportId = o.AirportId
                                                    JOIN Airports d ON f.DestinationAirportId = d.AirportId
                                                    WHERE o.Code = @originCode 
                                                    AND d.Code = @destCode
                                                    AND DATE(f.DepartureTime) = @flightDate";
                        
                        using var checkCmd = new MySqlCommand(checkExistingQuery, connection);
                        checkCmd.Parameters.AddWithValue("@originCode", route.Origin);
                        checkCmd.Parameters.AddWithValue("@destCode", route.Destination);
                        checkCmd.Parameters.AddWithValue("@flightDate", flightDate.Date);
                        
                        int existingForRoute = Convert.ToInt32(checkCmd.ExecuteScalar());
                        
                        if (existingForRoute >= 5)
                        {
                            continue;
                        }

                        var origin = airports.First(a => a.Code == route.Origin);
                        var destination = airports.First(a => a.Code == route.Destination);
                        
                        double distance = CalculateDistance(origin, destination);
                        
                        var suitableAircraft = aircraft.Where(a => a.Range >= distance * 1.1).ToList();
                        
                        if (!suitableAircraft.Any()) continue;
                        
                        int flightsToGenerate = Math.Max(0, rand.Next(5, 9) - existingForRoute);
                        
                        for (int f = 0; f < flightsToGenerate; f++)
                        {
                            var selectedAircraft = suitableAircraft[rand.Next(suitableAircraft.Count)];
                            
                            int hour = rand.Next(0, 24);
                            
                            int[] possibleMinutes = { 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55 };
                            int minute = possibleMinutes[rand.Next(possibleMinutes.Length)];
                            
                            DateTime departureTime = new DateTime(flightDate.Year, flightDate.Month, flightDate.Day, hour, minute, 0);
                            
                            double flightHours = distance / selectedAircraft.CruiseSpeed;
                            DateTime arrivalTime = departureTime.AddHours(flightHours).AddMinutes(30);
                            
                            string flightNumber = $"AW{flightNumberCounter:D4}";
                            
                            decimal basePrice = CalculatePrice(distance, selectedAircraft.Category);
                            
                            decimal priceVariation = 1.0m + (rand.Next(-10, 11) / 100.0m);
                            basePrice = Math.Round(basePrice * priceVariation / 100) * 100;
                            
                            int availableSeats = rand.Next((int)(selectedAircraft.MaxPassengers * 0.8), selectedAircraft.MaxPassengers + 1);
                            
                            string insertQuery = @"
                                INSERT INTO Flights (FlightNumber, AircraftId, OriginAirportId, DestinationAirportId, 
                                                   DepartureTime, ArrivalTime, Price, AvailableSeats)
                                VALUES (@flightNumber, @aircraftId, @originId, @destId, @depart, @arrive, @price, @seats)";
                            
                            using var command = new MySqlCommand(insertQuery, connection);
                            command.Parameters.AddWithValue("@flightNumber", flightNumber);
                            command.Parameters.AddWithValue("@aircraftId", selectedAircraft.Id);
                            command.Parameters.AddWithValue("@originId", origin.Id);
                            command.Parameters.AddWithValue("@destId", destination.Id);
                            command.Parameters.AddWithValue("@depart", departureTime);
                            command.Parameters.AddWithValue("@arrive", arrivalTime);
                            command.Parameters.AddWithValue("@price", basePrice);
                            command.Parameters.AddWithValue("@seats", availableSeats);
                            
                            command.ExecuteNonQuery();
                            flightsGenerated++;
                            
                            flightNumberCounter++;
                            if (flightNumberCounter > 9999)
                            {
                                flightNumberCounter = 1;
                            }
                        }
                    }
                }
                
                if (flightsGenerated > 0)
                {
                    LogManager.Info($"Generated {flightsGenerated} new flights for next 60 days", "DatabaseInitializer");
                }
                else
                {
                    LogManager.Info("Flight schedule is up to date", "DatabaseInitializer");
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error generating optimized flight schedule: {ex.Message}", "DatabaseInitializer");
            }
        }

        private static List<(int Id, string Model, string Category, int MaxPassengers, int Range, int CruiseSpeed)> GetAircraftData(MySqlConnection connection)
        {
            var aircraft = new List<(int, string, string, int, int, int)>();
            
            string query = "SELECT AircraftId, Model, Category, MaxPassengers, RangeNM, CruiseSpeedMPH FROM Aircraft";
            using var command = new MySqlCommand(query, connection);
            using var reader = command.ExecuteReader();
            
            while (reader.Read())
            {
                aircraft.Add((
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetInt32(3),
                    reader.GetInt32(4),
                    reader.GetInt32(5)
                ));
            }
            
            return aircraft;
        }

        private static List<(int Id, string Code, double Latitude, double Longitude)> GetAirportData(MySqlConnection connection)
        {
            var airports = new List<(int, string, double, double)>();
            
            string query = "SELECT AirportId, Code, Latitude, Longitude FROM Airports";
            using var command = new MySqlCommand(query, connection);
            using var reader = command.ExecuteReader();
            
            while (reader.Read())
            {
                airports.Add((
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetDouble(2),
                    reader.GetDouble(3)
                ));
            }
            
            return airports;
        }

        private static List<(string Origin, string Destination)> GetAllPossibleRoutes(List<(int Id, string Code, double Latitude, double Longitude)> airports)
        {
            var routes = new List<(string, string)>();
            
            foreach (var origin in airports)
            {
                foreach (var destination in airports)
                {
                    if (origin.Code != destination.Code)
                    {
                        routes.Add((origin.Code, destination.Code));
                    }
                }
            }
            
            LogManager.Info($"Created {routes.Count} possible routes", "DatabaseInitializer");
            return routes;
        }

        private static double CalculateDistance(
            (int Id, string Code, double Latitude, double Longitude) origin,
            (int Id, string Code, double Latitude, double Longitude) destination)
        {
            const double R = 3440.065;
            
            double lat1Rad = origin.Latitude * Math.PI / 180;
            double lat2Rad = destination.Latitude * Math.PI / 180;
            double deltaLat = (destination.Latitude - origin.Latitude) * Math.PI / 180;
            double deltaLon = (destination.Longitude - origin.Longitude) * Math.PI / 180;
            
            double a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                      Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                      Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            
            return R * c;
        }

        private static decimal CalculatePrice(double distance, string category)
        {
            decimal baseRate = category switch
            {
                "Light Jet" => 0.8m,
                "Super Mid-Size" => 1.2m,
                "Ultra Long Range" => 1.8m,
                _ => 1.0m
            };
            
            decimal price = (decimal)distance * baseRate;
            
            return Math.Max(Math.Round(price / 50) * 50, 500);
        }

        private static void CleanupExpiredTokens(MySqlConnection connection)
        {
            try
            {
                LogManager.Info("Cleaning up expired tokens...", "DatabaseInitializer");
                
                string emailVerQuery = @"DELETE FROM EmailVerifications 
                                       WHERE ExpiryDate < NOW() AND IsUsed = FALSE";
                using (var command = new MySqlCommand(emailVerQuery, connection))
                {
                    int deletedEmail = command.ExecuteNonQuery();
                    if (deletedEmail > 0)
                    {
                        LogManager.Info($"Deleted {deletedEmail} expired email verification tokens", "DatabaseInitializer");
                    }
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error cleaning up expired tokens: {ex.Message}", "DatabaseInitializer");
            }
        }
    }
}