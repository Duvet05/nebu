# Esquema de Base de Datos - Sistema de Memoria Contextual

**Fecha:** 04/11/2025

## Diagrama de Relaciones

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │◄────────────────────────┐
│ email           │                         │
│ firstName       │                         │
│ lastName        │                         │
│ ...             │                         │
└─────────────────┘                         │
        │                                   │
        │ 1:1                               │
        ▼                                   │
┌─────────────────┐                         │
│ user_profiles   │                         │
│─────────────────│                         │
│ id (PK)         │                         │
│ userId (FK)     │                         │
│ age             │                         │
│ preferences     │ (JSONB)                 │
│ routines        │ (JSONB)                 │
│ familyContext   │ (JSONB)                 │
│ ...             │                         │
└─────────────────┘                         │
                                            │
        │ 1:N                               │
        ▼                                   │
┌─────────────────────────────────┐         │
│      voice_sessions             │         │
│─────────────────────────────────│         │
│ id (PK)                         │         │
│ userId (FK) ────────────────────┼─────────┘
│ sessionToken                    │
│ roomName                        │
│ status (active/ended/paused)    │
│ language                        │
│ metadata (JSONB) ───┐           │
│   └─ agentId        │           │
│ startedAt           │           │
│ endedAt             │           │
│ durationSeconds     │           │
│ messageCount        │           │
│ totalTokensUsed     │           │
│ totalCost           │           │
└─────────────────────────────────┘
        │                  │
        │ 1:N              │ 1:N
        ▼                  ▼
┌──────────────────┐  ┌─────────────────┐
│ai_conversations  │  │session_heartbeats│
│──────────────────│  │─────────────────│
│ id (PK)          │  │ id (PK)         │
│ sessionId (FK)   │  │ sessionId (FK)  │
│ userId           │  │ status          │
│ messageType      │  │ metrics (JSONB) │
│ content          │  │   - audioQuality│
│ audioUrl         │  │   - latency     │
│ tokensUsed       │  │   - battery     │
│ cost             │  │   - signal      │
│ metadata (JSONB) │  │ deviceId        │
│ createdAt        │  │ errorMessage    │
└──────────────────┘  │ timestamp       │
                      └─────────────────┘

┌─────────────────┐
│     agents      │
│─────────────────│
│ id (PK)         │◄──────────┐
│ name            │           │
│ description     │           │
│ persona (JSONB) │           │
│   - instructions│           │
│   - tone        │           │
│   - expertise   │           │
│   - constraints │           │
│ voiceSettings   │           │
│ ownerUserId     │           │
│ isPublic        │           │
│ createdAt       │           │
└─────────────────┘           │
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        │                     │ N:1                  │
        │                     │                      │
        ▼                     │                      │
┌───────────────────────────────────────────┐        │
│          memory_contexts                  │        │
│───────────────────────────────────────────│        │
│ id (PK)                                   │        │
│ userId (FK) ──────────────────────────────┼────────┘
│ sessionId (FK) [nullable] ────────┐       │
│ agentId (FK) [nullable] ──────────┼───────┘
│                                   │       │
│ memoryType (enum)                 │       │
│   - episodic                      │       │
│   - semantic                      │       │
│   - procedural                    │       │
│                                   │       │
│ category (enum)                   │       │
│   - conversation                  │       │
│   - interest                      │       │
│   - emotion                       │       │
│   - achievement                   │       │
│   - routine                       │       │
│   - preference                    │       │
│   - learning                      │       │
│   - family                        │       │
│   - other                         │       │
│                                   │       │
│ content (TEXT)                    │       │
│ summary (TEXT)                    │       │
│ metadata (JSONB)                  │       │
│   - tags                          │       │
│   - emotions                      │       │
│   - topics                        │       │
│   - entities                      │       │
│   - language                      │       │
│   - confidence                    │       │
│   - source                        │       │
│                                   │       │
│ chromaCollectionId                │       │
│ chromaCollectionName              │       │
│ importance (0-1)                  │       │
│ accessCount                       │       │
│ lastAccessedAt                    │       │
│ createdAt                         │       │
│ updatedAt                         │       │
│ expiresAt                         │       │
└───────────────────────────────────────────┘
                    │
                    │ relacionado con
                    ▼
              voice_sessions
