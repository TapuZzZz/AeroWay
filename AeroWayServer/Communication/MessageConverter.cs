using System;
using System.IO;
using System.Text;
using AeroWayServer.Log;

namespace AeroWayServer.Communication
{
    public static class MessageConverter
    {
        public static string BytesToString(byte[] bytes, int bytesRead)
        {
            try
            {
                if (bytes == null || bytesRead <= 0)
                    return string.Empty;
                    
                return Encoding.UTF8.GetString(bytes, 0, bytesRead);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error converting bytes to string: {ex.Message}", "MessageConverter");
                return string.Empty;
            }
        }
        
        public static string ReadMessageFromStream(System.Net.Sockets.NetworkStream stream)
        {
            try
            {
                if (stream == null || !stream.DataAvailable)
                    return string.Empty;
                    
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
                        }
                        
                    } while (bytesRead == buffer.Length && stream.DataAvailable);
                    
                    if (totalBytesRead > 0)
                    {
                        LogManager.Debug($"Read {totalBytesRead} bytes from client stream", "MessageConverter");
                    }
                    
                    return Encoding.UTF8.GetString(memoryStream.ToArray());
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