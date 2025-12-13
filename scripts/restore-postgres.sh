#!/bin/bash
# =============================================================================
# NEBU - PostgreSQL Restore Script
# =============================================================================
# This script restores PostgreSQL backups from a compressed .sql.gz file.
# =============================================================================

set -e  # Exit on error

# =============================================================================
# CONFIGURATION
# =============================================================================

BACKUP_DIR="/root/nebu/backups/postgres"
POSTGRES_CONTAINER="nebu-postgres-prod"

# Load environment variables
if [ -f /root/nebu/.env ]; then
    source <(grep -E '^(DATABASE_|POSTGRES_)' /root/nebu/.env | sed 's/^/export /')
fi

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
# VALIDATIONS
# =============================================================================

# Check if a backup file is provided
if [ -z "$1" ]; then
    error "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups available"
    exit 1
fi

BACKUP_FILE="$1"

# If only the filename is provided, search for it in the backup directory
if [ ! -f "$BACKUP_FILE" ]; then
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

log "Starting backup restoration..."
log "Backup file: $BACKUP_FILE"

# Check if the PostgreSQL container is running
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    error "The container $POSTGRES_CONTAINER is not running."
    exit 1
fi

# =============================================================================
# WARNING
# =============================================================================

echo ""
echo "WARNING: This operation will delete all current data"
echo "   and replace it with the selected backup."
echo ""
read -p "Are you sure you want to continue? (type 'YES' to confirm): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    log "Operation canceled by the user."
    exit 0
fi

# =============================================================================
# RESTORE BACKUP
# =============================================================================

log "Uncompressing and restoring the backup..."

# Uncompress and restore the backup
gunzip -c "$BACKUP_FILE" | docker exec -i "$POSTGRES_CONTAINER" psql \
    -U "${DATABASE_USERNAME}" \
    -d postgres

if [ $? -eq 0 ]; then
    log "Backup restored successfully."
else
    error "Backup restoration failed."
    exit 1
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Restoration completed successfully."
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