```

## Cardinalidades

| Relación | Tipo | Descripción |
|----------|------|-------------|
| users → user_profiles | 1:1 | Cada usuario tiene un perfil |
| users → voice_sessions | 1:N | Un usuario puede tener múltiples sesiones |
| users → memory_contexts | 1:N | Un usuario puede tener múltiples memorias |
| voice_sessions → ai_conversations | 1:N | Una sesión tiene múltiples conversaciones |
| voice_sessions → session_heartbeats | 1:N | Una sesión tiene múltiples heartbeats |
| voice_sessions → memory_contexts | 1:N | Una sesión puede generar múltiples memorias |
| agents → memory_contexts | 1:N | Un agente puede tener múltiples memorias específicas |
| users → agents | 1:N | Un usuario puede ser dueño de múltiples agentes |

## Claves Foráneas

### memory_contexts
- `userId` → `users(id)` ON DELETE CASCADE
- `sessionId` → `voice_sessions(id)` ON DELETE SET NULL [nullable]
- `agentId` → `agents(id)` ON DELETE SET NULL [nullable] **✨ NUEVO**

### user_profiles
- `userId` → `users(id)` ON DELETE CASCADE

### voice_sessions
- `userId` → `users(id)` ON DELETE CASCADE (implícito)

### ai_conversations
- `sessionId` → `voice_sessions(id)` ON DELETE CASCADE

### session_heartbeats
- `sessionId` → `voice_sessions(id)` ON DELETE CASCADE

## Índices Importantes

### memory_contexts
```sql
-- Índices compuestos para búsquedas eficientes
CREATE INDEX "IDX_memory_contexts_userId_memoryType"
  ON memory_contexts ("userId", "memoryType");

CREATE INDEX "IDX_memory_contexts_userId_agentId_memoryType"
  ON memory_contexts ("userId", "agentId", "memoryType");

-- Índices simples
CREATE INDEX "IDX_memory_contexts_sessionId"
  ON memory_contexts ("sessionId");

CREATE INDEX "IDX_memory_contexts_agentId"
  ON memory_contexts ("agentId");

CREATE INDEX "IDX_memory_contexts_importance"
  ON memory_contexts (importance);

CREATE INDEX "IDX_memory_contexts_createdAt"
  ON memory_contexts ("createdAt");
```

### voice_sessions
```sql
CREATE INDEX "IDX_voice_sessions_userId"
  ON voice_sessions ("userId");

CREATE INDEX "IDX_voice_sessions_status"
  ON voice_sessions (status);
```

### ai_conversations
```sql
CREATE INDEX "IDX_ai_conversations_userId"
  ON ai_conversations ("userId");

CREATE INDEX "IDX_ai_conversations_sessionId"
  ON ai_conversations ("sessionId");
```

### session_heartbeats
```sql
CREATE INDEX "IDX_session_heartbeats_sessionId_timestamp"
  ON session_heartbeats ("sessionId", timestamp);

CREATE INDEX "IDX_session_heartbeats_status"
  ON session_heartbeats (status);
