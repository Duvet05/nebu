# Testing del Flujo de Memoria Contextual

**Fecha:** 04/11/2025

## Inicio Rápido

### 1. Verificar Migración

```bash
# Opción A: Con npm (si hay script configurado)
npm run migration:run

# Opción B: Manualmente con psql
psql -h localhost -U postgres -d nebu -f src/migrations/add-agent-id-to-memory-contexts.sql
```

### 2. Ejecutar Script de Prueba

```bash
# Instalar dependencias si es necesario
npm install axios

# Configurar variables de entorno
export API_BASE_URL="http://localhost:3001"
export AUTH_TOKEN="tu-jwt-token-aqui"  # Opcional pero recomendado

# Ejecutar tests
npx ts-node test-memory-flow.ts
```

### 3. Verificar en Base de Datos

```bash
# Conectar a PostgreSQL
psql -h localhost -U postgres -d nebu

# Ejecutar consultas del archivo
\i test-memory-queries.sql

# O consultas individuales
SELECT * FROM memory_contexts LIMIT 5;
```

## Archivos Creados

1. **MEMORY_FLOW_TEST_GUIDE.md** - Documentación completa del sistema
2. **test-memory-flow.ts** - Script automatizado de pruebas
3. **test-memory-queries.sql** - Consultas SQL útiles
4. **README_MEMORY_TESTS.md** - Este archivo (guía rápida)

## Flujo de Prueba Recomendado

### Paso 1: Verificación de Esquema
```sql
-- Verificar que agentId existe
SELECT column_name FROM information_schema.columns
WHERE table_name = 'memory_contexts' AND column_name = 'agentId';
```

### Paso 2: Crear Agente
```bash
curl -X POST http://localhost:3001/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Dino Buddy",
    "description": "Un dinosaurio amigable",
    "persona": {
      "instructions": "Eres un T-Rex amigable",
      "tone": "Entusiasta"
    },
    "isPublic": true
  }'
```

### Paso 3: Crear Sesión
```bash
curl -X POST http://localhost:3001/voice/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "userId": "tu-user-id",
    "language": "es",
    "metadata": { "agentId": "agent-id-del-paso-2" }
  }'
```

### Paso 4: Agregar Conversaciones
```bash
curl -X POST http://localhost:3001/voice/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "sessionId": "session-id-del-paso-3",
    "userId": "tu-user-id",
    "messageType": "user",
    "content": "Hola! Me gustan los dinosaurios"
  }'
```

### Paso 5: Finalizar Sesión (Trigger de Memoria)
```bash
curl -X POST http://localhost:3001/voice/sessions/session-id/end \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Paso 6: Verificar Memoria Creada
```sql
SELECT
  mc.id,
  mc.content,
  mc."memoryType",
  mc.category,
  mc.importance,
  a.name as agent_name
FROM memory_contexts mc
LEFT JOIN agents a ON mc."agentId" = a.id
WHERE mc."userId" = 'tu-user-id'
ORDER BY mc."createdAt" DESC;
```

## Puntos Clave a Verificar

### ✅ Migración
- [ ] Columna `agentId` existe en `memory_contexts`
- [ ] Índice `IDX_memory_contexts_agentId` creado
- [ ] Índice `IDX_memory_contexts_userId_agentId_memoryType` creado
- [ ] Foreign key `FK_memory_contexts_agentId` creado

### ✅ Relaciones
- [ ] memory_contexts → users (ManyToOne)
- [ ] memory_contexts → voice_sessions (ManyToOne, nullable)
- [ ] memory_contexts → agents (ManyToOne, nullable)
- [ ] user_profiles → users (OneToOne)
- [ ] voice_sessions → ai_conversations (OneToMany)

### ✅ Flujo de Memoria
- [ ] Crear sesión de voz funciona
- [ ] Agregar conversaciones funciona
- [ ] Finalizar sesión crea resumen
- [ ] Resumen se guarda en memory_contexts
- [ ] agentId se asocia correctamente
- [ ] Nueva sesión recupera memorias previas
- [ ] Memorias compartidas (NULL) accesibles por todos
- [ ] Memorias específicas solo accesibles por ese agente

### ✅ ChromaDB (si está configurado)
- [ ] Embeddings se almacenan correctamente
- [ ] Búsqueda semántica funciona
- [ ] Colecciones por usuario se crean

### ✅ Redis (si está configurado)
- [ ] Working memory se almacena
- [ ] Working memory expira después de TTL
- [ ] Limpieza funciona al finalizar sesión

## Troubleshooting

### Error: Cannot connect to database
```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres
# O
pg_isready -h localhost -p 5432
```

### Error: AUTH_TOKEN not working
```bash
# Obtener token válido desde el endpoint de login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tu-email", "password": "tu-password"}'
```

### Error: ChromaDB not available
```bash
# Iniciar ChromaDB con Docker
docker run -p 8000:8000 chromadb/chroma

