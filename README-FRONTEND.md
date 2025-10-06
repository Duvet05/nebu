# 🚀 Despliegue del Frontend Nebu Website

Este documento te guía para desplegar el frontend de Nebu Website en tu servidor usando Docker y Traefik.

## 📋 Requisitos Previos

1. **Stack principal ejecutándose**: El backend, PostgreSQL, Redis y Traefik deben estar corriendo
2. **Dominio configurado**: `flow-telligence.com` debe apuntar a tu IP `62.169.30.44`
3. **Puertos abiertos**: 80, 443 y 8080 en el firewall

## 🛠️ Configuración Inicial

### 1. Configurar variables de entorno

```bash
# Ir al directorio del frontend
cd nebu-website/

# Copiar el template de variables
cp template.env .env

# Editar las variables (especialmente SESSION_SECRET y datos de email)
nano .env
```

### 2. Verificar la configuración

El frontend estará disponible en:
- **Dominio principal**: https://flow-telligence.com
- **Acceso directo**: https://62.169.30.44:8080

## 🚀 Despliegue

### Opción 1: Script automático (Recomendado)

```bash
cd nebu-backend/
./deploy-frontend.sh
```

### Opción 2: Manual

```bash
cd nebu-backend/

# Construir el contenedor
docker compose -f docker-compose.frontend.yml build --no-cache

# Desplegar
docker compose -f docker-compose.frontend.yml up -d

# Verificar estado
docker compose -f docker-compose.frontend.yml ps
```

## 📊 Verificación del Despliegue

### Verificar que el contenedor esté corriendo
```bash
docker ps | grep nebu-frontend
```

### Ver logs del frontend
```bash
docker compose -f docker-compose.frontend.yml logs -f frontend
```

### Verificar health check
```bash
curl http://localhost:3000/api/health
```

### Verificar acceso externo
```bash
curl -I https://flow-telligence.com
curl -I https://62.169.30.44:8080
```

## 🔧 Comandos Útiles

### Reiniciar el frontend
```bash
docker compose -f docker-compose.frontend.yml restart frontend
```

### Reconstruir y redesplegar
```bash
docker compose -f docker-compose.frontend.yml down
docker compose -f docker-compose.frontend.yml build --no-cache
docker compose -f docker-compose.frontend.yml up -d
```

### Detener el frontend
```bash
docker compose -f docker-compose.frontend.yml down
```

### Ver recursos utilizados
```bash
docker stats nebu-frontend
```

## 🐛 Troubleshooting

### El sitio no carga
1. Verificar que el dominio apunte a la IP correcta
2. Verificar que Traefik esté corriendo: `docker ps | grep traefik`
3. Verificar los logs: `docker compose -f docker-compose.frontend.yml logs frontend`

### Error de certificado SSL
1. Verificar que Let's Encrypt pueda acceder al dominio
2. Verificar los logs de Traefik: `docker logs traefik-container-name`

### Puerto 8080 no accesible
1. Verificar que el puerto esté abierto: `ufw status`
2. Abrir el puerto si es necesario: `sudo ufw allow 8080`

## 🏗️ Arquitectura

```
Internet
    ↓
Traefik (Puerto 80/443/8080)
    ↓
Frontend Container (Puerto 3000)
    ↓
Backend API (para datos dinámicos)
```

## 📝 Notas Importantes

- El frontend es estático pero puede hacer llamadas al API del backend
- Los certificados SSL se renuevan automáticamente con Let's Encrypt
- El dominio `flow-telligence.com` ya está configurado en tu DNS
- El acceso directo por IP en puerto 8080 es para debugging/bypass

## 🔒 Seguridad

- Cambia el `SESSION_SECRET` en el archivo `.env`
- El sitio fuerza HTTPS automáticamente
- Las cabeceras de seguridad están configuradas en Traefik
