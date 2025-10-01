import { registerAs } from '@nestjs/config';

export const paymentsConfig = registerAs('payments', () => {

  return {
    // Stripe Configuration (secrets from environment)
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      enabled: process.env.ENABLE_STRIPE !== 'false',
    },

    // Transaction Limits (hardcoded sensible defaults)
    limits: {
      minPurchaseAmount: parseFloat(process.env.MIN_PURCHASE_AMOUNT || '5'),
      maxPurchaseAmount: parseFloat(process.env.MAX_PURCHASE_AMOUNT || '10000'),
      maxDailySpend: parseFloat(process.env.MAX_DAILY_SPEND || '25000'),
      maxMonthlySpend: parseFloat(process.env.MAX_MONTHLY_SPEND || '100000'),
    },

    // Subscription Plans (hardcoded sensible defaults)
    subscriptions: {
      enabled: process.env.ENABLE_SUBSCRIPTIONS !== 'false',
      plans: {
        basic: { 
          price: parseFloat(process.env.BASIC_PLAN_PRICE || '19.99'), 
          coursesLimit: parseInt(process.env.BASIC_PLAN_COURSES || '10', 10) 
        },
        premium: { 
          price: parseFloat(process.env.PREMIUM_PLAN_PRICE || '39.99'), 
          coursesLimit: parseInt(process.env.PREMIUM_PLAN_COURSES || '50', 10) 
        },
        enterprise: { 
          price: parseFloat(process.env.ENTERPRISE_PLAN_PRICE || '99.99'), 
          coursesLimit: parseInt(process.env.ENTERPRISE_PLAN_COURSES || '-1', 10) 
        },
      },
    },

    // Discount Configuration (hardcoded sensible defaults)
    discounts: {
      enabled: process.env.ENABLE_DISCOUNTS !== 'false',
      maxDiscountPercentage: parseFloat(process.env.MAX_DISCOUNT_PERCENTAGE || '90'),
      maxStackableDiscounts: parseInt(process.env.MAX_STACKABLE_DISCOUNTS || '2', 10),
      bulkDiscountThreshold: parseInt(process.env.BULK_DISCOUNT_THRESHOLD || '10', 10),
    },

    // Refund Configuration (hardcoded sensible defaults)
    refunds: {
      enabled: process.env.ENABLE_REFUNDS !== 'false',
      refundWindow: parseInt(process.env.REFUND_WINDOW || '30', 10),
      maxRefundsPerUser: parseInt(process.env.MAX_REFUNDS_PER_USER || '5', 10),
      refundProcessingTime: parseInt(process.env.REFUND_PROCESSING_TIME || '7', 10),
    },

    // Currency Configuration (hardcoded sensible defaults)
    currency: {
      default: process.env.DEFAULT_CURRENCY || 'USD',
      allowed: process.env.ALLOWED_CURRENCIES?.split(',') || ['USD', 'EUR', 'MXN'],
    },
  };
});
