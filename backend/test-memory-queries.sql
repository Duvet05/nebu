-- =====================================================
-- Consultas SQL para Pruebas de Memoria Contextual
-- Fecha: 04/11/2025
-- =====================================================

-- =====================================================
-- 1. VERIFICAR MIGRACIÓN
-- =====================================================

-- Verificar que la columna agentId existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'memory_contexts'
AND column_name = 'agentId';

-- Verificar índices relacionados con agentId
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'memory_contexts'
AND indexname LIKE '%agent%';

-- Verificar foreign key constraint
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'memory_contexts'::regclass
AND conname LIKE '%agent%';

-- =====================================================
-- 2. EXPLORACIÓN DE DATOS
-- =====================================================

-- Ver todas las tablas relacionadas con memoria
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
    'memory_contexts',
    'user_profiles',
    'voice_sessions',
    'ai_conversations',
    'session_heartbeats',
    'agents'
)
ORDER BY table_name;

-- Ver estructura completa de memory_contexts
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'memory_contexts'
ORDER BY ordinal_position;

-- =====================================================
-- 3. CONSULTAS DE MEMORIA POR USUARIO
-- =====================================================

-- Ver todas las memorias de un usuario con información del agente
-- REEMPLAZAR: 'USER_ID_AQUI' con el UUID real del usuario
SELECT
    mc.id,
    mc."memoryType",
    mc.category,
    LEFT(mc.content, 100) as content_preview,
    mc.importance,
    mc."accessCount",
    mc."createdAt",
    COALESCE(a.name, 'Memoria Compartida') as agent_name,
    CASE
        WHEN mc."agentId" IS NULL THEN 'Compartida (todos los agentes)'
        ELSE 'Específica del agente'
    END as memory_scope
FROM memory_contexts mc
LEFT JOIN agents a ON mc."agentId" = a.id
WHERE mc."userId" = 'USER_ID_AQUI'
ORDER BY mc."createdAt" DESC;

-- Contar memorias por tipo y agente
-- REEMPLAZAR: 'USER_ID_AQUI' con el UUID real del usuario
SELECT
    mc."memoryType",
    COALESCE(a.name, 'Compartida') as agent,
    COUNT(*) as count,
    ROUND(AVG(mc.importance)::numeric, 2) as avg_importance,
    MAX(mc."createdAt") as latest_memory
FROM memory_contexts mc
LEFT JOIN agents a ON mc."agentId" = a.id
WHERE mc."userId" = 'USER_ID_AQUI'
GROUP BY mc."memoryType", a.name
ORDER BY count DESC;

-- Memorias más importantes (Top 10)
-- REEMPLAZAR: 'USER_ID_AQUI' con el UUID real del usuario
SELECT
    LEFT(content, 80) as content_preview,
    importance,
    "accessCount",
    category,
    "memoryType",
    DATE_PART('day', NOW() - "createdAt") as age_days,
    "createdAt"
FROM memory_contexts
WHERE "userId" = 'USER_ID_AQUI'
ORDER BY importance DESC, "accessCount" DESC
LIMIT 10;

-- Memorias más accedidas
-- REEMPLAZAR: 'USER_ID_AQUI' con el UUID real del usuario
SELECT
    LEFT(content, 80) as content_preview,
    "accessCount",
    importance,
    "lastAccessedAt",
    category,
    "memoryType"
FROM memory_contexts
WHERE "userId" = 'USER_ID_AQUI'
ORDER BY "accessCount" DESC
LIMIT 10;

-- =====================================================
-- 4. ANÁLISIS DE SESIONES Y CONVERSACIONES
-- =====================================================

-- Sesiones con sus estadísticas
SELECT
    vs.id,
    vs."userId",
    vs.status,
    vs."messageCount",
    vs."durationSeconds",
    vs."startedAt",
    vs."endedAt",
    COUNT(DISTINCT ac.id) as actual_conversation_count,
    COUNT(DISTINCT mc.id) as memories_created
