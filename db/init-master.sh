#!/bin/bash
set -e

# Script idempotente para inicializar la base de datos PostgreSQL (master)
# Este script crea usuarios y roles solo si no existen

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
DO
\$\$
BEGIN
    IF '${REPLICATION_USER}' != '' AND '${REPLICATION_PASSWORD}' != '' THEN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${REPLICATION_USER}') THEN
            CREATE ROLE ${REPLICATION_USER} WITH REPLICATION LOGIN PASSWORD '${REPLICATION_PASSWORD}';
            RAISE NOTICE 'Replication user created with replication privileges.';
        ELSE
            RAISE NOTICE 'Replication user already exists.';
            -- Asegurar que tenga privilegios de replicación
            ALTER ROLE ${REPLICATION_USER} WITH REPLICATION;
        END IF;
    END IF;
END
\$\$;
EOSQL

# Configurar pg_hba.conf para permitir replicación
echo "host replication ${REPLICATION_USER} all md5" >> "$PGDATA/pg_hba.conf"
echo "host all all all md5" >> "$PGDATA/pg_hba.conf"

# Recargar configuración
pg_ctl reload -D "$PGDATA" || true

echo "Master DB initialization complete."