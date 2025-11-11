/**
 * Example usage of Flow-Telligence email aliases
 * This file demonstrates how to use the email configuration in different scenarios
 */

import { FLOW_TELLIGENCE_EMAILS, EMAIL_ROUTING, getEmailByPurpose } from '../src/email';

// ========================================
// Example 1: Direct usage of email constants
// ========================================
console.log('=== Example 1: Direct Email Access ===');
console.log('Admin email:', FLOW_TELLIGENCE_EMAILS.ADMIN);
console.log('Sales email:', FLOW_TELLIGENCE_EMAILS.VENTAS);
console.log('Support email:', FLOW_TELLIGENCE_EMAILS.SOPORTE);

// ========================================
// Example 2: Using helper function
// ========================================
console.log('\n=== Example 2: Using Helper Function ===');
const billingEmail = getEmailByPurpose('FACTURACION');
console.log('Billing email:', billingEmail);

const contactEmail = getEmailByPurpose('CONTACTO');
console.log('Contact email:', contactEmail);

// ========================================
// Example 3: Email routing for different purposes
// ========================================
console.log('\n=== Example 3: Email Routing ===');
console.log('Order notifications:', EMAIL_ROUTING.orders);
console.log('Support tickets:', EMAIL_ROUTING.support);
console.log('Billing invoices:', EMAIL_ROUTING.billing);

// ========================================
// Example 4: Simulated email sending scenarios
// ========================================
console.log('\n=== Example 4: Simulated Email Scenarios ===');

// Scenario A: New order notification
const orderNotification = {
  from: EMAIL_ROUTING.orders.from,
  to: EMAIL_ROUTING.orders.to,
  subject: 'Nueva orden #12345',
  body: 'Se ha recibido una nueva orden...',
};
console.log('Order notification:', JSON.stringify(orderNotification, null, 2));

// Scenario B: Support ticket response
const supportResponse = {
  from: EMAIL_ROUTING.support.from,
  to: 'customer@example.com',
  cc: EMAIL_ROUTING.support.to,
  subject: 'Re: Ticket #678 - Problema con el dispositivo',
  body: 'Hola, gracias por contactar a soporte...',
};
console.log('\nSupport response:', JSON.stringify(supportResponse, null, 2));

// Scenario C: Invoice email
const invoice = {
  from: EMAIL_ROUTING.billing.from,
  to: 'customer@example.com',
  subject: 'Factura #INV-2025-001',
  body: 'Adjunto encontrarás tu factura...',
};
console.log('\nInvoice email:', JSON.stringify(invoice, null, 2));

// ========================================
// Example 5: Dynamic email selection
// ========================================
console.log('\n=== Example 5: Dynamic Email Selection ===');

type EmailPurpose = 'order' | 'support' | 'billing' | 'general';

function getEmailForPurpose(purpose: EmailPurpose) {
  switch (purpose) {
    case 'order':
      return FLOW_TELLIGENCE_EMAILS.VENTAS;
    case 'support':
      return FLOW_TELLIGENCE_EMAILS.SOPORTE;
    case 'billing':
      return FLOW_TELLIGENCE_EMAILS.FACTURACION;
    case 'general':
      return FLOW_TELLIGENCE_EMAILS.CONTACTO;
    default:
      return FLOW_TELLIGENCE_EMAILS.ADMIN;
  }
}

console.log('Order purpose:', getEmailForPurpose('order'));
console.log('Support purpose:', getEmailForPurpose('support'));
console.log('Billing purpose:', getEmailForPurpose('billing'));
console.log('General purpose:', getEmailForPurpose('general'));

// ========================================
// Example 6: All available aliases
// ========================================
console.log('\n=== Example 6: All Available Aliases ===');
Object.entries(FLOW_TELLIGENCE_EMAILS).forEach(([key, value]) => {
  console.log(`${key.padEnd(15)} → ${value}`);
});

console.log('\n✅ Email configuration examples completed!');
console.log('📧 Total aliases available: 5/50');
console.log('🔗 Main account: admin@flow-telligence.com');
