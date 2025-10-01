import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  // Connection settings
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),

  // Cache configuration
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'nebu:',
  ttl: parseInt(process.env.REDIS_TTL || '300', 10), // 5 minutes default

  // Performance settings
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  connectTimeout: 10000,
  commandTimeout: 5000,
  lazyConnect: true,
  keepAlive: 30000,

  // Memory management
  maxMemory: process.env.REDIS_MAX_MEMORY || '256mb',
  evictionPolicy: process.env.REDIS_EVICTION_POLICY || 'allkeys-lru',
}));
