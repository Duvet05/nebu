# Guía de Pruebas del Flujo de Memoria Contextual

**Fecha:** 04/11/2025

## Resumen del Sistema de Memoria Contextual

Este documento describe el flujo completo del sistema de memoria contextual implementado en Nebu, incluyendo las relaciones entre tablas, endpoints disponibles, y scripts de prueba.

---

## 1. Arquitectura de Memoria

### 1.1 Tipos de Memoria

El sistema implementa tres tipos de memoria según el modelo cognitivo:

- **EPISODIC** (Episódica): Recuerdos de conversaciones pasadas
- **SEMANTIC** (Semántica): Conocimiento sobre el usuario
- **PROCEDURAL** (Procedimental): Patrones de comportamiento

### 1.2 Categorías de Memoria

```typescript
enum MemoryCategory {
  CONVERSATION = 'conversation',
  INTEREST = 'interest',
  EMOTION = 'emotion',
  ACHIEVEMENT = 'achievement',
  ROUTINE = 'routine',
  PREFERENCE = 'preference',
  LEARNING = 'learning',
  FAMILY = 'family',
  OTHER = 'other'
}
```

---

## 2. Estructura de Base de Datos

### 2.1 Tabla `memory_contexts`

**Tabla principal de memorias contextuales**

```sql
CREATE TABLE memory_contexts (
  id UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "sessionId" UUID REFERENCES voice_sessions(id) ON DELETE SET NULL,
  "agentId" UUID REFERENCES agents(id) ON DELETE SET NULL,  -- ✨ NUEVO
  "memoryType" VARCHAR NOT NULL DEFAULT 'episodic',
  category VARCHAR NOT NULL DEFAULT 'conversation',
  content TEXT NOT NULL,
  summary TEXT,
  metadata JSONB,
  "chromaCollectionId" VARCHAR(100),
  "chromaCollectionName" VARCHAR(50),
  importance FLOAT DEFAULT 0.5,
  "accessCount" INT DEFAULT 0,
  "lastAccessedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "expiresAt" TIMESTAMP
);

-- Índices
CREATE INDEX "IDX_memory_contexts_userId_memoryType" ON memory_contexts ("userId", "memoryType");
CREATE INDEX "IDX_memory_contexts_userId_agentId_memoryType" ON memory_contexts ("userId", "agentId", "memoryType");
CREATE INDEX "IDX_memory_contexts_sessionId" ON memory_contexts ("sessionId");
CREATE INDEX "IDX_memory_contexts_importance" ON memory_contexts (importance);
CREATE INDEX "IDX_memory_contexts_agentId" ON memory_contexts ("agentId");
```

### 2.2 Tabla `user_profiles`

**Perfil del usuario con preferencias y contexto**

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  "userId" UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age INT,
  preferences JSONB,  -- interests, favoriteTopics, learningStyle, etc.
  "developmentMilestones" JSONB,  -- language, cognitive, social, motor
  routines JSONB,  -- wakeTime, bedTime, mealTimes, screenTime
  "familyContext" JSONB,  -- familyMembers, pets, languages
  "educationalGoals" JSONB,
  "healthInfo" JSONB,
  "interactionStats" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### 2.3 Tabla `voice_sessions`

**Sesiones de voz/conversación**

```sql
CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY,
  "userId" UUID REFERENCES users(id),
  "sessionToken" VARCHAR(512),
  "roomName" VARCHAR(255),
  status VARCHAR(10) DEFAULT 'active',  -- active, ended, paused, error
  language VARCHAR(10) DEFAULT 'es',
  metadata JSONB,
  "startedAt" TIMESTAMP DEFAULT NOW(),
  "endedAt" TIMESTAMP,
  "durationSeconds" INT,
  "messageCount" INT DEFAULT 0,
  "totalTokensUsed" INT DEFAULT 0,
  "totalCost" FLOAT DEFAULT 0,
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "IDX_voice_sessions_userId" ON voice_sessions ("userId");
CREATE INDEX "IDX_voice_sessions_status" ON voice_sessions (status);
```

### 2.4 Tabla `ai_conversations`

