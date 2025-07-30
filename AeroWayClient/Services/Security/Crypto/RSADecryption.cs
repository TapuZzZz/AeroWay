using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayClient.Services.Security.Crypto
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
                    throw new Exception("Invalid decrypted AES key format");
                }

                return (parts[0], parts[1]);
            }
            catch (Exception ex)
            {
                throw new Exception("RSA decryption failed", ex);
            }
        }
    }
}