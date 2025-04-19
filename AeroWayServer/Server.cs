using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Security.Cryptography;
using MySql.Data.MySqlClient;
using System.Diagnostics;
using AeroWayServer.utils;
using AeroWayServer.Pages;
using AeroWayServer.Pages.addons;
using System.Threading.Tasks;

namespace AeroWayServer
{
    public class Server
    {
        private TcpListener? _listener;
        private readonly Dictionary<string, SessionInfo> _activeSessions = new();
        private readonly string _connectionString = "server=localhost;database=AeroWaydb;user=root;password=TapuZ2007;";

        private readonly object _lock = new();
        
        // Define file paths for logs and metrics
        private readonly string _logFilePath;

        public Server()
        {
            // Ensure directories exist
            Directory.CreateDirectory("log");
            Directory.CreateDirectory("json");
            
            // Set file paths
            _logFilePath = Path.Combine("log", "server_log.txt");
        }

        public void StartServer()
        {
            _listener = new TcpListener(IPAddress.Any, 8000);
            _listener.Start();

            StartHttpServer();
            Log("🚀 Server is listening on port 8000...");
            while (true)
            {
                TcpClient client = _listener.AcceptTcpClient();
                Log("✅ Client connected!");
                Thread clientThread = new Thread(HandleClient);
                clientThread.Start(client);
            }
        }
        
