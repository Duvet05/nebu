-- Migration: Make userId and iotDeviceId nullable in toys table
-- Date: 2025-11-04
-- Description: Permite que los juguetes existan sin un usuario asignado (orphan toys)
--              y sin un dispositivo IoT asociado, mejorando la compatibilidad con la app móvil

-- ============================================
-- UP Migration
-- ============================================

-- 1. Eliminar foreign key constraints existentes
ALTER TABLE "toys" DROP CONSTRAINT IF EXISTS "FK_toys_userId";
ALTER TABLE "toys" DROP CONSTRAINT IF EXISTS "FK_toys_iotDeviceId";

-- 2. Modificar columnas para permitir NULL
ALTER TABLE "toys"
  ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "toys"
  ALTER COLUMN "iotDeviceId" DROP NOT NULL;

-- 3. Recrear foreign keys con ON DELETE SET NULL
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

-- 4. Verificar cambios
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'toys'
  AND column_name IN ('userId', 'iotDeviceId');

-- ============================================
-- DOWN Migration (Rollback)
-- ============================================

-- ADVERTENCIA: Esta reversión fallará si existen registros con userId o iotDeviceId NULL
-- Primero debes eliminar o actualizar esos registros

-- -- 1. Eliminar foreign keys nuevas
-- ALTER TABLE "toys" DROP CONSTRAINT "FK_toys_userId";
-- ALTER TABLE "toys" DROP CONSTRAINT "FK_toys_iotDeviceId";

-- -- 2. Eliminar registros con valores NULL (CUIDADO: ESTO ELIMINARÁ DATOS)
-- -- DELETE FROM "toys" WHERE "userId" IS NULL OR "iotDeviceId" IS NULL;

-- -- 3. Revertir columnas a NOT NULL
-- ALTER TABLE "toys"
--   ALTER COLUMN "userId" SET NOT NULL;

-- ALTER TABLE "toys"
--   ALTER COLUMN "iotDeviceId" SET NOT NULL;

-- -- 4. Recrear foreign keys con ON DELETE CASCADE
-- ALTER TABLE "toys"
--   ADD CONSTRAINT "FK_toys_userId"
--   FOREIGN KEY ("userId")
--   REFERENCES "users"("id")
--   ON DELETE CASCADE
--   ON UPDATE CASCADE;

-- ALTER TABLE "toys"
--   ADD CONSTRAINT "FK_toys_iotDeviceId"
--   FOREIGN KEY ("iotDeviceId")
--   REFERENCES "iot_devices"("id")
--   ON DELETE CASCADE
--   ON UPDATE CASCADE;

-- ============================================
-- Testing Queries
-- ============================================

-- Verificar juguetes sin usuario asignado (orphan toys)
-- SELECT id, name, model, "macAddress", "userId", "iotDeviceId"
-- FROM toys
-- WHERE "userId" IS NULL;

-- Verificar juguetes sin dispositivo IoT
-- SELECT id, name, model, "macAddress", "userId", "iotDeviceId"
-- FROM toys
-- WHERE "iotDeviceId" IS NULL;

-- Contar juguetes por estado de asignación
-- SELECT
--   CASE
--     WHEN "userId" IS NULL THEN 'Sin asignar'
--     ELSE 'Asignado'
--   END AS assignment_status,
--   COUNT(*) as total
-- FROM toys
-- GROUP BY assignment_status;
