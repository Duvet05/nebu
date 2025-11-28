import { DataSource } from 'typeorm';
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
    console.log('📦 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conectado exitosamente\n');

    // Ejecutar seeders
    console.log('🌱 Ejecutando seeders...\n');

    await seedProducts(dataSource);

    console.log('\n✅ Todos los seeders completados exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('📦 Conexión cerrada');
  }
}

runSeeders();
