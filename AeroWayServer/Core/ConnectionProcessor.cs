using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using AeroWayServer.Security;
using AeroWayServer.Communication;
using AeroWayServer.Handlers;
using AeroWayServer.Log;

namespace AeroWayServer.Core
{
    public class ConnectionProcessor
    {
        public static void HandleClient(TcpClient client)
        {
            NetworkStream? stream = null;
            string clientAddress = "unknown";
            
            try
            {
                stream = client.GetStream();
                clientAddress = ((IPEndPoint?)client.Client.RemoteEndPoint)?.Address.ToString() ?? "unknown";
                
                KeyExchange.StartKeyExchange(stream, clientAddress);
                
                bool clientConnected = true;
                bool keyExchangeCompleted = false;
                
                while (clientConnected)
                {
                    try
                    {
                        if (stream.DataAvailable)
                        {
                            string encryptedMessage = MessageConverter.ReadMessageFromStream(stream);
                            
                            if (!string.IsNullOrEmpty(encryptedMessage))
                            {
                                string response;
                                
                                if (!keyExchangeCompleted && KeyExchange.HandleClientKeyExchange(encryptedMessage, clientAddress))
                                {
                                    keyExchangeCompleted = true;
                                    response = "KEY_EXCHANGE_SUCCESS:Key exchange completed successfully";
                                }
                                else if (keyExchangeCompleted)
                                {
                                    var (decryptedMessage, isVerified) = MessageDecryptor.DecryptClientMessage(encryptedMessage, clientAddress);
                                    
                                    if (!string.IsNullOrEmpty(decryptedMessage))
                                    {
                                        MessageType messageType = MessageTypeIdentifier.IdentifyMessageType(decryptedMessage);
                                        string messageContent = MessageTypeIdentifier.ExtractMessageContent(decryptedMessage);
                                        
                                        string plainResponse = MessageHandler.HandleMessage(messageType, messageContent, clientAddress);
                                        
                                        response = MessageEncryptor.EncryptServerMessage(plainResponse, clientAddress);
                                        
                                        if (string.IsNullOrEmpty(response))
                                        {
                                            LogManager.Error("Failed to encrypt server response", "ConnectionProcessor");
                                            response = "ERROR:Failed to encrypt response";
                                        }
                                    }
                                    else
                                    {
                                        response = "ERROR:Failed to process encrypted message";
                                    }
                                }
                                else
                                {
                                    response = "ERROR:Key exchange must be completed first";
                                }
                                
                                byte[] responseData = Encoding.UTF8.GetBytes(response);
                                stream.Write(responseData, 0, responseData.Length);
                            }
                        }
                        
                        System.Threading.Thread.Sleep(100);
                    }
                    catch (Exception ex)
                    {
                        LogManager.Error($"Client handling error: {ex.Message}", "ConnectionProcessor");
                        clientConnected = false;
                    }
                }
            }
            catch (Exception ex)
            {
                LogManager.Error($"HandleClient error: {ex.Message}", "ConnectionProcessor");
            }
            finally
            {
                try
                {
                    stream?.Close();
                }
                catch (Exception ex)
                {
                    LogManager.Error($"Error closing stream: {ex.Message}", "ConnectionProcessor");
                }
                
                try
                {
                    client.Close();
                }
                catch (Exception ex)
                {
                    LogManager.Error($"Error closing client: {ex.Message}", "ConnectionProcessor");
                }
            }
        }
    }
}