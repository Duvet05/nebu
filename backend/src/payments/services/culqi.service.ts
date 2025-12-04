import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Culqi Payment Service
 * 
 * Implementación oficial basada en la documentación de Culqi:
 * https://docs.culqi.com/
 * 
 * Características:
 * - Creación de cargos (charges)
 * - Reembolsos (refunds)
 * - Manejo de webhooks
 * - Retry logic con exponential backoff
 * - Logging detallado
 */

const CULQI_API_URL = 'https://api.culqi.com/v2';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export interface CulqiChargeData {
  amount: number; // Monto en centavos (100 = S/ 1.00)
  currency_code: string; // 'PEN' para Soles
  email: string;
  source_id: string; // Token ID from Culqi.js
  description: string;
  metadata?: Record<string, any>;
  antifraud_details?: {
    first_name: string;
    last_name: string;
    address: string;
    address_city: string;
    phone_number: string;
  };
}

export interface CulqiCharge {
  id: string;
  object: string;
  amount: number;
  currency_code: string;
  email: string;
  description: string;
  source: {
    id: string;
    type: string;
    card_number: string;
    card_brand: string;
  };
  outcome: {
    type: string;
    code: string;
    merchant_message: string;
    user_message: string;
  };
  metadata: Record<string, any>;
  creation_date: number;
}

export interface CulqiError {
  object: string;
  type: string;
  code?: string;
  merchant_message?: string;
  user_message?: string;
}

@Injectable()
export class CulqiService {
  private readonly logger = new Logger(CulqiService.name);
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('CULQI_SECRET_KEY') || '';
    this.publicKey = this.configService.get<string>('CULQI_PUBLIC_KEY') || '';
    this.enabled = !!(this.secretKey && this.publicKey);

