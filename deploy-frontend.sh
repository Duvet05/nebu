#!/bin/bash

# ===========================================
# SCRIPT DE DESPLIEGUE DEL FRONTEND
# ===========================================

set -e

echo "🚀 Iniciando despliegue del frontend Nebu Website..."

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.frontend.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.frontend.yml"
    echo "Ejecuta este script desde el directorio nebu-backend/"
    exit 1
fi

# Verificar que existe el frontend
if [ ! -d "../nebu-website" ]; then
    echo "❌ Error: No se encontró el directorio nebu-website/"
    exit 1
fi

# Verificar que existe el .env del frontend
if [ ! -f "../nebu-website/.env" ]; then
    echo "❌ Error: No se encontró el archivo .env en nebu-website/"
    echo "Copia el archivo .env.example o crea uno manualmente"
    exit 1
fi

echo "✅ Verificaciones completadas"

# Construir y desplegar el frontend
echo "🔨 Construyendo el contenedor del frontend..."
docker compose -f docker-compose.frontend.yml build --no-cache

echo "🚀 Desplegando el frontend..."
docker compose -f docker-compose.frontend.yml up -d

# Verificar el estado
echo "📊 Verificando el estado del despliegue..."
sleep 5
docker compose -f docker-compose.frontend.yml ps

echo ""
echo "🎉 ¡Frontend desplegado exitosamente!"
echo ""
echo "📡 URLs disponibles:"
echo "   - Dominio principal: https://flow-telligence.com"
echo "   - Acceso directo:    https://62.169.30.44:8080"
echo ""
echo "🔍 Para ver los logs:"
echo "   docker compose -f docker-compose.frontend.yml logs -f frontend"
echo ""
echo "⚠️  IMPORTANTE: Asegúrate de que:"
echo "   1. Los puertos 80, 443 y 8080 estén abiertos en el firewall"
echo "   2. El dominio flow-telligence.com apunte a la IP 62.169.30.44"
echo "   3. El stack principal de docker esté ejecutándose"