FROM voice_sessions vs
LEFT JOIN ai_conversations ac ON ac."sessionId" = vs.id
LEFT JOIN memory_contexts mc ON mc."sessionId" = vs.id
GROUP BY vs.id
ORDER BY vs."startedAt" DESC
LIMIT 20;

-- Conversaciones de una sesión específica
-- REEMPLAZAR: 'SESSION_ID_AQUI' con el UUID real de la sesión
SELECT
    ac.id,
    ac."messageType",
    ac.content,
    ac."tokensUsed",
    ac."processingTimeMs",
    ac."createdAt"
FROM ai_conversations ac
WHERE ac."sessionId" = 'SESSION_ID_AQUI'
ORDER BY ac."createdAt" ASC;

-- Ver todas las sesiones de un usuario con agentes
-- REEMPLAZAR: 'USER_ID_AQUI' con el UUID real del usuario
SELECT
    vs.id,
    vs.status,
    vs."messageCount",
    vs."startedAt",
    a.name as agent_name,
    vs.metadata->>'agentId' as agent_id_from_metadata
FROM voice_sessions vs
LEFT JOIN agents a ON a.id = (vs.metadata->>'agentId')::uuid
WHERE vs."userId" = 'USER_ID_AQUI'
ORDER BY vs."startedAt" DESC;

-- =====================================================
-- 5. ANÁLISIS DE AGENTES
-- =====================================================

-- Listar todos los agentes con estadísticas
SELECT
    a.id,
    a.name,
    a.description,
    a."isPublic",
    a."createdAt",
    COUNT(DISTINCT mc.id) as memory_count,
    COUNT(DISTINCT vs.id) as session_count
FROM agents a
LEFT JOIN memory_contexts mc ON mc."agentId" = a.id
LEFT JOIN voice_sessions vs ON (vs.metadata->>'agentId')::uuid = a.id
GROUP BY a.id
ORDER BY a."createdAt" DESC;

-- Ver personalidad (persona) de un agente
-- REEMPLAZAR: 'AGENT_ID_AQUI' con el UUID real del agente
SELECT
    id,
    name,
    description,
    persona,
    "voiceSettings"
FROM agents
WHERE id = 'AGENT_ID_AQUI';

-- =====================================================
-- 6. MEMORIA COMPARTIDA VS ESPECÍFICA
-- =====================================================

-- Comparar acceso a memorias entre agentes
-- REEMPLAZAR: 'AGENT_1_ID' y 'AGENT_2_ID' con UUIDs reales
WITH agent_memories AS (
    SELECT
        a.id as agent_id,
        a.name as agent_name,
        mc.id as memory_id,
        mc."userId",
        CASE
            WHEN mc."agentId" = a.id THEN 'Específica'
            WHEN mc."agentId" IS NULL THEN 'Compartida'
            ELSE 'No accesible'
        END as access_type
    FROM agents a
    CROSS JOIN memory_contexts mc
    WHERE a.id IN ('AGENT_1_ID', 'AGENT_2_ID')
)
SELECT
    agent_name,
    access_type,
    COUNT(*) as memory_count
FROM agent_memories
WHERE access_type IN ('Específica', 'Compartida')
GROUP BY agent_name, access_type
ORDER BY agent_name, access_type;

-- Memorias accesibles por un agente específico
-- REEMPLAZAR: 'AGENT_ID_AQUI' con el UUID real del agente
-- REEMPLAZAR: 'USER_ID_AQUI' con el UUID real del usuario
SELECT
    mc.id,
    LEFT(mc.content, 100) as content_preview,
    mc."memoryType",
    mc.importance,
    CASE
        WHEN mc."agentId" IS NULL THEN 'Compartida'
        WHEN mc."agentId" = 'AGENT_ID_AQUI' THEN 'Específica'
    END as scope
FROM memory_contexts mc
WHERE mc."userId" = 'USER_ID_AQUI'
AND (mc."agentId" = 'AGENT_ID_AQUI' OR mc."agentId" IS NULL)
ORDER BY mc.importance DESC;

