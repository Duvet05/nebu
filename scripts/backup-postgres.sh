#!/bin/bash
# =============================================================================
# NEBU - PostgreSQL Backup Script
# =============================================================================
# Este script crea backups automáticos de PostgreSQL con:
# - Compresión gzip
# - Timestamp en el nombre
# - Retención de backups antiguos (7 días por defecto)
# - Validación del backup
# =============================================================================

set -e  # Exit on error

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

# Directorio donde se guardarán los backups
BACKUP_DIR="/root/nebu/backups/postgres"

# Días de retención de backups (backups más antiguos se eliminan)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Cargar variables de entorno
if [ -f /root/nebu/.env ]; then
    source <(grep -E '^(DATABASE_|POSTGRES_)' /root/nebu/.env | sed 's/^/export /')
fi

# Nombre del contenedor de PostgreSQL
POSTGRES_CONTAINER="nebu-postgres-prod"

# Timestamp para el nombre del archivo
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Nombre del archivo de backup
BACKUP_FILE="nebu_db_backup_${TIMESTAMP}.sql.gz"

# Path completo del backup
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

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
# VALIDACIONES PREVIAS
# =============================================================================

log "🗄️  Iniciando backup de PostgreSQL..."

# Verificar que existe el directorio de backups
if [ ! -d "$BACKUP_DIR" ]; then
    log "📁 Creando directorio de backups: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Verificar que el contenedor está corriendo
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    error "El contenedor $POSTGRES_CONTAINER no está corriendo"
    exit 1
fi

# =============================================================================
# CREAR BACKUP
# =============================================================================

log "📦 Creando backup: $BACKUP_FILE"

# Ejecutar pg_dump dentro del contenedor y comprimir
docker exec -t "$POSTGRES_CONTAINER" pg_dump \
    -U "${DATABASE_USERNAME}" \
    -d "${DATABASE_NAME}" \
    --clean \
    --if-exists \
    --create \
    --verbose \
    2>&1 | gzip > "$BACKUP_PATH"

# Verificar que el backup se creó correctamente
if [ ! -f "$BACKUP_PATH" ]; then
    error "El archivo de backup no se creó: $BACKUP_PATH"
    exit 1
fi

# Obtener tamaño del backup
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
log "✅ Backup creado exitosamente: $BACKUP_FILE ($BACKUP_SIZE)"

# =============================================================================
# VALIDAR BACKUP
# =============================================================================

log "🔍 Validando integridad del backup..."

# Verificar que el archivo gzip es válido
if gzip -t "$BACKUP_PATH" 2>/dev/null; then
    log "✅ Backup validado correctamente"
else
    error "El backup está corrupto"
    exit 1
fi

# =============================================================================
# LIMPIAR BACKUPS ANTIGUOS
# =============================================================================

log "🧹 Limpiando backups antiguos (> $RETENTION_DAYS días)..."

# Eliminar backups más antiguos que RETENTION_DAYS
DELETED_COUNT=$(find "$BACKUP_DIR" -name "nebu_db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    log "🗑️  Eliminados $DELETED_COUNT backups antiguos"
else
    log "ℹ️  No hay backups antiguos para eliminar"
fi

# =============================================================================
# RESUMEN
# =============================================================================

# Contar backups actuales
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "nebu_db_backup_*.sql.gz" -type f | wc -l)

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Backup completado exitosamente"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "📁 Ubicación: $BACKUP_PATH"
log "📊 Tamaño: $BACKUP_SIZE"
log "🗄️  Total backups: $BACKUP_COUNT"
log "⏱️  Retención: $RETENTION_DAYS días"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
