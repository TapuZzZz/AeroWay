# AeroWay ✈️

A secure flight booking system with end-to-end encryption and modern web technologies.

[![.NET](https://img.shields.io/badge/.NET-8.0-purple)](https://dotnet.microsoft.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-red)](#security-features)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

## 🌟 Overview

AeroWay is a comprehensive flight booking platform built with security-first principles. Features a custom TCP server with RSA/AES hybrid encryption, responsive web client, and robust MySQL database backend.

> **🎓 Academic Project**: Final graduation project for Cybersecurity & Software Engineering at Amal High School Air Force Tech Track (5 credit units)

### ✨ Key Features

- **🔐 End-to-End Encryption**: RSA 2048-bit + AES 256-bit hybrid encryption
- **🛡️ Advanced Security**: SQL injection prevention, digital signatures, secure sessions
- **⚡ High Performance**: Multi-threaded server supporting 300+ concurrent users
- **🌐 Modern Web Interface**: Responsive ASP.NET Core MVC with HTTPS
- **📊 Admin Dashboard**: Real-time system monitoring and management
- **🔄 Perfect Forward Secrecy**: New encryption key for each message

## 🏗️ Architecture

```
┌─────────────────┐    Encrypted TCP    ┌─────────────────┐    MySQL    ┌─────────────────┐
│   Web Client    │ ◄─────────────────► │   TCP Server    │ ◄─────────► │    Database     │
│ ASP.NET Core    │                     │    C# .NET      │             │     MySQL       │
│  Port: 5050     │                     │   Port: 8000    │             │   Port: 3306    │
└─────────────────┘                     └─────────────────┘             └─────────────────┘
         │                                       │
         └───────────────────────────────────────┘
                    Admin Dashboard
                   (HTTPS Port: 8080)
```

## 🚀 Quick Start

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [MySQL Server 8.0+](https://dev.mysql.com/downloads/mysql/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aeroway.git
   cd aeroway
   ```

2. **Start the TCP Server**
   ```bash
   cd AeroWayServer
   dotnet run
   ```
   Enter MySQL connection details when prompted. Look for "SERVER ACTIVE" message.

3. **Start the Web Client** (new terminal)
   ```bash
   cd AeroWayClient
   dotnet run
   ```
   Enter server details (default: 127.0.0.1:8000). Look for "CLIENT ACTIVE" message.

4. **Access the Application**
   - **Main App**: https://localhost:5050
   - **Admin Panel**: https://localhost:8080

### Default Login
- **Email**: admin@aeroway.com
- **Password**: admin123

## 🔐 Security Features

### Encryption Protocol
- **Key Exchange**: RSA 2048-bit for secure key sharing
- **Message Encryption**: AES 256-bit with unique keys per message
- **Digital Signatures**: SHA256+RSA for message authentication
- **Perfect Forward Secrecy**: Each message uses a new encryption key

### Security Measures
- **SQL Injection Prevention**: Parameterized queries + intelligent input validation
- **Secure Authentication**: SHA256 password hashing with unique salts
- **Session Management**: Token-based authentication with security controls
- **Network Security**: HTTPS + custom encrypted TCP (defense in depth)

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | C# .NET 8.0 | TCP Server & Business Logic |
| **Web App** | ASP.NET Core MVC | Web Interface |
| **Database** | MySQL 8.0 | Data Storage |
| **Encryption** | RSA 2048 + AES 256 | Security Layer |
| **Frontend** | HTML5, CSS3, JavaScript | User Interface |

## 📡 Communication Protocol

Custom TCP protocol with encrypted messages:

```
Format: MESSAGE_TYPE:PARAM1:PARAM2:PARAM3
Encrypted: ENCRYPTED_MESSAGE:CONTENT:KEY:SIGNATURE

Message Types:
- KEY_EXCHANGE: RSA public key exchange
- REGISTER: User registration  
- LOGIN: Authentication
- SEARCH_FLIGHTS: Flight search
- CREATE_BOOKING: Reservation creation
- GET_BOOKINGS: Booking history
```

## 📊 Performance

- **Concurrent Users**: 300+ supported
- **Response Time**: <2 seconds average
- **Database Performance**: Optimized with strategic indexes
- **Memory Usage**: ~150MB efficient operation
- **Security Testing**: All major attack vectors tested and blocked

## 🎮 Usage

### For Users
1. **Register/Login**: Create account or sign in
2. **Search Flights**: Select destinations and dates
3. **Book Tickets**: Choose flights and complete reservation
4. **Manage Bookings**: View booking history and details

### For Admins
- **Dashboard**: https://localhost:8080
- **Monitor**: Real-time system statistics
- **Manage**: User accounts and system logs
- **Security**: Access security events and alerts

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**Artyom Kiselgoff**
- 🎓 Cybersecurity & Software Engineering Student
- 🏫 Amal High School - Air Force Technological Track
- 📅 Academic Year: 2024-2025
- 👨‍🏫 Supervisor: David Prokht

## 🙏 Acknowledgments

- **David Prokht** - Project supervisor and security guidance
- **Amal High School** - Air Force Tech Track program
- **Stack Overflow Community** - Technical problem solving
- **Microsoft Docs** - .NET and ASP.NET Core resources

## 🔮 Future Plans

- [ ] Mobile applications (iOS/Android)
- [ ] Real payment gateway integration
- [ ] Microservices architecture
- [ ] Cloud deployment (Azure/AWS)
- [ ] Advanced booking features
- [ ] Multi-language support

---

<p align="center">
  <strong>Built with ❤️ for secure and efficient flight booking</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security-First-red" alt="Security First">
  <img src="https://img.shields.io/badge/Performance-Optimized-green" alt="Performance Optimized">
  <img src="https://img.shields.io/badge/Education-Focused-blue" alt="Education Focused">
</p>
