#!/bin/bash
# Script para ejecutar migrations de TypeORM
# Similar a Liquibase update

set -e

echo "🔄 Ejecutando migrations de TypeORM..."
echo ""

# Verificar que el contenedor de backend esté corriendo
if ! docker ps | grep -q nebu-backend-prod; then
    echo "❌ El contenedor nebu-backend-prod no está corriendo"
    exit 1
fi

# Ejecutar migrations
docker exec nebu-backend-prod npm run typeorm migration:run -- -d ormconfig.ts

echo ""
echo "✅ Migrations ejecutadas exitosamente"
