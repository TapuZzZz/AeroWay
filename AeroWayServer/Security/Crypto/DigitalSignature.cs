using System;
using System.Security.Cryptography;
using System.Text;
using AeroWayServer.Log;

namespace AeroWayServer.Security.Crypto
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

                string result = Convert.ToBase64String(signature);
                LogManager.Debug("Digital signature created successfully", "DigitalSignature");
                return result;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Digital signature creation failed: {ex.Message}", "DigitalSignature");
                return string.Empty;
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

                if (isValid)
                {
                    LogManager.Debug("Digital signature verification succeeded", "DigitalSignature");
                }
                else
                {
                    LogManager.Warning("Digital signature verification failed - signature is invalid", "DigitalSignature");
                }

                return isValid;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Digital signature verification failed: {ex.Message}", "DigitalSignature");
                return false;
            }
        }
    }
}