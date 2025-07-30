using System;
using AeroWayClient.Services.Security.Crypto;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services.Security
{
    public class MessageDecryptor
    {
        public string DecryptMessage(string encryptedMessage, string clientPrivateKey, string serverPublicKey)
        {
            try
            {
                LogManager.Info($"Starting message decryption, encrypted length: {encryptedMessage.Length}", "MessageDecryptor");
                
                // Check if it's an encrypted message
                if (!encryptedMessage.StartsWith("ENCRYPTED_MESSAGE:"))
                {
                    LogManager.Warning("Message is not encrypted, returning as is", "MessageDecryptor");
                    return encryptedMessage;
                }

                // Parse encrypted message parts
                LogManager.Debug("Parsing encrypted message parts", "MessageDecryptor");
                string[] parts = encryptedMessage.Split(new[] { ':' }, 4);
                
                if (parts.Length < 4)
                {
                    LogManager.Error($"Invalid encrypted message format. Expected 4 parts, got {parts.Length}", "MessageDecryptor");
                    throw new Exception("Invalid encrypted message format");
                }

                string encryptedContent = parts[1];
                string encryptedKey = parts[2];
                string signature = parts[3];
                
                LogManager.Debug("Encrypted message parsed successfully", "MessageDecryptor");

                // Decrypt AES key using client's private key
                LogManager.Debug("Decrypting AES key with client's private key", "MessageDecryptor");
                var (key, iv) = RSADecryption.DecryptAESKey(encryptedKey, clientPrivateKey);
                
                if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(iv))
                {
                    LogManager.Error("Failed to decrypt AES key", "MessageDecryptor");
                    throw new Exception("Failed to decrypt AES key");
                }
                
                LogManager.Debug("AES key decrypted successfully", "MessageDecryptor");

                // Decrypt message content
                LogManager.Debug("Decrypting message content with AES", "MessageDecryptor");
                string decryptedContent = AESDecryption.DecryptMessage(encryptedContent, key, iv);
                
                if (string.IsNullOrEmpty(decryptedContent))
                {
                    LogManager.Error("Failed to decrypt message content", "MessageDecryptor");
                    throw new Exception("Failed to decrypt message content");
                }
                
                LogManager.Debug($"Message content decrypted. Length: {decryptedContent.Length}", "MessageDecryptor");

                // Verify signature
                LogManager.Debug("Verifying digital signature", "MessageDecryptor");
                bool isVerified = DigitalSignature.VerifySignature(decryptedContent, signature, serverPublicKey);
                
                if (!isVerified)
                {
                    LogManager.Warning("Message signature verification failed - message may have been tampered with", "MessageDecryptor");
                }
                else
                {
                    LogManager.Info("Message signature verified successfully", "MessageDecryptor");
                }

                LogManager.Info($"Message decryption completed successfully. Decrypted length: {decryptedContent.Length}", "MessageDecryptor");
                
                return decryptedContent;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Message decryption failed: {ex.Message}", "MessageDecryptor");
                throw new Exception($"Message decryption failed: {ex.Message}", ex);
            }
        }
    }
}