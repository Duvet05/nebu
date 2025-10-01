#  Nebu Mobile - AI-Powered IoT & Voice Control Platform

[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://docker.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io)
[![LiveKit](https://img.shields.io/badge/LiveKit-Real--time-purple.svg)](https://livekit.io)
[![React Native](https://img.shields.io/badge/React%20Native-Mobile-blue.svg)](https://reactnative.dev)

A cutting-edge platform combining **React Native mobile app**, **NestJS backend**, **LiveKit real-time communication**, and **IoT device control** for seamless voice-powered robot and device management.

##  Quick Start

### Prerequisites

- **Ubuntu/Debian** system with `apt` package manager
- **Internet connection** for downloading dependencies
- **sudo privileges** for package installation

### One-Command Installation

```bash
# Clone the repository
git clone <your-repository-url>
cd nebu-mobile

# Run the automated installer
./prerrequisites.sh

# Log out and log back in (or run: newgrp docker)
# Then start the application
make dev
```

That's it! Your application will be running at:
-  **Backend API**: http://localhost:3001
- 📚 **API Documentation**: http://localhost:3001/api/docs
- 🎙️ **LiveKit Server**: http://localhost:7880
-  **Traefik Dashboard**: http://localhost:8080

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Mobile App │    │    IoT Robot  │    │  🎙️ Voice Agent│
│  (React Native) │    │   (Any Device)  │    │   (AI Powered)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ ┌─────────────────────┼───────────────────────┼─────┐
         │ │              🎬 LiveKit Server              │     │
         │ │         (Real-time Communication)           │     │
         │ └─────────────────────┼───────────────────────┼─────┘
         │                       │                       │
         └─────────────────┐     │     ┌─────────────────┘
                           │     │     │
                    ┌─────────────────────────┐
                    │    NestJS Backend    │
                    │   (API & Coordination)  │
                    │      Port: 3001         │
                    └─────────────────────────┘
                              │
                    ┌─────────────────────────┐
                    │     🗄️ PostgreSQL      │
                    │   (Data & Sessions)     │
                    │      Port: 5432         │
                    └─────────────────────────┘
                              │
                    ┌─────────────────────────┐
                    │       Redis Cache     │
                    │   (Sessions & Queue)    │
                    │      Port: 6379         │
                    └─────────────────────────┘
```

##  Features & Capabilities

###  Mobile App (React Native)
-  **Voice Control**: AI-powered voice commands for robot control
-  **Real-time Communication**: Direct audio/video with IoT devices
-  **Device Management**: Register, monitor, and control IoT devices
-  **Live Streaming**: View camera feeds from robots in real-time
-  **Sensor Monitoring**: Real-time telemetry and sensor data
-  **Cross-platform**: iOS and Android support via Expo

### Backend API (NestJS)
-  **230+ Endpoints**: Comprehensive REST API with Swagger documentation
-  **IoT Device Registry**: Manage and coordinate multiple robots/devices
-  **Voice Session Management**: AI conversation tracking and analytics
-  **Real-time Coordination**: LiveKit integration for instant communication
-  **Analytics & Insights**: Device performance and usage analytics
-  **Authentication**: JWT-based secure access with refresh tokens

### 🎙️ LiveKit Integration
-  **Real-time Audio/Video**: Ultra-low latency communication
-  **Data Channels**: Send commands and receive sensor data
-  **Multi-participant**: Support for multiple users and devices
-  **Automatic Reconnection**: Robust connection handling
-  **Room Management**: Dynamic room creation and participant management

###  IoT & Robot Support
-  **Device Types**: Sensors, actuators, cameras, microphones, speakers
-  **Network Flexibility**: WiFi, Ethernet, 4G/5G connectivity options
-  **Auto-discovery**: Automatic backend and LiveKit server discovery
-  **Command Processing**: Voice-to-action command translation
-  **Telemetry**: Battery, temperature, humidity, position tracking

##  Mobile App Deployment

### Quick Deploy with Expo
```bash
cd mobile

# Development build (recommended)
npx eas build --profile development --platform android

# Preview build for testing
npx eas build --profile preview --platform android

# Production build
npx eas build --profile production --platform android
```

### Network Configuration
The mobile app can connect to the backend in multiple ways:
- **Local Network**: Same WiFi as backend (localhost:3001)
- **Remote Server**: Backend deployed on cloud server
- **Hotspot**: Using mobile hotspot for portable setup

##  Robot Integration

### Supported Connection Methods
1. **Same WiFi Network**: Robot and backend on same local network
2. **Ethernet + WiFi**: Robot wired, backend on WiFi
3. **Internet Connection**: Robot with 4G/5G, backend on cloud
4. **Mobile Hotspot**: Portable setup using phone's hotspot

### Robot Setup Example (Python)
```python
import requests
import livekit_client

# 1. Register with backend
device_response = requests.post(
    "http://192.168.1.100:3001/api/v1/iot/devices",
    json={
        "name": "My Robot",
        "deviceType": "controller",
        "location": "Living Room"
    }
)

# 2. Get LiveKit connection info
token_response = requests.get(
    f"http://192.168.1.100:3001/api/v1/iot/devices/{device_id}/livekit-token"
)

# 3. Connect to LiveKit for real-time communication
room = livekit_client.Room()
await room.connect(
    token_response["livekitUrl"],
    token_response["token"]
)
```

## 🛠️ Available Commands

### Development Commands
```bash
make dev              # Start development environment
make start            # Start all services
make stop             # Stop all services
make restart          # Restart all services
make status           # Show service status
```

### Database Commands
```bash
make db-init          # Initialize databases
make db-migrate       # Run database migrations
make db-seed          # Seed database with initial data
make db-backup        # Create database backup
```

### Monitoring & Debugging
```bash
make logs             # Show logs for all services
make health           # Run health checks
make ps               # Show running containers
```

## 🐳 Docker Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| **backend** | Custom NestJS | 3001 | REST API, IoT coordination, and business logic |
| **livekit** | livekit/livekit-server | 7880, 7881, 7882 | Real-time communication server |
| **postgres** | postgres:15-alpine | 5432 | Primary database for users, sessions, devices |
| **redis** | redis:7-alpine | 6379 | Cache, session store, and LiveKit state |
| **traefik** | traefik:v3.0 | 80/443 | Reverse proxy and load balancer |

## 🔍 Health Checks

All services include health checks. Monitor status with:

```bash
make health
```

Individual service health:
- Backend: http://localhost:3001/api/v1/health
- LiveKit: http://localhost:7880/
- Traefik: http://localhost:8080/ping

API Documentation:
- Swagger UI: http://localhost:3001/api/docs
- OpenAPI Spec: http://localhost:3001/api/docs-json

## 📁 Project Structure

```
nebu-mobile/
├── 📁 backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # Authentication & Authorization
│   │   ├── iot/               # IoT Device Management
│   │   ├── livekit/           # LiveKit Integration
│   │   ├── voice/             # Voice Agent & AI Sessions
│   │   ├── users/             # User Management
│   │   ├── analytics/         # Analytics & Insights
│   │   ├── notifications/     # Push Notifications
│   │   └── ...                # 20+ feature modules
│   └── Dockerfile
├── 📁 mobile/                 # React Native Mobile App
│   ├── src/
│   │   ├── components/        # Reusable UI Components
│   │   ├── screens/           # App Screens
│   │   ├── services/          # API & LiveKit Services
│   │   ├── navigation/        # Navigation Setup
│   │   └── store/             # State Management
│   ├── app.json              # Expo Configuration
│   └── eas.json              # EAS Build Configuration
├── 📁 livekit/                # LiveKit Server Configuration
│   └── livekit.yaml          # LiveKit Config
├── 📁 scripts/                # Automation Scripts
├── 📁 db/                     # Database Scripts & Backups
├── 📁 gateway/                # Traefik Configuration
├── 📁 monitoring/             # Grafana & Prometheus
├── docker-compose.yml         # Main Docker Compose
├── Makefile                   # Development Commands
├── prerrequisites.sh          # Automated Installer
└── template.env               # Environment Template
```

## Use Cases

###  Home Automation
- Control smart home devices via voice commands
- Monitor environmental sensors (temperature, humidity)
- Security camera streaming and control

### 🏭 Industrial IoT
- Remote robot operation and monitoring
- Real-time sensor data collection
- Equipment status and maintenance alerts

### 🎓 Educational Robotics
- Programming and controlling educational robots
- Real-time sensor data visualization
- Multi-user collaborative robot control

### 🚗 Autonomous Vehicles
- Remote vehicle monitoring and control
- Real-time telemetry and GPS tracking
- Emergency intervention capabilities

##  Troubleshooting

### Common Issues

1. **Docker permission denied**
   ```bash
   sudo usermod -aG docker $USER
   # Log out and log back in
   ```

2. **Port already in use**
   ```bash
   make stop
   # Check what's using the port
   sudo netstat -tulpn | grep :3001
   ```

3. **LiveKit connection failed**
   ```bash
   # Check LiveKit status
   docker logs nebu-mobile-livekit
   # Restart if needed
   docker-compose restart livekit
   ```

4. **Mobile app can't connect**
   ```bash
   # Update IP in mobile app config
   # mobile/src/services/api.ts
   # Change localhost to your machine's IP
   ```

## Configuration

### Environment Variables

Copy and edit the environment file:
```bash
cp template.env .env
nano .env
```

Key variables:
```bash
# LiveKit Configuration
LIVEKIT_URL=http://livekit:7880
LIVEKIT_WS_URL=ws://localhost:7880  # Change to your IP for mobile access

# Database
DATABASE_PASSWORD=your_secure_password

# Authentication
JWT_SECRET=your_jwt_secret
```

## 🔒 Security

- All services run in isolated Docker networks
- JWT authentication with refresh tokens
- Environment variables for sensitive data
- CORS protection for mobile app access
- Rate limiting and security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `make dev`
5. Submit a pull request

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review logs with `make logs`
3. Run health checks with `make health`
4. Create an issue in the repository

---

**Made with  for the Future of IoT & Robotics**