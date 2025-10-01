import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => {

  return {
    // JWT Configuration (secrets from environment)
    jwtSecret:
      process.env.JWT_SECRET ||
      (() => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET is required in production environment');
        }
        return 'dev-secret-key-change-in-production';
      })(),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256',

    // Refresh Token Configuration
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET ||
      (() => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('REFRESH_TOKEN_SECRET is required in production environment');
        }
        return 'dev-refresh-secret-key-change-in-production';
      })(),
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

    // Password Reset Configuration
    passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',

    // Email Verification Configuration
    emailVerificationExpiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h',

    // Security Settings (hardcoded sensible defaults)
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDuration: process.env.LOCKOUT_DURATION || '15m',

    // Session Configuration (hardcoded sensible defaults)
    sessionTimeout: process.env.SESSION_TIMEOUT || '30m',
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '3', 10),

    // URLs (from environment)
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // OAuth Configuration (secrets from environment)
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      },
    },
  };
});