```

## Tipos de Datos JSONB

### user_profiles.preferences
```json
{
  "interests": ["dinosaurios", "espacio"],
  "favoriteTopics": ["ciencia", "cuentos"],
  "learningStyle": "visual",
  "emotionalTendencies": ["curioso", "energético"],
  "favoriteActivities": ["cantar", "jugar"],
  "favoriteCharacters": ["dinosaurios", "robots"],
  "avoidTopics": []
}
```

### user_profiles.developmentMilestones
```json
{
  "language": {
    "nativeLanguage": "es",
    "learningLanguages": ["en"],
    "vocabularyLevel": "intermediate",
    "sentenceComplexity": "compound"
  },
  "cognitive": {
    "problemSolving": "proficient",
    "memory": "good",
    "attention": "developing",
    "creativity": "advanced"
  },
  "social": {
    "empathy": "developing",
    "cooperation": "good",
    "communication": "proficient",
    "emotionalRegulation": "developing"
  }
}
```

### user_profiles.routines
```json
{
  "wakeTime": "07:00",
  "bedTime": "21:00",
  "mealTimes": {
    "breakfast": "08:00",
    "lunch": "13:00",
    "dinner": "19:00",
    "snacks": ["10:00", "16:00"]
  },
  "screenTime": {
    "limit": 60,
    "currentUsage": 30
  }
}
```

### memory_contexts.metadata
```json
{
  "tags": ["dinosaurios", "aprendizaje", "paleontología"],
  "emotions": ["excited", "curious", "happy"],
  "topics": ["ciencia", "historia natural"],
  "entities": ["T-Rex", "Velociraptor", "Juan"],
  "language": "es",
  "confidence": 0.95,
  "source": "conversation",
  "messageCount": 6,
  "durationSeconds": 180
}
```

### agents.persona
```json
{
  "instructions": "Eres un T-Rex amigable que adora enseñar sobre dinosaurios",
  "tone": "Entusiasta, educativo y paciente",
  "expertise": ["paleontología", "dinosaurios", "ciencia"],
  "constraints": [
    "Siempre mantener tono apropiado para niños",
    "Usar lenguaje simple",
    "Fomentar la curiosidad"
  ],
  "examples": [
    "user: ¿Qué comían los dinosaurios?",
    "assistant: ¡Gran pregunta! Había dinosaurios herbívoros..."
  ]
}
```

### voice_sessions.metadata
```json
{
  "agentId": "uuid-del-agente",
  "roomType": "1-on-1",
  "startMethod": "voice_command",
  "parentPresent": true,
  "testRun": false
}
```

### session_heartbeats.metrics
```json
{
  "audioQuality": 0.95,
  "latency": 120,
  "batteryLevel": 78,
  "signalStrength": -45,
  "userEngagement": 0.88,
  "cpuUsage": 45,
  "memoryUsage": 60,
  "temperature": 42
}
```

## Consultas de Ejemplo por Caso de Uso

### 1. Obtener contexto completo para IA

```sql
-- Memoria episódica relevante (filtrada por agente)
SELECT * FROM memory_contexts
WHERE "userId" = :userId
  AND "memoryType" = 'episodic'
  AND ("agentId" = :agentId OR "agentId" IS NULL)
ORDER BY importance DESC, "createdAt" DESC
LIMIT 5;

-- Perfil del usuario
SELECT * FROM user_profiles WHERE "userId" = :userId;

-- Sesión actual
SELECT * FROM voice_sessions WHERE id = :sessionId;

-- Conversaciones de la sesión
SELECT * FROM ai_conversations
WHERE "sessionId" = :sessionId
ORDER BY "createdAt" ASC;

-- Agente actual
SELECT * FROM agents WHERE id = :agentId;
```

### 2. Dashboard de memorias del usuario

```sql
SELECT
  mc."memoryType",
  mc.category,
  COUNT(*) as count,
  AVG(mc.importance) as avg_importance,
  MAX(mc."createdAt") as latest
FROM memory_contexts mc
WHERE mc."userId" = :userId
GROUP BY mc."memoryType", mc.category
ORDER BY count DESC;
```

### 3. Análisis de sesiones

```sql
SELECT
  vs.id,
  vs."startedAt",
  vs."durationSeconds",
  vs."messageCount",
  a.name as agent_name,
  COUNT(DISTINCT mc.id) as memories_created
FROM voice_sessions vs
LEFT JOIN agents a ON a.id = (vs.metadata->>'agentId')::uuid
LEFT JOIN memory_contexts mc ON mc."sessionId" = vs.id
WHERE vs."userId" = :userId
GROUP BY vs.id, a.name
ORDER BY vs."startedAt" DESC;
```

### 4. Top memorias importantes

```sql
SELECT
  LEFT(content, 100) as preview,
  importance,
  "accessCount",
  category,
  COALESCE(a.name, 'Compartida') as agent
FROM memory_contexts mc
LEFT JOIN agents a ON a.id = mc."agentId"
WHERE mc."userId" = :userId
ORDER BY importance DESC, "accessCount" DESC
LIMIT 10;
```

### 5. Actividad reciente

```sql
SELECT
  DATE("createdAt") as date,
  COUNT(*) as memories_created,
  AVG(importance) as avg_importance
FROM memory_contexts
WHERE "userId" = :userId
  AND "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("createdAt")
