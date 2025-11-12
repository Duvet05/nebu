/**
 * Application Constants
 *
 * Valores que NO cambian entre entornos y son parte de la identidad de la aplicación.
 * Estos valores NO deben estar en .env
 */

export const APPLICATION_CONSTANTS = {
  // Información de la aplicación
  name: 'Nebu Mobile',
  version: '1.0.0', // TODO: Leer de package.json
  description: 'AI-Powered IoT & Voice Control Platform',
  supportEmail: 'soporte@flow-telligence.com',

  // Localización
  defaultLocale: 'es',
  supportedLocales: ['es', 'en'] as const,
  timezone: 'America/Mexico_City',

  // API Configuration
  api: {
    version: 'v1',
    prefix: '/api/v1',
    documentation: {
      enabled: true,
      path: '/api/docs',
      title: 'Nebu Mobile API',
      version: '1.0.0',
    },
  },

  // CORS Configuration (valores base, pueden ser sobreescritos por env)
  cors: {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] as const,
    headers: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
    ] as const,
  },

  // Rate Limiting (valores estándar)
  rateLimiting: {
    short: {
      windowMs: 1000, // 1 segundo
      max: 10,
    },
    medium: {
      windowMs: 60000, // 1 minuto
      max: 100,
    },
    long: {
      windowMs: 3600000, // 1 hora
      max: 1000,
    },
  },

  // Limits and constraints
  limits: {
    courses: {
      maxChaptersPerCourse: 50,
    },
    uploads: {
      maxFileSize: '50MB',
    },
  },
} as const;

export type ApplicationConstants = typeof APPLICATION_CONSTANTS;
