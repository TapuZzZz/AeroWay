using System;
using System.Text;
using AeroWayServer.Security;
using AeroWayServer.Security.Crypto;
using AeroWayServer.Log;

namespace AeroWayServer.Communication
{
    public static class MessageEncryptor
    {
        public static string EncryptServerMessage(string message, string clientId)
        {
            try
            {
                if (!KeyExchange.HasClientPublicKey(clientId))
                {
                    LogManager.Error($"Cannot encrypt message: No public key for client {clientId}", "MessageEncryptor");
                    return string.Empty;
                }
                
                string serverPrivateKey = KeyExchange.GetServerPrivateKey();
                
                var (encryptedContent, key, iv) = AESEncryption.EncryptMessage(message);
                
                if (string.IsNullOrEmpty(encryptedContent) || string.IsNullOrEmpty(key) || string.IsNullOrEmpty(iv))
                {
                    LogManager.Error("Failed to encrypt message with AES", "MessageEncryptor");
                    return string.Empty;
                }
                
                string signature = DigitalSignature.SignMessage(message, serverPrivateKey);
                
                if (string.IsNullOrEmpty(signature))
                {
                    LogManager.Error("Failed to create digital signature", "MessageEncryptor");
                    return string.Empty;
                }
                
                string clientPublicKey = KeyExchange.GetClientPublicKey(clientId);
                string encryptedKey = RSAEncryption.EncryptAESKey(key, iv, clientPublicKey);
                
                if (string.IsNullOrEmpty(encryptedKey))
                {
                    LogManager.Error("Failed to encrypt AES key with RSA", "MessageEncryptor");
                    return string.Empty;
                }
                
                string encryptedMessage = $"ENCRYPTED_MESSAGE:{encryptedContent}:{encryptedKey}:{signature}";
                
                LogManager.Info($"Message encrypted successfully for client {clientId}", "MessageEncryptor");
                
                return encryptedMessage;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error encrypting message: {ex.Message}", "MessageEncryptor");
                return string.Empty;
            }
        }
    }
}