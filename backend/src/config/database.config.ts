import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => {
  // Validate required environment variables
  const requiredVars = ['DATABASE_HOST', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
  }

  return {
    type: 'postgres' as const,
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true, // Force sync for initial setup
    logging: process.env.NODE_ENV === 'development',
    ssl:
      process.env.DATABASE_SSL === 'true'
        ? {
            rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,
    autoLoadEntities: true,
    retryAttempts: 3,
    retryDelay: 3000,
    maxQueryExecutionTime: 10000, // 10 seconds
    connectTimeoutMS: 10000,
    acquireTimeoutMS: 10000,
    timeout: 10000,
  };
});
