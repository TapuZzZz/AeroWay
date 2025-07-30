using System;
using AeroWayClient.Services.Security.Crypto;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services.Security
{
    public class MessageEncryptor
    {
        public string EncryptMessage(string message, string clientPrivateKey, string serverPublicKey)
        {
            try
            {
                LogManager.Info($"Starting message encryption, original length: {message.Length}", "MessageEncryptor");
                
                // Encrypt message with AES
                LogManager.Debug("Encrypting message content with AES", "MessageEncryptor");
                var (encryptedContent, key, iv) = AESEncryption.EncryptMessage(message);
                
                if (string.IsNullOrEmpty(encryptedContent) || string.IsNullOrEmpty(key) || string.IsNullOrEmpty(iv))
                {
                    LogManager.Error("AES encryption returned empty values", "MessageEncryptor");
                    throw new Exception("AES encryption failed");
                }
                
                LogManager.Debug($"AES encryption complete. Encrypted length: {encryptedContent.Length}", "MessageEncryptor");
                
                // Sign the original message
                LogManager.Debug("Creating digital signature", "MessageEncryptor");
                string signature = DigitalSignature.SignMessage(message, clientPrivateKey);
                
                if (string.IsNullOrEmpty(signature))
                {
                    LogManager.Error("Failed to create digital signature", "MessageEncryptor");
                    throw new Exception("Failed to create digital signature");
                }
                
                LogManager.Debug("Digital signature created successfully", "MessageEncryptor");
                
                // Encrypt AES key with server's RSA public key
                LogManager.Debug("Encrypting AES key with server's RSA public key", "MessageEncryptor");
                string encryptedKey = RSAEncryption.EncryptAESKey(key, iv, serverPublicKey);
                
                if (string.IsNullOrEmpty(encryptedKey))
                {
                    LogManager.Error("Failed to encrypt AES key with RSA", "MessageEncryptor");
                    throw new Exception("Failed to encrypt AES key");
                }
                
                LogManager.Debug("AES key encrypted successfully", "MessageEncryptor");
                
                // Build encrypted message
                string encryptedMessage = $"ENCRYPTED_MESSAGE:{encryptedContent}:{encryptedKey}:{signature}";
                
                LogManager.Info($"Message encryption completed. Total encrypted length: {encryptedMessage.Length}", "MessageEncryptor");
                
                return encryptedMessage;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Message encryption failed: {ex.Message}", "MessageEncryptor");
                throw new Exception($"Message encryption failed: {ex.Message}", ex);
            }
        }
    }
}