**Mensajes individuales dentro de una sesión**

```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  "userId" UUID,
  "sessionId" UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  "messageType" VARCHAR NOT NULL,  -- user, assistant, system
  content TEXT NOT NULL,
  "audioUrl" VARCHAR(500),
  "tokensUsed" INT,
  "processingTimeMs" INT,
  cost FLOAT,
  metadata JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "IDX_ai_conversations_userId" ON ai_conversations ("userId");
CREATE INDEX "IDX_ai_conversations_sessionId" ON ai_conversations ("sessionId");
```

### 2.5 Tabla `session_heartbeats`

**Monitoreo de salud de las sesiones**

```sql
CREATE TABLE session_heartbeats (
  id UUID PRIMARY KEY,
  "sessionId" UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL DEFAULT 'active',  -- active, idle, disconnected, reconnecting
  metrics JSONB,  -- audioQuality, latency, batteryLevel, signalStrength, etc.
  "deviceId" VARCHAR(100),
  "errorMessage" TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "IDX_session_heartbeats_sessionId_timestamp" ON session_heartbeats ("sessionId", timestamp);
CREATE INDEX "IDX_session_heartbeats_status" ON session_heartbeats (status);
```

### 2.6 Tabla `agents`

**Agentes/personajes con personalidad**

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  persona JSONB,  -- instructions, tone, expertise, constraints
  "voiceSettings" JSONB,
  "ownerUserId" VARCHAR(64),
  "isPublic" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

---

## 3. Relaciones entre Tablas

```
users (1) ──────────── (1) user_profiles
  │
  ├── (1) ──────────── (N) voice_sessions
  │                          │
  │                          ├── (1) ──────────── (N) ai_conversations
  │                          └── (1) ──────────── (N) session_heartbeats
  │
  ├── (1) ──────────── (N) memory_contexts
  │                          │
  │                          ├── (N) ──────────── (1) voice_sessions [opcional]
  │                          └── (N) ──────────── (1) agents [opcional]
  └── (1) ──────────── (N) agents [como owner]
```

**Notas importantes:**
- `memory_contexts.agentId` es **opcional**: permite memorias compartidas (NULL) o específicas del agente
- Las memorias con `agentId = NULL` son accesibles por todos los agentes del usuario
- Las memorias con `agentId` específico solo se recuperan para ese agente

---

## 4. Flujo de Memoria Contextual

### 4.1 Almacenamiento de Memoria

**1. Working Memory (Redis)**
```typescript
// Memoria de corto plazo - últimos 10 mensajes
await memoryService.updateWorkingMemory(sessionId, {
  role: 'user',
  content: 'Me gustan los dinosaurios',
  timestamp: new Date()
});
```

**2. Episodic Memory (ChromaDB + PostgreSQL)**
```typescript
// Al finalizar sesión o por evento importante
await memoryService.storeEpisodicMemory(
  userId,
  sessionId,
  'El niño expresó interés en dinosaurios y preguntó sobre el T-Rex',
  {
    category: MemoryCategory.INTEREST,
    tags: ['dinosaurios', 'aprendizaje'],
    emotions: ['excited', 'curious'],
    topics: ['paleontología'],
    confidence: 0.9
  },
  agentId  // ✨ NUEVO: memoria específica del agente
);
```

**3. Semantic Memory (ChromaDB)**
```typescript
// Conocimiento acumulado sobre el usuario
await memoryService.updateSemanticKnowledge(
  userId,
  'A este niño le encantan los dinosaurios carnívoros',
  MemoryCategory.INTEREST,
  0.95
);
```

### 4.2 Recuperación de Memoria

**Búsqueda Semántica**
```typescript
// Recuperar memorias relevantes para el contexto actual
const memories = await memoryService.retrieveRelevantMemories(
  userId,
  'Cuéntame sobre dinosaurios',  // query semántico
  5,  // límite de resultados
  agentId  // ✨ NUEVO: filtra por agente o compartidas
);
```

