#!/usr/bin/env node
/**
 * Script CLI para inicializar ChromaDB
 * 
 * Uso:
 *   npm run chromadb:seed           # Seed completo
 *   npm run chromadb:clear          # Limpiar todo
 *   npm run chromadb:stats          # Ver estadísticas
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ChromaDBSeederService } from '../search/services/chromadb-seeder.service';
import { ChromaDBService } from '../search/services/chromadb.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const seederService = app.get(ChromaDBSeederService);
  const chromaDBService = app.get(ChromaDBService);

  const command = process.argv[2] || 'seed';

  try {
    switch (command) {
      case 'seed':
        console.log('🌱 Iniciando seed de ChromaDB...\n');
        await seederService.seedAll();
        console.log('\n✅ Seed completado exitosamente!');
        break;

      case 'clear':
        console.log('⚠️  ¿Estás seguro de limpiar TODAS las colecciones?');
        console.log('   Presiona Ctrl+C para cancelar, o espera 3 segundos...\n');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await seederService.clearAll();
        console.log('\n✅ Colecciones limpiadas');
        break;

      case 'stats':
        console.log('📊 Obteniendo estadísticas de ChromaDB...\n');
        const stats = await chromaDBService.getStats();
        console.log('Colecciones:');
        console.log(`  - toy_personalities: ${stats.collections.toy_personalities} documentos`);
        console.log(`  - conversation_memories: ${stats.collections.conversation_memories} documentos`);
        console.log(`  - knowledge_base: ${stats.collections.knowledge_base} documentos`);
        console.log(`\nTotal: ${stats.total} documentos`);
        break;

      default:
        console.log('Comando no reconocido:', command);
        console.log('\nComandos disponibles:');
        console.log('  seed   - Inicializar base de conocimiento');
        console.log('  clear  - Limpiar todas las colecciones');
        console.log('  stats  - Ver estadísticas');
        process.exit(1);
    }

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
