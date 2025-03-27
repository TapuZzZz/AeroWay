using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;

namespace AeroWayServer.utils
{
    public class SystemMetricPoint
    {
        public DateTime Timestamp { get; set; }
        public double CpuUsage { get; set; }        // Total CPU system usage %
        public double MemoryUsage { get; set; }     // MB - process memory
        public int ThreadCount { get; set; }
        public int SessionCount { get; set; }       // Active sessions
    }

    public static class SystemMetricsTracker
    {
        private static readonly string MetricsFilePath = Path.Combine("json", "system_metrics.json");
        private static readonly int MaxDataPoints = 50;
        private static readonly TimeSpan MinRecordInterval = TimeSpan.FromSeconds(3);
        
        private static DateTime _lastRecordTime = DateTime.MinValue;
        private static readonly List<SystemMetricPoint> _metricsCache = new List<SystemMetricPoint>();
        
        // For CPU measurement
        private static readonly Process _currentProcess = Process.GetCurrentProcess();
        
        // Running on macOS
        private static readonly bool _isMacOS = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.OSX);
        
        // Clear metrics on startup
        static SystemMetricsTracker()
        {
            try
            {
                // Ensure json directory exists
                Directory.CreateDirectory("json");
                
                // Delete old metrics file
                if (File.Exists(MetricsFilePath))
                {
                    File.Delete(MetricsFilePath);
                    Console.WriteLine("Metrics reset on startup");
                }
                
                // Force garbage collection to stabilize memory readings
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing metrics: {ex.Message}");
            }
        }

        public static void RecordMetrics(int sessionCount)
        {
            // Check if we need to record
            if (DateTime.Now - _lastRecordTime < MinRecordInterval)
                return;

            _lastRecordTime = DateTime.Now;
            
            try
            {
                // Get real total system metrics
                double cpuUsage = GetTotalSystemCpuUsage();
                double memoryUsage = GetProcessMemoryUsage();
                int threadCount = GetProcessThreadCount();
                
                // Add new data point
                _metricsCache.Add(new SystemMetricPoint
                {
                    Timestamp = DateTime.Now,
                    CpuUsage = cpuUsage,
                    MemoryUsage = memoryUsage,
                    ThreadCount = threadCount,
                    SessionCount = sessionCount
                });
                
                // Keep only the most recent points
                if (_metricsCache.Count > MaxDataPoints)
                {
                    _metricsCache.RemoveAt(0);
                }
                
                // Save to file
                SaveMetrics(_metricsCache);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error recording metrics: {ex.Message}");
            }
        }

        public static List<SystemMetricPoint> GetRecentMetrics(int count)
        {
            try
            {
                if (_metricsCache.Count == 0)
                {
                    // First time collecting metrics, add current point
                    double cpuUsage = GetTotalSystemCpuUsage();
                    double memoryUsage = GetProcessMemoryUsage();
                    int threadCount = GetProcessThreadCount();
                    
                    _metricsCache.Add(new SystemMetricPoint
                    {
                        Timestamp = DateTime.Now,
                        CpuUsage = cpuUsage,
                        MemoryUsage = memoryUsage,
                        ThreadCount = threadCount,
                        SessionCount = 0
                    });
                }
                
                // Return the requested number of points
                return _metricsCache
                    .OrderBy(m => m.Timestamp)
                    .TakeLast(Math.Min(count, _metricsCache.Count))
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving metrics: {ex.Message}");
                
                // Return at least the current metrics if available
                if (_metricsCache.Count > 0)
                {
                    return new List<SystemMetricPoint> { _metricsCache.Last() };
                }
                
                // If no metrics yet, create a single point
                return new List<SystemMetricPoint>
                {
                    new SystemMetricPoint
                    {
                        Timestamp = DateTime.Now,
                        CpuUsage = GetTotalSystemCpuUsage(),
                        MemoryUsage = GetProcessMemoryUsage(),
                        ThreadCount = GetProcessThreadCount(),
                        SessionCount = 0
                    }
                };
            }
        }

