using System;
using System.Text;
using AeroWayServer.Security;
using AeroWayServer.Security.Crypto;
using AeroWayServer.Log;

namespace AeroWayServer.Communication
{
    public static class MessageDecryptor
    {
        public static (string Message, bool IsVerified) DecryptClientMessage(string encryptedMessage, string clientId)
        {
            try
            {
                if (!KeyExchange.HasClientPublicKey(clientId))
                {
                    LogManager.Error($"Cannot decrypt message: No public key for client {clientId}", "MessageDecryptor");
                    return (string.Empty, false);
                }

                var messageParts = ParseEncryptedMessage(encryptedMessage);
                if (messageParts == null)
                {
                    LogManager.Error("Invalid message format", "MessageDecryptor");
                    return (string.Empty, false);
                }

                var (encryptedContent, encryptedKey, signature) = messageParts.Value;

                string serverPrivateKey = KeyExchange.GetServerPrivateKey();
                
                var (key, iv) = RSADecryption.DecryptAESKey(encryptedKey, serverPrivateKey);
                
                if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(iv))
                {
                    LogManager.Error("Failed to decrypt AES key", "MessageDecryptor");
                    return (string.Empty, false);
                }
                
                string decryptedContent = AESDecryption.DecryptMessage(encryptedContent, key, iv);
                
                if (string.IsNullOrEmpty(decryptedContent))
                {
                    LogManager.Error("Failed to decrypt message content", "MessageDecryptor");
                    return (string.Empty, false);
                }
                
                string clientPublicKey = KeyExchange.GetClientPublicKey(clientId);
                bool isVerified = DigitalSignature.VerifySignature(decryptedContent, signature, clientPublicKey);
                
                if (!isVerified)
                {
                    LogManager.Warning($"Signature verification failed for message from client {clientId}", "MessageDecryptor");
                }
                
                LogManager.Info($"Message decrypted successfully from client {clientId}", "MessageDecryptor");
                
                return (decryptedContent, isVerified);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error decrypting message: {ex.Message}", "MessageDecryptor");
                return (string.Empty, false);
            }
        }
        
        private static (string EncryptedContent, string EncryptedKey, string Signature)? ParseEncryptedMessage(string message)
        {
            try
            {
                string[] parts = message.Split(new string[] { ":" }, 4, StringSplitOptions.None);
                
                if (parts.Length != 4 || parts[0] != "ENCRYPTED_MESSAGE")
                {
                    LogManager.Warning("Message format is invalid", "MessageDecryptor");
                    return null;
                }
                
                return (parts[1], parts[2], parts[3]);
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error parsing encrypted message: {ex.Message}", "MessageDecryptor");
                return null;
            }
        }
    }
}