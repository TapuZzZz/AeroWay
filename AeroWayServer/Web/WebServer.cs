using System;
using System.IO;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using AeroWayServer.Log;
using AeroWayServer.Web.Pages;

namespace AeroWayServer.Web
{
    public class WebServer
    {
        private readonly int port;
        private IWebHost? host;
        private readonly string certPath;
        private readonly string certPassword = "AeroWaySecurePassword";
        private static bool isMainServerRunning = false;
        private static readonly object lockObject = new object();
        
        public WebServer()
        {
            port = 8080;
            certPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Web", "localhost.pfx");
            EnsureCertificateExists();
        }
        
        public static void SetMainServerRunning(bool isRunning)
        {
            lock (lockObject)
            {
                isMainServerRunning = isRunning;
                LogManager.Info($"Main server status changed to: {(isRunning ? "Running" : "Not Running")}", "WebServer");
            }
        }
        
        public static bool IsMainServerRunning()
        {
            lock (lockObject)
            {
                return isMainServerRunning;
            }
        }
        
        private void EnsureCertificateExists()
        {
            try
            {
                string webDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Web");
                if (!Directory.Exists(webDir))
                {
                    Directory.CreateDirectory(webDir);
                }
                
                if (!File.Exists(certPath))
                {
                    var process = new System.Diagnostics.Process
                    {
                        StartInfo = new System.Diagnostics.ProcessStartInfo
                        {
                            FileName = "dotnet",
                            Arguments = $"dev-certs https -ep {certPath} -p {certPassword}",
                            UseShellExecute = false,
                            RedirectStandardOutput = true,
                            RedirectStandardError = true,
                            CreateNoWindow = true
                        }
                    };
                    
                    process.Start();
                    string output = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();
                    process.WaitForExit();
                    
                    if (process.ExitCode != 0)
                    {
                        LogManager.Error($"Failed to generate development certificate: {error}", "WebServer");
                        throw new Exception("Cannot generate HTTPS certificate");
                    }
                    
                    LogManager.Info("Generated development certificate for HTTPS", "WebServer");
                    
                    process = new System.Diagnostics.Process
                    {
                        StartInfo = new System.Diagnostics.ProcessStartInfo
                        {
                            FileName = "dotnet",
                            Arguments = "dev-certs https --trust",
                            UseShellExecute = false,
                            RedirectStandardOutput = true,
                            RedirectStandardError = true,
                            CreateNoWindow = true
                        }
                    };
                    
                    process.Start();
                    output = process.StandardOutput.ReadToEnd();
                    error = process.StandardError.ReadToEnd();
                    process.WaitForExit();
                    
                    if (process.ExitCode != 0)
                    {
                        LogManager.Warning($"Failed to trust development certificate: {error}", "WebServer");
                        LogManager.Warning("You may need to trust the certificate manually", "WebServer");
                    }
                    else
                    {
                        LogManager.Info("Development certificate trusted successfully", "WebServer");
                    }
                }
                else
                {
                    LogManager.Info("Using existing development certificate", "WebServer");
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error ensuring certificate exists: {ex.Message}", "WebServer");
                LogManager.Warning("Continuing without HTTPS certificate - server will use HTTP only", "WebServer");
            }
        }
        
        public void Start()
        {
            try
            {
                TextWriter originalOut = Console.Out;
                TextWriter originalError = Console.Error;
                
                Console.SetOut(TextWriter.Null);
                Console.SetError(TextWriter.Null);
                
                host = new WebHostBuilder()
                    .UseKestrel(options =>
                    {
                        options.Listen(IPAddress.Loopback, port, listenOptions =>
                        {
                            try
                            {
                                if (File.Exists(certPath))
                                {
                                    var certificate = new X509Certificate2(certPath, certPassword);
                                    listenOptions.UseHttps(certificate);
                                    LogManager.Info("HTTPS configured successfully", "WebServer");
                                }
                                else
                                {
                                    LogManager.Warning("Certificate not found, falling back to HTTP", "WebServer");
                                }
                            }
                            catch (Exception ex)
                            {
                                LogManager.Error($"Error setting up HTTPS: {ex.Message}", "WebServer");
                                LogManager.Warning("Falling back to HTTP", "WebServer");
                            }
                        });
                    })
                    .UseContentRoot(Directory.GetCurrentDirectory())
                    .ConfigureLogging(logging => 
                    {
                        logging.ClearProviders();
                        logging.SetMinimumLevel(LogLevel.None);
                    })
                    .Configure(app =>
                    {
                        // Security Middleware - checks every request
                        app.Use((context, next) =>
                        {
                            return SecurityMiddleware(context, next);
                        });
                        
                        // Routing Middleware
                        app.Run(context =>
                        {
                            return HandleRequest(context);
                        });
                    })
                    .Build();
                
                Environment.SetEnvironmentVariable("ASPNETCORE_SUPPRESSSTATUSMESSAGES", "true");
                Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Production");
                Environment.SetEnvironmentVariable("Logging__Console__IncludeScopes", "false");
                Environment.SetEnvironmentVariable("Logging__LogLevel__Default", "None");
                Environment.SetEnvironmentVariable("Logging__LogLevel__Microsoft", "None");
                Environment.SetEnvironmentVariable("Logging__LogLevel__Microsoft.Hosting.Lifetime", "None");
                Environment.SetEnvironmentVariable("Logging__LogLevel__Microsoft.AspNetCore", "None");
                Environment.SetEnvironmentVariable("ASPNETCORE_HOSTINGSTARTUPASSEMBLIES", "");
                Environment.SetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER", "false");
                
                new Thread(() => 
                {
                    try
                    {
                        Console.SetOut(TextWriter.Null);
                        Console.SetError(TextWriter.Null);
                        
                        host!.Run();
                    }
                    catch (Exception ex)
                    {
                        LogManager.Error($"Error running web host: {ex.Message}", "WebServer");
                    }
                })
                { 
                    IsBackground = true 
                }.Start();
                
                Thread.Sleep(500);
                
                Console.SetOut(originalOut);
                Console.SetError(originalError);
                
                LogManager.Info($"HTTPS server started on port {port}", "WebServer");
            }
            catch (Exception ex)
            {
                LogManager.Error($"Failed to start web server: {ex.Message}", "WebServer");
            }
        }
        
        private Task SecurityMiddleware(HttpContext context, Func<Task> next)
        {
            string path = context.Request.Path.Value?.ToLower() ?? "/";
            string clientIP = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            
            // Log access attempt
            LogManager.Info($"Access attempt from {clientIP} to {path}", "WebServer.Security");
            
            // Check server status
            bool serverRunning = IsMainServerRunning();
            
            // Protected paths - everything except "/" requires server to be running
            string[] protectedPaths = { "/dashboard", "/database", "/flightmanager", "/admin", "/api", "/logout" };
            
            bool isProtectedPath = Array.Exists(protectedPaths, p => path.StartsWith(p));
            
            if (isProtectedPath && !serverRunning)
            {
                // Log security violation
                LogManager.Warning($"SECURITY VIOLATION: Attempt to access protected path {path} while server is locked from {clientIP}", "WebServer.Security");
                
                // Force return to security violation page
                context.Response.StatusCode = 403; // Forbidden
                context.Response.ContentType = "text/html";
                
                string securityPage = SecurityViolationPage.GetHtml(path, clientIP);
                return context.Response.WriteAsync(securityPage);
            }
            
            // If server is locked and accessing root - show lock screen
            if (!serverRunning && path == "/")
            {
                context.Response.ContentType = "text/html";
                string lockPage = LockScreenPage.GetHtml();
                return context.Response.WriteAsync(lockPage);
            }
            
            // Continue to normal handling
            return next();
        }
        
        private Task HandleRequest(HttpContext context)
        {
            string path = context.Request.Path.Value?.ToLower() ?? "/";
            
            context.Response.ContentType = "text/html";
            string responseHtml = "";
            
            // Route based on path
            switch (path)
            {
                case "/":
                case "/dashboard":
                    responseHtml = DashboardPage.GetHtml();
                    break;
                    
                case "/database":
                    responseHtml = GetDatabasePage();
                    break;
                    
                case "/flightmanager":
                    responseHtml = GetFlightManagerPage();
                    break;
                    
                case "/logout":
                    // Return server to locked state
                    SetMainServerRunning(false);
                    LogManager.Info("Server manually locked via logout", "WebServer");
                    context.Response.Redirect("/");
                    return Task.CompletedTask;
                    
                default:
                    // Use the new NotFoundPage for 404 errors
                    context.Response.StatusCode = 404;
                    responseHtml = NotFoundPage.GetHtml();
                    break;
            }
            
            return context.Response.WriteAsync(responseHtml);
        }
        
        private string GetDatabasePage()
        {
            return @"
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <title>AeroWay Database</title>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' rel='stylesheet'>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                    }
                    .container {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        padding: 40px;
                        text-align: center;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                        max-width: 600px;
                        width: 90%;
                    }
                    h1 { font-size: 2.5rem; margin-bottom: 20px; font-weight: 700; }
                    p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
                    .btn {
                        display: inline-block;
                        padding: 12px 24px;
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        text-decoration: none;
                        border-radius: 10px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                    .btn:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateY(-2px);
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h1>🗄️ Database Management</h1>
                    <p>Database interface and management tools would be implemented here.</p>
                    <a href='/dashboard' class='btn'>← Back to Dashboard</a>
                </div>
            </body>
            </html>";
        }
        
        private string GetFlightManagerPage()
        {
            return @"
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <title>AeroWay Flight Manager</title>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' rel='stylesheet'>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', sans-serif;
                        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #333;
                    }
                    .container {
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        padding: 40px;
                        text-align: center;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                        max-width: 600px;
                        width: 90%;
                    }
                    h1 { font-size: 2.5rem; margin-bottom: 20px; font-weight: 700; color: #2d3748; }
                    p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.8; }
                    .btn {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #667eea;
                        color: white;
                        text-decoration: none;
                        border-radius: 10px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    }
                    .btn:hover {
                        background: #5a67d8;
                        transform: translateY(-2px);
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h1>✈️ Flight Manager</h1>
                    <p>Flight scheduling, management and tracking tools would be implemented here.</p>
                    <a href='/dashboard' class='btn'>← Back to Dashboard</a>
                </div>
            </body>
            </html>";
        }
        
        public void Stop()
        {
            try
            {
                Console.SetOut(TextWriter.Null);
                Console.SetError(TextWriter.Null);
                
                if (host != null)
                {
                    host.StopAsync().Wait();
                    host.Dispose();
                    LogManager.Info("Web server stopped successfully", "WebServer");
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error stopping web server: {ex.Message}", "WebServer");
                LogManager.Warning("Web server may not have stopped cleanly", "WebServer");
            }
        }
    }
}