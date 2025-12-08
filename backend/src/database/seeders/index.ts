import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { seedUsers } from './users.seeder';
import { seedProducts } from './product-catalog.seeder';
import { seedInventory } from './inventory.seeder';
import { seedToys } from './toys.seeder';
import { getDatabaseConfig } from '../../config/database.config';

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

  // Crear conexión a la base de datos usando configuración compartida
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false, // No sincronizar en seeders
  });

  try {
    logger.log('📦 Conectando a la base de datos...');
    await dataSource.initialize();
    logger.log('✅ Conectado exitosamente');

    // Ejecutar seeders en orden
    logger.log('🌱 Ejecutando seeders...');

    // 1. Usuarios (deben crearse primero para relaciones)
    await seedUsers(dataSource);
    
    // 2. Productos (antes de inventario y juguetes)
    await seedProducts(dataSource);
    
    // 3. Inventario
    await seedInventory(dataSource);
    
    // 4. Juguetes (requiere usuarios y productos)
    await seedToys(dataSource);

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
