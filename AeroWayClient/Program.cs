using System;
using System.Threading;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using AeroWayClient.Services.Log;
using AeroWayClient.Services.Core;
using AeroWayClient.Middleware;

// First, configure server connection
Console.Clear();
if (!ServerConfigService.ConfigureServer())
{
    Environment.Exit(1);
}

// Play Matrix animation after successful connection
PlayMatrixAnimation();

var builder = WebApplication.CreateBuilder(args);

// Disable all default console logging
builder.Logging.ClearProviders();
builder.Logging.SetMinimumLevel(LogLevel.None);

// Suppress Kestrel console output
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.AddServerHeader = false;
});

// Disable hosting startup messages
builder.WebHost.UseSetting(WebHostDefaults.SuppressStatusMessagesKey, "true");
Environment.SetEnvironmentVariable("ASPNETCORE_SUPPRESSSTATUSMESSAGES", "true");

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add session support
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Suppress all console output during build
Console.SetOut(TextWriter.Null);
Console.SetError(TextWriter.Null);

var app = builder.Build();

// Restore console output after build
var standardOutput = new StreamWriter(Console.OpenStandardOutput());
standardOutput.AutoFlush = true;
Console.SetOut(standardOutput);

// Clear console and display startup
DisplayStartupBanner();
System.Console.WriteLine();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// HTTPS redirection - only if we have HTTPS configured
if (app.Configuration["ASPNETCORE_URLS"]?.Contains("https") == true)
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseTempDataCleanup();
app.UseRouting();
app.UseSession();
app.UseAuthorization();


app.MapControllerRoute(
    name: "emailVerification",
    pattern: "verify-email",
    defaults: new { controller = "EmailVerification", action = "Verify" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Custom startup complete message
DisplayRunningStatus();

// Redirect console output to null again before running
Console.SetOut(TextWriter.Null);
Console.SetError(TextWriter.Null);

try
{
    app.Run();
}
finally
{
    // Restore console for shutdown message
    Console.SetOut(standardOutput);
    DisplayShutdownMessage();
}

static void PlayMatrixAnimation()
{
    try
    {
        // Matrix characters - includes Hebrew letters for unique effect
        char[] matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,./<>?אבגדהוזחטיכלמנסעפצקרשת".ToCharArray();
        
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
        
        // Cyan and Dark Blue color scheme
        ConsoleColor[] colors = { ConsoleColor.Cyan, ConsoleColor.DarkCyan, ConsoleColor.DarkBlue, ConsoleColor.Blue };
        
        while (DateTime.Now < endTime)
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
                                // Bright cyan leading character
                                Console.ForegroundColor = ConsoleColor.Cyan;
                                Console.Write(matrixChars[random.Next(matrixChars.Length)]);
                            }
                            else if (y < 3)
                            {
                                // Cyan for near-leading chars
                                Console.ForegroundColor = ConsoleColor.Cyan;
                                Console.Write(matrixChars[random.Next(matrixChars.Length)]);
                            }
                            else if (y < 8)
                            {
                                // Dark Blue for middle section
                                Console.ForegroundColor = ConsoleColor.DarkBlue;
                                Console.Write(matrixChars[random.Next(matrixChars.Length)]);
                            }
                            else if (y < 15 && charPosition < height - 1)
                            {
                                // Random colors from array for tail
                                Console.ForegroundColor = colors[random.Next(colors.Length)];
                                Console.Write(matrixChars[random.Next(matrixChars.Length)]);
                            }
                            else if (charPosition < height - 1)
                            {
                                Console.Write(" ");
                            }
                        }
                    }
                    catch
                    {
                        // Silently handle any cursor position errors
                    }
                }
            }
            
            Thread.Sleep(50);
        }
        
        Console.Clear();
    }
    catch (Exception ex)
    {
        LogManager.Error($"Error in matrix animation: {ex.Message}", "ClientStartup");
        Thread.Sleep(1000);
        Console.Clear();
    }
}

