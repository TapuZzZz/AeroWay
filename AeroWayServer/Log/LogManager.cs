using System;
using System.IO;
using System.Text;

namespace AeroWayServer.Log
{
    public static class LogManager
    {
        private static readonly string logDirectory = "AeroWay/AeroWayServer/Log";
        private static readonly string logFilePath = string.Empty; // Initialize with empty string
        
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
                logFilePath = Path.Combine(logDirectory, "AeroWayServerLog.txt");
                
                if (!Directory.Exists(logDirectory))
                {
                    Directory.CreateDirectory(logDirectory);
                }
                
                using (StreamWriter writer = new StreamWriter(logFilePath, true))
                {
                    writer.WriteLine();
                    writer.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [INFO] [LogManager] ========== NEW SERVER SESSION ==========");
                }
            }
            catch (Exception ex)
            {
                try
                {
                    File.AppendAllText(Path.Combine(logDirectory, "AeroWayServerLog.txt"), 
                        $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [ERROR] [LogManager] Static constructor error: {ex.Message}{Environment.NewLine}");
                }
                catch 
                { 
                    
                }
            }
        }
        
        public static void WriteLog(string message, string source = "Server", LogLevel level = LogLevel.INFO)
        {
            try
            {
                lock (logLock)
                {
                    string timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                    string logMessage = $"[{timestamp}] [{level}] [{source}] {message}";
                    
                    File.AppendAllText(logFilePath, logMessage + Environment.NewLine);
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
                    
                }
            }
        }
        
        public static void Debug(string message, string source = "Server")
        {
            WriteLog(message, source, LogLevel.DEBUG);
        }
        
        public static void Info(string message, string source = "Server")
        {
            WriteLog(message, source, LogLevel.INFO);
        }
        
        public static void Warning(string message, string source = "Server")
        {
            WriteLog(message, source, LogLevel.WARNING);
        }
        
        public static void Error(string message, string source = "Server")
        {
            WriteLog(message, source, LogLevel.ERROR);
        }
        
        public static void Critical(string message, string source = "Server")
        {
            WriteLog(message, source, LogLevel.CRITICAL);
        }
    }
}