**Construcción de Contexto para IA**
```typescript
const context = await memoryService.buildContextForAI(
  userId,
  sessionId,
  'Mensaje actual del usuario',
  agentId  // ✨ NUEVO: incluye personalidad del agente
);

// Retorna un contexto estructurado:
// === ROL DEL AGENTE ===
// [instrucciones, tono, especialidad, restricciones]
//
// === PERFIL DEL NIÑO ===
// [nombre, edad, intereses, idioma]
//
// === LO QUE SÉ SOBRE EL NIÑO ===
// [conocimiento semántico relevante]
//
// === CONVERSACIONES PASADAS RELEVANTES ===
// [memorias episódicas similares]
//
// === CONVERSACIÓN ACTUAL ===
// [últimos 10 mensajes]
```

### 4.3 Mantenimiento de Memoria

**Decaimiento de Importancia**
```typescript
// Cron job diario a las 3 AM
@Cron(CronExpression.EVERY_DAY_AT_3AM)
async applyMemoryDecay() {
  // Reduce importancia: 1% por día
  for (const memory of oldMemories) {
    memory.decay(0.01 * ageInDays);
  }
}
```

**Limpieza de Memorias Expiradas**
```typescript
// Cron job diario a las 2 AM
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async cleanupExpiredMemories() {
  // Elimina memorias donde expiresAt < NOW()
  const expired = await memoryRepo.find({
    where: { expiresAt: LessThan(new Date()) }
  });
  // Elimina de ChromaDB y PostgreSQL
}
```

---

## 5. Endpoints Disponibles

### 5.1 Voice Sessions (Base para Memoria)

```bash
# Crear sesión
POST /voice/sessions
{
  "userId": "uuid",
  "language": "es",
  "metadata": {}
}

# Listar sesiones
GET /voice/sessions?userId=uuid&status=active

# Obtener sesión específica con conversaciones
GET /voice/sessions/:id

# Finalizar sesión (trigger para crear resumen de memoria)
POST /voice/sessions/:id/end

# Obtener conversaciones de una sesión
GET /voice/sessions/:id/conversations
```

### 5.2 Conversations

```bash
# Agregar mensaje a sesión
POST /voice/conversations
{
  "sessionId": "uuid",
  "userId": "uuid",
  "messageType": "user",
  "content": "Me gustan los dinosaurios",
  "metadata": {}
}
```

### 5.3 Memory Service (Uso Interno)

**No hay endpoints REST directos**, pero el servicio se usa en:
- `voice.service.ts`: Al finalizar sesión → `createSessionSummary()`
- Agentes de IA: Al generar respuestas → `buildContextForAI()`

---

## 6. Scripts de Prueba

### 6.1 Verificar Migración

```bash
# Ejecutar desde backend/
npm run migration:run

# O manualmente (ajustar credenciales)
psql -h localhost -U postgres -d nebu -f src/migrations/add-agent-id-to-memory-contexts.sql
```

### 6.2 Verificar Esquema

```sql
-- Verificar que agentId existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'memory_contexts'
AND column_name = 'agentId';

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'memory_contexts'
AND indexname LIKE '%agentId%';

-- Verificar foreign key
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'memory_contexts'::regclass
AND conname = 'FK_memory_contexts_agentId';
```

### 6.3 Consultas Útiles

```sql
-- Ver memorias por usuario y agente
SELECT
  mc.id,
  mc.content,
  mc."memoryType",
  mc.category,
  mc.importance,
  mc."createdAt",
  a.name as agent_name,
  CASE WHEN mc."agentId" IS NULL THEN 'Compartida' ELSE 'Específica' END as scope
FROM memory_contexts mc
LEFT JOIN agents a ON mc."agentId" = a.id
WHERE mc."userId" = 'USER_ID_AQUI'
ORDER BY mc."createdAt" DESC;

-- Contar memorias por tipo y agente
SELECT
  mc."memoryType",
  COALESCE(a.name, 'Memoria Compartida') as agent_name,
  COUNT(*) as count,
  AVG(mc.importance) as avg_importance
FROM memory_contexts mc
LEFT JOIN agents a ON mc."agentId" = a.id
GROUP BY mc."memoryType", a.name
ORDER BY count DESC;

-- Memorias más importantes
SELECT
  content,
  importance,
  "accessCount",
  category,
  DATE_PART('day', NOW() - "createdAt") as days_old
FROM memory_contexts
WHERE "userId" = 'USER_ID_AQUI'
ORDER BY importance DESC, "accessCount" DESC
LIMIT 10;

-- Sesiones con más conversaciones
SELECT
  vs.id,
  vs."userId",
  vs.status,
  vs."messageCount",
  vs."durationSeconds",
  COUNT(mc.id) as memories_created,
  vs."startedAt"
FROM voice_sessions vs
LEFT JOIN memory_contexts mc ON mc."sessionId" = vs.id
GROUP BY vs.id
ORDER BY vs."startedAt" DESC
LIMIT 20;
```

