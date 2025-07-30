using System;
using System.Security.Cryptography;
using System.Text;
using AeroWayServer.Log;

namespace AeroWayServer.Security.Crypto
{
    public static class AESDecryption
    {
        public static string DecryptMessage(string encryptedText, string key, string iv)
        {
            try
            {
                byte[] cipherBytes = Convert.FromBase64String(encryptedText);
                byte[] keyBytes = Convert.FromBase64String(key);
                byte[] ivBytes = Convert.FromBase64String(iv);

                using Aes aes = Aes.Create();
                using ICryptoTransform decryptor = aes.CreateDecryptor(keyBytes, ivBytes);
                using var ms = new System.IO.MemoryStream(cipherBytes);
                using var cryptoStream = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
                using var reader = new System.IO.StreamReader(cryptoStream);

                string result = reader.ReadToEnd();
                LogManager.Debug("AES decryption completed successfully", "AESDecryption");
                return result;
            }
            catch (Exception ex)
            {
                LogManager.Error($"AES decryption failed: {ex.Message}", "AESDecryption");
                return string.Empty;
            }
        }
    }
}