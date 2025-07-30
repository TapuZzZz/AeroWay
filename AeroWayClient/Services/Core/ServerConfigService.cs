using System;
using System.Net.Sockets;
using System.Threading;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services.Core
{
    public static class ServerConfigService
    {
        private static string? _serverHost;
        private static int _serverPort;
        private static bool _isConfigured = false;
        
        public static string ServerHost => _serverHost ?? "127.0.0.1";
        public static int ServerPort => _serverPort == 0 ? 8000 : _serverPort;
        public static bool IsConfigured => _isConfigured;
        
        public static bool ConfigureServer()
        {
            Console.Clear();
            DisplayConfigHeader();
            
            const int MAX_ATTEMPTS = 3;
            int attempts = 0;
            
            while (attempts < MAX_ATTEMPTS)
            {
                attempts++;
                
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine($"Connection attempt {attempts}/{MAX_ATTEMPTS}:");
                Console.ResetColor();
                
                // Get server IP
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.Write("  Server IP ");
                Console.ForegroundColor = ConsoleColor.Gray;
                Console.Write("[127.0.0.1]: ");
                Console.ForegroundColor = ConsoleColor.White;
                
                string? inputHost = Console.ReadLine();
                if (string.IsNullOrWhiteSpace(inputHost))
                {
                    inputHost = "127.0.0.1";
                }
                
                // Get server port
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.Write("  Server Port ");
                Console.ForegroundColor = ConsoleColor.Gray;
                Console.Write("[8000]: ");
                Console.ForegroundColor = ConsoleColor.White;
                
                string? inputPort = Console.ReadLine();
                int port = 8000;
                if (!string.IsNullOrWhiteSpace(inputPort))
                {
                    if (!int.TryParse(inputPort, out port) || port < 1 || port > 65535)
                    {
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("  Invalid port number. Using default port 8000.");
                        Console.ResetColor();
                        port = 8000;
                    }
                }
                
                // Test connection
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Blue;
                Console.WriteLine("  Testing connection to server...");
                Console.ResetColor();
                
                Console.ForegroundColor = ConsoleColor.DarkBlue;
                Console.WriteLine("  " + new string('─', 45));
                Console.ResetColor();
                
                if (TestServerConnection(inputHost, port))
                {
                    _serverHost = inputHost;
                    _serverPort = port;
                    _isConfigured = true;
                    
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("  ✓ Connected to AeroWay Server successfully!");
                    Console.ForegroundColor = ConsoleColor.Blue;
                    Console.WriteLine(new string('═', 75));
                    Console.ResetColor();
                    
                    LogManager.Info($"Server configured successfully: {inputHost}:{port}", "ServerConfig");
                    
                    Thread.Sleep(1500);
                    return true;
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("  ✗ Failed to connect to server");
                    Console.ResetColor();
                    
                    if (attempts < MAX_ATTEMPTS)
                    {
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine($"  You have {MAX_ATTEMPTS - attempts} attempts remaining.");
                        Console.ResetColor();
                        
                        Console.WriteLine();
                        Console.ForegroundColor = ConsoleColor.DarkBlue;
                        Console.WriteLine(new string('═', 75));
                        Console.ResetColor();
                    }
                }
            }
            
            // Failed after all attempts
            Console.Clear();
            DisplayConfigHeader();
            
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("  Failed to connect to server after 3 attempts!");
            Console.WriteLine("  Please ensure the AeroWay Server is running.");
            Console.ResetColor();
            
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("  Press any key to exit...");
            Console.ResetColor();
            Console.ReadKey();
            
            return false;
        }
        
        private static bool TestServerConnection(string host, int port)
        {
            try
            {
                LogManager.Debug($"Testing connection to {host}:{port}", "ServerConfig");
                
                using (var client = new TcpClient())
                {
                    // Set timeout to 5 seconds
                    var result = client.BeginConnect(host, port, null, null);
                    var success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromSeconds(5));
                    
                    if (!success)
                    {
                        LogManager.Warning($"Connection timeout to {host}:{port}", "ServerConfig");
                        return false;
                    }
                    
                    client.EndConnect(result);
                    
                    // Check if we can read the key exchange message
                    var stream = client.GetStream();
                    
                    // Wait for data
                    int timeout = 0;
                    while (!stream.DataAvailable && timeout < 20) // 2 seconds
                    {
                        Thread.Sleep(100);
                        timeout++;
                    }
                    
                    if (stream.DataAvailable)
                    {
                        byte[] buffer = new byte[100];
                        int bytesRead = stream.Read(buffer, 0, buffer.Length);
                        string response = System.Text.Encoding.UTF8.GetString(buffer, 0, bytesRead);
                        
                        if (response.StartsWith("KEY_EXCHANGE:"))
                        {
                            LogManager.Info($"Server validation successful - received key exchange", "ServerConfig");
                            return true;
                        }
                    }
                    
                    LogManager.Warning("Connected but no valid response from server", "ServerConfig");
                    return false;
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Connection test failed: {ex.Message}", "ServerConfig");
                return false;
            }
        }
        
        private static void DisplayConfigHeader()
        {
            Console.ForegroundColor = ConsoleColor.Blue;
            Console.WriteLine(@"
 ███████╗ ███████╗ ██████╗  ██╗   ██╗ ███████╗ ██████╗ 
 ██╔════╝ ██╔════╝ ██╔══██╗ ██║   ██║ ██╔════╝ ██╔══██╗
 ███████╗ █████╗   ██████╔╝ ██║   ██║ █████╗   ██████╔╝
 ╚════██║ ██╔══╝   ██╔══██╗ ╚██╗ ██╔╝ ██╔══╝   ██╔══██╗
 ███████║ ███████╗ ██║  ██║  ╚████╔╝  ███████╗ ██║  ██║
 ╚══════╝ ╚══════╝ ╚═╝  ╚═╝   ╚═══╝   ╚══════╝ ╚═╝  ╚═╝
                                                               
              ██████╗  ██████╗  ███╗   ██╗ ███████╗ ██╗  ██████╗ 
             ██╔════╝ ██╔═══██╗ ████╗  ██║ ██╔════╝ ██║ ██╔════╝ 
             ██║      ██║   ██║ ██╔██╗ ██║ █████╗   ██║ ██║  ███╗
             ██║      ██║   ██║ ██║╚██╗██║ ██╔══╝   ██║ ██║   ██║
             ╚██████╗ ╚██████╔╝ ██║ ╚████║ ██║      ██║ ╚██████╔╝
              ╚═════╝  ╚═════╝  ╚═╝  ╚═══╝ ╚═╝      ╚═╝  ╚═════╝ ");
            
            Console.ResetColor();
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.DarkBlue;
            Console.WriteLine(new string('═', 75));
            Console.ResetColor();
            
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("  Please enter AeroWay Server connection details:");
            Console.ResetColor();
        }
    }
}