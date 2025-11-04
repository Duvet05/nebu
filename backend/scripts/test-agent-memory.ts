/**
 * Script de prueba para memoria contextual por agente
 *
 * Ejecutar con: npx ts-node scripts/test-agent-memory.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MemoryService } from '../src/memory/services/memory.service';
import { AgentsService } from '../src/agents/agents.service';
import { MemoryCategory } from '../src/memory/entities/memory-context.entity';

async function bootstrap() {
  console.log('🚀 Iniciando test de memoria contextual por agente...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const memoryService = app.get(MemoryService);
  const agentsService = app.get(AgentsService);

  // ============================================
  // 1. Crear agentes de prueba
  // ============================================
  console.log('📝 Paso 1: Creando agentes de prueba...');

  const mathTutor = await agentsService.create({
    name: 'Tutor de Matemáticas',
    description: 'Agente especializado en enseñar matemáticas a niños',
    persona: {
      instructions: 'Eres un tutor de matemáticas paciente y creativo. Usa ejemplos del mundo real para enseñar.',
      tone: 'educativo y alentador',
      expertise: ['matemáticas', 'lógica', 'resolución de problemas'],
      constraints: ['No dar respuestas directas, guiar al niño'],
    },
    isPublic: true,
  });
  console.log(`✅ Agente creado: ${mathTutor.name} (${mathTutor.id})`);

  const storyteller = await agentsService.create({
    name: 'Contador de Cuentos',
    description: 'Agente que narra historias interactivas',
    persona: {
      instructions: 'Eres un narrador de cuentos mágico. Crea historias inmersivas y educativas.',
      tone: 'mágico y emocionante',
      expertise: ['literatura', 'creatividad', 'narrativa'],
      constraints: ['Historias apropiadas para niños', 'Evitar contenido violento'],
    },
    isPublic: true,
  });
  console.log(`✅ Agente creado: ${storyteller.name} (${storyteller.id})\n`);

  // ============================================
  // 2. Crear memorias de prueba
  // ============================================
  const testUserId = '00000000-0000-0000-0000-000000000001';
  const testSessionId = '00000000-0000-0000-0000-000000000002';

  console.log('📝 Paso 2: Creando memorias de prueba...');

  // Memoria compartida (sin agentId)
  await memoryService.storeEpisodicMemory(
    testUserId,
    testSessionId,
    'El niño tiene un perro llamado Max y le gusta jugar con él en el parque',
    {
      category: MemoryCategory.FAMILY,
      topics: ['mascota', 'familia'],
      entities: ['Max', 'perro'],
    }
  );
  console.log('✅ Memoria compartida: Info sobre mascota');

  // Memorias del tutor de matemáticas
  await memoryService.storeEpisodicMemory(
    testUserId,
    testSessionId,
    'El niño aprendió la tabla del 5. Mostró entusiasmo al resolver 5x7=35',
    {
      category: MemoryCategory.LEARNING,
      topics: ['matemáticas', 'multiplicación', 'tabla del 5'],
      emotions: ['excited', 'proud'],
    },
    mathTutor.id // <-- Específica del tutor
  );
  console.log('✅ Memoria del tutor: Tabla del 5');

  await memoryService.storeEpisodicMemory(
    testUserId,
    testSessionId,
    'El niño tuvo dificultad con fracciones, especialmente 1/2 vs 1/4',
    {
      category: MemoryCategory.LEARNING,
      topics: ['matemáticas', 'fracciones'],
      emotions: ['confused', 'frustrated'],
    },
    mathTutor.id
  );
  console.log('✅ Memoria del tutor: Dificultad con fracciones');

  // Memorias del contador de cuentos
  await memoryService.storeEpisodicMemory(
    testUserId,
    testSessionId,
    'Al niño le encantó la historia sobre dinosaurios. Pidió más historias de T-Rex',
    {
      category: MemoryCategory.INTEREST,
      topics: ['dinosaurios', 'cuentos', 'T-Rex'],
      emotions: ['excited', 'curious'],
    },
    storyteller.id // <-- Específica del contador
  );
  console.log('✅ Memoria del contador: Historia de dinosaurios');

  await memoryService.storeEpisodicMemory(
    testUserId,
    testSessionId,
    'El niño creó su propio personaje: un dragón llamado Fuego que es amigo de los niños',
    {
      category: MemoryCategory.INTEREST,
      topics: ['creatividad', 'dragones', 'personajes'],
      entities: ['Fuego', 'dragón'],
    },
    storyteller.id
  );
  console.log('✅ Memoria del contador: Personaje creado\n');

  // ============================================
  // 3. Probar recuperación de memorias
  // ============================================
  console.log('📝 Paso 3: Probando recuperación de memorias...\n');

  // Test 1: Memorias del tutor de matemáticas
  console.log('🔍 Test 1: Buscando memorias para el Tutor de Matemáticas');
  const mathMemories = await memoryService.retrieveRelevantMemories(
    testUserId,
    'matemáticas multiplicación',
    10,
    mathTutor.id
  );
  console.log(`📊 Encontradas ${mathMemories.length} memorias:`);
  mathMemories.forEach((mem, idx) => {
    const scope = mem.agentId ? 'Específica' : 'Compartida';
    console.log(`   ${idx + 1}. [${scope}] ${mem.content.substring(0, 60)}...`);
  });
  console.log('');

  // Test 2: Memorias del contador de cuentos
  console.log('🔍 Test 2: Buscando memorias para el Contador de Cuentos');
  const storyMemories = await memoryService.retrieveRelevantMemories(
    testUserId,
    'historias dinosaurios',
    10,
    storyteller.id
  );
  console.log(`📊 Encontradas ${storyMemories.length} memorias:`);
  storyMemories.forEach((mem, idx) => {
    const scope = mem.agentId ? 'Específica' : 'Compartida';
    console.log(`   ${idx + 1}. [${scope}] ${mem.content.substring(0, 60)}...`);
  });
  console.log('');

  // ============================================
  // 4. Probar construcción de contexto
  // ============================================
  console.log('📝 Paso 4: Probando construcción de contexto...\n');

  console.log('🤖 Contexto para Tutor de Matemáticas:');
  console.log('─'.repeat(60));
  const mathContext = await memoryService.buildContextForAI(
    testUserId,
    testSessionId,
    '¿Me ayudas con la tabla del 7?',
    mathTutor.id
  );
  console.log(mathContext);
  console.log('─'.repeat(60));
  console.log('');

  console.log('🤖 Contexto para Contador de Cuentos:');
  console.log('─'.repeat(60));
  const storyContext = await memoryService.buildContextForAI(
    testUserId,
    testSessionId,
    'Cuéntame una historia de dragones',
    storyteller.id
  );
  console.log(storyContext);
  console.log('─'.repeat(60));
  console.log('');

  // ============================================
  // 5. Verificar aislamiento de memorias
  // ============================================
  console.log('📝 Paso 5: Verificando aislamiento de memorias...\n');

  console.log('✅ Verificaciones:');
  const mathHasOwnMemories = mathMemories.some(m => m.agentId === mathTutor.id);
  const mathHasSharedMemories = mathMemories.some(m => m.agentId === null);
  const mathHasStorytellerMemories = mathMemories.some(m => m.agentId === storyteller.id);

  console.log(`   - Tutor tiene sus propias memorias: ${mathHasOwnMemories ? '✅' : '❌'}`);
  console.log(`   - Tutor accede a memorias compartidas: ${mathHasSharedMemories ? '✅' : '❌'}`);
  console.log(`   - Tutor NO accede a memorias del contador: ${!mathHasStorytellerMemories ? '✅' : '❌'}`);

  const storyHasOwnMemories = storyMemories.some(m => m.agentId === storyteller.id);
  const storyHasSharedMemories = storyMemories.some(m => m.agentId === null);
  const storyHasMathMemories = storyMemories.some(m => m.agentId === mathTutor.id);

  console.log(`   - Contador tiene sus propias memorias: ${storyHasOwnMemories ? '✅' : '❌'}`);
  console.log(`   - Contador accede a memorias compartidas: ${storyHasSharedMemories ? '✅' : '❌'}`);
  console.log(`   - Contador NO accede a memorias del tutor: ${!storyHasMathMemories ? '✅' : '❌'}`);

  // ============================================
  // 6. Estadísticas
  // ============================================
  console.log('\n📊 Estadísticas finales:');
  const stats = await memoryService.getMemoryStats(testUserId);
  console.log(`   - Total memorias episódicas: ${stats.episodicMemories}`);
  console.log(`   - Conocimiento semántico: ${stats.semanticKnowledge}`);
  console.log(`   - Importancia promedio: ${stats.averageImportance}`);

  console.log('\n✨ Test completado exitosamente!');
  console.log('\n💡 Nota: Recuerda limpiar los datos de prueba si es necesario.');

  await app.close();
}

bootstrap().catch((error) => {
  console.error('❌ Error en el test:', error);
  process.exit(1);
});
