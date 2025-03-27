using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayClientMVC.utils
{
    public static class RSADecryption
    {
        public static (string Key, string IV) DecryptAESKey(string encryptedKeyIV, string privateKey)
        {
            using RSACryptoServiceProvider rsa = new RSACryptoServiceProvider(2048);
            rsa.FromXmlString(privateKey);

            byte[] dataToDecrypt = Convert.FromBase64String(encryptedKeyIV);
            byte[] decryptedData = rsa.Decrypt(dataToDecrypt, false);

            string decryptedText = Encoding.UTF8.GetString(decryptedData);
            string[] parts = decryptedText.Split(':');

            return (parts[0], parts[1]);
        }
    }
}
