import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { getDatabaseConfig } from './src/config/database.config';

config({ path: ['.env.local', '.env'] });

/**
 * TypeORM CLI Configuration
 * Usa la misma configuración compartida que el resto de la aplicación
 */
// Para CLI/migraciones: usa solo JS compilado
export default new DataSource({
  ...getDatabaseConfig(),
  entities: ['dist/**/*.entity.js'],
  migrations: [],
  migrationsTableName: 'migrations_history',
});