# Verificar
curl http://localhost:8000/api/v1/heartbeat
```

### Error: Redis not available
```bash
# Iniciar Redis con Docker
docker run -p 6379:6379 redis:alpine

# Verificar
redis-cli ping  # debe responder PONG
```

## Consultas SQL Útiles

### Ver últimas memorias creadas
```sql
SELECT
  LEFT(content, 80) as preview,
  "memoryType",
  category,
  importance,
  "createdAt"
FROM memory_contexts
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Ver agentes con sus memorias
```sql
SELECT
  a.name,
  COUNT(mc.id) as memory_count
FROM agents a
LEFT JOIN memory_contexts mc ON mc."agentId" = a.id
GROUP BY a.id, a.name
ORDER BY memory_count DESC;
```

### Ver sesiones con más interacción
```sql
SELECT
  vs.id,
  vs."messageCount",
  COUNT(ac.id) as conversations,
  COUNT(DISTINCT mc.id) as memories
FROM voice_sessions vs
LEFT JOIN ai_conversations ac ON ac."sessionId" = vs.id
LEFT JOIN memory_contexts mc ON mc."sessionId" = vs.id
GROUP BY vs.id
ORDER BY vs."messageCount" DESC
LIMIT 10;
```

## Logs a Revisar

### Backend (NestJS)
```bash
# Ver logs del servicio de memoria
tail -f logs/app.log | grep MemoryService

# O si usa stdout
docker logs -f nebu-backend | grep "Episodic memory"
```

### Buscar en logs:
- `"Episodic memory stored"` - Memoria creada
- `"Retrieved X relevant memories"` - Búsqueda funcionando
- `"Session summary created"` - Resumen generado
- `"Memory decay applied"` - Decaimiento ejecutado
- `"Cleaned up X expired memories"` - Limpieza ejecutada

## Siguientes Pasos

1. **Desarrollo:** Agregar endpoint REST para consultar memorias
   ```typescript
   // memory.controller.ts
   @Get('memory/user/:userId')
   async getUserMemories(@Param('userId') userId: string) {
     return this.memoryService.getUserMemories(userId);
   }
   ```

2. **Testing:** Agregar tests unitarios e integración
   ```bash
   npm run test:e2e -- memory
   ```

3. **Monitoreo:** Configurar métricas de memoria
   - Total de memorias por usuario
   - Tasa de decaimiento
   - Memorias más accedidas
   - Uso de ChromaDB

4. **Optimización:** Revisar queries lentas
   ```sql
   -- Habilitar análisis de queries
   EXPLAIN ANALYZE
   SELECT * FROM memory_contexts WHERE "userId" = '...' AND ...;
   ```

## Documentación Adicional

- **Arquitectura completa:** Ver `MEMORY_FLOW_TEST_GUIDE.md`
- **Consultas SQL:** Ver `test-memory-queries.sql`
- **Script de prueba:** Ver `test-memory-flow.ts`
- **Migración:** Ver `src/migrations/add-agent-id-to-memory-contexts.sql`

## Contacto y Soporte

Si encuentras problemas:
1. Revisar logs del backend
2. Ejecutar consultas de troubleshooting en `test-memory-queries.sql`
3. Verificar que todos los servicios (PostgreSQL, Redis, ChromaDB) estén corriendo
4. Revisar las variables de entorno

---

**¡Listo para probar el sistema de memoria contextual!** 🧠🦕
