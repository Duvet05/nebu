#!/bin/bash
# Script para aplicar migraciones consolidadas de desarrollo
# Uso: ./scripts/apply-migrations.sh [--skip-backup]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATION_FILE="$REPO_ROOT/backend/src/migrations/consolidated-migrations.sql"

# Cargar variables de entorno desde .env si existe
if [ -f "$REPO_ROOT/.env" ]; then
  export $(cat "$REPO_ROOT/.env" | grep -v '^#' | xargs)
fi

# Valores por defecto desde variables de entorno
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USERNAME:-postgres}"
DB_NAME="${DATABASE_NAME:-nebu}"
DB_PASSWORD="${DATABASE_PASSWORD}"

SKIP_BACKUP=false

# Procesar argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    *)
      echo "Argumento desconocido: $1"
      exit 1
      ;;
  esac
done

echo "====================================="
echo "🔧 Aplicando migraciones consolidadas"
echo "====================================="
echo "Base de datos: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Usuario: $DB_USER"
echo ""

# Hacer backup si no se saltó
if [ "$SKIP_BACKUP" = false ]; then
  BACKUP_DIR="$REPO_ROOT/db/backups/postgres"
  mkdir -p "$BACKUP_DIR"
  
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="$BACKUP_DIR/backup_before_migration_$TIMESTAMP.dump"
  
  echo "📦 Haciendo backup de la base de datos..."
  export PGPASSWORD="$DB_PASSWORD"
  pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F c -b -v -f "$BACKUP_FILE" "$DB_NAME" 2>&1 | grep -v "^$"
  unset PGPASSWORD
  
  echo "✅ Backup guardado en: $BACKUP_FILE"
  echo ""
else
  echo "⚠️  Saltando backup (--skip-backup especificado)"
  echo ""
fi

# Aplicar migraciones
echo "🚀 Aplicando migraciones desde: $MIGRATION_FILE"
export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"
EXIT_CODE=$?
unset PGPASSWORD

if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Migraciones aplicadas exitosamente"
  echo ""
  
  # Verificaciones post-migración
  echo "🔍 Ejecutando verificaciones..."
  export PGPASSWORD="$DB_PASSWORD"
  
  echo ""
  echo "Verificando columna agentId en memory_contexts:"
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'memory_contexts' AND column_name = 'agentId';"
  
  echo ""
  echo "Verificando columnas nullable en toys:"
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'toys' AND column_name IN ('userId', 'iotDeviceId');"
  
  unset PGPASSWORD
  
  echo ""
  echo "====================================="
  echo "✨ ¡Proceso completado con éxito!"
  echo "====================================="
else
  echo ""
  echo "❌ Error al aplicar migraciones (código de salida: $EXIT_CODE)"
  
  if [ "$SKIP_BACKUP" = false ]; then
    echo ""
    echo "Para revertir, puedes restaurar el backup:"
    echo "  pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $BACKUP_FILE"
  fi
  
  exit $EXIT_CODE
fi