-- =====================================================
-- 7. PRUEBAS DE DECAIMIENTO Y LIMPIEZA
-- =====================================================

-- Ver memorias por edad y su importancia actual
-- REEMPLAZAR: 'USER_ID_AQUI' con el UUID real del usuario
SELECT
    id,
    LEFT(content, 60) as content_preview,
    importance,
    "accessCount",
    DATE_PART('day', NOW() - "createdAt") as age_days,
    ROUND((importance - (0.01 * DATE_PART('day', NOW() - "createdAt")))::numeric, 2) as importance_after_decay,
    "expiresAt",
    CASE
        WHEN "expiresAt" IS NOT NULL AND "expiresAt" < NOW() THEN 'EXPIRADA'
        ELSE 'Activa'
    END as status
FROM memory_contexts
WHERE "userId" = 'USER_ID_AQUI'
AND "memoryType" = 'episodic'
ORDER BY age_days DESC;

-- Simular decaimiento de memoria (NO ejecutar en producción sin backup)
-- DESCOMENTAR SOLO PARA PRUEBAS
/*
UPDATE memory_contexts
SET importance = GREATEST(
    importance - (0.01 * DATE_PART('day', NOW() - "createdAt")),
    0
)
WHERE "memoryType" = 'episodic'
AND "userId" = 'USER_ID_AQUI';
*/

-- Ver memorias que serían eliminadas en el próximo cleanup
SELECT
    id,
    LEFT(content, 60) as content_preview,
    importance,
    "expiresAt",
    DATE_PART('day', NOW() - "expiresAt") as days_expired
FROM memory_contexts
WHERE "expiresAt" < NOW()
ORDER BY "expiresAt" DESC;

-- =====================================================
-- 8. PERFIL DE USUARIO
-- =====================================================

-- Ver perfil completo de un usuario
-- REEMPLAZAR: 'USER_ID_AQUI' con el UUID real del usuario
SELECT
    up.id,
    up."userId",
    up.age,
    up.preferences,
    up."developmentMilestones",
    up.routines,
    up."familyContext",
    up."educationalGoals",
    up."healthInfo",
    up."interactionStats",
    up."createdAt",
    up."updatedAt"
FROM user_profiles up
WHERE up."userId" = 'USER_ID_AQUI';

-- Ver preferencias e intereses del usuario
-- REEMPLAZAR: 'USER_ID_AQUI' con el UUID real del usuario
SELECT
    up."userId",
    up.age,
    up.preferences->>'interests' as interests,
    up.preferences->>'favoriteTopics' as favorite_topics,
    up.preferences->>'learningStyle' as learning_style,
    up."developmentMilestones"->'language'->>'nativeLanguage' as native_language
FROM user_profiles up
WHERE up."userId" = 'USER_ID_AQUI';

-- =====================================================
-- 9. SESSION HEARTBEATS
-- =====================================================

-- Ver heartbeats recientes de una sesión
-- REEMPLAZAR: 'SESSION_ID_AQUI' con el UUID real de la sesión
SELECT
    sh.id,
    sh.status,
    sh.metrics,
    sh."deviceId",
    sh.timestamp
FROM session_heartbeats sh
WHERE sh."sessionId" = 'SESSION_ID_AQUI'
ORDER BY sh.timestamp DESC
LIMIT 20;

-- Estado de salud de sesiones activas
SELECT
    vs.id as session_id,
    vs."userId",
    vs.status as session_status,
    sh.status as heartbeat_status,
    sh.metrics->>'audioQuality' as audio_quality,
    sh.metrics->>'latency' as latency,
    sh.metrics->>'batteryLevel' as battery,
    sh.timestamp as last_heartbeat
FROM voice_sessions vs
LEFT JOIN LATERAL (
    SELECT *
    FROM session_heartbeats
    WHERE "sessionId" = vs.id
    ORDER BY timestamp DESC
    LIMIT 1
) sh ON true
WHERE vs.status = 'active'
ORDER BY sh.timestamp DESC;

