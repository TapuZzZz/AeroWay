using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayClient.Services.Security.Crypto
{
    public static class AESDecryption
    {
        public static string DecryptMessage(string encryptedText, string key, string iv)
        {
            try
            {
                byte[] encryptedBytes = Convert.FromBase64String(encryptedText);
                byte[] keyBytes = Convert.FromBase64String(key);
                byte[] ivBytes = Convert.FromBase64String(iv);

                using Aes aes = Aes.Create();
                using ICryptoTransform decryptor = aes.CreateDecryptor(keyBytes, ivBytes);
                byte[] decryptedBytes = decryptor.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);

                return Encoding.UTF8.GetString(decryptedBytes);
            }
            catch (Exception ex)
            {
                throw new Exception("AES decryption failed", ex);
            }
        }
    }
}