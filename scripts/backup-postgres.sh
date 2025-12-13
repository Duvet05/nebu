#!/bin/bash
# =============================================================================
# NEBU - PostgreSQL Backup Script
# =============================================================================
# This script performs automated backups of PostgreSQL with the following features:
# - Gzip compression
# - Timestamp in the file name
# - Retention of old backups (7 days by default)
# - Backup validation
# =============================================================================

set -e  # Exit on error

# =============================================================================
# CONFIGURATION
# =============================================================================

# Directory where backups will be stored
BACKUP_DIR="/root/nebu/backups/postgres"

# Retention days for backups (older backups will be deleted)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Load environment variables
if [ -f /root/nebu/.env ]; then
    source <(grep -E '^(DATABASE_|POSTGRES_)' /root/nebu/.env | sed 's/^/export /')
fi

# Name of the PostgreSQL container
POSTGRES_CONTAINER="nebu-postgres-prod"

# Timestamp for the filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup file name
BACKUP_FILE="nebu_db_backup_${TIMESTAMP}.sql.gz"

# Full path to the backup file
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# =============================================================================
# FUNCTIONS
# =============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# =============================================================================
# PRE-BACKUP VALIDATIONS
# =============================================================================

log "Starting PostgreSQL backup..."

# Check if the backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Check if the PostgreSQL container is running
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    error "The container $POSTGRES_CONTAINER is not running."
    exit 1
fi

# =============================================================================
# CREATE BACKUP
# =============================================================================

log "Creating backup: $BACKUP_FILE"

# Run pg_dump inside the container and compress the output
docker exec -t "$POSTGRES_CONTAINER" pg_dump \
    -U "${DATABASE_USERNAME}" \
    -d "${DATABASE_NAME}" \
    --clean \
    --if-exists \
    --create \
    --verbose \
    2>&1 | gzip > "$BACKUP_PATH"

# Verify that the backup file was created successfully
if [ ! -f "$BACKUP_PATH" ]; then
    error "The backup file was not created: $BACKUP_PATH"
    exit 1
fi

# Get the backup file size
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
log "Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"

# =============================================================================
# VALIDATE BACKUP
# =============================================================================

log "Validating backup integrity..."

# Check if the gzip file is valid
if gzip -t "$BACKUP_PATH" 2>/dev/null; then
    log "Backup validated successfully"
else
    error "The backup is corrupted."
    exit 1
fi

# =============================================================================
# CLEAN OLD BACKUPS
# =============================================================================

log "Cleaning old backups (> $RETENTION_DAYS days)..."

# Delete backups older than RETENTION_DAYS
DELETED_COUNT=$(find "$BACKUP_DIR" -name "nebu_db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    log "Deleted $DELETED_COUNT old backups."
else
    log "No old backups to delete."
fi

# =============================================================================
# SUMMARY
# =============================================================================

# Count the current backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "nebu_db_backup_*.sql.gz" -type f | wc -l)

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Backup completed successfully"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Backup location: $BACKUP_PATH"
log "Backup size: $BACKUP_SIZE"
log "Total backups: $BACKUP_COUNT"
log "Retention period: $RETENTION_DAYS days"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
