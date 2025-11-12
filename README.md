#  Nebu - Consolidated Repository

<div align="center">

![Nebu Logo](https://img.shields.io/badge/Nebu-IoT%20Companion-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

** Repositorio consolidado para el ecosistema Nebu IoT**

</div>

## ️ Architecture

Consolidated monorepo structure for the Nebu IoT Companion project:

```
nebu/
├── frontend/           # Remix-based frontend
│   ├── app/           # Remix application
│   ├── public/        # Static assets
│   └── Dockerfile     # Frontend container
├── backend/           # NestJS API backend
│   ├── src/           # Backend source code
│   │   └── config/
│   │       └── constants/  # Constantes centralizadas ✨
│   └── Dockerfile     # Backend container
├── db/                # Database initialization
├── monitoring/        # Grafana, Prometheus, Loki configs
├── scripts/           # Deployment & migration scripts
├── docker-compose.yml # Core services
├── docker-compose.monitoring.yml  # Monitoring stack
└── template.env       # Template de configuración (34 vars)
```

##  Quick Start

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

##  Features

### Production Ready
-  Docker Compose orchestration
-  SSL/TLS with Let's Encrypt
-  Traefik reverse proxy
-  Complete monitoring stack
-  Redis caching
-  PostgreSQL database

### Google Analytics 4
-  Real-time tracking
-  Event tracking (CTA clicks, WhatsApp, newsletter)
-  Multi-device support
-  Mobile optimization

### Security & Performance
-  Rate limiting
-  Security headers
-  Non-root containers
-  Resource limits
-  Production optimization

##  Configuration

### Environment Variables

El proyecto usa una configuración centralizada optimizada (54% menos variables):

```bash
# Setup environment
cp template.env .env
# Editar .env con tus valores (solo 34 variables esenciales)
```

**Variables esenciales** (34 total):
- Secretos y credenciales (JWT, Database, APIs)
- Configuración por entorno (URLs, dominio, puertos)
- Configuración específica (memoria AI, emails)

**Constantes hardcodeadas** (40+ variables movidas a código):
- Información de la aplicación → `application.constants.ts`
- Configuración de seguridad → `security.constants.ts`
- Reglas de negocio de pagos → `payments.constants.ts`
- Feature flags → `features.constants.ts`
- Configuración de Redis → `redis.constants.ts`

Ver documentación completa:
- [MIGRACION_CONSTANTES.md](MIGRACION_CONSTANTES.md) - Guía de migración
- [PROPUESTA_CENTRALIZACION.md](PROPUESTA_CENTRALIZACION.md) - Justificación técnica

## ️ Development

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

### Docker Compose

**Servicios Core** (docker-compose.yml):
```bash
docker compose up -d
```
Incluye: Traefik, Frontend, Backend, PostgreSQL, Redis, ChromaDB

**Stack de Monitoreo** (docker-compose.monitoring.yml):
```bash
docker compose -f docker-compose.monitoring.yml up -d
```
Incluye: Prometheus, Grafana, Loki, Promtail

##  Monitoring

- **Grafana**: Dashboards and visualizations
- **Prometheus**: Metrics collection  
- **Loki**: Log aggregation
- **Promtail**: Log shipping

##  Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

##  License

MIT License - see LICENSE file for details.

---

**Built with ️ by Flow-telligence Team**
