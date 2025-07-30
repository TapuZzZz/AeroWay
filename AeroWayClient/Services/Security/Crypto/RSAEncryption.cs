using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayClient.Services.Security.Crypto
{
    public static class RSAEncryption
    {
        public static string EncryptAESKey(string key, string iv, string publicKey)
        {
            try
            {
                using RSACryptoServiceProvider rsa = new RSACryptoServiceProvider(2048);
                rsa.FromXmlString(publicKey);

                string combined = $"{key}:{iv}";
                byte[] dataToEncrypt = Encoding.UTF8.GetBytes(combined);
                byte[] encryptedData = rsa.Encrypt(dataToEncrypt, false);

                return Convert.ToBase64String(encryptedData);
            }
            catch (Exception ex)
            {
                throw new Exception("RSA encryption failed", ex);
            }
        }
    }
}