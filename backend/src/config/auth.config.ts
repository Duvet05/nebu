import { registerAs } from '@nestjs/config';
import { SECURITY_CONSTANTS } from './constants/security.constants';

export const authConfig = registerAs('auth', () => {

  return {
    // JWT Configuration (secrets from environment, expiration from constants)
    jwtSecret:
      process.env.JWT_SECRET ||
      (() => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET is required in production environment');
        }
        return 'dev-secret-key-change-in-production';
      })(),
    jwtExpiresIn: SECURITY_CONSTANTS.tokens.jwt, // From constants: '15m'
    jwtAlgorithm: 'HS256' as const,

    // Refresh Token Configuration
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET ||
      (() => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('REFRESH_TOKEN_SECRET is required in production environment');
        }
        return 'dev-refresh-secret-key-change-in-production';
      })(),
    refreshTokenExpiresIn: SECURITY_CONSTANTS.tokens.refresh, // From constants: '7d'

    // Password Reset Configuration (from constants)
    passwordResetExpiresIn: SECURITY_CONSTANTS.tokens.passwordReset, // '1h'

    // Email Verification Configuration (from constants)
    emailVerificationExpiresIn: SECURITY_CONSTANTS.tokens.emailVerification, // '24h'

    // Security Settings (from constants, no longer configurable)
    bcryptRounds: SECURITY_CONSTANTS.bcryptRounds, // 12
    maxLoginAttempts: SECURITY_CONSTANTS.maxLoginAttempts, // 5
    lockoutDuration: SECURITY_CONSTANTS.lockoutDuration, // '15m'

    // Session Configuration (from constants)
    sessionTimeout: SECURITY_CONSTANTS.sessionTimeout, // '30m'
    maxConcurrentSessions: SECURITY_CONSTANTS.maxConcurrentSessions, // 3

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
