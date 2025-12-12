#!/bin/bash
set -e

echo "Este contenedor está configurado como esclavo/replica de PostgreSQL. La configuración de replicación debe realizarse mediante parámetros de PostgreSQL y archivos de configuración, no con este script."

# Script para inicializar una base de datos PostgreSQL como réplica (esclava)
# Requiere que las variables de entorno estén definidas:
#   - POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
#   - REPLICA_HOST, REPLICA_PORT, REPLICA_USER, REPLICA_PASSWORD
#   - PGDATA

if [ -z "$REPLICA_HOST" ] || [ -z "$REPLICA_USER" ] || [ -z "$REPLICA_PASSWORD" ]; then
  echo "Faltan variables de entorno para la replicación: REPLICA_HOST, REPLICA_USER, REPLICA_PASSWORD"
  exit 1
fi

# Detener el servidor si está corriendo
pg_ctl -D "$PGDATA" -m fast stop || true

# Limpiar datos previos
rm -rf "$PGDATA"/*

# Realizar basebackup desde el master
PGPASSWORD="$REPLICA_PASSWORD" pg_basebackup -h "$REPLICA_HOST" -p "${REPLICA_PORT:-5432}" -U "$REPLICA_USER" -D "$PGDATA" -Fp -Xs -P -R

# El parámetro -R crea automáticamente el archivo standby.signal y la configuración de conexión
# Si se requiere configuración adicional, agregar aquí

echo "Replica PostgreSQL inicializada correctamente."