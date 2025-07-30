using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayClient.Services.Security.Crypto
{
    public static class DigitalSignature
    {
        public static string SignMessage(string message, string privateKey)
        {
            try
            {
                using RSA rsa = RSA.Create();
                rsa.FromXmlString(privateKey);

                byte[] messageBytes = Encoding.UTF8.GetBytes(message);
                byte[] signature = rsa.SignData(
                    messageBytes, 
                    HashAlgorithmName.SHA256, 
                    RSASignaturePadding.Pkcs1
                );

                return Convert.ToBase64String(signature);
            }
            catch (Exception ex)
            {
                throw new Exception("Digital signature creation failed", ex);
            }
        }

        public static bool VerifySignature(string message, string signature, string publicKey)
        {
            try
            {
                using RSA rsa = RSA.Create();
                rsa.FromXmlString(publicKey);

                byte[] messageBytes = Encoding.UTF8.GetBytes(message);
                byte[] signatureBytes = Convert.FromBase64String(signature);

                bool isValid = rsa.VerifyData(
                    messageBytes,
                    signatureBytes,
                    HashAlgorithmName.SHA256,
                    RSASignaturePadding.Pkcs1
                );

                return isValid;
            }
            catch (Exception ex)
            {
                throw new Exception("Digital signature verification failed", ex);
            }
        }
    }
}