---

## 7. Flujo de Prueba Completo

### Escenario: Conversación con Memoria Contextual

```bash
# 1. Crear un agente
POST /agents
{
  "name": "Dino Buddy",
  "description": "Un dinosaurio amigable que enseña sobre paleontología",
  "persona": {
    "instructions": "Eres un T-Rex amigable que adora enseñar sobre dinosaurios",
    "tone": "Entusiasta y educativo",
    "expertise": ["paleontología", "dinosaurios", "ciencia"],
    "constraints": ["Siempre mantener tono apropiado para niños"]
  },
  "isPublic": true
}
# Respuesta: { "id": "agent-uuid", ... }

# 2. Crear sesión de voz
POST /voice/sessions
{
  "userId": "user-uuid",
  "language": "es",
  "metadata": {
    "agentId": "agent-uuid"
  }
}
# Respuesta: { "id": "session-uuid", ... }

# 3. Agregar conversación (usuario)
POST /voice/conversations
{
  "sessionId": "session-uuid",
  "userId": "user-uuid",
  "messageType": "user",
  "content": "Hola! Me gustan mucho los dinosaurios"
}

# 4. Construir contexto para IA (interno)
# El servicio de voz llamará a:
const context = await memoryService.buildContextForAI(
  'user-uuid',
  'session-uuid',
  'Hola! Me gustan mucho los dinosaurios',
  'agent-uuid'
);

# 5. Agregar respuesta del asistente
POST /voice/conversations
{
  "sessionId": "session-uuid",
  "userId": "user-uuid",
  "messageType": "assistant",
  "content": "¡Hola! ¡Qué emocionante! Los dinosaurios son increíbles. ¿Cuál es tu favorito?"
}

# 6. Continuar conversación...

# 7. Finalizar sesión (trigger para crear resumen)
POST /voice/sessions/session-uuid/end
# Esto ejecuta createSessionSummary() que:
# - Genera resumen con GPT-4
# - Extrae insights (topics, emotions, entities, newKnowledge)
# - Guarda como memoria episódica con agentId
# - Actualiza conocimiento semántico

# 8. Verificar memoria creada
# En la base de datos verás:
# - memory_contexts con content = resumen de la conversación
# - agentId = 'agent-uuid'
# - category = 'conversation'
# - metadata con insights extraídos

# 9. Nueva sesión con el mismo agente recuperará las memorias
POST /voice/sessions
{
  "userId": "user-uuid",
  "metadata": { "agentId": "agent-uuid" }
}
# Al construir contexto, recuperará:
# - Working memory (vacía, nueva sesión)
# - Episodic memories (conversación anterior sobre dinosaurios)
# - Semantic knowledge (le gustan los dinosaurios)
# - User profile
# - Agent persona (Dino Buddy)
```

---

## 8. Verificación de ChromaDB

```bash
# Si ChromaDB está corriendo, verificar colecciones
curl http://localhost:8000/api/v1/collections

# Debería mostrar colecciones como:
# - episodic_memories_{userId}
# - semantic_knowledge_{userId}
```

---

## 9. Pruebas Programáticas

Ver el archivo adjunto `test-memory-flow.ts` para un script de prueba automatizado.

---

## 10. Casos de Prueba Recomendados

### 10.1 Memoria Compartida vs Específica