-- =====================================================
-- 10. ESTADÍSTICAS GENERALES
-- =====================================================

-- Resumen general del sistema
SELECT
    'Users' as entity,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 'Agents', COUNT(*) FROM agents
UNION ALL
SELECT 'Voice Sessions', COUNT(*) FROM voice_sessions
UNION ALL
SELECT 'AI Conversations', COUNT(*) FROM ai_conversations
UNION ALL
SELECT 'Memory Contexts', COUNT(*) FROM memory_contexts
UNION ALL
SELECT 'User Profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'Session Heartbeats', COUNT(*) FROM session_heartbeats;

-- Memorias por tipo
SELECT
    "memoryType",
    COUNT(*) as count,
    ROUND(AVG(importance)::numeric, 2) as avg_importance,
    ROUND(AVG("accessCount")::numeric, 2) as avg_access_count
FROM memory_contexts
GROUP BY "memoryType"
ORDER BY count DESC;

-- Memorias por categoría
SELECT
    category,
    COUNT(*) as count,
    ROUND(AVG(importance)::numeric, 2) as avg_importance
FROM memory_contexts
GROUP BY category
ORDER BY count DESC;

-- Actividad por día (últimos 30 días)
SELECT
    DATE("createdAt") as date,
    COUNT(*) as memories_created
FROM memory_contexts
WHERE "createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY DATE("createdAt")
ORDER BY date DESC;

-- =====================================================
-- 11. TROUBLESHOOTING
-- =====================================================

-- Encontrar memorias sin userId (datos corruptos)
SELECT * FROM memory_contexts WHERE "userId" IS NULL;

-- Encontrar memorias huérfanas (usuario no existe)
SELECT mc.id, mc."userId", mc.content
FROM memory_contexts mc
LEFT JOIN users u ON u.id = mc."userId"
WHERE u.id IS NULL;

-- Encontrar memorias con agentId inválido
SELECT mc.id, mc."agentId", mc.content
FROM memory_contexts mc
LEFT JOIN agents a ON a.id = mc."agentId"
WHERE mc."agentId" IS NOT NULL AND a.id IS NULL;

-- Sesiones sin conversaciones
SELECT vs.id, vs."messageCount", COUNT(ac.id) as actual_count
FROM voice_sessions vs
LEFT JOIN ai_conversations ac ON ac."sessionId" = vs.id
GROUP BY vs.id
HAVING COUNT(ac.id) = 0
ORDER BY vs."createdAt" DESC;

-- Usuarios sin perfil
SELECT u.id, u.email, u."firstName", u."lastName"
FROM users u
LEFT JOIN user_profiles up ON up."userId" = u.id
WHERE up.id IS NULL;

-- =====================================================
-- 12. MANTENIMIENTO Y LIMPIEZA
-- =====================================================

-- PRECAUCIÓN: Las siguientes consultas modifican datos
-- Solo ejecutar después de hacer backup

-- Eliminar memorias expiradas (DESCOMENTAR PARA USAR)
/*
DELETE FROM memory_contexts
WHERE "expiresAt" < NOW();
*/

-- Resetear accessCount de memorias antiguas (DESCOMENTAR PARA USAR)
/*
UPDATE memory_contexts
SET "accessCount" = 0
WHERE "lastAccessedAt" < NOW() - INTERVAL '90 days';
*/

-- Eliminar sesiones muy antiguas sin memorias (DESCOMENTAR PARA USAR)
/*
DELETE FROM voice_sessions
WHERE "startedAt" < NOW() - INTERVAL '180 days'
AND status = 'ended'
AND id NOT IN (SELECT DISTINCT "sessionId" FROM memory_contexts WHERE "sessionId" IS NOT NULL);
*/

-- =====================================================
-- FIN DE CONSULTAS
-- =====================================================
