#!/bin/bash

# ===========================================
# DEPLOY OPTIMIZADO - PRODUCCIÓN SEGURA
# ===========================================
# Version 2.1 - Sin Docker Secrets, máxima seguridad
# Implementa todas las mejoras críticas de seguridad y performance

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 INICIANDO DESPLIEGUE SEGURO Y OPTIMIZADO...${NC}"

# ===========================================
# 1. VALIDACIONES PRE-DESPLIEGUE
# ===========================================
echo -e "${YELLOW}📋 1. Validaciones previas...${NC}"

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    exit 1
fi

# Verificar variables críticas
required_vars=("DATABASE_PASSWORD" "JWT_SECRET" "REFRESH_TOKEN_SECRET" "REDIS_PASSWORD" "GRAFANA_PASSWORD")
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        echo -e "${RED}❌ Error: Variable ${var} no encontrada en .env${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Validaciones completadas${NC}"

# ===========================================
# 2. PREPARACIÓN DEL ENTORNO
# ===========================================
echo -e "${YELLOW}🔧 2. Preparando entorno seguro...${NC}"

# Verificar recursos del sistema
echo "📊 Recursos del sistema:"
echo "  - RAM disponible: $(free -h | awk '/^Mem:/ {print $7}')"
echo "  - CPU cores: $(nproc)"
echo "  - Disk space: $(df -h / | awk 'NR==2 {print $4}' | head -1)"

# Crear directorios necesarios con permisos seguros
sudo mkdir -p ./gateway/letsencrypt
sudo chmod 600 ./gateway/letsencrypt
sudo mkdir -p ./monitoring/{grafana/{dashboards,datasources},prometheus}
sudo chmod -R 755 ./monitoring

echo -e "${GREEN}✅ Entorno preparado${NC}"

# ===========================================
# 3. DETENER SERVICIOS EXISTENTES
# ===========================================
echo -e "${YELLOW}🛑 3. Deteniendo servicios existentes...${NC}"

# Detener con gracia servicios existentes
if docker compose -f docker-compose.prod.yml ps -q > /dev/null 2>&1; then
    echo "  Deteniendo stack de producción existente..."
    docker compose -f docker-compose.prod.yml down --timeout 30
fi

if docker compose -f docker-compose.yml ps -q > /dev/null 2>&1; then
    echo "  Deteniendo stack de desarrollo..."
    docker compose -f docker-compose.yml down --timeout 30
fi

echo -e "${GREEN}✅ Servicios detenidos${NC}"

# ===========================================
# 4. CONSTRUCCIÓN DE IMÁGENES OPTIMIZADAS
# ===========================================
echo -e "${YELLOW}🔨 4. Construyendo imágenes optimizadas...${NC}"

# Build con optimizaciones de seguridad
docker compose -f docker-compose.optimized.yml build \
    --no-cache \
    --compress \
    --parallel \
    --pull

# Verificar que las imágenes se construyeron correctamente
if ! docker images | grep -q "nebu"; then
    echo -e "${RED}❌ Error: Imágenes no construidas correctamente${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Imágenes construidas${NC}"

# ===========================================
# 5. VALIDACIÓN DE CONFIGURACIÓN DE SEGURIDAD
# ===========================================
echo -e "${YELLOW}🔐 5. Validando configuración de seguridad...${NC}"

# Verificar permisos de archivos críticos
chmod 600 .env
chmod -R 600 secrets/ 2>/dev/null || true

# Verificar que no hay puertos inseguros expuestos
if grep -q "8080:8080" docker-compose.optimized.yml; then
    echo -e "${YELLOW}⚠️  Advertencia: Puerto 8080 expuesto - removiendo...${NC}"
    sed -i '/8080:8080/d' docker-compose.optimized.yml
fi

echo -e "${GREEN}✅ Configuración de seguridad validada${NC}"

# ===========================================
# 6. DESPLIEGUE DEL STACK OPTIMIZADO
# ===========================================
echo -e "${YELLOW}🚀 6. Desplegando stack optimizado...${NC}"

# Desplegar con configuración optimizada
docker compose -f docker-compose.optimized.yml up -d --remove-orphans

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

echo -e "${GREEN}✅ Stack desplegado${NC}"

