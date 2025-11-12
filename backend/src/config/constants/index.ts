/**
 * Constants Index
 *
 * Re-export all constants for easy importing
 */

export * from './application.constants';
export * from './security.constants';
export * from './payments.constants';
export * from './features.constants';
export * from './redis.constants';

/**
 * Resumen de constantes:
 *
 * - APPLICATION_CONSTANTS: Información de la app, API config, límites
 * - SECURITY_CONSTANTS: Configuración de seguridad (bcrypt, timeouts, etc)
 * - PAYMENT_CONSTANTS: Reglas de negocio para pagos
 * - FEATURES: Feature flags
 * - REDIS_CONSTANTS: Configuración base de Redis
 *
 * Estas constantes reemplazan variables de .env que no deberían ser configurables.
 */
