/**
 * Email Service (Disabled)
 *
 * Email functionality has been moved to the backend API.
 * This file is kept for backwards compatibility but all functions
 * now return success: false with an appropriate message.
 *
 * To enable emails, call the backend API endpoints instead:
 * - POST /api/v1/email/newsletter
 * - POST /api/v1/email/pre-order
 */

import { BUSINESS } from "~/config/constants";

export const EMAIL_CONFIG = {
  admin: "admin@flow-telligence.com",
  contacto: "contacto@flow-telligence.com",
  facturacion: "facturacion@flow-telligence.com",
  info: "info@flow-telligence.com",
  soporte: "soporte@flow-telligence.com",
  ventas: "ventas@flow-telligence.com",
} as const;

/**
 * Send newsletter welcome email
 * @deprecated Use backend API instead: POST /api/v1/email/newsletter
 */
export async function sendNewsletterWelcome(email: string) {
  console.warn(
    "[Deprecated] sendNewsletterWelcome called. Email functionality should be handled by backend API."
  );
  return {
    success: false,
    error: "Email service disabled in frontend. Use backend API instead.",
  };
}

/**
 * Send pre-order confirmation email to customer
 * @deprecated Use backend API instead: POST /api/v1/email/pre-order
 */
export async function sendPreOrderConfirmation(data: {
  email: string;
  firstName: string;
  lastName: string;
  quantity: number;
  color: string;
  totalPrice: number;
}) {
  console.warn(
    "[Deprecated] sendPreOrderConfirmation called. Email functionality should be handled by backend API."
  );
  return {
    success: false,
    error: "Email service disabled in frontend. Use backend API instead.",
  };
}

/**
 * Send pre-order notification to internal team
 * @deprecated Use backend API instead: POST /api/v1/email/pre-order
 */
export async function sendPreOrderNotification(data: {
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
  paymentMethod: string;
}) {
  console.warn(
    "[Deprecated] sendPreOrderNotification called. Email functionality should be handled by backend API."
  );
  return {
    success: false,
    error: "Email service disabled in frontend. Use backend API instead.",
  };
}
