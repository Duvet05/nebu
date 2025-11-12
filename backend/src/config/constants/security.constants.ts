/**
 * Security Constants
 *
 * Valores de seguridad estándar que NO deben cambiar sin revisión de código.
 * Estos valores NO deben estar en .env para prevenir configuraciones inseguras.
 */

export const SECURITY_CONSTANTS = {
  // Password Hashing
  bcryptRounds: 12,

  // Login & Account Security
  maxLoginAttempts: 5,
  lockoutDuration: '15m', // 15 minutos

  // Session Configuration
  sessionTimeout: '30m', // 30 minutos
  maxConcurrentSessions: 3,

  // Token Expiration Times
  tokens: {
    // JWT tokens - corto para seguridad
    jwt: '15m', // 15 minutos (más seguro que 24h)

    // Refresh tokens - largo para UX
    refresh: '7d', // 7 días

    // Password reset - tiempo limitado
    passwordReset: '1h', // 1 hora

    // Email verification - tiempo generoso
    emailVerification: '24h', // 24 horas
  },

  // CORS & Headers
  security: {
    frameDeny: true,
    contentTypeNosniff: true,
    xssProtection: true,
  },
} as const;

export type SecurityConstants = typeof SECURITY_CONSTANTS;

/**
 * Helper para convertir duraciones a milisegundos
 */
export function parseDuration(duration: string): number {
  const units: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = duration.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const [, value, unit] = match;
  return parseInt(value, 10) * units[unit];
}
