using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Security.Cryptography;
using System.Threading;
using AeroWayClientMVC.utils;
using System.Timers;

namespace AeroWayClientMVC.Models
{
    public class MessageModel
    {
        private readonly string _serverIp = "127.0.0.1";
        private readonly int _serverPort = 8000;

        private TcpClient? _client;
        private NetworkStream? _stream;

        private string? _clientPublicKey;
        private string? _clientPrivateKey;
        private string? _serverPublicKey;

        private bool _isConnected = false;
        private System.Timers.Timer? _pingTimer;

        public void StartSession()
        {
            try
            {
                _client = new TcpClient(_serverIp, _serverPort);
                _stream = _client.GetStream();

                _serverPublicKey = ReceiveServerPublicKey();
                GenerateClientKeys();
                SendClientPublicKey();

                _isConnected = true;

                Thread listenThread = new Thread(ListenToServer);
                listenThread.IsBackground = true;
                listenThread.Start();

                StartPing();

            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Connection failed: {ex.Message}");
            }
        }

        public void SendMessage(string plainMessage)
        {
            if (!_isConnected || _stream == null || _serverPublicKey == null || _clientPrivateKey == null)
            {
                Console.WriteLine("❌ Not connected to the server.");
                return;
            }

            try
            {
                var aesResult = AESEncryption.EncryptMessage(plainMessage);
                string encryptedKeyIV = RSAEncryption.EncryptAESKey(aesResult.Key, aesResult.IV, _serverPublicKey);
                string signature = DigitalSignature.SignMessage(aesResult.EncryptedText, _clientPrivateKey);

                string finalMessage = $"{aesResult.EncryptedText}|{encryptedKeyIV}|{signature}";
                byte[] messageBytes = Encoding.UTF8.GetBytes(finalMessage);

                _stream.Write(messageBytes, 0, messageBytes.Length);
                _stream.Flush();

                Console.WriteLine($"📤 Sent: {plainMessage}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error sending message: {ex.Message}");
            }
        }

        private string ReceiveServerPublicKey()
        {
            if (_stream == null) throw new InvalidOperationException("Stream is not initialized.");

            byte[] buffer = new byte[2048];
            int bytesRead = _stream.Read(buffer, 0, buffer.Length);
            string serverPublicKey = Encoding.UTF8.GetString(buffer, 0, bytesRead);
            return serverPublicKey;
        }

        private void GenerateClientKeys()
        {
            var rsaClient = RSA.Create();
            _clientPublicKey = rsaClient.ToXmlString(false);
            _clientPrivateKey = rsaClient.ToXmlString(true);
        }

        private void SendClientPublicKey()
        {
            if (_stream == null || _clientPublicKey == null) throw new InvalidOperationException("Stream or client public key is not initialized.");

            byte[] clientPublicKeyBytes = Encoding.UTF8.GetBytes(_clientPublicKey);
            _stream.Write(clientPublicKeyBytes, 0, clientPublicKeyBytes.Length);
            _stream.Flush();
        }

        private void ListenToServer()
        {
            try
            {
                byte[] buffer = new byte[4096];

                while (_isConnected && _stream != null && _clientPrivateKey != null)
                {
                    int bytesRead = _stream.Read(buffer, 0, buffer.Length);
                    if (bytesRead == 0)
                    {
                        Console.WriteLine("🔴 Server closed the connection.");
                        _isConnected = false;
                        break;
                    }

                    string responseData = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                    string[] parts = responseData.Split('|');
                    if (parts.Length != 2)
                    {
                        Console.WriteLine("❌ Invalid response format.");
                        continue;
                    }

                    string encryptedResponseMessage = parts[0];
                    string encryptedResponseKeyIV = parts[1];

                    var (responseAESKey, responseAESIV) = RSADecryption.DecryptAESKey(encryptedResponseKeyIV, _clientPrivateKey);
                    string decryptedResponseMessage = AESDecryption.DecryptMessage(encryptedResponseMessage, responseAESKey, responseAESIV);

                    Console.WriteLine($"📥 Server Response: {decryptedResponseMessage}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error listening to server: {ex.Message}");
                _isConnected = false;
            }
        }

        private void StartPing()
        {
            _pingTimer = new System.Timers.Timer(30000); // כל 30 שניות
            _pingTimer.Elapsed += (sender, e) => SendMessage("PING");
            _pingTimer.AutoReset = true;
            _pingTimer.Start();
        }

        public void CloseSession()
        {
            _isConnected = false;
            _pingTimer?.Stop();
            _stream?.Close();
            _client?.Close();
            Console.WriteLine("🔌 Session closed.");
        }
    }
}