ORDER BY date DESC;
```

## Triggers y Funciones (Recomendados)

### Auto-actualizar updatedAt en memory_contexts

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memory_contexts_updated_at
BEFORE UPDATE ON memory_contexts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Log de accesos a memoria

```sql
CREATE TABLE memory_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "memoryId" UUID NOT NULL REFERENCES memory_contexts(id) ON DELETE CASCADE,
  "accessedAt" TIMESTAMP DEFAULT NOW(),
  "accessType" VARCHAR(50), -- 'retrieve', 'update', 'increment'
  metadata JSONB
);

CREATE INDEX "IDX_memory_access_log_memoryId" ON memory_access_log ("memoryId");
CREATE INDEX "IDX_memory_access_log_accessedAt" ON memory_access_log ("accessedAt");
```

## Vistas Útiles

### Vista de memorias con información enriquecida

```sql
CREATE VIEW v_memory_contexts_enriched AS
SELECT
  mc.*,
  u."firstName" as user_name,
  u.email as user_email,
  a.name as agent_name,
  vs."startedAt" as session_start,
  DATE_PART('day', NOW() - mc."createdAt") as age_days,
  CASE
    WHEN mc."expiresAt" IS NOT NULL AND mc."expiresAt" < NOW() THEN 'EXPIRED'
    WHEN mc.importance < 0.3 THEN 'LOW'
    WHEN mc.importance < 0.7 THEN 'MEDIUM'
    ELSE 'HIGH'
  END as importance_level
FROM memory_contexts mc
LEFT JOIN users u ON u.id = mc."userId"
LEFT JOIN agents a ON a.id = mc."agentId"
LEFT JOIN voice_sessions vs ON vs.id = mc."sessionId";
```

### Vista de sesiones con estadísticas

```sql
CREATE VIEW v_voice_sessions_stats AS
SELECT
  vs.*,
  COUNT(DISTINCT ac.id) as conversation_count,
  COUNT(DISTINCT mc.id) as memory_count,
  MAX(ac."createdAt") as last_message_at,
  a.name as agent_name
FROM voice_sessions vs
LEFT JOIN ai_conversations ac ON ac."sessionId" = vs.id
LEFT JOIN memory_contexts mc ON mc."sessionId" = vs.id
LEFT JOIN agents a ON a.id = (vs.metadata->>'agentId')::uuid
GROUP BY vs.id, a.name;
```

## Consideraciones de Performance

### Particionamiento (Para gran escala)

```sql
-- Particionar memory_contexts por createdAt (mensual)
CREATE TABLE memory_contexts_2025_11 PARTITION OF memory_contexts
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE memory_contexts_2025_12 PARTITION OF memory_contexts
FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
-- etc.
```

### Archivado de datos antiguos

```sql
-- Tabla de archivo para memorias muy antiguas
CREATE TABLE memory_contexts_archive (
  LIKE memory_contexts INCLUDING ALL
);

-- Mover memorias antiguas de baja importancia
INSERT INTO memory_contexts_archive
SELECT * FROM memory_contexts
WHERE "createdAt" < NOW() - INTERVAL '1 year'
  AND importance < 0.3
  AND "accessCount" < 5;

-- Luego eliminar de la tabla principal
DELETE FROM memory_contexts
WHERE "createdAt" < NOW() - INTERVAL '1 year'
  AND importance < 0.3
  AND "accessCount" < 5;
```

## Tamaño Estimado de Tablas

| Tabla | Filas estimadas (1000 usuarios activos) | Tamaño estimado |
|-------|------------------------------------------|-----------------|
| users | 1,000 | 100 KB |
| user_profiles | 1,000 | 5 MB |
| agents | 100 | 50 KB |
| voice_sessions | 50,000 (50 por usuario) | 10 MB |
| ai_conversations | 500,000 (10 por sesión) | 200 MB |
| memory_contexts | 150,000 (150 por usuario) | 500 MB |
| session_heartbeats | 2,000,000 | 800 MB |
| **TOTAL** | | **~1.5 GB** |

---

**Nota:** Este esquema está optimizado para el sistema de memoria contextual con soporte para múltiples agentes. La adición de `agentId` permite memorias compartidas y específicas por agente, maximizando la flexibilidad del sistema.
