// Culqi API service with enhanced error handling and retry logic
const CULQI_API_URL = "https://api.culqi.com/v2";
const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY || "";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second

// Culqi error codes documentation
const CULQI_ERROR_CODES = {
  // Card errors
  "card_declined": "Tarjeta rechazada",
  "insufficient_funds": "Fondos insuficientes",
  "lost_card": "Tarjeta perdida o robada",
  "stolen_card": "Tarjeta reportada como robada",
  "expired_card": "Tarjeta expirada",
  "incorrect_cvc": "Código CVC incorrecto",
  "processing_error": "Error al procesar",
  "fraudulent": "Transacción fraudulenta",

  // API errors
  "invalid_request": "Solicitud inválida",
  "authentication_error": "Error de autenticación",
  "api_connection_error": "Error de conexión con Culqi",
  "rate_limit_error": "Límite de solicitudes excedido",

  // Other
  "timeout": "Tiempo de espera agotado",
} as const;

export interface PreOrderData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  quantity: number;
  color: string;
  totalPrice: number;
}

interface CulqiError {
  object: string;
  type: string;
  merchant_message?: string;
  user_message?: string;
  code?: string;
}

interface CulqiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
}

/**
 * Utility: Sleep for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Utility: Check if error is retryable
 */
function isRetryableError(error: CulqiError | any): boolean {
  if (error.type === "api_connection_error") return true;
  if (error.type === "rate_limit_error") return true;
  if (error.code === "timeout") return true;
  if (error.message?.includes("ECONNRESET")) return true;
  if (error.message?.includes("ETIMEDOUT")) return true;
  if (error.message?.includes("network")) return true;
  return false;
}

/**
 * Utility: Get user-friendly error message
 */
function getUserFriendlyError(error: CulqiError): string {
  if (error.user_message) return error.user_message;
  if (error.code && CULQI_ERROR_CODES[error.code as keyof typeof CULQI_ERROR_CODES]) {
    return CULQI_ERROR_CODES[error.code as keyof typeof CULQI_ERROR_CODES];
  }
  if (error.type === "card_error") return "Error con la tarjeta. Verifica los datos e intenta nuevamente.";
  if (error.type === "authentication_error") return "Error de autenticación con el sistema de pagos.";
  return "Error al procesar el pago. Por favor intenta nuevamente.";
}

/**
 * Utility: Log Culqi operation
 */
function logCulqiOperation(
  operation: string,
  status: "success" | "error" | "retry",
  details: any
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    service: "culqi",
    operation,
    status,
    ...details,
  };

  if (status === "error") {
    console.error(`[CULQI ERROR] ${operation}:`, JSON.stringify(logEntry, null, 2));
  } else if (status === "retry") {
    console.warn(`[CULQI RETRY] ${operation}:`, JSON.stringify(logEntry, null, 2));
  } else {
    console.log(`[CULQI SUCCESS] ${operation}:`, JSON.stringify(logEntry, null, 2));
  }
}

/**
 * Utility: Make Culqi API request with retry logic
 */
