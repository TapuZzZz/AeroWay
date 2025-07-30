using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayClient.Services.Security.Crypto
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
                byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
                byte[] encryptedBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

                string encryptedText = Convert.ToBase64String(encryptedBytes);
                string key = Convert.ToBase64String(aes.Key);
                string iv = Convert.ToBase64String(aes.IV);

                return (encryptedText, key, iv);
            }
            catch (Exception ex)
            {
                throw new Exception("AES encryption failed", ex);
            }
        }
    }
}