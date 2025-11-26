import { DataSource } from 'typeorm';
import { AddDeviceIdToIotDevices1732582800000 } from '../src/migrations/1732582800000-AddDeviceIdToIotDevices';

/**
 * Script para ejecutar la migración que agrega deviceId a iot_devices
 * 
 * Uso:
 *   npm run migration:run
 */

async function runMigration() {
  // Crear DataSource con configuración de producción o desarrollo
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'nebu_user',
    password: process.env.DB_PASSWORD || 'nebu_pass',
    database: process.env.DB_DATABASE || 'nebu_db',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
    synchronize: false, // NUNCA true en producción
  });

  try {
    console.log('🔄 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conexión establecida');

    console.log('🔄 Ejecutando migración: AddDeviceIdToIotDevices...');
    const migration = new AddDeviceIdToIotDevices1732582800000();
    await migration.up(dataSource.createQueryRunner());
    console.log('✅ Migración ejecutada exitosamente');

    console.log('\n📋 Resumen de cambios:');
    console.log('  • Columna "macAddress" ahora es NULLABLE');
    console.log('  • Nueva columna "deviceId" (VARCHAR(64), NULLABLE, UNIQUE)');
    console.log('  • Nuevo índice en "deviceId"');
    console.log('\n✅ Base de datos actualizada correctamente');

  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runMigration();
