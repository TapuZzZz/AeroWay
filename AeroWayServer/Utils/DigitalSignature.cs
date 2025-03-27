using System;
using System.Security.Cryptography;
using System.Text;

namespace AeroWayServer.utils
{
    public static class DigitalSignature
    {
        public static string SignMessage(string message, string privateKey)
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

        public static bool VerifySignature(string message, string signature, string publicKey)
        {
            using RSA rsa = RSA.Create();
            rsa.FromXmlString(publicKey);

            byte[] messageBytes = Encoding.UTF8.GetBytes(message);
            byte[] signatureBytes = Convert.FromBase64String(signature);

            return rsa.VerifyData(
                messageBytes,
                signatureBytes,
                HashAlgorithmName.SHA256,
                RSASignaturePadding.Pkcs1
            );
        }
    }
}
