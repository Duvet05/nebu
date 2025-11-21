// app/utils/security.ts
// Utilidades de seguridad para validación y sanitización

/**
 * Valida una clave pública de API
 * @param key - La clave a validar
 * @returns La clave validada o string vacío si es inválida
 */
export function validatePublicKey(key: string | undefined): string {
  if (!key) return '';
  
  // Remover espacios en blanco
  const trimmedKey = key.trim();
  
  // Validar formato básico de clave pública
  // Ajusta el patrón según el formato real de tus claves
  const publicKeyPattern = /^[a-zA-Z0-9_-]{20,}$/;
  
  if (!publicKeyPattern.test(trimmedKey)) {
    console.warn('Invalid public key format detected');
    return '';
  }
  
  return trimmedKey;
}

/**
 * Sanitiza un ID (como Facebook Pixel ID)
 * @param id - El ID a sanitizar
 * @returns El ID sanitizado o string vacío si es inválido
 */
export function sanitizeId(id: string | undefined): string {
  if (!id) return '';
  
  // Remover espacios en blanco
  const trimmedId = id.trim();
  
  // Validar que solo contenga números
  const idPattern = /^[0-9]{10,20}$/;
  
  if (!idPattern.test(trimmedId)) {
    console.warn('Invalid ID format detected');
    return '';
  }
  
  return trimmedId;
}

/**
 * Sanitiza una URL para prevenir inyecciones
 * @param url - La URL a sanitizar
 * @returns La URL sanitizada o null si es inválida
 */
export function sanitizeUrl(url: string | undefined): string | null {
  if (!url) return null;
  
  try {
    const urlObject = new URL(url);
    
    // Solo permitir protocolos seguros
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(urlObject.protocol)) {
      return null;
    }
    
    return urlObject.toString();
  } catch (error) {
    console.warn('Invalid URL detected:', error);
    return null;
  }
}

/**
 * Escapa HTML para prevenir XSS
 * @param text - El texto a escapar
 * @returns El texto escapado
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Valida y sanitiza datos de entrada del usuario
 * @param input - Los datos de entrada
 * @param maxLength - Longitud máxima permitida
 * @returns Los datos sanitizados
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  
  // Truncar si excede la longitud máxima
  let sanitized = input.substring(0, maxLength);
  
  // Remover caracteres de control
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Remover espacios en blanco excesivos
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

/**
 * Genera un nonce para Content Security Policy
 * @returns Un nonce único
 */
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para entornos sin crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Valida un email
 * @param email - El email a validar
 * @returns true si el email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

/**
 * Valida un número de teléfono peruano
 * @param phone - El número de teléfono a validar
 * @returns true si el número es válido
 */
export function isValidPeruvianPhone(phone: string): boolean {
  // Formato: +51 9XX XXX XXX o 9XX XXX XXX
  const phonePattern = /^(\+51\s?)?9\d{8}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  return phonePattern.test(cleanPhone);
}

/**
 * Hashea datos sensibles para logging (no para seguridad real)
 * @param data - Los datos a hashear
 * @returns Una versión hasheada para logs
 */
export function hashForLogging(data: string): string {
  if (!data || data.length < 4) return '***';
  
  // Mostrar solo primeros y últimos caracteres
  const firstChars = data.substring(0, 2);
  const lastChars = data.substring(data.length - 2);
  const middleLength = Math.max(data.length - 4, 3);
  const middle = '*'.repeat(middleLength);
  
  return `${firstChars}${middle}${lastChars}`;
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minuto
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Filtrar intentos fuera de la ventana de tiempo
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Agregar nuevo intento
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}