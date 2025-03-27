using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayServer.utils
{
    public static class AESDecryption
    {
        public static string DecryptMessage(string encryptedText, string key, string iv)
        {
            byte[] cipherBytes = Convert.FromBase64String(encryptedText);
            byte[] keyBytes = Convert.FromBase64String(key);
            byte[] ivBytes = Convert.FromBase64String(iv);

            using Aes aes = Aes.Create();
            using ICryptoTransform decryptor = aes.CreateDecryptor(keyBytes, ivBytes);
            using var ms = new System.IO.MemoryStream(cipherBytes);
            using var cryptoStream = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var reader = new System.IO.StreamReader(cryptoStream);

            return reader.ReadToEnd();
        }
    }
}
