using System;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Threading;
using AeroWayClient.Services.Core;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services.Security
{
    public class KeyExchange
    {
        public class KeyExchangeResult
        {
            public bool Success { get; set; }
            public string? ServerPublicKey { get; set; }
            public string? ClientPublicKey { get; set; }
            public string? ClientPrivateKey { get; set; }
            public string? ErrorMessage { get; set; }
        }

        public KeyExchangeResult PerformKeyExchange(NetworkStream stream)
        {
            try
            {
                LogManager.Info("Starting key exchange process", "KeyExchange");
                
                // Wait for server's key exchange message
                LogManager.Debug("Waiting for server's public key...", "KeyExchange");
                int timeout = 0;
                while (!stream.DataAvailable && timeout < 50)
                {
                    Thread.Sleep(100);
                    timeout++;
                }
                
                if (!stream.DataAvailable)
                {
                    LogManager.Error("Timeout waiting for server key exchange", "KeyExchange");
                    return new KeyExchangeResult 
                    { 
                        Success = false, 
                        ErrorMessage = "Timeout waiting for server key exchange"
                    };
                }
                
                // Read server's public key
                string serverMessage = MessageConverter.ReadMessageFromStream(stream);
                
                if (string.IsNullOrEmpty(serverMessage))
                {
                    LogManager.Error("No response from server during key exchange", "KeyExchange");
                    return new KeyExchangeResult 
                    { 
                        Success = false, 
                        ErrorMessage = "No response from server"
                    };
                }
                
                LogManager.Debug($"Received server message, length: {serverMessage.Length}", "KeyExchange");
                
                if (!serverMessage.StartsWith("KEY_EXCHANGE:"))
                {
                    LogManager.Error($"Invalid key exchange message format: {serverMessage.Substring(0, Math.Min(30, serverMessage.Length))}", "KeyExchange");
                    return new KeyExchangeResult 
                    { 
                        Success = false, 
                        ErrorMessage = "Invalid key exchange message format"
                    };
                }
                
                string serverPublicKey = serverMessage.Substring("KEY_EXCHANGE:".Length);
                LogManager.Info("Received server public key", "KeyExchange");
                
                // Generate client keys
                LogManager.Info("Generating client RSA keys...", "KeyExchange");
                var (clientPublicKey, clientPrivateKey) = GenerateClientKeys();
                
                // Send client public key
                string clientResponse = $"KEY_EXCHANGE:{clientPublicKey}";
                byte[] responseBytes = MessageConverter.StringToBytes(clientResponse);
                stream.Write(responseBytes, 0, responseBytes.Length);
                stream.Flush();
                
                LogManager.Info("Sent client public key to server", "KeyExchange");
                
                // Wait for confirmation (optional)
                Thread.Sleep(200);
                
                if (stream.DataAvailable)
                {
                    string confirmation = MessageConverter.ReadMessageFromStream(stream);
                    if (confirmation.StartsWith("KEY_EXCHANGE_SUCCESS:"))
                    {
                        LogManager.Info("Server confirmed key exchange success", "KeyExchange");
                    }
                }
                
                LogManager.Info("Key exchange completed successfully", "KeyExchange");
                
                return new KeyExchangeResult
                {
                    Success = true,
                    ServerPublicKey = serverPublicKey,
                    ClientPublicKey = clientPublicKey,
                    ClientPrivateKey = clientPrivateKey
                };
            }
            catch (Exception ex)
            {
                LogManager.Error($"Key exchange failed: {ex.Message}", "KeyExchange");
                return new KeyExchangeResult 
                { 
                    Success = false, 
                    ErrorMessage = $"Key exchange failed: {ex.Message}" 
                };
            }
        }

        private (string publicKey, string privateKey) GenerateClientKeys()
        {
            try
            {
                using RSA rsa = RSA.Create(2048);
                string publicKey = rsa.ToXmlString(false);
                string privateKey = rsa.ToXmlString(true);
                
                LogManager.Debug("Client RSA keys (2048-bit) generated successfully", "KeyExchange");
                return (publicKey, privateKey);
            }
            catch (Exception ex)
            {
                LogManager.Critical($"Failed to generate client keys: {ex.Message}", "KeyExchange");
                throw new Exception($"Failed to generate client keys: {ex.Message}", ex);
            }
        }
    }
}