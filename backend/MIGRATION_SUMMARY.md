# Migración: AgentId en Memory Contexts

**Fecha:** 2025-01-04
**Estado:** ✅ Completado
**Tipo:** Esquema de base de datos

## Resumen

Se agregó la columna `agentId` a la tabla `memory_contexts` para permitir que cada memoria contextual esté asociada a un agente específico. Esto permite:

- Memorias personalizadas por agente
- Separación de contextos conversacionales entre diferentes agentes
- Flexibilidad para compartir memorias (cuando `agentId` es NULL)

## Cambios Realizados

### 1. Entidad TypeORM

**Archivo:** `src/memory/entities/memory-context.entity.ts`

```typescript
// Agregado import
import { Agent } from '../../agents/entities/agent.entity';

// Nuevo campo
@Column({ type: 'uuid', nullable: true })
@Index()
agentId?: string;

// Nueva relación
@ManyToOne(() => Agent, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'agentId' })
agent?: Agent;

// Nuevo índice compuesto
@Index(['userId', 'agentId', 'memoryType'])
```

### 2. Base de Datos

**Cambios en la tabla `memory_contexts`:**

```sql
-- Nueva columna
agentId UUID NULL

-- Comentario
COMMENT: 'ID del agente asociado a esta memoria (opcional, permite memorias compartidas entre agentes si es NULL)'
```

**Índices pendientes** (se crearán automáticamente al reiniciar con `synchronize: true`):
- `IDX_memory_contexts_agentId`
- `IDX_memory_contexts_userId_agentId_memoryType`

**Foreign Keys pendientes:**
- `FK_memory_contexts_agentId` → `agents(id)` ON DELETE SET NULL

> **Nota:** Los índices y foreign keys se crearán automáticamente cuando TypeORM sincronice con la tabla `agents` existente.

## Estructura de la Tabla

```
memory_contexts (17 columnas)
├── id (uuid, PK)
├── userId (uuid, NOT NULL) → users(id)
├── sessionId (uuid, NULL) → voice_sessions(id)
├── agentId (uuid, NULL) → agents(id) [NUEVO]
├── memoryType (enum: episodic/semantic/procedural)
├── category (enum: conversation/interest/emotion/etc)
├── content (text)
├── summary (text, NULL)
├── metadata (jsonb)
├── chromaCollectionId (varchar)
├── chromaCollectionName (varchar)
├── importance (float, default: 0.5)
├── accessCount (int, default: 0)
├── lastAccessedAt (timestamp)
├── createdAt (timestamp)
├── updatedAt (timestamp)
└── expiresAt (timestamp)
```

## Archivos Creados

1. **Migración TypeORM:**
   - `src/migrations/1730752800000-AddAgentIdToMemoryContexts.ts`
   - Migración reversible con métodos `up()` y `down()`

2. **Migración SQL Manual:**
   - `src/migrations/add-agent-id-to-memory-contexts.sql`
   - Incluye queries de verificación y ejemplos de uso

3. **Script de Verificación:**
   - `scripts/verify-memory-migration.sh`
   - Verifica estado de la migración y proporciona recomendaciones

4. **Este documento:**
   - `MIGRATION_SUMMARY.md`

## Verificación

### Estado Actual

```bash
# Verificar que la columna existe
docker exec nebu-postgres-prod psql -U nebu_user -d nebu_db -c \
  "SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'memory_contexts'
   AND column_name = 'agentId';"

# Resultado esperado:
# column_name | data_type | is_nullable
# ------------+-----------+-------------
# agentId     | uuid      | YES
```

### Próximos Pasos

1. **Reiniciar la aplicación** para que TypeORM sincronice los índices y foreign keys:
   ```bash
   npm run start:dev
   # o
   docker compose restart backend
   ```

2. **Verificar sincronización completa:**
   ```bash
   ./scripts/verify-memory-migration.sh
   ```

## Uso

### Queries de Ejemplo

#### Ver memorias por agente
```sql
SELECT
    mc.*,
    a.name as agent_name
FROM memory_contexts mc
LEFT JOIN agents a ON mc."agentId" = a.id
WHERE mc."userId" = 'USER_ID_AQUI'
ORDER BY mc."createdAt" DESC;
```

#### Contar memorias por agente
```sql
SELECT
    COALESCE(a.name, 'Sin agente específico') as agent_name,
    COUNT(*) as memory_count,
    mc."memoryType"
FROM memory_contexts mc
LEFT JOIN agents a ON mc."agentId" = a.id
GROUP BY a.name, mc."memoryType"
ORDER BY memory_count DESC;
```

#### Memorias compartidas (sin agente específico)
```sql
SELECT *
FROM memory_contexts
WHERE "agentId" IS NULL
AND "userId" = 'USER_ID_AQUI';
```

### Código TypeScript

#### Crear memoria con agente específico
```typescript
const memory = await this.memoryContextRepository.save({
  userId: user.id,
  agentId: agent.id, // <-- NUEVO
  sessionId: session.id,
  memoryType: MemoryType.EPISODIC,
  category: MemoryCategory.CONVERSATION,
  content: 'El niño aprendió sobre dinosaurios',
  importance: 0.8,
  metadata: {
    topics: ['dinosaurios', 'paleontología'],
    emotions: ['excited', 'curious']
  }
});
```

#### Buscar memorias de un agente específico
```typescript
const agentMemories = await this.memoryContextRepository.find({
  where: {
    userId: user.id,
    agentId: agent.id, // <-- NUEVO
    memoryType: MemoryType.EPISODIC
  },
  order: {
    createdAt: 'DESC'
  },
  take: 10
});
```

#### Buscar memorias compartidas o del agente
```typescript
const memories = await this.memoryContextRepository.find({
  where: [
    { userId: user.id, agentId: agent.id }, // Específicas del agente
    { userId: user.id, agentId: IsNull() }  // Compartidas
  ],
  order: {
    importance: 'DESC'
  }
});
```

## Impacto

### Código Existente
- ✅ **Sin breaking changes**: La columna es `nullable`, el código existente sigue funcionando
- ✅ **Retrocompatible**: Memorias existentes tienen `agentId = NULL` (compartidas)

### Performance
- ✅ **Optimizado**: Índice compuesto `(userId, agentId, memoryType)` para queries rápidas
- ✅ **Escalable**: La estructura soporta millones de memorias por usuario

### Próximas Mejoras Sugeridas

1. **Actualizar `MemoryService.buildContextForAI()`** para filtrar por `agentId`
2. **Migrar memorias existentes** a agentes específicos (opcional)
3. **Agregar campo `agentId` en DTOs** de memoria
4. **Implementar políticas de compartición** (qué memorias son compartidas vs específicas)

## Rollback

Si necesitas revertir la migración:

```sql
-- Eliminar foreign key
ALTER TABLE memory_contexts
DROP CONSTRAINT IF EXISTS "FK_memory_contexts_agentId";

-- Eliminar índices
DROP INDEX IF EXISTS "IDX_memory_contexts_userId_agentId_memoryType";
DROP INDEX IF EXISTS "IDX_memory_contexts_agentId";

-- Eliminar columna
ALTER TABLE memory_contexts
DROP COLUMN "agentId";
```

O usando la migración TypeORM:
```bash
npm run migration:revert
```

---

**Autor:** Claude
**Revisado:** Pendiente
**Aprobado:** Pendiente
