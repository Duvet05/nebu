#!/bin/bash
set -e

# Script idempotente para inicializar la base de datos PostgreSQL (master)
# Este script crea usuarios y roles solo si no existen

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${OMRS_DB_REPL_USER}') THEN
        CREATE ROLE ${OMRS_DB_REPL_USER} LOGIN PASSWORD '${OMRS_DB_REPL_PASSWORD}';
        RAISE NOTICE 'Replication user created.';
    ELSE
        RAISE NOTICE 'Replication user already exists.';
    END IF;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${OMRS_DB_BACKUP_USER}') THEN
        CREATE ROLE ${OMRS_DB_BACKUP_USER} LOGIN PASSWORD '${OMRS_DB_BACKUP_PASSWORD}';
        RAISE NOTICE 'Backup user created.';
    ELSE
        RAISE NOTICE 'Backup user already exists.';
    END IF;
END
$$;
EOSQL

echo "Master DB initialization complete."