using System;
using System.Security.Cryptography;
using System.Text;
using AeroWayServer.Log;

namespace AeroWayServer.Security.Crypto
{
    public static class RSAEncryption
    {
        public static string EncryptAESKey(string key, string iv, string publicKey)
        {
            try
            {
                using RSACryptoServiceProvider rsa = new RSACryptoServiceProvider(2048);
                rsa.FromXmlString(publicKey);

                string combinedKeyIV = $"{key}:{iv}";
                byte[] dataToEncrypt = Encoding.UTF8.GetBytes(combinedKeyIV);
                byte[] encryptedData = rsa.Encrypt(dataToEncrypt, false);

                string result = Convert.ToBase64String(encryptedData);
                LogManager.Debug("RSA encryption of AES key completed successfully", "RSAEncryption");
                return result;
            }
            catch (Exception ex)
            {
                LogManager.Error($"RSA encryption of AES key failed: {ex.Message}", "RSAEncryption");
                return string.Empty;
            }
        }
    }
}