# ===========================================
# 7. VERIFICACIONES POST-DESPLIEGUE
# ===========================================
echo -e "${YELLOW}📊 7. Verificaciones finales...${NC}"

echo "🔍 Estado de contenedores:"
docker compose -f docker-compose.optimized.yml ps

echo ""
echo "🏥 Health checks:"

# Verificar health de servicios críticos
services=("nebu-postgres-prod" "nebu-redis-prod" "nebu-backend-prod" "nebu-frontend")
for service in "${services[@]}"; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$service.*healthy"; then
        echo -e "  ✅ $service: healthy"
    elif docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$service.*Up"; then
        echo -e "  🟡 $service: running (health check pendiente)"
    else
        echo -e "  ❌ $service: not running"
    fi
done

echo ""
echo "🌐 Pruebas de conectividad:"

# Probar endpoints principales (con timeout)
timeout 10 curl -s -o /dev/null -w "Frontend: %{http_code}\n" -k https://62.169.30.44/ || echo "Frontend: timeout"
timeout 10 curl -s -o /dev/null -w "Dashboard: %{http_code}\n" http://127.0.0.1:9080/ping || echo "Dashboard: timeout"

echo ""

# ===========================================
# 8. OPTIMIZACIONES POST-DESPLIEGUE
# ===========================================
echo -e "${YELLOW}⚡ 8. Aplicando optimizaciones post-despliegue...${NC}"

# Limpiar imágenes y contenedores huérfanos
docker image prune -f > /dev/null 2>&1 || true
docker container prune -f > /dev/null 2>&1 || true

# Configurar logrotate para logs de Docker (opcional)
if command -v logrotate >/dev/null 2>&1; then
    echo "📝 Configurando rotación de logs..."
    sudo cat > /etc/logrotate.d/docker-nebu << EOF
/var/lib/docker/containers/*/*-json.log {
    daily
    rotate 7
    compress
    missingok
    delaycompress
    copytruncate
    maxsize 100M
}
EOF
fi

echo -e "${GREEN}✅ Optimizaciones aplicadas${NC}"

# ===========================================
# 9. RESUMEN FINAL
# ===========================================
echo ""
echo -e "${BLUE}🎉 ¡DESPLIEGUE OPTIMIZADO COMPLETADO!${NC}"
echo ""
echo -e "${GREEN}📋 RESUMEN DE MEJORAS IMPLEMENTADAS:${NC}"
echo ""
echo -e "${GREEN}🔴 SEGURIDAD CRÍTICA:${NC}"
echo -e "  ✅ Variables de entorno seguras (sin Docker Secrets)"
echo -e "  ✅ Puerto 8080 removido de Traefik"
echo -e "  ✅ Límites de recursos en PostgreSQL y Redis"
echo -e "  ✅ Redis con autenticación por password"
echo -e "  ✅ Imágenes con versiones específicas (no :latest)"
echo -e "  ✅ Usuarios no-root en contenedores"
echo ""
echo -e "${YELLOW}🟠 PERFORMANCE Y ESTABILIDAD:${NC}"
echo -e "  ✅ Frontend: 2GB RAM, 1 CPU"
echo -e "  ✅ Backend: 1GB RAM, 1 CPU"
echo -e "  ✅ PostgreSQL: Optimizado para 8GB RAM"
echo -e "  ✅ Redis: AOF mejorado y persistencia"
echo -e "  ✅ Políticas de restart específicas"
echo -e "  ✅ Health checks en todos los servicios"
echo ""
echo -e "${BLUE}🌐 SERVICIOS DISPONIBLES:${NC}"
echo -e "  - Frontend:     https://62.169.30.44/"
echo -e "  - Dashboard:    http://127.0.0.1:9080/ (admin:admin123)"
echo -e "  - API Health:   Usar Host header api.flow-telligence.com"
echo ""
echo -e "${BLUE}🔧 PRÓXIMOS PASOS:${NC}"
echo -e "  1. Configurar registros DNS A hacia 62.169.30.44"
echo -e "  2. Esperar propagación DNS (24-48h)"
echo -e "  3. Los certificados SSL se generarán automáticamente"
echo ""
echo -e "${GREEN}📊 Para monitorear:${NC}"
echo -e "  docker compose -f docker-compose.optimized.yml logs -f [servicio]"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Backup los secretos en .env en lugar seguro${NC}"
