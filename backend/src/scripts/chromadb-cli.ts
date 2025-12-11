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
      case 'seed': {
        // eslint-disable-next-line no-console
        console.log('🌱 Iniciando seed de ChromaDB...\n');
        await seederService.seedAll();
        // eslint-disable-next-line no-console
        console.log('\n✅ Seed completado exitosamente!');
        break;
      }

      case 'clear': {
        // eslint-disable-next-line no-console
        console.log('⚠️  ¿Estás seguro de limpiar TODAS las colecciones?');
        // eslint-disable-next-line no-console
        console.log('   Presiona Ctrl+C para cancelar, o espera 3 segundos...\n');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await seederService.clearAll();
        // eslint-disable-next-line no-console
        console.log('\n✅ Colecciones limpiadas');
        break;
      }

      case 'stats': {
        // eslint-disable-next-line no-console
        console.log('📊 Obteniendo estadísticas de ChromaDB...\n');
        const stats = await chromaDBService.getStats();
        // eslint-disable-next-line no-console
        console.log('Colecciones:');
        // eslint-disable-next-line no-console
        console.log(`  - toy_personalities: ${stats.collections.toy_personalities} documentos`);
        // eslint-disable-next-line no-console
        console.log(`  - conversation_memories: ${stats.collections.conversation_memories} documentos`);
        // eslint-disable-next-line no-console
        console.log(`  - knowledge_base: ${stats.collections.knowledge_base} documentos`);
        // eslint-disable-next-line no-console
        console.log(`\nTotal: ${stats.total} documentos`);
        break;
      }

      default: {
        // eslint-disable-next-line no-console
        console.log('Comando no reconocido:', command);
        // eslint-disable-next-line no-console
        console.log('\nComandos disponibles:');
        // eslint-disable-next-line no-console
        console.log('  seed   - Inicializar base de conocimiento');
        // eslint-disable-next-line no-console
        console.log('  clear  - Limpiar todas las colecciones');
        // eslint-disable-next-line no-console
        console.log('  stats  - Ver estadísticas');
        process.exit(1);
      }
    }

    await app.close();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('\n❌ Error:', error.message);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
