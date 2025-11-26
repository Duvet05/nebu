// app/config/env.server.ts
import { z } from 'zod';

/**
 * Schema de validación para variables de entorno del servidor
 * Este archivo SOLO debe importarse en código del servidor (loaders, actions)
 */
const envSchema = z.object({
  // Base URLs
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BACKEND_URL: z.string().url('BACKEND_URL debe ser una URL válida'),
  
  // API Keys
  VITE_CULQI_PUBLIC_KEY: z.string().min(1, 'VITE_CULQI_PUBLIC_KEY es requerida'),
  VITE_GA_TRACKING_ID: z.string().optional(),
  VITE_FB_PIXEL_ID: z.string().optional(),
  VITE_TIKTOK_PIXEL_ID: z.string().optional(),
  
  // Session & Security
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET debe tener al menos 32 caracteres'),
  
  // Email (si usas servidor)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/).default('100'),
  RATE_LIMIT_WINDOW: z.string().regex(/^\d+$/).default('60000'), // ms
});

/**
 * Valida y parsea las variables de entorno
 * @throws {z.ZodError} Si alguna variable es inválida
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(
        (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
      );
      
      console.error('❌ Error en variables de entorno:\n' + issues.join('\n'));
      
      throw new Error(
        'Variables de entorno inválidas. Revisa tu archivo .env y compáralo con .env.example'
      );
    }
    throw error;
  }
}

// Validar al cargar el módulo (solo en servidor)
export const env = validateEnv();

// Helper para verificar si estamos en producción
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Tipos inferidos
export type Env = z.infer<typeof envSchema>;
