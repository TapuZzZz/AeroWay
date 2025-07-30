using System;
using System.IO;
using System.Text;

namespace AeroWayClient.Services.Log
{
    public static class LogManager
    {
        private static readonly string logDirectory = "AeroWay/AeroWayClient/Services/Log";
        private static readonly string logFilePath = string.Empty;
        
        private static readonly object logLock = new object();
        
        public enum LogLevel
        {
            DEBUG,
            INFO,
            WARNING,
            ERROR,
            CRITICAL
        }
        
        static LogManager()
        {
            try
            {
                // Initialize logFilePath
                logFilePath = Path.Combine(logDirectory, "AeroWayClientLog.txt");
                
                if (!Directory.Exists(logDirectory))
                {
                    Directory.CreateDirectory(logDirectory);
                }
                
                using (StreamWriter writer = new StreamWriter(logFilePath, true))
                {
                    writer.WriteLine();
                    writer.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [INFO] [LogManager] ========== NEW CLIENT SESSION ==========");
                }
            }
            catch (Exception ex)
            {
                try
                {
                    // Fallback in case initialization fails
                    logFilePath = Path.Combine(logDirectory, "AeroWayClientLog.txt");
                    File.AppendAllText(logFilePath, 
                        $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [ERROR] [LogManager] Static constructor error: {ex.Message}{Environment.NewLine}");
                }
                catch 
                { 
                    // Silent fail
                }
            }
        }
        
        public static void WriteLog(string message, string source = "Client", LogLevel level = LogLevel.INFO)
        {
            try
            {
                lock (logLock)
                {
                    string timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                    string logMessage = $"[{timestamp}] [{level}] [{source}] {message}";
                    
                    File.AppendAllText(logFilePath, logMessage + Environment.NewLine);
                    
                    // הסרנו את ההדפסה לקונסול - רק כותבים לקובץ
                }
            }
            catch (Exception ex)
            {
                try
                {
                    File.AppendAllText(logFilePath, 
                        $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [ERROR] [LogManager] WriteLog error: {ex.Message}{Environment.NewLine}");
                }
                catch 
                { 
                    // Silent fail
                }
            }
        }
        
        public static void Debug(string message, string source = "Client")
        {
            WriteLog(message, source, LogLevel.DEBUG);
        }
        
        public static void Info(string message, string source = "Client")
        {
            WriteLog(message, source, LogLevel.INFO);
        }
        
        public static void Warning(string message, string source = "Client")
        {
            WriteLog(message, source, LogLevel.WARNING);
        }
        
        public static void Error(string message, string source = "Client")
        {
            WriteLog(message, source, LogLevel.ERROR);
        }
        
        public static void Critical(string message, string source = "Client")
        {
            WriteLog(message, source, LogLevel.CRITICAL);
        }
    }
}