import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

/**
 * Configuración compartida de la base de datos
 * Usada por:
 * - NestJS TypeORM (app.module.ts)
 * - Seeders (database/seeders/index.ts)
 * - TypeORM CLI (ormconfig.ts)
 */
export function getDatabaseConfig(): DataSourceOptions {
  // ONE master flag controls the database mode
  // DB_USE_MIGRATIONS=false (default) → synchronize mode (development)
  // DB_USE_MIGRATIONS=true → migrations mode (production)
  const useMigrations = process.env.DB_USE_MIGRATIONS === 'true';

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    // entities solo para seeders/scripts, no para runtime
    synchronize: !useMigrations,
    migrationsRun: useMigrations,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
    } : false,
  };
}

/**
 * NestJS Config registration
 */
export const databaseConfig = registerAs('database', () => {
  // Validate required environment variables
  const requiredVars = ['DATABASE_HOST', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
  }

  return {
    ...getDatabaseConfig(),
    // entities no se incluye aquí, solo autoLoadEntities
    autoLoadEntities: true,
    retryAttempts: 3,
    retryDelay: 3000,
    maxQueryExecutionTime: 10000,
    connectTimeoutMS: 10000,
    acquireTimeoutMS: 10000,
    timeout: 10000,
  };
});
