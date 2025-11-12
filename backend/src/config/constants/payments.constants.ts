/**
 * Payment Constants
 *
 * Reglas de negocio para pagos y transacciones.
 * Estos valores NO deben estar en .env porque son reglas críticas del negocio.
 * Cambiarlos requiere revisión y aprobación formal.
 */

export const PAYMENT_CONSTANTS = {
  // Transaction Limits (en USD)
  limits: {
    minPurchaseAmount: 5, // $5 USD mínimo
    maxPurchaseAmount: 10000, // $10,000 USD máximo por transacción
    maxDailySpend: 25000, // $25,000 USD máximo por día
    maxMonthlySpend: 100000, // $100,000 USD máximo por mes
  },

  // Currency Configuration
  currency: {
    default: 'USD' as const,
    allowed: ['USD', 'EUR', 'MXN'] as const,
  },

  // Subscription Plans
  subscriptions: {
    enabled: true,
    plans: {
      basic: {
        price: 19.99,
        coursesLimit: 10,
        features: ['basic-support', 'mobile-access'] as const,
      },
      premium: {
        price: 39.99,
        coursesLimit: 50,
        features: ['priority-support', 'mobile-access', 'offline-mode'] as const,
      },
      enterprise: {
        price: 99.99,
        coursesLimit: -1, // Ilimitado
        features: [
          'dedicated-support',
          'mobile-access',
          'offline-mode',
          'api-access',
          'custom-branding',
        ] as const,
      },
    },
  },

  // Discount Configuration
  discounts: {
    enabled: true,
    maxDiscountPercentage: 90, // Máximo 90% de descuento
    maxStackableDiscounts: 2, // Máximo 2 descuentos acumulables
    bulkDiscountThreshold: 10, // Descuento por volumen a partir de 10 items
  },

  // Refund Configuration
  refunds: {
    enabled: true,
    refundWindow: 30, // 30 días para solicitar reembolso
    maxRefundsPerUser: 5, // Máximo 5 reembolsos por usuario
    refundProcessingTime: 7, // 7 días hábiles para procesar
  },

  // Payment Methods
  paymentMethods: {
    culqi: {
      enabled: true,
      name: 'Culqi',
      supportedCountries: ['PE'] as const, // Perú
    },
    stripe: {
      enabled: false, // Por implementar
      name: 'Stripe',
      supportedCountries: ['US', 'MX', 'CA'] as const,
    },
  },
} as const;

export type PaymentConstants = typeof PAYMENT_CONSTANTS;

/**
 * Validar si un monto está dentro de los límites permitidos
 */
export function isValidAmount(amount: number): boolean {
  return (
    amount >= PAYMENT_CONSTANTS.limits.minPurchaseAmount &&
    amount <= PAYMENT_CONSTANTS.limits.maxPurchaseAmount
  );
}

/**
 * Validar si una moneda es soportada
 */
export function isSupportedCurrency(currency: string): boolean {
  return PAYMENT_CONSTANTS.currency.allowed.includes(
    currency as any,
  );
}
