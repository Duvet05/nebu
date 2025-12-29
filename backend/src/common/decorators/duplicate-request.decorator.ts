import { SetMetadata } from '@nestjs/common';

export const DUPLICATE_REQUEST_KEY = 'duplicate_request';

export interface DuplicateRequestOptions {
  /**
   * Tiempo en segundos para considerar una solicitud como duplicada
   * @default 60
   */
  ttl?: number;

  /**
   * Campos del body a usar para generar la clave de duplicado
   * Si no se especifica, se usa todo el body
   */
  fields?: string[];

  /**
   * Mensaje personalizado para requests duplicados
   */
  message?: string;
}

/**
 * Decorator para prevenir requests duplicados basados en el contenido del body
 *
 * @example
 * ```typescript
 * @Post()
 * @PreventDuplicateRequest({ ttl: 300, fields: ['email', 'type'] })
 * async createComplaint(@Body() dto: CreateComplaintDto) {
 *   // ...
 * }
 * ```
 */
export const PreventDuplicateRequest = (options: DuplicateRequestOptions = {}) =>
  SetMetadata(DUPLICATE_REQUEST_KEY, {
    ttl: options.ttl || 60,
    fields: options.fields,
    message: options.message || 'Solicitud duplicada detectada. Por favor, espere antes de volver a intentar.',
  });
