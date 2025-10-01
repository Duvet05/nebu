import { registerAs } from '@nestjs/config';

export const smtpConfig = registerAs('smtp', () => ({
  // Feature flag - enable/disable email notifications
  enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  
  // Connection settings (from environment variables)
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@nebu.academy',

  // Default configuration settings
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  // Template settings
  templates: {
    directory: './templates/email',
    engine: 'handlebars',
  },
}));
