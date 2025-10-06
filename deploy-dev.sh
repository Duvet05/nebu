#!/bin/bash

# ===========================================
# SCRIPT DE DESARROLLO - NEBU BACKEND
# ===========================================

set -e

echo "🛠️  Iniciando stack de desarrollo..."

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.yml"
    echo "Ejecuta este script desde el directorio nebu-backend/"
    exit 1
fi

# Verificar que existe el .env
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "Copia el template.env como .env y personaliza los valores"
    exit 1
fi

echo "✅ Verificaciones completadas"

# Construir y desplegar
echo "🔨 Construyendo contenedores..."
docker compose build --no-cache

echo "🚀 Desplegando stack de desarrollo..."
docker compose up -d

# Verificar el estado
echo "📊 Verificando el estado del despliegue..."
sleep 5
docker compose ps

echo ""
echo "🎉 ¡Stack de desarrollo desplegado!"
echo ""
echo "📡 Servicios disponibles:"
echo "   - Traefik Dashboard: http://traefik.localhost"
echo "   - Portainer:         http://portainer.localhost"
echo "   - Backend API:       http://api.localhost"
echo "   - PostgreSQL:        localhost:5432"
echo "   - Redis:             localhost:6379"
echo ""
echo "🔍 Para ver los logs:"
echo "   docker compose logs -f [servicio]"
echo ""
echo "🛑 Para detener:"
echo "   docker compose down"
