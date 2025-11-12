import { registerAs } from '@nestjs/config';
import { REDIS_CONSTANTS } from './constants/redis.constants';

export const redisConfig = registerAs('redis', () => ({
  // Connection settings (from environment)
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,

  // Database selection (from constants)
  db: REDIS_CONSTANTS.db, // Always 0

  // Cache configuration (from constants)
  keyPrefix: REDIS_CONSTANTS.keyPrefix, // 'nebu:'
  ttl: REDIS_CONSTANTS.defaultTTL, // 300 seconds (5 minutes)

  // Performance settings (from constants)
  ...REDIS_CONSTANTS.performance,

  // Memory management (from constants)
  maxMemory: REDIS_CONSTANTS.memory.maxMemory,
  evictionPolicy: REDIS_CONSTANTS.memory.evictionPolicy,

  // Cache TTLs by type (from constants)
  cacheTTL: REDIS_CONSTANTS.cacheTTL,
}));
