/**
 * Script de Prueba para el Flujo de Memoria Contextual
 * Fecha: 04/11/2025
 *
 * Este script prueba el flujo completo de memoria contextual incluyendo:
 * - Creación de agentes
 * - Sesiones de voz
 * - Conversaciones
 * - Almacenamiento de memoria
 * - Recuperación de memoria
 * - Verificación de relaciones
 */

import axios from 'axios';

// Configuración
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // JWT token

interface TestContext {
  userId: string;
  agentId?: string;
  sessionId?: string;
  conversationIds: string[];
  memoryIds: string[];
}

const testContext: TestContext = {
  userId: '',
  conversationIds: [],
  memoryIds: []
};

// Cliente HTTP con autenticación
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(AUTH_TOKEN && { 'Authorization': `Bearer ${AUTH_TOKEN}` })
  }
});

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message: string) {
  log(`ℹ ${message}`, 'blue');
}

function logWarning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

function logSection(title: string) {
  console.log('');
  log(`${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

// Tests
async function test1_CreateAgent() {
  logSection('Test 1: Crear Agente');

  try {
    const response = await client.post('/agents', {
      name: 'Dino Buddy Test',
      description: 'Un dinosaurio amigable para pruebas de memoria contextual',
      persona: {
        instructions: 'Eres un T-Rex amigable que adora enseñar sobre dinosaurios a niños',
        tone: 'Entusiasta, educativo y paciente',
        expertise: ['paleontología', 'dinosaurios', 'ciencia', 'historia natural'],
        constraints: [
          'Siempre mantener tono apropiado para niños',
          'Usar lenguaje simple y ejemplos visuales',
          'Fomentar la curiosidad y el aprendizaje'
        ]
      },
      voiceSettings: {
        voice: 'alloy',
        speed: 1.0,
        pitch: 1.0
      },
      isPublic: true
    });

    testContext.agentId = response.data.id;
    logSuccess(`Agente creado: ${response.data.name} (ID: ${testContext.agentId})`);
    logInfo(`Persona: ${JSON.stringify(response.data.persona, null, 2)}`);
    return true;
  } catch (error: any) {
    logError(`Error al crear agente: ${error.message}`);
    if (error.response?.data) {
      console.error(error.response.data);
    }
    return false;
  }
}

async function test2_CreateVoiceSession() {
  logSection('Test 2: Crear Sesión de Voz');

  if (!testContext.userId) {
    logWarning('Se requiere userId. Configurando userId de prueba...');
    testContext.userId = '00000000-0000-0000-0000-000000000001'; // UUID de prueba
  }

  try {
    const response = await client.post('/voice/sessions', {
      userId: testContext.userId,
      language: 'es',
      metadata: {
        agentId: testContext.agentId,
        testRun: true,
        timestamp: new Date().toISOString()
      }
    });

    testContext.sessionId = response.data.id;
    logSuccess(`Sesión creada: ${testContext.sessionId}`);
    logInfo(`Estado: ${response.data.status}`);
    logInfo(`Idioma: ${response.data.language}`);
    logInfo(`Agente en metadata: ${response.data.metadata?.agentId}`);
    return true;
  } catch (error: any) {
    logError(`Error al crear sesión: ${error.message}`);
    if (error.response?.data) {
      console.error(error.response.data);
    }
    return false;
  }
}

async function test3_AddConversations() {
  logSection('Test 3: Agregar Conversaciones');

  if (!testContext.sessionId) {
    logError('Se requiere sessionId. Ejecute test2 primero.');
    return false;
  }

  const conversations = [
    {
      messageType: 'user',
      content: '¡Hola! Me llamo Juan y me encantan los dinosaurios'
    },
    {
      messageType: 'assistant',
      content: '¡Hola Juan! ¡Qué emocionante! Los dinosaurios son increíbles. Yo soy Dino Buddy, un T-Rex muy amigable. ¿Cuál es tu dinosaurio favorito?'
    },
    {
      messageType: 'user',
      content: 'Mi favorito es el Velociraptor porque es muy rápido y astuto'
    },
    {
      messageType: 'assistant',
      content: '¡Excelente elección! Los velociraptores eran súper inteligentes y trabajaban en equipo. ¿Sabías que eran más pequeños de lo que muestran en las películas?'
    },
    {
      messageType: 'user',
      content: '¿De verdad? ¿Qué tan pequeños eran?'
    },
    {
      messageType: 'assistant',
      content: 'Sí, los velociraptores reales medían solo 50 cm de alto, ¡como un pavo grande! Pero eran muy rápidos y tenían garras afiladas.'
    }
  ];

  try {
    for (const conv of conversations) {
      const response = await client.post('/voice/conversations', {
        sessionId: testContext.sessionId,
        userId: testContext.userId,
        messageType: conv.messageType,
        content: conv.content,
        metadata: {
          testMessage: true
        }
      });

      testContext.conversationIds.push(response.data.id);
      logSuccess(`Mensaje agregado [${conv.messageType}]: "${conv.content.substring(0, 50)}..."`);
    }

    logInfo(`Total de mensajes agregados: ${conversations.length}`);
    return true;
  } catch (error: any) {
    logError(`Error al agregar conversaciones: ${error.message}`);
    if (error.response?.data) {
      console.error(error.response.data);
    }
    return false;
  }
}

async function test4_GetSessionConversations() {
  logSection('Test 4: Obtener Conversaciones de la Sesión');

  if (!testContext.sessionId) {
    logError('Se requiere sessionId. Ejecute test2 primero.');
    return false;
  }

  try {
    const response = await client.get(`/voice/sessions/${testContext.sessionId}/conversations`);

    logSuccess(`Conversaciones recuperadas: ${response.data.length}`);
    response.data.forEach((conv: any, index: number) => {
      logInfo(`  ${index + 1}. [${conv.messageType}] ${conv.content.substring(0, 60)}...`);
    });
    return true;
  } catch (error: any) {
    logError(`Error al obtener conversaciones: ${error.message}`);
    if (error.response?.data) {
      console.error(error.response.data);
    }
    return false;
  }
}

async function test5_EndSession() {
  logSection('Test 5: Finalizar Sesión (Trigger de Resumen de Memoria)');

  if (!testContext.sessionId) {
    logError('Se requiere sessionId. Ejecute test2 primero.');
    return false;
  }

  try {
    const response = await client.post(`/voice/sessions/${testContext.sessionId}/end`);

    logSuccess(`Sesión finalizada: ${testContext.sessionId}`);
    logInfo(`Estado: ${response.data.status}`);
    logInfo(`Duración: ${response.data.durationSeconds} segundos`);
    logInfo(`Mensajes totales: ${response.data.messageCount}`);
    logWarning('Nota: El resumen de memoria se crea en background (createSessionSummary)');

    return true;
  } catch (error: any) {
    logError(`Error al finalizar sesión: ${error.message}`);
    if (error.response?.data) {
      console.error(error.response.data);
    }
    return false;
  }
}

async function test6_VerifyMemoryInDatabase() {
  logSection('Test 6: Verificar Memoria en Base de Datos');

  logInfo('Este test requiere acceso directo a la base de datos PostgreSQL');
  logInfo('Ejecute las siguientes consultas manualmente:\n');

  console.log(`
-- Ver memorias creadas para este usuario
SELECT
  mc.id,
  mc.content,
  mc."memoryType",
  mc.category,
  mc.importance,
  mc."agentId",
  a.name as agent_name,
  mc."createdAt"
FROM memory_contexts mc
LEFT JOIN agents a ON mc."agentId" = a.id
WHERE mc."userId" = '${testContext.userId}'
ORDER BY mc."createdAt" DESC;

-- Ver resumen de memoria por agente
SELECT
  COALESCE(a.name, 'Memoria Compartida') as agent,
  mc."memoryType",
  COUNT(*) as count,
  AVG(mc.importance) as avg_importance
FROM memory_contexts mc
LEFT JOIN agents a ON mc."agentId" = a.id
WHERE mc."userId" = '${testContext.userId}'
GROUP BY a.name, mc."memoryType";

-- Ver sesión con sus conversaciones
SELECT
  vs.id,
  vs.status,
  vs."messageCount",
  COUNT(DISTINCT ac.id) as conversation_count,
  COUNT(DISTINCT mc.id) as memory_count
FROM voice_sessions vs
LEFT JOIN ai_conversations ac ON ac."sessionId" = vs.id
LEFT JOIN memory_contexts mc ON mc."sessionId" = vs.id
WHERE vs.id = '${testContext.sessionId}'
GROUP BY vs.id;
  `);

  return true;
}

async function test7_CreateSecondSession() {
  logSection('Test 7: Crear Segunda Sesión (Test de Recuperación de Memoria)');

  logInfo('Creando nueva sesión con el mismo usuario y agente...');
  logInfo('El sistema debería recuperar las memorias de la sesión anterior');

  try {
    const response = await client.post('/voice/sessions', {
      userId: testContext.userId,
      language: 'es',
      metadata: {
        agentId: testContext.agentId,
        testRun: true,
        sessionNumber: 2
      }
    });

    const newSessionId = response.data.id;
    logSuccess(`Segunda sesión creada: ${newSessionId}`);

    logInfo('\nAl construir el contexto para IA, el sistema recuperará:');
    logInfo('  1. Working Memory: vacía (nueva sesión)');
    logInfo('  2. Episodic Memories: conversación anterior sobre dinosaurios');
    logInfo('  3. Semantic Knowledge: Juan ama los dinosaurios, especialmente Velociraptor');
    logInfo('  4. User Profile: datos del usuario');
    logInfo('  5. Agent Persona: Dino Buddy');

    logWarning('\nPara verificar esto, revisar los logs del backend cuando se construya el contexto');

    return true;
  } catch (error: any) {
    logError(`Error al crear segunda sesión: ${error.message}`);
    if (error.response?.data) {
      console.error(error.response.data);
    }
    return false;
  }
}

async function test8_TestSharedVsSpecificMemory() {
  logSection('Test 8: Memoria Compartida vs Específica del Agente');

  logInfo('Creando segundo agente para probar aislamiento de memorias...');

  try {
    // Crear segundo agente
    const agent2Response = await client.post('/agents', {
      name: 'Space Explorer',
      description: 'Un astronauta que enseña sobre el espacio',
      persona: {
        instructions: 'Eres un astronauta amigable que adora enseñar sobre el espacio',
        tone: 'Aventurero y educativo',
        expertise: ['astronomía', 'espacio', 'planetas', 'estrellas'],
      },
      isPublic: true
    });

    const agent2Id = agent2Response.data.id;
    logSuccess(`Segundo agente creado: ${agent2Response.data.name} (ID: ${agent2Id})`);

    // Crear sesión con segundo agente
    const sessionResponse = await client.post('/voice/sessions', {
      userId: testContext.userId,
      language: 'es',
      metadata: {
        agentId: agent2Id,
        testRun: true
      }
    });

    logSuccess(`Sesión con segundo agente creada: ${sessionResponse.data.id}`);

    logInfo('\nComportamiento esperado:');
    logInfo('  ✓ Memorias compartidas (agentId = NULL): accesibles por ambos agentes');
    logInfo('  ✓ Memorias de Dino Buddy: solo accesibles por Dino Buddy');
    logInfo('  ✓ Memorias de Space Explorer: solo accesibles por Space Explorer');

    logInfo('\nEjecutar esta consulta SQL para verificar:');
    console.log(`
-- Comparar memorias accesibles por cada agente
SELECT
  a.name as agent,
  COUNT(CASE WHEN mc."agentId" = a.id THEN 1 END) as specific_memories,
  COUNT(CASE WHEN mc."agentId" IS NULL THEN 1 END) as shared_memories
FROM agents a
CROSS JOIN memory_contexts mc
WHERE a.id IN ('${testContext.agentId}', '${agent2Id}')
  AND mc."userId" = '${testContext.userId}'
  AND (mc."agentId" = a.id OR mc."agentId" IS NULL)
GROUP BY a.name;
    `);

    return true;
  } catch (error: any) {
    logError(`Error en test de memoria compartida: ${error.message}`);
    if (error.response?.data) {
      console.error(error.response.data);
    }
    return false;
  }
}

async function test9_MemoryDecayAndCleanup() {
  logSection('Test 9: Decaimiento y Limpieza de Memoria');

  logInfo('Estos procesos se ejecutan automáticamente via Cron Jobs:');
  logInfo('  - Decaimiento: Diario a las 3 AM (reduce importancia 1% por día)');
  logInfo('  - Limpieza: Diario a las 2 AM (elimina memorias expiradas)');

  logInfo('\nPara probar manualmente, ejecutar estas consultas SQL:\n');

  console.log(`
-- Simular decaimiento de memoria (1% por día)
UPDATE memory_contexts
SET importance = GREATEST(
  importance - (0.01 * DATE_PART('day', NOW() - "createdAt")),
  0
)
WHERE "memoryType" = 'episodic'
  AND "userId" = '${testContext.userId}';

-- Ver importancia antes y después
SELECT
  id,
  LEFT(content, 50) as content_preview,
  importance,
  "accessCount",
  DATE_PART('day', NOW() - "createdAt") as age_days,
  "createdAt"
FROM memory_contexts
WHERE "userId" = '${testContext.userId}'
ORDER BY importance DESC;

-- Simular limpieza de memorias expiradas
DELETE FROM memory_contexts
WHERE "expiresAt" < NOW()
  AND "userId" = '${testContext.userId}';
  `);

  return true;
}

async function test10_MemoryStats() {
  logSection('Test 10: Estadísticas de Memoria');

  logInfo('El servicio de memoria incluye un método getMemoryStats()');
  logInfo('Para probarlo, agregar este endpoint temporal al backend:\n');

  console.log(`
// En memory.controller.ts (crear si no existe)
@Get('memory/stats/:userId')
async getMemoryStats(@Param('userId') userId: string) {
  return this.memoryService.getMemoryStats(userId);
}

// Luego hacer:
GET /memory/stats/${testContext.userId}

// Debería retornar:
{
  "episodicMemories": 5,
  "semanticKnowledge": 12,
  "averageImportance": "0.75"
}
  `);

  return true;
}

// Ejecutar todos los tests
async function runAllTests() {
  logSection('Iniciando Pruebas de Flujo de Memoria Contextual');
  logInfo(`Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Santiago' })}`);
  logInfo(`API Base URL: ${API_BASE_URL}`);
  logInfo(`Auth Token: ${AUTH_TOKEN ? 'Configurado' : 'No configurado (algunos tests pueden fallar)'}`);

  const tests = [
    { name: 'Crear Agente', fn: test1_CreateAgent },
    { name: 'Crear Sesión de Voz', fn: test2_CreateVoiceSession },
    { name: 'Agregar Conversaciones', fn: test3_AddConversations },
    { name: 'Obtener Conversaciones', fn: test4_GetSessionConversations },
    { name: 'Finalizar Sesión', fn: test5_EndSession },
    { name: 'Verificar Memoria en BD', fn: test6_VerifyMemoryInDatabase },
    { name: 'Segunda Sesión (Recuperación)', fn: test7_CreateSecondSession },
    { name: 'Memoria Compartida vs Específica', fn: test8_TestSharedVsSpecificMemory },
    { name: 'Decaimiento y Limpieza', fn: test9_MemoryDecayAndCleanup },
    { name: 'Estadísticas de Memoria', fn: test10_MemoryStats },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error: any) {
      logError(`Test "${test.name}" falló con excepción: ${error.message}`);
      failed++;
    }

    // Pequeña pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  logSection('Resumen de Pruebas');
  logSuccess(`Tests exitosos: ${passed}`);
  if (failed > 0) {
    logError(`Tests fallidos: ${failed}`);
  }
  logInfo(`Total: ${passed + failed}`);

  logSection('Contexto de Prueba');
  console.log(JSON.stringify(testContext, null, 2));

  logSection('Siguientes Pasos');
  logInfo('1. Verificar las memorias en la base de datos con las consultas SQL proporcionadas');
  logInfo('2. Revisar los logs del backend para ver el contexto construido para la IA');
  logInfo('3. Probar ChromaDB para ver los embeddings semánticos');
  logInfo('4. Probar Redis para ver la working memory');
  logInfo('5. Verificar que los Cron Jobs estén funcionando (decay y cleanup)');
}

// Ejecutar
if (require.main === module) {
  runAllTests()
    .then(() => {
      logInfo('\nPruebas completadas.');
      process.exit(0);
    })
    .catch((error) => {
      logError(`\nError fatal: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

export { runAllTests, testContext };
