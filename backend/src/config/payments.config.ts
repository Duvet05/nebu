import { registerAs } from '@nestjs/config';
import { PAYMENT_CONSTANTS } from './constants/payments.constants';

export const paymentsConfig = registerAs('payments', () => {

  return {
    // Culqi Configuration (secrets from environment)
    culqi: {
      secretKey: process.env.CULQI_SECRET_KEY,
      publicKey: process.env.CULQI_PUBLIC_KEY,
      enabled: PAYMENT_CONSTANTS.paymentMethods.culqi.enabled,
    },

    // Transaction Limits (from constants, no longer configurable)
    limits: PAYMENT_CONSTANTS.limits,

    // Subscription Plans (from constants)
    subscriptions: PAYMENT_CONSTANTS.subscriptions,

    // Discount Configuration (from constants)
    discounts: PAYMENT_CONSTANTS.discounts,

    // Refund Configuration (from constants)
    refunds: PAYMENT_CONSTANTS.refunds,

    // Currency Configuration (from constants)
    currency: PAYMENT_CONSTANTS.currency,
  };
});