async function culqiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: any,
  retries = MAX_RETRIES
): Promise<CulqiResponse<T>> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${CULQI_API_URL}${endpoint}`, {
        method,
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${CULQI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        const error: CulqiError = result;
        const isRetryable = isRetryableError(error);

        logCulqiOperation(endpoint, "error", {
          attempt: attempt + 1,
          statusCode: response.status,
          errorType: error.type,
          errorCode: error.code,
          merchantMessage: error.merchant_message,
          isRetryable,
        });

        // Retry if it's a retryable error and we have attempts left
        if (isRetryable && attempt < retries) {
          const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt); // Exponential backoff
          logCulqiOperation(endpoint, "retry", {
            attempt: attempt + 1,
            nextRetryIn: `${delayMs}ms`,
          });
          await sleep(delayMs);
          continue;
        }

        return {
          success: false,
          error: getUserFriendlyError(error),
          errorCode: error.code,
          retryable: isRetryable,
        };
      }

      logCulqiOperation(endpoint, "success", {
        attempt: attempt + 1,
        id: result.id,
      });

      return {
        success: true,
        data: result,
      };

    } catch (error: any) {
      lastError = error;

      // Handle network errors, timeouts, etc.
      const isRetryable = error.name === "AbortError" ||
                         error.message?.includes("network") ||
                         error.message?.includes("ECONNRESET") ||
                         error.message?.includes("ETIMEDOUT");

      logCulqiOperation(endpoint, "error", {
        attempt: attempt + 1,
        errorName: error.name,
        errorMessage: error.message,
        isRetryable,
      });

      if (isRetryable && attempt < retries) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt);
        logCulqiOperation(endpoint, "retry", {
          attempt: attempt + 1,
          nextRetryIn: `${delayMs}ms`,
        });
        await sleep(delayMs);
        continue;
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Error de conexión. Por favor intenta nuevamente.",
    retryable: true,
  };
}

/**
 * Create a Culqi charge
 * @param tokenId - Token ID from Culqi.js (frontend)
 * @param data - Pre-order data
 */
export async function createCharge(tokenId: string, data: PreOrderData): Promise<CulqiResponse> {
  // Validate inputs
  if (!tokenId || !tokenId.startsWith("tkn_")) {
    return {
      success: false,
      error: "Token de pago inválido",
      retryable: false,
    };
  }

  if (!CULQI_SECRET_KEY) {
    console.error("[CULQI] Missing CULQI_SECRET_KEY in environment variables");
    return {
      success: false,
      error: "Configuración de pagos incompleta",
      retryable: false,
    };
  }

  // Validate amount (Culqi requires amount >= 100 cents = S/ 1.00)
  const amountInCents = Math.round(data.totalPrice * 100);
  if (amountInCents < 100) {
    return {
      success: false,
      error: "El monto mínimo es S/ 1.00",
      retryable: false,
    };
  }

  const requestBody = {
    amount: amountInCents,
    currency_code: "PEN",
    email: data.email,
    source_id: tokenId,
    description: `Pre-orden Nebu - ${data.quantity}x ${data.color}`,
    metadata: {
      order_type: "pre-order",
      product: "Nebu IoT Companion",
      color: data.color,
      quantity: data.quantity.toString(),
      customer_name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postal_code: data.postalCode,
    },
  };

  logCulqiOperation("createCharge", "success", {
    amount: data.totalPrice,
    currency: "PEN",
    email: data.email,
  });

  return culqiRequest("/charges", "POST", requestBody);
}

/**
 * Get charge information
 */
export async function getCharge(chargeId: string): Promise<CulqiResponse> {
  if (!chargeId || !chargeId.startsWith("chr_")) {
    return {
      success: false,
      error: "ID de cargo inválido",
      retryable: false,
    };
  }

  return culqiRequest(`/charges/${chargeId}`, "GET");
}

/**
 * Refund a charge (total or partial)
 */
export async function refundCharge(
  chargeId: string,
  amount: number,
  reason: string
): Promise<CulqiResponse> {
  if (!chargeId || !chargeId.startsWith("chr_")) {
    return {
      success: false,
      error: "ID de cargo inválido",
      retryable: false,
    };
  }

  const amountInCents = Math.round(amount * 100);
  if (amountInCents < 100) {
    return {
      success: false,
      error: "El monto mínimo de reembolso es S/ 1.00",
      retryable: false,
    };
  }

  const requestBody = {
    amount: amountInCents,
    charge_id: chargeId,
    reason,
  };

  return culqiRequest("/refunds", "POST", requestBody);
}

/**
 * Create a Culqi order (for payment links)
 */
export async function createOrder(data: {
  amount: number;
  currency: string;
  description: string;
  orderNumber: string;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  expirationDays?: number;
  metadata?: Record<string, any>;
}): Promise<CulqiResponse> {
  const amountInCents = Math.round(data.amount * 100);

  if (amountInCents < 100) {
    return {
      success: false,
      error: "El monto mínimo es S/ 1.00",
      retryable: false,
    };
  }

  const expirationDate = Math.floor(Date.now() / 1000) + (data.expirationDays || 7) * 86400;

  const requestBody = {
    amount: amountInCents,
    currency_code: data.currency || "PEN",
    description: data.description,
    order_number: data.orderNumber,
    client_details: {
      first_name: data.customerDetails.firstName,
      last_name: data.customerDetails.lastName,
      email: data.customerDetails.email,
      phone_number: data.customerDetails.phone,
    },
    expiration_date: expirationDate,
    metadata: data.metadata || {},
  };

  return culqiRequest("/orders", "POST", requestBody);
}

/**
 * Process Culqi webhook event
 */
export async function processWebhook(event: any) {
  try {
    const { object, data } = event;

    logCulqiOperation("webhook", "success", {
      eventType: object,
      eventId: data?.id,
    });

    switch (object) {
      case "event.charge.succeeded":
        // Payment successful
        return {
          success: true,
          type: "charge_succeeded",
          data: {
            chargeId: data.id,
            amount: data.amount / 100,
            currency: data.currency_code,
            email: data.email,
            metadata: data.metadata,
            createdAt: data.creation_date,
          },
        };

      case "event.charge.failed":
        // Payment failed
        return {
          success: true,
          type: "charge_failed",
          data: {
            chargeId: data.id,
            email: data.email,
            reason: data.outcome?.user_message || "Payment failed",
            errorCode: data.outcome?.code,
          },
        };

      case "event.order.expired":
        // Order expired
        return {
          success: true,
          type: "order_expired",
          data: {
            orderId: data.id,
            orderNumber: data.order_number,
          },
        };

      case "event.refund.succeeded":
        // Refund successful
        return {
          success: true,
          type: "refund_succeeded",
          data: {
            refundId: data.id,
            chargeId: data.charge_id,
            amount: data.amount / 100,
            reason: data.reason,
          },
        };

      default:
        logCulqiOperation("webhook", "error", {
          message: "Unknown event type",
          eventType: object,
        });
        return {
          success: true,
          type: "unknown",
          data: null,
        };
    }
  } catch (error: any) {
    logCulqiOperation("webhook", "error", {
      message: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message || "Error procesando webhook",
    };
  }
}
