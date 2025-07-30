using System;
using System.Security.Cryptography;
using System.Text;
using AeroWayServer.Log;

namespace AeroWayServer.Security.Crypto
{
    public static class RSADecryption
    {
        public static (string Key, string IV) DecryptAESKey(string encryptedKeyIV, string privateKey)
        {
            try
            {
                using RSACryptoServiceProvider rsa = new RSACryptoServiceProvider(2048);
                rsa.FromXmlString(privateKey);

                byte[] dataToDecrypt = Convert.FromBase64String(encryptedKeyIV);
                byte[] decryptedData = rsa.Decrypt(dataToDecrypt, false);

                string decryptedText = Encoding.UTF8.GetString(decryptedData);
                string[] parts = decryptedText.Split(':');

                if (parts.Length != 2)
                {
                    LogManager.Error("Invalid decrypted AES key format - expected Key:IV", "RSADecryption");
                    return (string.Empty, string.Empty);
                }

                LogManager.Debug("RSA decryption of AES key completed successfully", "RSADecryption");
                return (parts[0], parts[1]);
            }
            catch (Exception ex)
            {
                LogManager.Error($"RSA decryption of AES key failed: {ex.Message}", "RSADecryption");
                return (string.Empty, string.Empty);
            }
        }
    }
}