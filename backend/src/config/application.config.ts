import { registerAs } from '@nestjs/config';
import { APPLICATION_CONSTANTS } from './constants/application.constants';
import { SECURITY_CONSTANTS } from './constants/security.constants';
import { PAYMENT_CONSTANTS } from './constants/payments.constants';
import { FEATURES } from './constants/features.constants';

export const applicationConfig = registerAs('app', () => {

  return {
    // Application settings (from constants, no longer configurable)
    name: APPLICATION_CONSTANTS.name,
    version: APPLICATION_CONSTANTS.version,
    description: APPLICATION_CONSTANTS.description,
    supportEmail: APPLICATION_CONSTANTS.supportEmail,
    defaultLocale: APPLICATION_CONSTANTS.defaultLocale,
    supportedLocales: APPLICATION_CONSTANTS.supportedLocales,
    timezone: APPLICATION_CONSTANTS.timezone,

    // API configuration (from constants)
    api: {
      version: APPLICATION_CONSTANTS.api.version,
      prefix: APPLICATION_CONSTANTS.api.prefix,
      documentation: APPLICATION_CONSTANTS.api.documentation,
      cors: {
        enabled: true,
        credentials: true,
        methods: APPLICATION_CONSTANTS.cors.methods,
        headers: APPLICATION_CONSTANTS.cors.headers,
      },
      rateLimiting: APPLICATION_CONSTANTS.rateLimiting,
    },

    // Features flags (from constants, no longer from env)
    features: {
      authentication: {
        oauthEnabled: FEATURES.authentication.oauth,
        emailVerificationRequired: FEATURES.authentication.emailVerificationRequired,
      },
      payments: {
        subscriptionsEnabled: FEATURES.payments.subscriptions,
        stripeEnabled: FEATURES.payments.stripe,
      },
      notifications: {
        emailNotificationsEnabled: FEATURES.notifications.email,
        notificationsEnabled: FEATURES.notifications.push,
      },
      admin: {
        analyticsEnabled: FEATURES.admin.analytics,
      },
      uploads: {
        localStorageEnabled: FEATURES.uploads.localStorage,
      },
      monitoring: {
        healthChecksEnabled: FEATURES.monitoring.healthChecks,
      },
      automation: {
        enabled: FEATURES.automation.scheduledTasks,
      },
      security: {
        rateLimitingEnabled: true,
      },
      websocket: {
        websocketEnabled: FEATURES.realtime.websocket,
      }
    },

    // Limits and constraints (from constants)
    limits: {
      users: {
        maxConcurrentSessions: SECURITY_CONSTANTS.maxConcurrentSessions,
      },
      courses: {
        maxChaptersPerCourse: APPLICATION_CONSTANTS.limits.courses.maxChaptersPerCourse,
      },
      payments: {
        minPurchaseAmount: PAYMENT_CONSTANTS.limits.minPurchaseAmount,
        maxPurchaseAmount: PAYMENT_CONSTANTS.limits.maxPurchaseAmount,
      },
      uploads: {
        maxFileSize: APPLICATION_CONSTANTS.limits.uploads.maxFileSize,
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
