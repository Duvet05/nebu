# 🤖 Nebu - Consolidated Repository

<div align="center">

![Nebu Logo](https://img.shields.io/badge/Nebu-IoT%20Companion-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

**🤖 Repositorio consolidado para el ecosistema Nebu IoT**

</div>

## 🏗️ Architecture

Consolidated monorepo structure for the Nebu IoT Companion project:

```
nebu/
├── frontend/           # Remix-based frontend
│   ├── app/           # Remix application
│   ├── public/        # Static assets
│   ├── build/         # Production build
│   └── Dockerfile     # Frontend container
├── backend/           # NestJS API backend  
│   ├── src/           # Backend source code
│   ├── dist/          # Compiled backend
│   └── Dockerfile     # Backend container
├── db/                # Database initialization
├── monitoring/        # Grafana, Prometheus configs
├── gateway/           # Traefik configuration
├── redis/             # Redis configuration
├── scripts/           # Deployment scripts
├── docker-compose.prod.yml  # Production setup
└── deploy-prod.sh     # Production deployment
```

## 🚀 Quick Start

### Production Deployment

```bash
# Clone repository
git clone https://github.com/Duvet05/nebu.git
cd nebu

# Setup environment
cp template.env .env
# Edit .env with your configuration

# Deploy
./deploy-prod.sh
```

### Services

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| Frontend | https://62.169.30.44/ | 443 | Remix website |
| Backend API | https://62.169.30.44/api | 443 | NestJS API |
| Dashboard | http://127.0.0.1:9080 | 9080 | Traefik dashboard |
| Grafana | Internal | - | Monitoring dashboard |

## 📊 Features

### ✅ Production Ready
- 🐳 Docker Compose orchestration
- 🔒 SSL/TLS with Let's Encrypt
- 🚦 Traefik reverse proxy
- 📊 Complete monitoring stack
- 🔴 Redis caching
- 💾 PostgreSQL database

### ✅ Google Analytics 4
- 📈 Real-time tracking
- 🎯 Event tracking (CTA clicks, WhatsApp, newsletter)
- 🌍 Multi-device support
- 📱 Mobile optimization

### ✅ Security & Performance
- 🛡️ Rate limiting
- 🔐 Security headers
- 👤 Non-root containers
- 💾 Resource limits
- 🚀 Production optimization

## 🛠️ Development

### Frontend (Remix)
```bash
cd frontend
npm install
npm run dev
```

### Backend (NestJS)  
```bash
cd backend
npm install
npm run start:dev
```

## 📈 Monitoring

- **Grafana**: Dashboards and visualizations
- **Prometheus**: Metrics collection  
- **Loki**: Log aggregation
- **Promtail**: Log shipping

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by Flow-telligence Team**
