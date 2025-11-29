/**
 * Feature Flags
 *
 * Control de features habilitadas en la aplicación.
 * En un futuro, esto debería migrar a un sistema de feature flags
 * como LaunchDarkly, Unleash, o similar para control dinámico.
 *
 * Por ahora, estas son constantes hardcodeadas que requieren deploy
 * para ser modificadas.
 */

export const FEATURES = {
  // Authentication & Security
  authentication: {
    oauth: false, // TODO: Habilitar cuando OAuth esté implementado
    emailVerificationRequired: true,
    twoFactorAuth: false, // TODO: Implementar 2FA
  },

  // Payments & Subscriptions
  payments: {
    subscriptions: true,
    culqi: true, // Culqi para Perú
    stripe: false, // TODO: Integrar Stripe
    paypal: false, // TODO: Integrar PayPal
  },

  // Notifications
  notifications: {
    email: true,
    push: true,
    sms: false, // TODO: Integrar SMS
    inApp: true,
  },

  // Analytics & Monitoring
  admin: {
    analytics: true,
    userTracking: true,
    errorTracking: true,
  },

  // Storage & Uploads
  uploads: {
    localStorage: true,
    cloudStorage: false, // TODO: Integrar S3/Cloudinary
    videoProcessing: false, // TODO: Implementar encoding
  },

  // Real-time Features
  realtime: {
    websocket: true,
    livekit: true, // Audio/Video
    presence: true, // Online/Offline status
  },

  // Health & Monitoring
  monitoring: {
    healthChecks: true,
    metrics: true,
    logging: true,
  },

  // Automation
  automation: {
    emailAutomation: false, // TODO: Implementar workflows
    scheduledTasks: true,
  },

  // AI & Intelligence
  ai: {
    contextualMemory: true,
    embeddings: true,
    chatbot: true,
  },
} as const;

export type Features = typeof FEATURES;

/**
 * Helper para verificar si una feature está habilitada
 */
export function isFeatureEnabled(
  category: keyof Features,
  feature: string,
): boolean {
  const categoryFeatures = FEATURES[category] as Record<string, boolean>;
  return categoryFeatures[feature] ?? false;
}

/**
 * Obtener todas las features habilitadas
 */
export function getEnabledFeatures(): string[] {
  const enabled: string[] = [];

  Object.entries(FEATURES).forEach(([category, features]) => {
    Object.entries(features).forEach(([feature, isEnabled]) => {
      if (isEnabled) {
        enabled.push(`${category}.${feature}`);
      }
    });
  });

  return enabled;
}
