using System;
using System.IO;
using System.Text;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services.Core
{
    public static class MessageConverter
    {
        public static string BytesToString(byte[] bytes, int bytesRead)
        {
            try
            {
                if (bytes == null || bytesRead <= 0)
                {
                    LogManager.Warning("No data to convert (null or empty bytes)", "MessageConverter");
                    return string.Empty;
                }
                    
                string result = Encoding.UTF8.GetString(bytes, 0, bytesRead);
                LogManager.Debug($"Converted {bytesRead} bytes to string", "MessageConverter");
                return result;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error converting bytes to string: {ex.Message}", "MessageConverter");
                return string.Empty;
            }
        }
        
        public static byte[] StringToBytes(string message)
        {
            try
            {
                if (string.IsNullOrEmpty(message))
                {
                    LogManager.Warning("No message to convert (null or empty string)", "MessageConverter");
                    return new byte[0];
                }
                    
                byte[] result = Encoding.UTF8.GetBytes(message);
                LogManager.Debug($"Converted string to {result.Length} bytes", "MessageConverter");
                return result;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error converting string to bytes: {ex.Message}", "MessageConverter");
                return new byte[0];
            }
        }
        
        public static string ReadMessageFromStream(System.Net.Sockets.NetworkStream stream)
        {
            try
            {
                if (stream == null)
                {
                    LogManager.Error("Cannot read from null stream", "MessageConverter");
                    return string.Empty;
                }
                
                if (!stream.DataAvailable)
                {
                    LogManager.Debug("No data available in stream", "MessageConverter");
                    return string.Empty;
                }
                    
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    int totalBytesRead = 0;
                    
                    do
                    {
                        bytesRead = stream.Read(buffer, 0, buffer.Length);
                        
                        if (bytesRead > 0)
                        {
                            memoryStream.Write(buffer, 0, bytesRead);
                            totalBytesRead += bytesRead;
                            LogManager.Debug($"Read chunk: {bytesRead} bytes", "MessageConverter");
                        }
                        
                    } while (bytesRead == buffer.Length && stream.DataAvailable);
                    
                    if (totalBytesRead > 0)
                    {
                        LogManager.Info($"Read total of {totalBytesRead} bytes from stream", "MessageConverter");
                        return Encoding.UTF8.GetString(memoryStream.ToArray());
                    }
                    else
                    {
                        LogManager.Warning("No bytes were read from stream", "MessageConverter");
                        return string.Empty;
                    }
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error reading message from stream: {ex.Message}", "MessageConverter");
                return string.Empty;
            }
        }
    }
}