```sql
-- Crear memoria compartida (sin agentId)
INSERT INTO memory_contexts ("userId", content, "memoryType", category, importance)
VALUES ('user-uuid', 'El niño se llama Juan', 'semantic', 'other', 0.9);

-- Crear memoria específica del agente
INSERT INTO memory_contexts ("userId", "agentId", content, "memoryType", category, importance)
VALUES ('user-uuid', 'agent-uuid', 'Juan preguntó sobre el T-Rex', 'episodic', 'conversation', 0.8);

-- Verificar recuperación
SELECT content,
  CASE WHEN "agentId" IS NULL THEN 'Compartida' ELSE 'Específica' END as scope
FROM memory_contexts
WHERE "userId" = 'user-uuid'
AND ("agentId" = 'agent-uuid' OR "agentId" IS NULL);
```

### 10.2 Decaimiento de Memoria

```sql
-- Ver importancia antes
SELECT id, content, importance, "createdAt" FROM memory_contexts WHERE "userId" = 'user-uuid';

-- Simular decaimiento (1% por día)
UPDATE memory_contexts
SET importance = GREATEST(importance - (0.01 * DATE_PART('day', NOW() - "createdAt")), 0)
WHERE "memoryType" = 'episodic';

-- Ver importancia después
SELECT id, content, importance, DATE_PART('day', NOW() - "createdAt") as age_days
FROM memory_contexts
WHERE "userId" = 'user-uuid';
```

### 10.3 Acceso y Popularidad

```sql
-- Simular acceso a memoria
UPDATE memory_contexts
SET
  "accessCount" = "accessCount" + 1,
  "lastAccessedAt" = NOW(),
  importance = LEAST(importance + 0.05, 1.0)
WHERE id = 'memory-uuid';
```

---

## 11. Configuración Requerida

Variables de entorno necesarias:

```env
# OpenAI (para resúmenes y análisis)
OPENAI_API_KEY=sk-...

# ChromaDB (para embeddings semánticos)
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Redis (para working memory)
REDIS_HOST=localhost
REDIS_PORT=6379

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=nebu

# Configuración de memoria
MEMORY_RETENTION_DAYS=30
ENABLE_MEMORY_DECAY=true
```

---

## 12. Checklist de Pruebas

- [ ] Migración ejecutada correctamente
- [ ] Índices creados en memory_contexts
- [ ] Foreign key de agentId funciona
- [ ] Crear sesión de voz
- [ ] Agregar conversaciones
- [ ] Finalizar sesión genera resumen
- [ ] Resumen se guarda en memory_contexts
- [ ] Memoria tiene agentId correcto
- [ ] Nueva sesión recupera memorias del agente
- [ ] Memorias compartidas (NULL) accesibles por todos
- [ ] ChromaDB almacena embeddings
- [ ] Redis almacena working memory
- [ ] Decaimiento de memoria funciona
- [ ] Limpieza de memorias expiradas funciona
- [ ] Estadísticas de memoria correctas

---

## 13. Troubleshooting

### ChromaDB no conecta
```bash
# Verificar que ChromaDB esté corriendo
docker ps | grep chroma
# O iniciar manualmente
docker run -p 8000:8000 chromadb/chroma
```

### Redis no conecta
```bash
# Verificar Redis
docker ps | grep redis
redis-cli ping  # debe responder PONG
```

### Migración falla
```bash
# Verificar estado de migraciones
npm run migration:show

# Revertir si es necesario
npm run migration:revert

# Ejecutar nuevamente
npm run migration:run
```

### OpenAI API falla
```bash
# Verificar API key
echo $OPENAI_API_KEY

# Probar manualmente
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## Conclusión

Este sistema de memoria contextual permite a los agentes de Nebu:
- Recordar conversaciones pasadas específicas de cada agente
- Construir conocimiento acumulado sobre el usuario
- Adaptar respuestas basándose en preferencias y contexto
- Mantener coherencia entre sesiones
- Olvidar gradualmente información antigua menos relevante

La adición de `agentId` permite que múltiples agentes compartan contexto general del usuario mientras mantienen sus propias memorias específicas.
