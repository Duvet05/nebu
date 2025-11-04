#!/bin/bash

# Script de verificación de la migración de agentId en memory_contexts
# Ejecutar desde: /root/nebu/backend

set -e

echo "================================================"
echo "Verificación de Migración: AgentId en Memory Contexts"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verificar que las variables estén configuradas
if [ -z "$DATABASE_HOST" ] || [ -z "$DATABASE_NAME" ] || [ -z "$DATABASE_USERNAME" ]; then
    echo -e "${RED}Error: Variables de entorno de base de datos no configuradas${NC}"
    echo "Por favor configura DATABASE_HOST, DATABASE_NAME, DATABASE_USERNAME en .env"
    exit 1
fi

echo -e "${YELLOW}Configuración de Base de Datos:${NC}"
echo "Host: $DATABASE_HOST"
echo "Database: $DATABASE_NAME"
echo "User: $DATABASE_USERNAME"
echo ""

# Función para ejecutar queries
run_query() {
    local query=$1
    docker exec -i nebu-postgres-prod psql -U "$DATABASE_USERNAME" -d "$DATABASE_NAME" -t -c "$query" 2>/dev/null || echo "Error ejecutando query"
}

# 1. Verificar si la columna agentId ya existe
echo -e "${YELLOW}1. Verificando si la columna agentId existe...${NC}"
COLUMN_EXISTS=$(run_query "SELECT column_name FROM information_schema.columns WHERE table_name = 'memory_contexts' AND column_name = 'agentId';")

if [[ $COLUMN_EXISTS == *"agentId"* ]]; then
    echo -e "${GREEN}✓ La columna agentId ya existe${NC}"
    NEEDS_MIGRATION=false
else
    echo -e "${YELLOW}⚠ La columna agentId NO existe - se necesita migración${NC}"
    NEEDS_MIGRATION=true
fi
echo ""

# 2. Mostrar estructura actual de la tabla
echo -e "${YELLOW}2. Estructura actual de memory_contexts:${NC}"
run_query "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'memory_contexts' ORDER BY ordinal_position;"
echo ""

# 3. Verificar índices relacionados con agentId
echo -e "${YELLOW}3. Verificando índices relacionados con agentId...${NC}"
INDEXES=$(run_query "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'memory_contexts' AND indexname LIKE '%agentId%';")

if [ -z "$INDEXES" ] || [ "$INDEXES" == "Error ejecutando query" ]; then
    echo -e "${YELLOW}⚠ No se encontraron índices relacionados con agentId${NC}"
else
    echo -e "${GREEN}✓ Índices encontrados:${NC}"
    echo "$INDEXES"
fi
echo ""

# 4. Verificar foreign key constraint
echo -e "${YELLOW}4. Verificando foreign key constraint...${NC}"
FK_EXISTS=$(run_query "SELECT conname FROM pg_constraint WHERE conrelid = 'memory_contexts'::regclass AND conname = 'FK_memory_contexts_agentId';")

if [[ $FK_EXISTS == *"FK_memory_contexts_agentId"* ]]; then
    echo -e "${GREEN}✓ Foreign key constraint existe${NC}"
else
    echo -e "${YELLOW}⚠ Foreign key constraint NO existe${NC}"
fi
echo ""

# 5. Contar registros actuales
echo -e "${YELLOW}5. Estadísticas de memory_contexts:${NC}"
TOTAL_RECORDS=$(run_query "SELECT COUNT(*) FROM memory_contexts;")
echo "Total de registros: $TOTAL_RECORDS"

if [[ $COLUMN_EXISTS == *"agentId"* ]]; then
    WITH_AGENT=$(run_query "SELECT COUNT(*) FROM memory_contexts WHERE \"agentId\" IS NOT NULL;")
    WITHOUT_AGENT=$(run_query "SELECT COUNT(*) FROM memory_contexts WHERE \"agentId\" IS NULL;")
    echo "Con agentId: $WITH_AGENT"
    echo "Sin agentId: $WITHOUT_AGENT"
fi
echo ""

# 6. Verificar que la tabla agents existe
echo -e "${YELLOW}6. Verificando tabla agents...${NC}"
AGENTS_COUNT=$(run_query "SELECT COUNT(*) FROM agents;")
echo -e "${GREEN}✓ Tabla agents existe con $AGENTS_COUNT agentes${NC}"
echo ""

# Resumen y recomendaciones
echo "================================================"
echo -e "${YELLOW}RESUMEN:${NC}"
echo "================================================"

if [ "$NEEDS_MIGRATION" = true ]; then
    echo -e "${RED}⚠ ACCIÓN REQUERIDA: La migración NO ha sido aplicada${NC}"
    echo ""
    echo "Opciones para aplicar la migración:"
    echo ""
    echo "1. AUTO-SYNC (Recomendado para desarrollo):"
    echo "   - TypeORM tiene synchronize: true"
    echo "   - Reinicia la aplicación para aplicar cambios automáticamente:"
    echo "     npm run start:dev"
    echo ""
    echo "2. MIGRACIÓN MANUAL (Recomendado para producción):"
    echo "   - Ejecuta el script SQL:"
    echo "     cat src/migrations/add-agent-id-to-memory-contexts.sql | docker exec -i nebu-postgres-prod psql -U $DATABASE_USERNAME -d $DATABASE_NAME"
    echo ""
    echo "3. TYPEORM CLI:"
    echo "   - Configura TypeORM migrations en package.json"
    echo "   - npm run migration:run"
else
    echo -e "${GREEN}✓ La migración ha sido aplicada exitosamente${NC}"
    echo ""
    echo "Puedes usar las siguientes queries para trabajar con la nueva columna:"
    echo ""
    echo "-- Ver memorias por agente:"
    echo "SELECT mc.*, a.name as agent_name"
    echo "FROM memory_contexts mc"
    echo "LEFT JOIN agents a ON mc.\"agentId\" = a.id"
    echo "WHERE mc.\"userId\" = 'USER_ID_AQUI';"
    echo ""
    echo "-- Contar memorias por agente:"
    echo "SELECT COALESCE(a.name, 'Sin agente') as agent_name, COUNT(*)"
    echo "FROM memory_contexts mc"
    echo "LEFT JOIN agents a ON mc.\"agentId\" = a.id"
    echo "GROUP BY a.name;"
fi

echo ""
echo "================================================"
