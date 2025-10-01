import { registerAs } from '@nestjs/config';

export const emailConfig = registerAs('email', () => {
  // Simplified email configuration using existing SMTP environment variables
  const emailConfig = {
    providers: {
      smtp: {
        name: 'SMTP Provider',
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { type: 'login' },
        accounts: {
          default: {
            email: process.env.SMTP_USER || 'noreply@nebu.com',
            password: process.env.SMTP_PASSWORD || '',
            fromName: 'Nebu Mobile',
            purpose: 'General email communications'
          }
        }
      }
    },
    default: { provider: 'smtp', account: 'default' },
    routing: {
      notifications: { provider: 'smtp', account: 'default' },
      support: { provider: 'smtp', account: 'default' },
      admin: { provider: 'smtp', account: 'default' }
    }
  };

  return {
    // Feature flag - enable/disable email notifications
    enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    
    // Global configuration
    defaultProvider: emailConfig.default.provider,
    defaultAccount: emailConfig.default.account,
    
    // Available providers
    providers: emailConfig.providers,
    
    // Email routing
    routing: emailConfig.routing,
    
    // Helper to get provider configuration
    getProviderConfig: (provider: string, account: string) => {
      const providerConfig = emailConfig.providers[provider];
      if (!providerConfig) {
        throw new Error(`Email provider not found: ${provider}`);
      }
      
      const accountConfig = providerConfig.accounts[account];
      if (!accountConfig) {
        throw new Error(`Email account not found: ${account} in ${provider}`);
      }
      
      return {
        host: providerConfig.host,
        port: providerConfig.port,
        secure: providerConfig.secure,
        auth: {
          user: accountConfig.email,
          pass: accountConfig.password,
        },
        from: {
          name: accountConfig.fromName,
          email: accountConfig.email,
        },
        purpose: accountConfig.purpose,
      };
    },
    
    // Helper to get configuration by email type
    getConfigForType: (type: 'notifications' | 'support' | 'admin' | 'default') => {
      const routing = emailConfig.routing[type] || emailConfig.default;
      const providerConfig = emailConfig.providers[routing.provider];
      const accountConfig = providerConfig?.accounts[routing.account];
      
      return {
        host: providerConfig?.host,
        port: providerConfig?.port,
        secure: providerConfig?.secure,
        auth: {
          user: accountConfig?.email,
          pass: accountConfig?.password,
        },
        from: {
          name: accountConfig?.fromName,
          email: accountConfig?.email,
        },
        purpose: accountConfig?.purpose,
      };
    },

    // Email settings with sensible defaults
    settings: {
      // Connection settings
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      
      // Retry settings
      maxRetries: 3,
      retryDelay: 5000,
      
      // Rate limiting
      rateLimit: {
        maxEmailsPerMinute: 60,
        maxEmailsPerHour: 1000,
      },
      
      // Template settings
      templates: {
        directory: './templates/email',
        engine: 'handlebars',
      },
    },
  };
});
