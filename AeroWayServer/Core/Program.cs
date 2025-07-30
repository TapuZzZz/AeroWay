using System;
using System.Threading;
using System.Net;
using System.Text;
using MySql.Data.MySqlClient;
using AeroWayServer.Log;
using AeroWayServer.Web;
using AeroWayServer.Database;

namespace AeroWayServer.Core
{
    class Program
    {
        private static WebServer? webServer = null;
        private static bool serverRunning = false;
        private static bool shouldExit = false;
        
        static void Main(string[] args)
        {
            Console.CancelKeyPress += (sender, e) => {
                e.Cancel = true;
                
                if (serverRunning)
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.Write("  ⚠ ");
                    Console.ForegroundColor = ConsoleColor.DarkYellow;
                    Console.WriteLine("Shutting down server...");
                    Console.ResetColor();
                    
                    StopServer();
                    
                    Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.Write("  ✓ ");
                    Console.ForegroundColor = ConsoleColor.DarkGreen;
                    Console.WriteLine("Server has been shut down successfully!");
                    Console.ResetColor();
                    
                    Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.WriteLine("  Application is shutting down...");
                    Console.ResetColor();
                    
                    Thread.Sleep(800);
                    Environment.Exit(0);
                }
                else
                {
                    shouldExit = true;
                    Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.WriteLine("  Application is shutting down...");
                    Console.ResetColor();
                    Thread.Sleep(500);
                    Environment.Exit(0);
                }
            };

            int globalAttempts = 0;
            
