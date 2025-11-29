import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { seedProducts } from './product-catalog.seeder';
import { ProductCatalog } from '../../toys/entities/product-catalog.entity';

// Cargar variables de entorno
dotenv.config({ path: ['.env.local', '.env'] });

/**
 * Script de seeding principal
 *
 * Ejecuta todos los seeders en orden.
 * Uso: npm run seed
 */
async function runSeeders() {
  const logger = new Logger('Seeders');

  // Crear conexión a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    entities: [ProductCatalog], // Importar entidades directamente
    synchronize: false, // No sincronizar en seeders
    logging: true,
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
    } : false,
  });

  try {
    logger.log('📦 Conectando a la base de datos...');
    await dataSource.initialize();
    logger.log('✅ Conectado exitosamente');

    // Ejecutar seeders
    logger.log('🌱 Ejecutando seeders...');

    await seedProducts(dataSource);

    logger.log('✅ Todos los seeders completados exitosamente');
  } catch (error) {
    logger.error('❌ Error ejecutando seeders:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    logger.log('📦 Conexión cerrada');
  }
}

runSeeders();
