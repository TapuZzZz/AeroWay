using System;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.IO;
using MySql.Data.MySqlClient;
using AeroWayServer.Log;
using AeroWayServer.Web;

namespace AeroWayServer.Core
{
    public class ConnectionListener
    {
        private static TcpListener? listener;
        private static string dbServer = "";
        private static string dbUser = "";
        private static string dbPassword = "";
        private static string dbDatabase = "";
        private static int port = 8000;

        public static void Start(string sqlServer, string sqlUser, string sqlPassword, string sqlDatabase, int serverPort = 8000)
        {
            try
            {
                dbServer = sqlServer;
                dbUser = sqlUser;
                dbPassword = sqlPassword;
                dbDatabase = sqlDatabase;
                port = serverPort;
                
                listener = new TcpListener(IPAddress.Any, port);
                listener.Start();
                
                WebServer.SetMainServerRunning(true);
                
                while (true)
                {
                    try
                    {
                        TcpClient client = listener.AcceptTcpClient();
                        
                        Thread clientThread = new Thread(() => ConnectionProcessor.HandleClient(client));
                        clientThread.IsBackground = true;
                        clientThread.Start();
                    }
                    catch (Exception ex)
                    {
                        LogManager.Error($"Client connection error: {ex.Message}", "ConnectionListener");
                        Thread.Sleep(1000);
                    }
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"ConnectionListener Start error: {ex.Message}", "ConnectionListener");
                try
                {
                    if (listener != null)
                    {
                        listener.Stop();
                    }
                }
                catch (Exception stopEx)
                {
                    LogManager.Error($"Error stopping listener: {stopEx.Message}", "ConnectionListener");
                }
            }
        }
        
        public static string GetConnectionString()
        {
            try
            {
                return $"server={dbServer};user={dbUser};password={dbPassword};database={dbDatabase};";
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error creating connection string: {ex.Message}", "ConnectionListener");
                return string.Empty;
            }
        }
    }
}