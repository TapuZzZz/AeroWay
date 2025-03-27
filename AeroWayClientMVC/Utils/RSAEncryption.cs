using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayClientMVC.utils
{
    public static class RSAEncryption
    {
        public static string EncryptAESKey(string key, string iv, string publicKey)
        {
            using RSACryptoServiceProvider rsa = new RSACryptoServiceProvider(2048);
            rsa.FromXmlString(publicKey);

            string combinedKeyIV = $"{key}:{iv}";
            byte[] dataToEncrypt = Encoding.UTF8.GetBytes(combinedKeyIV);
            byte[] encryptedData = rsa.Encrypt(dataToEncrypt, false);

            return Convert.ToBase64String(encryptedData);
        }
    }
}