    if (!this.enabled) {
      this.logger.warn('⚠️  Culqi is not configured. Missing CULQI_SECRET_KEY or CULQI_PUBLIC_KEY');
    } else {
      this.logger.log('✅ Culqi service initialized');
    }
  }

  /**
   * Verifica si el servicio está habilitado
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Obtiene la public key (para el frontend)
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Utility: Sleep para retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Utility: Determina si un error es reintentable
   */
  private isRetryableError(error: any): boolean {
    if (error.type === 'api_connection_error') return true;
    if (error.type === 'rate_limit_error') return true;
    if (error.code === 'timeout') return true;
    if (error.message?.includes('ECONNRESET')) return true;
    if (error.message?.includes('ETIMEDOUT')) return true;
    if (error.message?.includes('network')) return true;
    return false;
  }

  /**
   * Utility: Obtiene mensaje amigable del error
   */
  private getUserFriendlyError(error: CulqiError): string {
    const errorMessages: Record<string, string> = {
      card_declined: 'Tarjeta rechazada',
      insufficient_funds: 'Fondos insuficientes',
      lost_card: 'Tarjeta perdida o robada',
      stolen_card: 'Tarjeta reportada como robada',
      expired_card: 'Tarjeta expirada',
      incorrect_cvc: 'Código CVC incorrecto',
      processing_error: 'Error al procesar',
      fraudulent: 'Transacción fraudulenta',
      invalid_request: 'Solicitud inválida',
      authentication_error: 'Error de autenticación',
      api_connection_error: 'Error de conexión con Culqi',
      rate_limit_error: 'Límite de solicitudes excedido',
      timeout: 'Tiempo de espera agotado',
    };

    if (error.user_message) return error.user_message;
    if (error.code && errorMessages[error.code]) return errorMessages[error.code];
    if (error.type === 'card_error') return 'Error con la tarjeta. Verifica los datos e intenta nuevamente.';
    if (error.type === 'authentication_error') return 'Error de autenticación con el sistema de pagos.';
    
    return 'Error al procesar el pago. Por favor intenta nuevamente.';
  }

  /**
   * Realiza una petición a la API de Culqi con retry logic
   */
  private async culqiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any,
    retries = MAX_RETRIES,
  ): Promise<T> {
    if (!this.enabled) {
      throw new HttpException(
        'Culqi service is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    let lastError: any = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(`${CULQI_API_URL}${endpoint}`, {
          method,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
          const error: CulqiError = result;
          const isRetryable = this.isRetryableError(error);

          this.logger.error(`Culqi API Error (attempt ${attempt + 1}/${retries + 1}):`, {
            endpoint,
            statusCode: response.status,
            errorType: error.type,
            errorCode: error.code,
            merchantMessage: error.merchant_message,
            isRetryable,
          });

          // Retry si es un error reintentable y quedan intentos
          if (isRetryable && attempt < retries) {
            const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt); // Exponential backoff
            this.logger.warn(`Retrying in ${delayMs}ms...`);
            await this.sleep(delayMs);
            continue;
          }

          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: this.getUserFriendlyError(error),
              errorCode: error.code,
              merchantMessage: error.merchant_message,
              retryable: isRetryable,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        this.logger.log(`Culqi API Success (attempt ${attempt + 1}):`, {
          endpoint,
          id: result.id,
        });

        return result;

      } catch (error: any) {
        lastError = error;

        // Si es HttpException, lanzarla directamente
        if (error instanceof HttpException) {
          throw error;
        }

        // Handle network errors, timeouts, etc.
        const isRetryable =
          error.name === 'AbortError' ||
          error.message?.includes('network') ||
          error.message?.includes('ECONNRESET') ||
          error.message?.includes('ETIMEDOUT');

        this.logger.error(`Culqi Request Error (attempt ${attempt + 1}/${retries + 1}):`, {
          endpoint,
          errorName: error.name,
          errorMessage: error.message,
          isRetryable,
        });

        if (isRetryable && attempt < retries) {
          const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt);
          this.logger.warn(`Retrying in ${delayMs}ms...`);
          await this.sleep(delayMs);
          continue;
        }
      }
    }

    throw new HttpException(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Error de conexión. Por favor intenta nuevamente.',
        error: lastError?.message,
        retryable: true,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  /**
   * Crea un cargo en Culqi
   * 
   * @param data Datos del cargo
   * @returns Charge object de Culqi
   */
  async createCharge(data: CulqiChargeData): Promise<CulqiCharge> {
    // Validaciones
    if (!data.source_id || !data.source_id.startsWith('tkn_')) {
      throw new HttpException(
        'Token de pago inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.amount < 100) {
      throw new HttpException(
        'El monto mínimo es S/ 1.00 (100 centavos)',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.email || !data.email.includes('@')) {
      throw new HttpException(
        'Email inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log('Creating Culqi charge:', {
      amount: data.amount / 100,
      currency: data.currency_code,
      email: data.email,
      description: data.description,
    });

    return this.culqiRequest<CulqiCharge>('/charges', 'POST', data);
  }

  /**
   * Obtiene información de un cargo
   * 
   * @param chargeId ID del cargo
   * @returns Charge object de Culqi
   */
  async getCharge(chargeId: string): Promise<CulqiCharge> {
    if (!chargeId || !chargeId.startsWith('chr_')) {
      throw new HttpException(
        'ID de cargo inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.culqiRequest<CulqiCharge>(`/charges/${chargeId}`, 'GET');
  }

  /**
   * Crea un reembolso
   * 
   * @param chargeId ID del cargo a reembolsar
   * @param amount Monto a reembolsar en centavos
   * @param reason Razón del reembolso
   * @returns Refund object de Culqi
   */
  async createRefund(chargeId: string, amount: number, reason: string): Promise<any> {
    if (!chargeId || !chargeId.startsWith('chr_')) {
      throw new HttpException(
        'ID de cargo inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (amount < 100) {
      throw new HttpException(
        'El monto mínimo de reembolso es S/ 1.00 (100 centavos)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const requestBody = {
      amount,
      charge_id: chargeId,
      reason,
    };

    this.logger.log('Creating Culqi refund:', {
      chargeId,
      amount: amount / 100,
      reason,
    });

    return this.culqiRequest('/refunds', 'POST', requestBody);
  }

  /**
   * Procesa un webhook de Culqi
   * 
   * @param event Evento del webhook
   * @returns Datos procesados del evento
   */
  processWebhook(event: any): {
    type: string;
    data: any;
  } {
    const { object, data } = event;

    this.logger.log('Processing Culqi webhook:', {
      eventType: object,
      eventId: data?.id,
    });

    switch (object) {
      case 'event.charge.succeeded':
        return {
          type: 'charge_succeeded',
          data: {
            chargeId: data.id,
            amount: data.amount / 100,
            currency: data.currency_code,
            email: data.email,
            metadata: data.metadata,
            createdAt: data.creation_date,
          },
        };

      case 'event.charge.failed':
        return {
          type: 'charge_failed',
          data: {
            chargeId: data.id,
            email: data.email,
            reason: data.outcome?.user_message || 'Payment failed',
            errorCode: data.outcome?.code,
          },
        };

      case 'event.order.expired':
        return {
          type: 'order_expired',
          data: {
            orderId: data.id,
            orderNumber: data.order_number,
          },
        };

      case 'event.refund.succeeded':
        return {
          type: 'refund_succeeded',
          data: {
            refundId: data.id,
            chargeId: data.charge_id,
            amount: data.amount / 100,
            reason: data.reason,
          },
        };

      default:
        this.logger.warn('Unknown webhook event type:', object);
        return {
          type: 'unknown',
          data: null,
        };
    }
  }
}
