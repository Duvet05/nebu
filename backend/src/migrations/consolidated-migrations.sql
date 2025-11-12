-- =====================================================
-- MIGRACIONES CONSOLIDADAS - NEBU BACKEND
-- =====================================================
-- Fecha de consolidación: 2025-11-12
-- Descripción: Archivo único con todas las migraciones de desarrollo temprano
-- Instrucciones: Ejecutar este archivo contra la base de datos de desarrollo
--
-- Uso:
--   psql -U usuario -d nebu -f consolidated-migrations.sql
--   O vía Docker:
--   docker exec -i nebu-postgres-prod psql -U usuario -d nebu < consolidated-migrations.sql
-- =====================================================

-- =====================================================
-- MIGRACIÓN 1: Make userId and iotDeviceId nullable in toys table
-- =====================================================
-- Fecha: 2025-11-04
-- Descripción: Permite que los juguetes existan sin un usuario asignado (orphan toys)
--              y sin un dispositivo IoT asociado, mejorando la compatibilidad con la app móvil

-- 1.1 Eliminar foreign key constraints existentes
ALTER TABLE "toys" DROP CONSTRAINT IF EXISTS "FK_toys_userId";
ALTER TABLE "toys" DROP CONSTRAINT IF EXISTS "FK_toys_iotDeviceId";

-- 1.2 Modificar columnas para permitir NULL
ALTER TABLE "toys"
  ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "toys"
  ALTER COLUMN "iotDeviceId" DROP NOT NULL;

-- 1.3 Recrear foreign keys con ON DELETE SET NULL
ALTER TABLE "toys"
  ADD CONSTRAINT "FK_toys_userId"
  FOREIGN KEY ("userId")
  REFERENCES "users"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "toys"
  ADD CONSTRAINT "FK_toys_iotDeviceId"
  FOREIGN KEY ("iotDeviceId")
  REFERENCES "iot_devices"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 1.4 Verificar cambios
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'toys'
  AND column_name IN ('userId', 'iotDeviceId');

-- =====================================================
-- MIGRACIÓN 2: Agregar agentId a memory_contexts
-- =====================================================
-- Fecha: 2025-01-04
-- Descripción: Permite asociar memorias contextuales a agentes específicos

-- 2.1 Agregar columna agentId
ALTER TABLE memory_contexts
ADD COLUMN IF NOT EXISTS "agentId" UUID;

-- 2.2 Crear índice simple para agentId
CREATE INDEX IF NOT EXISTS "IDX_memory_contexts_agentId"
ON memory_contexts ("agentId");

-- 2.3 Crear índice compuesto para búsquedas optimizadas
CREATE INDEX IF NOT EXISTS "IDX_memory_contexts_userId_agentId_memoryType"
ON memory_contexts ("userId", "agentId", "memoryType");

-- 2.4 Agregar constraint de foreign key
ALTER TABLE memory_contexts
ADD CONSTRAINT "FK_memory_contexts_agentId"
FOREIGN KEY ("agentId")
REFERENCES agents(id)
ON DELETE SET NULL;

-- 2.5 Comentarios para documentación
COMMENT ON COLUMN memory_contexts."agentId" IS 'ID del agente asociado a esta memoria (opcional, permite memorias compartidas entre agentes si es NULL)';

-- 2.6 Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'memory_contexts'
AND column_name = 'agentId';

-- =====================================================
-- QUERIES DE VERIFICACIÓN FINAL
-- =====================================================

-- Verificar índices en memory_contexts
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'memory_contexts'
AND indexname LIKE '%agentId%';

-- Verificar foreign keys en memory_contexts
SELECT conname, contype, confdeltype
FROM pg_constraint
WHERE conrelid = 'memory_contexts'::regclass
AND conname = 'FK_memory_contexts_agentId';

-- Verificar foreign keys en toys
SELECT conname, contype, confdeltype
FROM pg_constraint
WHERE conrelid = 'toys'::regclass
AND conname IN ('FK_toys_userId', 'FK_toys_iotDeviceId');

-- =====================================================
-- ROLLBACK (DOWN) - Solo ejecutar si necesitas revertir
-- =====================================================
-- ADVERTENCIA: Ejecutar esto revertirá TODAS las migraciones

/*
-- Revertir Migración 2: agentId en memory_contexts
ALTER TABLE memory_contexts DROP CONSTRAINT IF EXISTS "FK_memory_contexts_agentId";
DROP INDEX IF EXISTS "IDX_memory_contexts_userId_agentId_memoryType";
DROP INDEX IF EXISTS "IDX_memory_contexts_agentId";
ALTER TABLE memory_contexts DROP COLUMN IF EXISTS "agentId";

-- Revertir Migración 1: toys nullable
-- NOTA: Esto fallará si existen registros con userId o iotDeviceId NULL
ALTER TABLE "toys" DROP CONSTRAINT IF EXISTS "FK_toys_userId";
ALTER TABLE "toys" DROP CONSTRAINT IF EXISTS "FK_toys_iotDeviceId";

-- Opcional: Eliminar registros con valores NULL antes de revertir
-- DELETE FROM "toys" WHERE "userId" IS NULL OR "iotDeviceId" IS NULL;

ALTER TABLE "toys" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "toys" ALTER COLUMN "iotDeviceId" SET NOT NULL;

ALTER TABLE "toys"
  ADD CONSTRAINT "FK_toys_userId"
  FOREIGN KEY ("userId")
  REFERENCES "users"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "toys"
  ADD CONSTRAINT "FK_toys_iotDeviceId"
  FOREIGN KEY ("iotDeviceId")
  REFERENCES "iot_devices"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
*/

-- =====================================================
-- QUERIES ÚTILES POST-MIGRACIÓN
-- =====================================================

-- Ver juguetes sin usuario asignado (orphan toys)
-- SELECT id, name, model, "macAddress", "userId", "iotDeviceId"
-- FROM toys
-- WHERE "userId" IS NULL;

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

-- =====================================================
-- FIN DE MIGRACIONES CONSOLIDADAS
-- =====================================================
