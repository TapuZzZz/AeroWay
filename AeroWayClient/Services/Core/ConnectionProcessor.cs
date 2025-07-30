using System;
using System.Net.Sockets;
using System.Threading;
using AeroWayClient.Services.Security;
using AeroWayClient.Services.Log;

namespace AeroWayClient.Services.Core
{
    public class ConnectionProcessor : IDisposable
    {
        private TcpClient? _client;
        private NetworkStream? _stream;
        private bool _isConnected;
        
        // Key exchange results
        public string? ServerPublicKey { get; private set; }
        public string? ClientPublicKey { get; private set; }
        public string? ClientPrivateKey { get; private set; }
        
        // Connection info
        private readonly string _serverHost;
        private readonly int _serverPort;
        
        public bool IsConnected => _isConnected && _client?.Connected == true;
        public NetworkStream? Stream => _stream;
        
        public ConnectionProcessor(string serverHost = "127.0.0.1", int serverPort = 8000)
        {
            _serverHost = serverHost;
            _serverPort = serverPort;
            _isConnected = false;
            LogManager.Debug($"ConnectionProcessor created for {serverHost}:{serverPort}", "ConnectionProcessor");
        }
        
        public bool Connect()
        {
            try
            {
                LogManager.Info($"Connecting to {_serverHost}:{_serverPort}...", "ConnectionProcessor");
                
                // Create TCP connection
                _client = new TcpClient();
                _client.Connect(_serverHost, _serverPort);
                _stream = _client.GetStream();
                
                LogManager.Info("TCP connection established successfully", "ConnectionProcessor");
                
                // Perform key exchange
                LogManager.Info("Starting key exchange process", "ConnectionProcessor");
                var keyExchange = new KeyExchange();
                var keyResult = keyExchange.PerformKeyExchange(_stream);
                
                if (!keyResult.Success)
                {
                    LogManager.Error($"Key exchange failed: {keyResult.ErrorMessage}", "ConnectionProcessor");
                    Disconnect();
                    return false;
                }
                
                // Store keys
                ServerPublicKey = keyResult.ServerPublicKey;
                ClientPublicKey = keyResult.ClientPublicKey;
                ClientPrivateKey = keyResult.ClientPrivateKey;
                
                _isConnected = true;
                
                LogManager.Info("Connection established successfully with key exchange completed", "ConnectionProcessor");
                return true;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Connection failed: {ex.Message}", "ConnectionProcessor");
                Disconnect();
                return false;
            }
        }
        
        public void Disconnect()
        {
            try
            {
                _isConnected = false;
                
                if (_stream != null)
                {
                    _stream.Close();
                    _stream.Dispose();
                    _stream = null;
                    LogManager.Debug("Network stream closed", "ConnectionProcessor");
                }
                
                if (_client != null)
                {
                    _client.Close();
                    _client.Dispose();
                    _client = null;
                    LogManager.Debug("TCP client closed", "ConnectionProcessor");
                }
                
                // Clear keys
                ServerPublicKey = null;
                ClientPublicKey = null;
                ClientPrivateKey = null;
                
                LogManager.Info("Disconnected from server", "ConnectionProcessor");
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error during disconnect: {ex.Message}", "ConnectionProcessor");
            }
        }
        
        public string SendEncryptedMessage(string plainMessage)
        {
            if (!IsConnected || _stream == null)
            {
                LogManager.Error("Cannot send message - not connected to server", "ConnectionProcessor");
                throw new InvalidOperationException("Not connected to server");
            }
            
            if (string.IsNullOrEmpty(ServerPublicKey) || string.IsNullOrEmpty(ClientPrivateKey))
            {
                LogManager.Error("Cannot send message - keys not available", "ConnectionProcessor");
                throw new InvalidOperationException("Keys not available");
            }
            
            try
            {
                LogManager.Debug($"Sending encrypted message, plain length: {plainMessage.Length}", "ConnectionProcessor");
                
                // Encrypt message
                var encryptor = new MessageEncryptor();
                string encryptedMessage = encryptor.EncryptMessage(plainMessage, ClientPrivateKey, ServerPublicKey);
                
                // Send encrypted message
                byte[] messageBytes = MessageConverter.StringToBytes(encryptedMessage);
                _stream.Write(messageBytes, 0, messageBytes.Length);
                _stream.Flush();
                
                LogManager.Info($"Sent encrypted message, size: {messageBytes.Length} bytes", "ConnectionProcessor");
                
                // Wait for response
                LogManager.Debug("Waiting for server response...", "ConnectionProcessor");
                int timeout = 0;
                while (!_stream.DataAvailable && timeout < 50) // 5 seconds timeout
                {
                    Thread.Sleep(100);
                    timeout++;
                }
                
                if (!_stream.DataAvailable)
                {
                    LogManager.Error("Timeout waiting for server response", "ConnectionProcessor");
                    throw new TimeoutException("Timeout waiting for server response");
                }
                
                // Read encrypted response
                string encryptedResponse = MessageConverter.ReadMessageFromStream(_stream);
                
                if (string.IsNullOrEmpty(encryptedResponse))
                {
                    LogManager.Error("No response received from server", "ConnectionProcessor");
                    throw new Exception("No response received from server");
                }
                
                LogManager.Info($"Received encrypted response, length: {encryptedResponse.Length}", "ConnectionProcessor");
                
                // Decrypt response
                var decryptor = new MessageDecryptor();
                string decryptedResponse = decryptor.DecryptMessage(encryptedResponse, ClientPrivateKey, ServerPublicKey);
                
                LogManager.Debug("Response decrypted successfully", "ConnectionProcessor");
                
                return decryptedResponse;
            }
            catch (Exception ex)
            {
                LogManager.Error($"Error sending encrypted message: {ex.Message}", "ConnectionProcessor");
                throw;
            }
        }
        
        public void Dispose()
        {
            LogManager.Debug("Disposing ConnectionProcessor", "ConnectionProcessor");
            Disconnect();
        }
    }
}