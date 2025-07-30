using System;
using System.Security.Cryptography;
using System.Text;
using AeroWayServer.Log;

namespace AeroWayServer.Security.Crypto
{
    public static class AESEncryption
    {
        public static (string EncryptedText, string Key, string IV) EncryptMessage(string plainText)
        {
            try
            {
                using Aes aes = Aes.Create();
                aes.KeySize = 256;
                aes.GenerateKey();
                aes.GenerateIV();

                using ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
                using var ms = new System.IO.MemoryStream();
                using var cryptoStream = new CryptoStream(ms, encryptor, CryptoStreamMode.Write);
                using (var writer = new System.IO.StreamWriter(cryptoStream))
                {
                    writer.Write(plainText);
                }

                string encryptedText = Convert.ToBase64String(ms.ToArray());
                string key = Convert.ToBase64String(aes.Key);
                string iv = Convert.ToBase64String(aes.IV);

                LogManager.Debug("AES encryption completed successfully", "AESEncryption");
                return (encryptedText, key, iv);
            }
            catch (Exception ex)
            {
                LogManager.Error($"AES encryption failed: {ex.Message}", "AESEncryption");
                return (string.Empty, string.Empty, string.Empty);
            }
        }
    }
}