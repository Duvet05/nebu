/**
 * Redis Constants
 *
 * Configuración base de Redis que NO cambia entre entornos.
 * Los valores específicos (host, port, password) vienen del .env
 */

export const REDIS_CONSTANTS = {
  // Database selection
  db: 0, // Siempre usar DB 0 (Redis default)

  // Key prefix para namespace
  keyPrefix: 'nebu:',

  // TTL por defecto (5 minutos)
  // Nota: Cada cache debería definir su propio TTL según su caso de uso
  defaultTTL: 300, // 5 minutos en segundos

  // Performance settings
  performance: {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    connectTimeout: 10000,
    commandTimeout: 5000,
    lazyConnect: true,
    keepAlive: 30000,
  },

  // Memory management
  memory: {
    maxMemory: '256mb',
    evictionPolicy: 'allkeys-lru' as const, // Least Recently Used
  },

  // Cache TTLs por tipo de dato (en segundos)
  cacheTTL: {
    // Sesiones de usuario - 30 minutos
    session: 1800,

    // Datos de usuario - 1 hora
    user: 3600,

    // Configuración de app - 24 horas
    config: 86400,

    // Resultados de búsqueda - 5 minutos
    search: 300,

    // Tokens temporales - 15 minutos
    token: 900,

    // Rate limiting - 1 minuto
    rateLimit: 60,

    // Analytics temporales - 10 minutos
    analytics: 600,
  },

  // Key patterns (para facilitar queries)
  keyPatterns: {
    session: 'session:*',
    user: 'user:*',
    token: 'token:*',
    rateLimit: 'rate:*',
    cache: 'cache:*',
  },
} as const;

export type RedisConstants = typeof REDIS_CONSTANTS;

/**
 * Helper para generar keys con prefix
 */
export function generateRedisKey(
  type: keyof typeof REDIS_CONSTANTS.cacheTTL,
  id: string | number,
): string {
  return `${REDIS_CONSTANTS.keyPrefix}${type}:${id}`;
}

/**
 * Helper para obtener TTL por tipo
 */
export function getTTL(type: keyof typeof REDIS_CONSTANTS.cacheTTL): number {
  return REDIS_CONSTANTS.cacheTTL[type];
}
