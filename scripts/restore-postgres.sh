#!/bin/bash
# =============================================================================
# NEBU - PostgreSQL Restore Script
# =============================================================================
# Este script restaura backups de PostgreSQL
# =============================================================================

set -e  # Exit on error

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

BACKUP_DIR="/root/nebu/backups/postgres"
POSTGRES_CONTAINER="nebu-postgres-prod"

# Cargar variables de entorno
if [ -f /root/nebu/.env ]; then
    source <(grep -E '^(DATABASE_|POSTGRES_)' /root/nebu/.env | sed 's/^/export /')
fi

# =============================================================================
# FUNCIONES
# =============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# =============================================================================
# VALIDACIONES
# =============================================================================

# Verificar que se proporcionó un archivo de backup
if [ -z "$1" ]; then
    error "Uso: $0 <archivo_backup.sql.gz>"
    echo ""
    echo "Backups disponibles:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "  No hay backups disponibles"
    exit 1
fi

BACKUP_FILE="$1"

# Si es solo el nombre del archivo, buscar en el directorio de backups
if [ ! -f "$BACKUP_FILE" ]; then
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        error "Archivo de backup no encontrado: $BACKUP_FILE"
        exit 1
    fi
fi

log "🔄 Iniciando restauración de backup..."
log "📁 Archivo: $BACKUP_FILE"

# Verificar que el contenedor está corriendo
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    error "El contenedor $POSTGRES_CONTAINER no está corriendo"
    exit 1
fi

# =============================================================================
# ADVERTENCIA
# =============================================================================

echo ""
echo "⚠️  ADVERTENCIA: Esta operación eliminará todos los datos actuales"
echo "   y los reemplazará con el backup seleccionado."
echo ""
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    log "❌ Operación cancelada por el usuario"
    exit 0
fi

# =============================================================================
# RESTAURAR BACKUP
# =============================================================================

log "📦 Descomprimiendo y restaurando backup..."

# Descomprimir y restaurar el backup
gunzip -c "$BACKUP_FILE" | docker exec -i "$POSTGRES_CONTAINER" psql \
    -U "${DATABASE_USERNAME}" \
    -d postgres

if [ $? -eq 0 ]; then
    log "✅ Backup restaurado exitosamente"
else
    error "Falló la restauración del backup"
    exit 1
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Restauración completada"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