            while (!shouldExit)
            {
                Console.Clear();
                
                DisplayTitle(false);
                System.Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.DarkMagenta;
                Console.WriteLine(new string('═', 75));
                Console.ResetColor();
                
                const string DEFAULT_SQL_SERVER = "127.0.0.1";
                const string DEFAULT_SQL_USER = "root";
                const string DEFAULT_SQL_PASSWORD = "TapuZ2007";
                const string DEFAULT_SQL_DATABASE = "AeroWay";
                const int DEFAULT_PORT = 8000;
                
                string sqlServer = DEFAULT_SQL_SERVER;
                string sqlUser = DEFAULT_SQL_USER;
                string sqlPassword = DEFAULT_SQL_PASSWORD;
                string sqlDatabase = DEFAULT_SQL_DATABASE;
                int serverPort = DEFAULT_PORT;
                
                const int MAX_ATTEMPTS = 5;
                int attempts = 0;
                bool connectionSuccessful = false;
                
                StartWebServer();
                
                while (attempts < MAX_ATTEMPTS && !connectionSuccessful && !shouldExit)
                {
                    attempts++;
                    globalAttempts++;
                    
                    sqlServer = DEFAULT_SQL_SERVER;
                    sqlUser = DEFAULT_SQL_USER;
                    sqlPassword = DEFAULT_SQL_PASSWORD;
                    sqlDatabase = DEFAULT_SQL_DATABASE;
                    
                    Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.WriteLine($"Connection attempt {attempts}/{MAX_ATTEMPTS}:");
                    Console.ResetColor();
                    
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.Write("  ");
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    Console.Write("SQL Server ");
                    Console.ForegroundColor = ConsoleColor.Gray;
                    Console.Write($"[{DEFAULT_SQL_SERVER}]: ");
                    Console.ForegroundColor = ConsoleColor.White;
                    string input = ReadFilteredInput();
                    Console.ResetColor();
                    if (!string.IsNullOrEmpty(input))
                    {
                        sqlServer = input;
                    }
                    
                    if (shouldExit) break;
                    
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.Write("  ");
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    Console.Write("SQL User ");
                    Console.ForegroundColor = ConsoleColor.Gray;
                    Console.Write($"[{DEFAULT_SQL_USER}]: ");
                    Console.ForegroundColor = ConsoleColor.White;
                    input = ReadFilteredInput();
                    Console.ResetColor();
                    if (!string.IsNullOrEmpty(input))
                    {
                        sqlUser = input;
                    }
                    
                    if (shouldExit) break;
                    
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.Write("  ");
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    Console.Write("SQL Password ");
                    Console.ForegroundColor = ConsoleColor.Gray;
                    Console.Write($"[{DEFAULT_SQL_PASSWORD}]: ");
                    Console.ForegroundColor = ConsoleColor.White;
                    input = ReadFilteredPassword();
                    Console.ResetColor();
                    if (!string.IsNullOrEmpty(input))
                    {
                        sqlPassword = input;
                    }
                    
                    if (shouldExit) break;
                    
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.Write("  ");
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    Console.Write("SQL Database ");
                    Console.ForegroundColor = ConsoleColor.Gray;
                    Console.Write($"[{DEFAULT_SQL_DATABASE}]: ");
                    Console.ForegroundColor = ConsoleColor.White;
                    input = ReadFilteredInput();
                    Console.ResetColor();
                    if (!string.IsNullOrEmpty(input))
                    {
                        sqlDatabase = input;
                    }
                    
                    if (shouldExit) break;
                    
                    Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.Blue;
                    Console.WriteLine("Testing connection...");
                    Console.ResetColor();
                    
                    Console.ForegroundColor = ConsoleColor.Blue;
                    Console.WriteLine(new string('─', 45));
                    Console.ResetColor();
                    
                    if (TestDatabaseConnection(sqlServer, sqlUser, sqlPassword, sqlDatabase))
                    {
                        connectionSuccessful = true;
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("Connected to MySQL successfully.");
                        Console.ResetColor();
                        
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.WriteLine("Initializing database tables...");
                        Console.ResetColor();
                        
                        if (DatabaseInitializer.InitializeDatabase(sqlServer, sqlUser, sqlPassword, sqlDatabase))
                        {
                            Console.ForegroundColor = ConsoleColor.Green;
                            Console.WriteLine("Database tables initialized successfully.");
                            Console.ResetColor();
                        }
                        else
                        {
                            Console.ForegroundColor = ConsoleColor.Yellow;
                            Console.WriteLine("Warning: Some database tables may not have been initialized properly.");
                            Console.WriteLine("Check the log file for details.");
                            Console.ResetColor();
                        }
                        
                        Console.ForegroundColor = ConsoleColor.DarkMagenta;
                        Console.WriteLine(new string('═', 75));
                        Console.ResetColor();
                        
                        Console.ForegroundColor = ConsoleColor.White;
                        Console.Write("  ");
                        Console.ForegroundColor = ConsoleColor.Magenta;
                        Console.Write("Server Port ");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.Write($"[{DEFAULT_PORT}]: ");
                        Console.ForegroundColor = ConsoleColor.White;
                        input = ReadFilteredInput();
                        Console.ResetColor();

                        if (!string.IsNullOrEmpty(input) && int.TryParse(input, out int customPort))
                        {
                            if (customPort > 0 && customPort < 65536)
                            {
                                serverPort = customPort;
                            }
                            else
                            {
                                Console.ForegroundColor = ConsoleColor.Yellow;
                                Console.WriteLine($"Invalid port number. Using default port {DEFAULT_PORT}.");
                                Console.ResetColor();
                            }
                        }

                        if (shouldExit) break;

                        bool portAvailable = false;
                        while (!portAvailable && !shouldExit)
                        {
                            if (IsPortAvailable(serverPort))
                            {
                                portAvailable = true;
                                Console.ForegroundColor = ConsoleColor.DarkMagenta;
                                Console.WriteLine(new string('═', 75));
                                Console.ResetColor();
                            }
                            else
                            {
                                Console.ForegroundColor = ConsoleColor.Red;
                                Console.WriteLine($"Port {serverPort} is already in use.");
                                Console.ResetColor();
                                
                                Console.ForegroundColor = ConsoleColor.White;
                                Console.Write("  ");
                                Console.ForegroundColor = ConsoleColor.Magenta;
                                Console.Write("Try another port? (Y/N): ");
                                Console.ForegroundColor = ConsoleColor.White;
                                string response = ReadFilteredInput().ToUpper();
                                
                                if (response != "Y")
                                {
                                    Console.WriteLine("Server startup aborted.");
                                    shouldExit = true;
                                    break;
                                }
                                
                                bool validPortEntered = false;
                                while (!validPortEntered && !shouldExit)
                                {
                                    Console.ForegroundColor = ConsoleColor.White;
                                    Console.Write("  ");
                                    Console.ForegroundColor = ConsoleColor.Magenta;
                                    Console.Write("Enter new port: ");
                                    Console.ForegroundColor = ConsoleColor.White;
                                    input = ReadFilteredInput();
                                    Console.ResetColor();
                                    
                                    if (!string.IsNullOrEmpty(input) && int.TryParse(input, out int newPort))
                                    {
                                        if (newPort > 0 && newPort < 65536)
                                        {
                                            serverPort = newPort;
                                            validPortEntered = true;
                                        }
                                        else
                                        {
                                            Console.ForegroundColor = ConsoleColor.Red;
                                            Console.WriteLine("Invalid port number. Please enter a number between 1 and 65535.");
                                            Console.ResetColor();
                                        }
                                    }
                                    else
                                    {
                                        Console.ForegroundColor = ConsoleColor.Red;
                                        Console.WriteLine("Invalid input. Please enter a valid port number.");
                                        Console.ResetColor();
                                    }
                                }
                            }
                        }

                        if (shouldExit) break;

                        Thread.Sleep(1200);
                        
                        PlayMatrixAnimation();
                        
                        Console.Clear();
                        
                        DisplayTitle(true);
                        System.Console.WriteLine();
                        Console.ForegroundColor = ConsoleColor.DarkMagenta;
                        Console.WriteLine(new string('═', 75));
                        Console.ResetColor();
                        
                        int boxWidth = 75;
                        
                        Console.WriteLine();
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("      ✓ Server initialized successfully!");
                        Console.ResetColor();
                        
                        Console.ForegroundColor = ConsoleColor.Magenta;
                        Console.WriteLine($"      Now listening for connections on port {serverPort}...");
                        Console.ResetColor();
                        
                        Console.WriteLine();
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("      System Information:");
                        Console.ForegroundColor = ConsoleColor.DarkMagenta;
                        Console.WriteLine("      " + new string('─', 45));
                        Console.ResetColor();
                        
                        Console.Write("      ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("• ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("SQL Database: ");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.WriteLine($"{sqlDatabase}");
                        
                        Console.Write("      ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("• ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("SQL Server Address: ");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.WriteLine($"{sqlServer}");
                        
                        Console.Write("      ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("• ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("SQL User: ");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.WriteLine($"{sqlUser}");
                        
                        Console.Write("      ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("• ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("Server Port: ");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.WriteLine($"{serverPort}");
                        
                        Console.Write("      ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("• ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("Connection Attempts: ");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.WriteLine($"{globalAttempts}");
                        
                        Console.Write("      ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("• ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("Current Time: ");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")}");
                        
                        Console.Write("      ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("• ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("Log File: ");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.WriteLine($"AeroWayServer/Log/AeroWayServerLog.txt");
                        
                        Console.Write("      ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("• ");
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("Web UI: ");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.WriteLine("https://localhost:8080/");
                        Console.ResetColor();
                        
                        Console.WriteLine();
                        Console.ForegroundColor = ConsoleColor.Magenta;
                        for (int i = 0; i < boxWidth; i++)
                        {
                            if (i % 2 == 0)
                                Console.Write("•");
                            else
                                Console.Write("◦");
                        }
                        Console.ResetColor();

                        Console.WriteLine();
                        
                        string indent = "                 ";

                        Console.ForegroundColor = ConsoleColor.DarkMagenta;
                        Console.WriteLine($"{indent}╭────────────────────────────────────╮");
                        Console.WriteLine($"{indent}│           SERVER ACTIVE            │");
                        Console.WriteLine($"{indent}│                                    │");
                        Console.WriteLine($"{indent}│        Press Ctrl+C to exit        │");
                        Console.WriteLine($"{indent}╰────────────────────────────────────╯");
                        Console.ResetColor();
                        
                        Console.ForegroundColor = ConsoleColor.Magenta;
                        for (int i = 0; i < boxWidth; i++)
                        {
                            if (i % 2 == 0)
                                Console.Write("•");
                            else
                                Console.Write("◦");
                        }
                        Console.ResetColor();
                        Console.WriteLine("\n");
                        
                        try
                        {
                            LogManager.Info("================================", "Server");
                            LogManager.Info("======== SERVER STARTED ========", "Server");
                            LogManager.Info("================================", "Server");
                            LogManager.Info($"SQL Database: {sqlDatabase}", "Server");
                            LogManager.Info($"SQL Server: {sqlServer}", "Server");
                            LogManager.Info($"SQL User: {sqlUser}", "Server");
                            LogManager.Info($"Server Port: {serverPort}", "Server");
                            LogManager.Info($"Connection Attempts: {globalAttempts}", "Server");
                            LogManager.Info($"Server started at: {DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}", "Server");
                            LogManager.Info("================================", "Server");
                        }
                        catch (Exception logEx)
                        {
                            LogManager.Error($"Error writing startup logs: {logEx.Message}", "Server");
                        }
                        
                        serverRunning = true;
                        ConnectionListener.Start(sqlServer, sqlUser, sqlPassword, sqlDatabase, serverPort);
                        
                        while (!shouldExit)
                        {
                            Thread.Sleep(500);
                        }
                        
                        break;
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("Failed to connect to MySQL.");
                        Console.ResetColor();
                        
                        if (attempts < MAX_ATTEMPTS)
                        {
                            Console.ForegroundColor = ConsoleColor.Yellow;
                            Console.WriteLine($"You have {MAX_ATTEMPTS - attempts} attempts remaining.");
                            Console.ResetColor();

                            System.Console.WriteLine();
                            Console.ForegroundColor = ConsoleColor.DarkMagenta;
                            Console.WriteLine(new string('═', 75));
                            Console.ResetColor();
                        }
                    }
                }
                
                if (!connectionSuccessful && !shouldExit)
                {
                    Console.Clear();
                    DisplayTitle(false);
                    System.Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.DarkMagenta;
                    Console.WriteLine(new string('═', 75));
                    Console.ResetColor();
                    
                    Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Too many failed connection attempts!");
                    Console.WriteLine("Waiting 5 minutes before allowing more attempts...");
                    Console.ResetColor();
                    
                    const int COOLDOWN_MINUTES = 5;
                    int secondsLeft = COOLDOWN_MINUTES * 60;
                    
                    while (secondsLeft > 0 && !shouldExit)
                    {
                        int minutes = secondsLeft / 60;
                        int seconds = secondsLeft % 60;
                        
                        Console.SetCursorPosition(0, Console.CursorTop);
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.Write($"Time remaining: {minutes:D2}:{seconds:D2}     ");
                        Console.ResetColor();
                        
                        Thread.Sleep(1000);
                        secondsLeft--;
                    }
                    
                    if (!shouldExit)
                    {
                        Console.WriteLine("\nYou can try connecting again.");
                        Console.ForegroundColor = ConsoleColor.Magenta;
                        Console.WriteLine("Press any key to continue...");
                        Console.ResetColor();
                        Console.ReadKey();
                    }
                }
                
                if (shouldExit)
                {
                    if (serverRunning)
                    {
                        StopServer();
                    }
                    break;
                }
            }
        }
        
        private static void StartWebServer()
        {
            try
            {
                webServer = new WebServer();
                webServer.Start();
                WebServer.SetMainServerRunning(false);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Failed to start Web UI: {ex.Message}", "Program");
            }
        }
        
        private static void StopServer()
        {
            try
            {
                if (webServer != null)
                {
                    webServer.Stop();
                }
                
                LogManager.Info("Server has been shut down", "Program");
                
                serverRunning = false;
                WebServer.SetMainServerRunning(false);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error during shutdown: {ex.Message}", "Program");
            }
        }
        
        private static bool TestDatabaseConnection(string server, string user, string password, string database)
        {
            try
            {
                using var conn = new MySqlConnection(
                    $"server={server};user={user};password={password};database={database};");
                conn.Open();
                return true;
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"Connection error: {ex.Message}");
                Console.ResetColor();
                return false;
            }
        }

        private static bool IsPortAvailable(int port)
        {
            try
            {
                using (var socket = new System.Net.Sockets.Socket(
                    System.Net.Sockets.AddressFamily.InterNetwork, 
                    System.Net.Sockets.SocketType.Stream, 
                    System.Net.Sockets.ProtocolType.Tcp))
                {
                    socket.Bind(new System.Net.IPEndPoint(System.Net.IPAddress.Any, port));
                    socket.Close();
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void DisplayTitle(bool active = false)
        {
            Console.ForegroundColor = ConsoleColor.DarkMagenta;
            Console.WriteLine(@"
 ██████╗  ███████╗ ██████╗   ██████╗  ██╗    ██╗  █████╗  ██╗   ██╗
 ██╔══██╗ ██╔════╝ ██╔══██╗ ██╔═══██╗ ██║    ██║ ██╔══██╗ ╚██╗ ██╔╝
 ███████║ █████╗   ██████╔╝ ██║   ██║ ██║ █╗ ██║ ███████║  ╚████╔╝ 
 ██╔══██║ ██╔══╝   ██╔══██╗ ██║   ██║ ██║███╗██║ ██╔══██║   ╚██╔╝  
 ██║  ██║ ███████╗ ██║  ██║ ╚██████╔╝ ╚███╔███╔╝ ██║  ██║    ██║   
 ╚═╝  ╚═╝ ╚══════╝ ╚═╝  ╚═╝  ╚═════╝   ╚══╝╚══╝  ╚═╝  ╚═╝    ╚═╝   
                                                               
            ███████╗ ███████╗ ██████╗  ██╗   ██╗ ███████╗ ██████╗ 
            ██╔════╝ ██╔════╝ ██╔══██╗ ██║   ██║ ██╔════╝ ██╔══██╗
            ███████╗ █████╗   ██████╔╝ ██║   ██║ █████╗   ██████╔╝
            ╚════██║ ██╔══╝   ██╔══██╗ ╚██╗ ██╔╝ ██╔══╝   ██╔══██╗
            ███████║ ███████╗ ██║  ██║  ╚████╔╝  ███████╗ ██║  ██║
            ╚══════╝ ╚══════╝ ╚═╝  ╚═╝   ╚═══╝   ╚══════╝ ╚═╝  ╚═╝");
            
            Console.ResetColor();
        }

        private static void PlayMatrixAnimation()
        {
            try
            {
                char[] matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,./<>?".ToCharArray();
                
                int width = Console.WindowWidth;
                int height = Console.WindowHeight;
                
                int fullWidth = width;
                
                Random random = new Random();
                
                int[] tails = new int[fullWidth];
                
                int[] speed = new int[fullWidth];
                
                for (int i = 0; i < fullWidth; i++)
                {
                    tails[i] = random.Next(-height, 0);
                    speed[i] = random.Next(1, 5);
                }
                
                Console.Clear();
                
                DateTime endTime = DateTime.Now.AddSeconds(2);
                
                ConsoleColor[] colors = { ConsoleColor.Blue, ConsoleColor.DarkBlue, ConsoleColor.Magenta, ConsoleColor.DarkMagenta };
                
                while (DateTime.Now < endTime && !shouldExit)
                {
                    for (int x = 0; x < fullWidth; x++)
                    {
                        tails[x] += speed[x];
                        
                        if (tails[x] >= height)
                        {
                            tails[x] = random.Next(-height, 0);
                            speed[x] = random.Next(1, 5);
                            continue;
                        }
                        
                        if (tails[x] < 0)
                            continue;
                        
                        for (int y = 0; y < height; y++)
                        {
                            int charPosition = tails[x] - y;
                            
                            try
                            {
                                if (charPosition >= 0 && charPosition < height)
                                {
                                    Console.SetCursorPosition(x, charPosition);
                                    
                                    if (y == 0)
                                    {
                                        Console.ForegroundColor = ConsoleColor.Blue;
                                        Console.Write(matrixChars[random.Next(matrixChars.Length)]);
                                    }
                                    else if (y < 5)
                                    {
                                        Console.ForegroundColor = ConsoleColor.Magenta;
                                        Console.Write(matrixChars[random.Next(matrixChars.Length)]);
                                    }
                                    else if (y < 15 && charPosition < height - 1)
                                    {
                                        Console.ForegroundColor = colors[random.Next(colors.Length)];
                                        Console.Write(matrixChars[random.Next(matrixChars.Length)]);
                                    }
                                    else if (charPosition < height - 1)
                                    {
                                        Console.Write(" ");
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                LogManager.Error($"Matrix animation error: {ex.Message}", "Program");
                            }
                        }
                    }
                    
                    Thread.Sleep(50);
                }
                
                Console.Clear();
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error in matrix animation: {ex.Message}", "Program");
                Thread.Sleep(1000);
                Console.Clear();
            }
        }

        private static string ReadFilteredInput()
        {
            string input = "";
            ConsoleKeyInfo key;
            
            try
            {
                while (true)
                {
                    key = Console.ReadKey(true);
                    
                    if (key.Key == ConsoleKey.Enter)
                    {
                        Console.WriteLine();
                        return input;
                    }
                    else if (key.Key == ConsoleKey.Escape || (key.Key == ConsoleKey.C && key.Modifiers == ConsoleModifiers.Control))
                    {
                        shouldExit = true;
                        return "";
                    }
                    else if (key.Key == ConsoleKey.Backspace && input.Length > 0)
                    {
                        input = input.Substring(0, input.Length - 1);
                        Console.Write("\b \b");
                    }
                    else if ((key.KeyChar >= 'a' && key.KeyChar <= 'z') || 
                             (key.KeyChar >= 'A' && key.KeyChar <= 'Z') || 
                             (key.KeyChar >= '0' && key.KeyChar <= '9') || 
                             char.IsPunctuation(key.KeyChar) || 
                             char.IsSymbol(key.KeyChar) || 
                             key.KeyChar == ' ' || 
                             key.KeyChar == '.' || 
                             key.KeyChar == '-' || 
                             key.KeyChar == '_')
                    {
                        input += key.KeyChar;
                        Console.Write(key.KeyChar);
                    }
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error reading input: {ex.Message}", "Program");
                return input;
            }
        }
        
        private static string ReadFilteredPassword()
        {
            string password = "";
            ConsoleKeyInfo key;
            
            try
            {
                do
                {
                    key = Console.ReadKey(true);
                    
                    if (key.Key == ConsoleKey.Enter)
                    {
                        Console.WriteLine();
                        return password;
                    }
                    else if (key.Key == ConsoleKey.Escape || (key.Key == ConsoleKey.C && key.Modifiers == ConsoleModifiers.Control))
                    {
                        shouldExit = true;
                        return "";
                    }
                    else if (key.Key == ConsoleKey.Backspace && password.Length > 0)
                    {
                        password = password.Substring(0, password.Length - 1);
                        Console.Write("\b \b");
                    }
                    else if ((key.KeyChar >= 'a' && key.KeyChar <= 'z') || 
                            (key.KeyChar >= 'A' && key.KeyChar <= 'Z') || 
                            (key.KeyChar >= '0' && key.KeyChar <= '9') || 
                            char.IsPunctuation(key.KeyChar) || 
                            char.IsSymbol(key.KeyChar) || 
                            key.KeyChar == ' ' || 
                            key.KeyChar == '.' || 
                            key.KeyChar == '-' || 
                            key.KeyChar == '_')
                    {
                        password += key.KeyChar;
                        Console.Write("*");
                    }
                } while (true);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error reading password: {ex.Message}", "Program");
                return password;
            }
        }
    }
}