static void DisplayStartupBanner()
{
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.WriteLine(@"
 ██████╗  ███████╗ ██████╗   ██████╗  ██╗    ██╗  █████╗  ██╗   ██╗
 ██╔══██╗ ██╔════╝ ██╔══██╗ ██╔═══██╗ ██║    ██║ ██╔══██╗ ╚██╗ ██╔╝
 ███████║ █████╗   ██████╔╝ ██║   ██║ ██║ █╗ ██║ ███████║  ╚████╔╝ 
 ██╔══██║ ██╔══╝   ██╔══██╗ ██║   ██║ ██║███╗██║ ██╔══██║   ╚██╔╝  
 ██║  ██║ ███████╗ ██║  ██║ ╚██████╔╝ ╚███╔███╔╝ ██║  ██║    ██║   
 ╚═╝  ╚═╝ ╚══════╝ ╚═╝  ╚═╝  ╚═════╝   ╚══╝╚══╝  ╚═╝  ╚═╝    ╚═╝   
                                                               
            ███████╗ ██╗      ██╗ ███████╗ ███╗   ██╗ ████████╗
            ██╔════╝ ██║      ██║ ██╔════╝ ████╗  ██║ ╚══██╔══╝
            ██║      ██║      ██║ █████╗   ██╔██╗ ██║    ██║   
            ██║      ██║      ██║ ██╔══╝   ██║╚██╗██║    ██║   
            ╚██████╗ ███████╗ ██║ ███████╗ ██║ ╚████║    ██║   
             ╚═════╝ ╚══════╝ ╚═╝ ╚══════╝ ╚═╝  ╚═══╝    ╚═╝   ");
    
    Console.ResetColor();
}

static void DisplayRunningStatus()
{
    Console.ForegroundColor = ConsoleColor.DarkBlue;
    Console.WriteLine("═══════════════════════════════════════════════════════════════════════════");
    Console.ResetColor();
    
    Console.WriteLine();
    Console.ForegroundColor = ConsoleColor.Cyan;
    Console.WriteLine("      ✓ Client Web Server initialized successfully!");
    Console.ResetColor();
    
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.WriteLine("      Now listening on:");
    Console.ForegroundColor = ConsoleColor.Gray;
    Console.WriteLine("      • https://localhost:5050");
    Console.WriteLine("      • http://localhost:5000");
    Console.ResetColor();
    
    Console.WriteLine();
    Console.ForegroundColor = ConsoleColor.Cyan;
    Console.WriteLine("      System Information:");
    Console.ForegroundColor = ConsoleColor.DarkBlue;
    Console.WriteLine("      ─────────────────────────────────────────────");
    Console.ResetColor();
    
    Console.Write("      ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("• ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("Environment: ");
    Console.ForegroundColor = ConsoleColor.Gray;
    Console.WriteLine("Development");
    
    Console.Write("      ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("• ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("Server Connected: ");
    Console.ForegroundColor = ConsoleColor.Gray;
    Console.WriteLine($"{ServerConfigService.ServerHost}:{ServerConfigService.ServerPort}");
    
    Console.Write("      ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("• ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("Log File: ");
    Console.ForegroundColor = ConsoleColor.Gray;
    Console.WriteLine("Logs/AeroWayClientLog.txt");
    
    Console.Write("      ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("• ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("Start Time: ");
    Console.ForegroundColor = ConsoleColor.Gray;
    Console.WriteLine(DateTime.Now.ToString("HH:mm:ss"));
    
    Console.Write("      ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("• ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("Process ID: ");
    Console.ForegroundColor = ConsoleColor.Gray;
    Console.WriteLine(Environment.ProcessId);
    
    Console.Write("      ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write("• ");
    Console.ForegroundColor = ConsoleColor.Blue;
    Console.Write(".NET Version: ");
    Console.ForegroundColor = ConsoleColor.Gray;
    Console.WriteLine(Environment.Version);
    
    Console.ResetColor();
    
    Console.WriteLine();
    Console.ForegroundColor = ConsoleColor.Blue;
    for (int i = 0; i < 75; i++)
    {
        if (i % 2 == 0)
            Console.Write("•");
        else
            Console.Write("◦");
    }
    Console.ResetColor();
    Console.WriteLine();
    
    string indent = "                 ";
    Console.ForegroundColor = ConsoleColor.DarkBlue;
    Console.WriteLine($"{indent}╭────────────────────────────────────╮");
    Console.WriteLine($"{indent}│          CLIENT ACTIVE             │");
    Console.WriteLine($"{indent}│                                    │");
    Console.WriteLine($"{indent}│        Press Ctrl+C to exit        │");
    Console.WriteLine($"{indent}╰────────────────────────────────────╯");
    Console.ResetColor();
    
    Console.ForegroundColor = ConsoleColor.Blue;
    for (int i = 0; i < 75; i++)
    {
        if (i % 2 == 0)
            Console.Write("•");
        else
            Console.Write("◦");
    }
    Console.ResetColor();
    Console.WriteLine("\n");
    
    // Log startup to file only - no console output
    LogManager.Info("================================", "ClientStartup");
    LogManager.Info("======== CLIENT STARTED ========", "ClientStartup");
    LogManager.Info("================================", "ClientStartup");
    LogManager.Info($"HTTPS: https://localhost:5050", "ClientStartup");
    LogManager.Info($"HTTP: http://localhost:5000", "ClientStartup");
    LogManager.Info($"Started at: {DateTime.Now:yyyy-MM-dd HH:mm:ss}", "ClientStartup");
    LogManager.Info("================================", "ClientStartup");
}

static void DisplayShutdownMessage()
{
    Console.WriteLine();
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.Write("  ⚠ ");
    Console.ForegroundColor = ConsoleColor.DarkYellow;
    Console.WriteLine("Shutting down client...");
    Console.ResetColor();
    
    Thread.Sleep(500);
    
    Console.WriteLine();
    Console.ForegroundColor = ConsoleColor.Green;
    Console.Write("  ✓ ");
    Console.ForegroundColor = ConsoleColor.DarkGreen;
    Console.WriteLine("Client has been shut down successfully!");
    Console.ResetColor();
    
    LogManager.Info("Client shutdown completed", "ClientShutdown");
}