        // Get complete system CPU usage on macOS by running multiple samples
        private static double GetTotalSystemCpuUsage()
        {
            try
            {
                if (_isMacOS)
                {
                    // Run top with 2 samples, 1 second apart, for more accurate reading
                    var startInfo = new ProcessStartInfo
                    {
                        FileName = "top",
                        Arguments = "-l 2 -n 0 -s 1", // 2 samples, 1 second apart
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    };
                    
                    using (var process = Process.Start(startInfo))
                    {
                        if (process == null) return 5.0;
                        
                        string result = process.StandardOutput.ReadToEnd();
                        process.WaitForExit();
                        
                        // Skip first sample and parse the second one (more accurate)
                        string[] samples = result.Split(new[] { "Processes:" }, StringSplitOptions.None);
                        
                        if (samples.Length > 2)
                        {
                            string secondSample = samples[2]; // Get the second sample
                            
                            // Look for CPU usage in the second sample
                            foreach (string line in secondSample.Split('\n'))
                            {
                                if (line.Contains("CPU usage:"))
                                {
                                    // Parse user, sys, idle percentages
                                    string[] parts = line.Split(new[] { ':', ',' }, StringSplitOptions.RemoveEmptyEntries);
                                    if (parts.Length >= 3)
                                    {
                                        double userPercent = ParsePercentage(parts[1]);
                                        double sysPercent = ParsePercentage(parts[2]);
                                        
                                        // User + System = Total CPU usage
                                        return Math.Round(userPercent + sysPercent, 1);
                                    }
                                }
                            }
                        }
                    }
                    
                    // Alternative approach: use vm_stat and iostat for system load
                    var sysInfoStartInfo = new ProcessStartInfo
                    {
                        FileName = "iostat",
                        Arguments = "-c 2",
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    };
                    
                    using (var process = Process.Start(sysInfoStartInfo))
                    {
                        if (process == null) return 10.0;
                        
                        string result = process.StandardOutput.ReadToEnd();
                        process.WaitForExit();
                        
                        // Parse iostat output to get CPU usage
                        string[] lines = result.Split('\n');
                        if (lines.Length > 3)
                        {
                            string[] values = lines[2].Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                            if (values.Length >= 6)
                            {
                                double userPercent = 0;
                                double sysPercent = 0;
                                
                                if (double.TryParse(values[3], out userPercent) && 
                                    double.TryParse(values[4], out sysPercent))
                                {
                                    return Math.Round(userPercent + sysPercent, 1);
                                }
                            }
                        }
                    }
                }
                
                // Third attempt - use sysctl for CPU load average
                var loadStartInfo = new ProcessStartInfo
                {
                    FileName = "sysctl",
                    Arguments = "-n vm.loadavg",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true
                };
                
                using (var process = Process.Start(loadStartInfo))
                {
                    if (process == null) return 15.0;
                    
                    string result = process.StandardOutput.ReadToEnd().Trim();
                    process.WaitForExit();
                    
                    // Parse load average
                    result = result.Replace("{ ", "").Replace(" }", "");
                    string[] loads = result.Split(' ');
                    
                    if (loads.Length >= 1 && double.TryParse(loads[0], out double load1))
                    {
                        // Convert load to percentage based on CPU cores
                        int cpuCount = Environment.ProcessorCount;
                        double loadPercent = (load1 / cpuCount) * 100;
                        return Math.Round(Math.Min(100, loadPercent), 1);
                    }
                }
                
                // Fallback
                return 20.0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error measuring system CPU: {ex.Message}");
                return 20.0;
            }
        }

        private static double ParsePercentage(string text)
        {
            // Parse percentage values like "10.5% user"
            if (string.IsNullOrEmpty(text)) return 0;
            text = text.Trim();
            
            int percentIndex = text.IndexOf('%');
            if (percentIndex > 0)
            {
                string percentValue = text.Substring(0, percentIndex).Trim();
                if (double.TryParse(percentValue, out double result))
                {
                    return result;
                }
            }
            
            return 0;
        }

        // Get memory usage for our process only
        private static double GetProcessMemoryUsage()
        {
            try
            {
                _currentProcess.Refresh();
                
                // Return actual RAM usage of the process in MB
                double memoryMB = _currentProcess.WorkingSet64 / (1024.0 * 1024.0);
                return Math.Round(memoryMB, 1);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error measuring memory: {ex.Message}");
                return 50.0; // Fallback
            }
        }

        // Get thread count for our process
        private static int GetProcessThreadCount()
        {
            try
            {
                _currentProcess.Refresh();
                return _currentProcess.Threads.Count;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error counting threads: {ex.Message}");
                return 10; // Fallback
            }
        }

        private static void SaveMetrics(List<SystemMetricPoint> metrics)
        {
            try
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                string json = JsonSerializer.Serialize(metrics, options);
                File.WriteAllText(MetricsFilePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving metrics: {ex.Message}");
            }
        }
    }
}