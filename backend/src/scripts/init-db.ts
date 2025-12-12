import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../config/database.config';
import { Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: ['.env.local', '.env'] });

const logger = new Logger('DatabaseInit');

async function waitForDatabase(dataSource: DataSource, maxRetries = 30, retryDelay = 2000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      // Test connection
      await dataSource.query('SELECT 1');
      logger.log('✅ PostgreSQL is ready');
      return true;
    } catch (error) {
      retries++;
      logger.warn(`⏳ Waiting for PostgreSQL to be ready... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  throw new Error('❌ PostgreSQL did not become ready in time');
}

async function bootstrap() {
  logger.log('================================================');
  logger.log('🚀 Nebu Database Initialization');
  logger.log('================================================');

  const dbConfig = getDatabaseConfig();
  // Ensure we don't auto-sync/migrate in the connection itself, we want to control it
  const dataSource = new DataSource({
    ...dbConfig,
    entities: ['dist/**/*.entity.js', 'src/**/*.entity.ts'], // Support both TS (dev) and JS (prod)
    synchronize: false,
    migrationsRun: false,
  });

  try {
    // 1. Wait for DB
    await waitForDatabase(dataSource);

    // 2. Handle Schema (Migrations or Sync)
    const useMigrations = process.env.DB_USE_MIGRATIONS === 'true';
    
    if (useMigrations) {
      logger.log('🔄 [Production] Running Migrations...');
      await dataSource.runMigrations();
      logger.log('✅ Migrations completed');
    } else {
      logger.log('🔄 [Development] Synchronizing Schema...');
      await dataSource.synchronize();
      logger.log('✅ Schema synchronized');
    }

    // 3. Run Seeders
    const autoSeed = process.env.AUTO_SEED === 'true';
    if (autoSeed) {
      logger.log('🌱 Running Database Seeders...');
      try {
        // Use ts-node to run the seeder script directly
        execSync('npx ts-node -r dotenv/config src/database/seeders/index.ts', { stdio: 'inherit' });
        logger.log('✅ Database seeded successfully');
      } catch (error) {
        logger.warn('⚠️ Database seeding failed (data might already exist or error occurred)');
        // Don't swallow the error completely, let's see it if we are debugging
        if (process.env.NODE_ENV !== 'production') {
            console.error(error);
        }
      }

      logger.log('🌱 Seeding ChromaDB...');
      try {
        // Set a timeout for chromadb seeding to prevent hanging
        execSync('npm run chromadb:seed', { stdio: 'inherit', timeout: 60000 }); // 60 second timeout
        logger.log('✅ ChromaDB seeded successfully');
      } catch (error) {
        logger.warn('⚠️ ChromaDB seeding failed or timed out (this is non-critical)');
        // Don't fail the whole initialization if ChromaDB seeding fails
      }
    } else {
      logger.log('ℹ️ AUTO_SEED is not true, skipping seeders.');
    }

    logger.log('================================================');
    logger.log('✅ Initialization Completed Successfully');
    logger.log('================================================');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

bootstrap();