        private void HandleClient(object? obj)
        {
            TcpClient client = (TcpClient)(obj ?? throw new ArgumentNullException(nameof(obj)));
            NetworkStream stream = client.GetStream();

            var rsa = RSA.Create();
            string serverPublicKey = rsa.ToXmlString(false);
            string serverPrivateKey = rsa.ToXmlString(true);

            string sessionId = Guid.NewGuid().ToString();
            string clientIP = ((IPEndPoint)client.Client.RemoteEndPoint!).Address.ToString();

            var sessionInfo = new SessionInfo(sessionId, clientIP);

            lock (_lock)
            {
                _activeSessions[sessionId] = sessionInfo;
            }
            Log($"✅ Session Added to Active List | Session ID: {sessionId} | IP: {clientIP}");

            try
            {
                SendServerPublicKey(stream, serverPublicKey);
                string clientPublicKey = ReceiveClientPublicKey(stream);

                Log($"🟢 Session Started with Client | Session ID: {sessionId}");

                while (true)
                {
                    string encryptedMessage, encryptedKeyIV, signature;

                    try
                    {
                        ReceiveEncryptedMessage(stream, out encryptedMessage, out encryptedKeyIV, out signature);
                    }
                    catch (Exception ex)
                    {
                        Log($"🔴 Client disconnected or error receiving message | Session ID: {sessionId} | Error: {ex.Message}");
                        break;
                    }

                    try
                    {
                        string aesKey, aesIV;
                        DecryptAESKey(encryptedKeyIV, serverPrivateKey, out aesKey, out aesIV);

                        string decryptedMessage = AESDecryption.DecryptMessage(encryptedMessage, aesKey, aesIV);

                        if (decryptedMessage == "PING")
                        {
                            lock (_lock)
                            {
                                _activeSessions[sessionId].MessageCount++;
                            }
                            continue;
                        }

                        ValidateSignature(encryptedMessage, signature, clientPublicKey);

                        lock (_lock)
                        {
                            _activeSessions[sessionId].MessageCount++;
                        }
                        Log($"📜 Received Message | Session ID: {sessionId} | Message: {decryptedMessage}");

                        string responseMessage = $"Server received: {decryptedMessage}";
                        SendEncryptedResponse(stream, responseMessage, clientPublicKey);
                    }
                    catch (Exception innerEx)
                    {
                        Log($"❌ Error handling message | Session ID: {sessionId} | Error: {innerEx.Message}");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Log($"❌ Session Error | Session ID: {sessionId} | Error: {ex.Message}");
            }
            finally
            {
                lock (_lock)
                {
                    if (_activeSessions.TryGetValue(sessionId, out var session))
                    {
                        Log($"🔌 Client disconnected | Session ID: {sessionId} | IP: {session.ClientIP} | Duration: {session.GetDuration()} | Messages: {session.MessageCount}");
                        _activeSessions.Remove(sessionId);
                    }
                    else
                    {
                        Log($"🔌 Client disconnected | Session ID: {sessionId} (Session not found)");
                    }
                }
                stream.Close();
                client.Close();
                Log($"❌ Session Removed from Active List | Session ID: {sessionId}");
            }
        }

        public void StartHttpServer()
        {
            HttpListener listener = new HttpListener();
            listener.Prefixes.Add("http://localhost:8080/");
            listener.Start();

            Log("🌐 HTTP Server is running on http://localhost:8080");

            Thread httpThread = new Thread(() =>
            {
                while (true)
                {
                    try
                    {
                        var context = listener.GetContext();
                        
                        ThreadPool.QueueUserWorkItem(state => 
                        {
                            try
                            {
                                if (state != null)
                                {
                                    HandleHttpRequest((HttpListenerContext)state);
                                }
                                else
                                {
                                    Log("❌ Error: Null context received in HTTP request handler");
                                }
                            }
                            catch (Exception ex)
                            {
                                Log($"❌ Error handling HTTP request: {ex.Message}");
                            }
                        }, context);
                    }
                    catch (Exception ex)
                    {
                        Log($"❌ Error accepting HTTP request: {ex.Message}");
                    }
                }
            });
    
            httpThread.IsBackground = true;
            httpThread.Start();
        }
        
        private void HandleHttpRequest(HttpListenerContext context)
        {
            string path = context.Request.Url!.AbsolutePath;
            string method = context.Request.HttpMethod;
            
            string responseString = "";
            bool redirect = false;
            bool apiRequest = false;
            
            try
            {
                using (var response = context.Response)
                {
                    // Add cache control headers to all responses
                    response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate");
                    response.Headers.Add("Pragma", "no-cache");
                    response.Headers.Add("Expires", "0");
                    
                    // Handle API endpoints first
                    if (path == "/api/deleteFlight")
                    {
                        apiRequest = true;
                        DeleteFlightPage.HandleDeleteFlightRequest(context, _connectionString);
                        return;
                    }
                    else if (path == "/api/getFlight")
                    {
                        apiRequest = true;
                        EditFlightPage.HandleGetFlightRequest(context, _connectionString);
                        return;
                    }
                    else if (path == "/api/updateFlight")
                    {
                        apiRequest = true;
                        EditFlightPage.HandleUpdateFlightRequest(context, _connectionString);
                        return;
                    }
                    else if (path == "/")
                    {
                        response.StatusCode = 302;
                        response.RedirectLocation = "/login";
                        redirect = true;
                    }
                    else if (path == "/login" && method == "GET")
                    {
                        responseString = LoginPage.GenerateLoginHtml(null);
                    }
                    else if (path == "/login" && method == "POST")
                    {
                        // Read form data and authenticate
                        var (username, password) = AdminLogIn.ReadLoginForm(context);
                        bool isAuthenticated = AdminLogIn.AuthenticateUser(username, password, response, _connectionString, Log);
                        
                        if (isAuthenticated)
                        {
                            // Redirect to dashboard on successful login
                            response.StatusCode = 302;
                            response.RedirectLocation = "/dashboard";
                            redirect = true;
                        }
                        else
                        {
                            // Return to login page with error message
                            responseString = LoginPage.GenerateLoginHtml("Invalid username or password.<br>Please try again.");
                        }
                    }
                    else if (path == "/logout" && method == "GET")
                    {
                        // Use AdminLogIn to handle logout
                        AdminLogIn.Logout(response);
                        
                        response.StatusCode = 302;
                        response.RedirectLocation = "/login";
                        redirect = true;
                    }
                    else
                    {
                        // All other routes require authentication
                        if (!AdminLogIn.IsSessionAuthenticated(context))
                        {
                            // User not authenticated, redirect to login
                            string ipAddress = context.Request.RemoteEndPoint.Address.ToString();
                            Log($"⚠️ Unauthorized access attempt to {path} from {ipAddress}");
                            
                            response.StatusCode = 302;
                            response.RedirectLocation = "/login";
                            redirect = true;
                        }
                        else
                        {
                            // User is authenticated, handle specific routes
                            switch (path)
                            {
                                case "/dashboard":
                                    responseString = DashboardPage.GenerateAdminHtml(_activeSessions, _connectionString);
                                    break;
                                
                                case "/database":
                                    responseString = DatabasePage.GenerateDatabaseHtml(_connectionString);
                                    break;
                                
                                case "/flightmanager":
                                    responseString = FlightManagerPage.GenerateFlightManagerHtml(_connectionString);
                                    break;
                                
                                default:
                                    // Handle 404 for pages that don't exist
                                    response.StatusCode = 404;
                                    responseString = "<h1>404 - Not Found</h1>";
                                    break;
                            }
                        }
                    }

                    // Only write response for non-API, non-redirect requests
                    if (!redirect && !apiRequest)
                    {
                        byte[] buffer = Encoding.UTF8.GetBytes(responseString);
                        response.ContentLength64 = buffer.Length;
                        response.OutputStream.Write(buffer, 0, buffer.Length);
                    }
                }
            }
            catch (Exception ex)
            {
                Log($"❌ HTTP Server Error: {ex.Message} | Stack Trace: {ex.StackTrace}");
                
                try
                {
                    if (!context.Response.OutputStream.CanWrite)
                    {
                        return; // Response already sent or closed
                    }
                    
                    context.Response.StatusCode = 500;
                    byte[] errorBuffer = Encoding.UTF8.GetBytes($"<h1>500 - Internal Server Error</h1><p>{ex.Message}</p>");
                    context.Response.ContentLength64 = errorBuffer.Length;
                    context.Response.OutputStream.Write(errorBuffer, 0, errorBuffer.Length);
                    context.Response.Close();
                }
                catch (Exception innerEx)
                {
                    Log($"❌ Failed to send error response: {innerEx.Message}");
                }
            }
        }

        private void DecryptAESKey(string encryptedKeyIV, string privateKey, out string key, out string iv)
        {
            (key, iv) = RSADecryption.DecryptAESKey(encryptedKeyIV, privateKey);
        }

        private void SendEncryptedResponse(NetworkStream stream, string responseMessage, string clientPublicKey)
        {
            var aesResult = AESEncryption.EncryptMessage(responseMessage);
            string encryptedKeyIV = RSAEncryption.EncryptAESKey(aesResult.Key, aesResult.IV, clientPublicKey);

            string finalResponse = $"{aesResult.EncryptedText}|{encryptedKeyIV}";
            byte[] responseBytes = Encoding.UTF8.GetBytes(finalResponse);
            stream.Write(responseBytes, 0, responseBytes.Length);
        }
        
        private void SendServerPublicKey(NetworkStream stream, string publicKey)
        {
            byte[] publicKeyBytes = Encoding.UTF8.GetBytes(publicKey);
            stream.Write(publicKeyBytes, 0, publicKeyBytes.Length);
            stream.Flush();
        }

        private string ReceiveClientPublicKey(NetworkStream stream)
        {
            byte[] buffer = new byte[2048];
            int bytesRead = stream.Read(buffer, 0, buffer.Length);
            string clientPublicKey = Encoding.UTF8.GetString(buffer, 0, bytesRead);
            return clientPublicKey;
        }

        private void ReceiveEncryptedMessage(NetworkStream stream, out string encryptedMessage, out string encryptedKeyIV, out string signature)
        {
            byte[] buffer = new byte[4096];
            int bytesRead = stream.Read(buffer, 0, buffer.Length);
            string receivedData = Encoding.UTF8.GetString(buffer, 0, bytesRead);
            string[] parts = receivedData.Split('|');

            if (parts.Length != 3)
                throw new Exception("Invalid message format.");

            encryptedMessage = parts[0];
            encryptedKeyIV = parts[1];
            signature = parts[2];

            Log("📥 Encrypted Message Received.");
        }

        private void ValidateSignature(string encryptedMessage, string signature, string clientPublicKey)
        {
            bool isValid = DigitalSignature.VerifySignature(encryptedMessage, signature, clientPublicKey);
            if (!isValid)
            {
                throw new Exception("Invalid signature!");
            }
        }

        private void Log(string message)
        {
            string logMessage = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}";
            Console.WriteLine(logMessage);
            
            try 
            {
                File.AppendAllText(_logFilePath, logMessage + Environment.NewLine);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error writing to log file: {ex.Message}");
            }
        }
    }
}