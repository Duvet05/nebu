-- Migración: Agregar agentId a memory_contexts
-- Fecha: 2025-01-04
-- Descripción: Permite asociar memorias contextuales a agentes específicos

-- =====================================================
-- MIGRACIÓN HACIA ADELANTE (UP)
-- =====================================================

-- 1. Agregar columna agentId
ALTER TABLE memory_contexts
ADD COLUMN "agentId" UUID;

-- 2. Crear índice simple para agentId
CREATE INDEX "IDX_memory_contexts_agentId"
ON memory_contexts ("agentId");

-- 3. Crear índice compuesto para búsquedas optimizadas
CREATE INDEX "IDX_memory_contexts_userId_agentId_memoryType"
ON memory_contexts ("userId", "agentId", "memoryType");

-- 4. Agregar constraint de foreign key
ALTER TABLE memory_contexts
ADD CONSTRAINT "FK_memory_contexts_agentId"
FOREIGN KEY ("agentId")
REFERENCES agents(id)
ON DELETE SET NULL;

-- 5. Comentarios para documentación
COMMENT ON COLUMN memory_contexts."agentId" IS 'ID del agente asociado a esta memoria (opcional, permite memorias compartidas entre agentes si es NULL)';

-- =====================================================
-- MIGRACIÓN HACIA ATRÁS (DOWN) - Solo ejecutar si necesitas revertir
-- =====================================================

/*
-- Eliminar foreign key constraint
ALTER TABLE memory_contexts
DROP CONSTRAINT "FK_memory_contexts_agentId";

-- Eliminar índice compuesto
DROP INDEX "IDX_memory_contexts_userId_agentId_memoryType";

-- Eliminar índice simple
DROP INDEX "IDX_memory_contexts_agentId";

-- Eliminar columna
ALTER TABLE memory_contexts
DROP COLUMN "agentId";
*/

-- =====================================================
-- QUERIES DE VERIFICACIÓN
-- =====================================================

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'memory_contexts'
AND column_name = 'agentId';

-- Verificar índices creados
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'memory_contexts'
AND indexname LIKE '%agentId%';

-- Verificar foreign key
SELECT conname, contype, confdeltype
FROM pg_constraint
WHERE conrelid = 'memory_contexts'::regclass
AND conname = 'FK_memory_contexts_agentId';

-- =====================================================
-- QUERIES ÚTILES POST-MIGRACIÓN
-- =====================================================

-- Ver memorias por agente
-- SELECT mc.*, a.name as agent_name
-- FROM memory_contexts mc
-- LEFT JOIN agents a ON mc."agentId" = a.id
-- WHERE mc."userId" = 'USER_ID_AQUI'
-- ORDER BY mc."createdAt" DESC;

-- Contar memorias por agente
-- SELECT
--   COALESCE(a.name, 'Sin agente específico') as agent_name,
--   COUNT(*) as memory_count,
--   mc."memoryType"
-- FROM memory_contexts mc
-- LEFT JOIN agents a ON mc."agentId" = a.id
-- GROUP BY a.name, mc."memoryType"
-- ORDER BY memory_count DESC;
