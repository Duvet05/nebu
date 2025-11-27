#!/bin/bash
# Script de backup de base de datos
# Uso: ./scripts/backup-db.sh [tabla]

set -e

# Configuración
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="nebu-postgres-prod"
DB_USER="nebu_user"
DB_NAME="nebu_db"

# Crear carpeta de backups si no existe
mkdir -p "$BACKUP_DIR"

# Función para hacer backup de toda la BD
backup_full() {
    echo "📦 Creando backup completo de la base de datos..."
    docker exec -t $CONTAINER pg_dump -U $DB_USER -d $DB_NAME \
        > "$BACKUP_DIR/full_backup_$DATE.sql"
    echo "✅ Backup completo guardado: $BACKUP_DIR/full_backup_$DATE.sql"
}

# Función para hacer backup de una tabla específica
backup_table() {
    local table=$1
    echo "📦 Creando backup de la tabla: $table"
    docker exec -t $CONTAINER pg_dump -U $DB_USER -d $DB_NAME \
        -t $table --data-only \
        > "$BACKUP_DIR/${table}_$DATE.sql"
    echo "✅ Backup de $table guardado: $BACKUP_DIR/${table}_$DATE.sql"
}

# Función para hacer backup solo del catálogo de productos
backup_products() {
    echo "📦 Creando backup del catálogo de productos..."
    docker exec -t $CONTAINER pg_dump -U $DB_USER -d $DB_NAME \
        -t product_catalog \
        > "$BACKUP_DIR/products_backup_$DATE.sql"
    echo "✅ Backup de productos guardado: $BACKUP_DIR/products_backup_$DATE.sql"
}

# Main
case "${1:-full}" in
    full)
        backup_full
        ;;
    products)
        backup_products
        ;;
    *)
        backup_table "$1"
        ;;
esac

# Mostrar tamaño del backup
echo ""
echo "📊 Archivos de backup recientes:"
ls -lh "$BACKUP_DIR" | tail -5
