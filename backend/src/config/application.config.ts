import { registerAs } from '@nestjs/config';

export const applicationConfig = registerAs('app', () => {

  return {
    // Application settings
    name: process.env.APP_NAME || 'Nebu Mobile',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'AI-Powered IoT & Voice Control Platform',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@nebu.com',
    defaultLocale: process.env.DEFAULT_LOCALE || 'es',
    supportedLocales: process.env.SUPPORTED_LOCALES?.split(',') || ['es', 'en'],
    timezone: process.env.APP_TIMEZONE || 'America/Mexico_City',

    // API configuration
    api: {
      version: process.env.API_VERSION || 'v1',
      prefix: process.env.API_PREFIX || '/api/v1',
      documentation: {
        enabled: process.env.API_DOCS_ENABLED !== 'false',
        path: process.env.API_DOCS_PATH || '/api/docs',
        title: process.env.API_DOCS_TITLE || 'Nebu Mobile API',
        version: process.env.API_DOCS_VERSION || '1.0.0',
      },
      cors: {
        enabled: process.env.CORS_ENABLED !== 'false',
        credentials: process.env.CORS_CREDENTIALS !== 'false',
        methods: process.env.CORS_METHODS?.split(',') || [
          'GET',
          'POST',
          'PUT',
          'DELETE',
          'PATCH',
          'OPTIONS',
        ],
        headers: process.env.CORS_HEADERS?.split(',') || [
          'Accept',
          'Authorization',
          'Content-Type',
          'X-Requested-With',
        ],
      },
      rateLimiting: {
        short: {
          windowMs: parseInt(process.env.RATE_LIMIT_SHORT_WINDOW || '1000', 10),
          max: parseInt(process.env.RATE_LIMIT_SHORT_MAX || '10', 10),
        },
        medium: {
          windowMs: parseInt(process.env.RATE_LIMIT_MEDIUM_WINDOW || '60000', 10),
          max: parseInt(process.env.RATE_LIMIT_MEDIUM_MAX || '100', 10),
        },
        long: {
          windowMs: parseInt(process.env.RATE_LIMIT_LONG_WINDOW || '3600000', 10),
          max: parseInt(process.env.RATE_LIMIT_LONG_MAX || '1000', 10),
        },
      },
    },

    // Features flags (using environment variables)
    features: {
      authentication: { 
        oauthEnabled: process.env.ENABLE_OAUTH !== 'false', 
        emailVerificationRequired: true 
      },
      courses: { 
        videoStreamingEnabled: true, 
        certificatesEnabled: true 
      },
      payments: { 
        subscriptionsEnabled: true, 
        stripeEnabled: process.env.ENABLE_STRIPE !== 'false' 
      },
      community: { 
        reviewsEnabled: true, 
        commentsEnabled: true,
        chatEnabled: process.env.ENABLE_CHAT !== 'false'
      },
      notifications: { 
        emailNotificationsEnabled: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
        notificationsEnabled: process.env.ENABLE_NOTIFICATIONS !== 'false'
      },
      admin: { 
        analyticsEnabled: process.env.ENABLE_ANALYTICS !== 'false' 
      },
      uploads: { 
        localStorageEnabled: true 
      },
      monitoring: { 
        healthChecksEnabled: true 
      },
      automation: { 
        enabled: false 
      },
      security: { 
        rateLimitingEnabled: true 
      },
      websocket: {
        websocketEnabled: process.env.ENABLE_WEBSOCKET !== 'false'
      }
    },

    // Limits and constraints (hardcoded sensible defaults)
    limits: {
      users: { 
        maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '3', 10) 
      },
      courses: { 
        maxChaptersPerCourse: parseInt(process.env.MAX_CHAPTERS_PER_COURSE || '50', 10) 
      },
      payments: { 
        minPurchaseAmount: parseFloat(process.env.MIN_PURCHASE_AMOUNT || '5'), 
        maxPurchaseAmount: parseFloat(process.env.MAX_PURCHASE_AMOUNT || '10000') 
      },
      uploads: { 
        maxFileSize: process.env.MAX_FILE_SIZE || '50MB' 
      },
    },

    // Environment-specific URLs
    urls: {
      frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
      api: process.env.API_URL || 'http://localhost:3001',
      backend: process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3001',
    },

    // Environment settings
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isTest: process.env.NODE_ENV === 'test',
      port: parseInt(process.env.PORT, 10) || 3001,
    },
  };
});
