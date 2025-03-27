using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayClientMVC.utils
{
    public static class AESEncryption
    {
        public static (string EncryptedText, string Key, string IV) EncryptMessage(string plainText)
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

            return (encryptedText, key, iv);
        }
    }
}
