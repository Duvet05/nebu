#!/bin/bash

# ===========================================
# SCRIPT DE PRODUCCIÓN - NEBU BACKEND
# ===========================================

set -e

echo "🚀 Iniciando stack de producción..."

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.prod.yml"
    echo "Ejecuta este script desde el directorio nebu-backend/"
    exit 1
fi

# Verificar que existe el .env
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "Copia el template.env como .env y personaliza los valores"
    exit 1
fi

# Verificar que existe el frontend
if [ ! -d "../nebu-website" ]; then
    echo "❌ Error: No se encontró el directorio nebu-website/"
    exit 1
fi

echo "✅ Verificaciones completadas"

# Construir y desplegar
echo "🔨 Construyendo contenedores..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Desplegando stack de producción..."
docker compose -f docker-compose.prod.yml up -d

# Verificar el estado
echo "📊 Verificando el estado del despliegue..."
sleep 10
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 ¡Stack de producción desplegado!"
echo ""
echo "📡 Servicios disponibles:"
echo "   - Frontend:          https://flow-telligence.com"
echo "   - Frontend (IP):     https://62.169.30.44:8080"
echo "   - Backend API:       https://api.flow-telligence.com"
echo "   - Traefik Dashboard: https://traefik.flow-telligence.com"
echo "   - Grafana:          https://dashboard.flow-telligence.com"
echo "   - Prometheus:       https://metrics.flow-telligence.com"
echo ""
echo "🔍 Para ver los logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f [servicio]"
echo ""
echo "🛑 Para detener:"
echo "   docker compose -f docker-compose.prod.yml down"
echo ""
echo "⚠️  IMPORTANTE: Asegúrate de que:"
echo "   1. Los puertos 80, 443 y 8080 estén abiertos en el firewall"
echo "   2. El dominio flow-telligence.com apunte a la IP 62.169.30.44"
echo "   3. Los certificados SSL se generen correctamente"
