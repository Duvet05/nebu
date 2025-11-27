#!/bin/bash
# Script para hacer rollback de la última migration
# Similar a Liquibase rollback

set -e

echo "⏪ Haciendo rollback de la última migration..."
echo ""

# Verificar que el contenedor de backend esté corriendo
if ! docker ps | grep -q nebu-backend-prod; then
    echo "❌ El contenedor nebu-backend-prod no está corriendo"
    exit 1
fi

# Preguntar confirmación
read -p "¿Estás seguro de hacer rollback? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelado"
    exit 0
fi

# Ejecutar rollback
docker exec nebu-backend-prod npm run typeorm migration:revert -- -d ormconfig.ts

echo ""
echo "✅ Rollback ejecutado exitosamente"
