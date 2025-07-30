using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using AeroWayServer.Log;

namespace AeroWayServer.Security
{
    public class KeyExchange
    {
        private static readonly Dictionary<string, string> clientPublicKeys = new Dictionary<string, string>();
        private static string serverPrivateKey = "";
        private static string serverPublicKey = "";
        
        static KeyExchange()
        {
            GenerateServerKeys();
        }
        
        private static void GenerateServerKeys()
        {
            try
            {
                using (RSA rsa = RSA.Create(2048))
                {
                    serverPrivateKey = rsa.ToXmlString(true);
                    serverPublicKey = rsa.ToXmlString(false);
                }
                
                LogManager.Info("Server RSA keys generated successfully", "KeyExchange");
            }
            catch (Exception ex)
            {
                LogManager.Critical($"Error generating server keys: {ex.Message}", "KeyExchange");
            }
        }
        
        public static string GetServerPublicKey()
        {
            return serverPublicKey;
        }

        public static string GetServerPrivateKey()
        {
            return serverPrivateKey;
        }
        
        public static void StoreClientPublicKey(string clientId, string publicKey)
        {
            try
            {
                clientPublicKeys[clientId] = publicKey;
                LogManager.Info($"Stored public key for client: {clientId}", "KeyExchange");
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error storing client public key: {ex.Message}", "KeyExchange");
            }
        }
        
        public static bool HasClientPublicKey(string clientId)
        {
            return !string.IsNullOrEmpty(clientId) && clientPublicKeys.ContainsKey(clientId);
        }
        
        public static string GetClientPublicKey(string clientId)
        {
            if (HasClientPublicKey(clientId))
            {
                return clientPublicKeys[clientId];
            }
            return string.Empty;
        }
        
        public static string StartKeyExchange(System.Net.Sockets.NetworkStream stream, string clientAddress)
        {
            try
            {
                string keyExchangeMessage = $"KEY_EXCHANGE:{serverPublicKey}";
                byte[] keyExchangeData = Encoding.UTF8.GetBytes(keyExchangeMessage);
                stream.Write(keyExchangeData, 0, keyExchangeData.Length);
                
                LogManager.Info($"Sent server public key to client {clientAddress}", "KeyExchange");
                
                return "Key exchange started";
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error starting key exchange: {ex.Message}", "KeyExchange");
                return $"Error: {ex.Message}";
            }
        }
        
        public static bool HandleClientKeyExchange(string message, string clientAddress)
        {
            try
            {
                if (message.StartsWith("KEY_EXCHANGE:"))
                {
                    string clientPublicKey = message.Substring("KEY_EXCHANGE:".Length);
                    StoreClientPublicKey(clientAddress, clientPublicKey);
                    
                    LogManager.Info($"Key exchange completed with client {clientAddress}", "KeyExchange");
                    
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error handling client key exchange: {ex.Message}", "KeyExchange");
                return false;
            }
        }
    }
}