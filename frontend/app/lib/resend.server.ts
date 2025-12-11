import { Resend } from "resend";
import { BUSINESS } from "~/config/constants";

// Initialize Resend client lazily
let resend: Resend | null = null;

const getResendClient = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// Flow-Telligence Email Configuration
// Account: admin@flow-telligence.com (6/50 aliases usados)
export const EMAIL_CONFIG = {
  admin: "admin@flow-telligence.com",
  contacto: "contacto@flow-telligence.com",
  facturacion: "facturacion@flow-telligence.com",
  info: "info@flow-telligence.com",
  soporte: "soporte@flow-telligence.com",
  ventas: "ventas@flow-telligence.com",
} as const;

// Email configuration
const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || `Nebu <${EMAIL_CONFIG.contacto}>`;
const EMAIL_TO = process.env.EMAIL_TO || EMAIL_CONFIG.admin;

// Email templates
export const emailTemplates = {
  /**
   * Welcome email for newsletter subscribers
   */
  newsletterWelcome: (email: string) => ({
    from: EMAIL_FROM,
    to: email,
    subject: "¡Bienvenido a Nebu! ",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e0e0e0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .emoji { font-size: 48px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji"></div>
              <h1 style="margin: 0;">¡Bienvenido a la familia Nebu!</h1>
            </div>
            <div class="content">
              <p>¡Hola!</p>

              <p>Nos emociona muchísimo que te unas a nuestra comunidad. Nebu es más que un juguete, es un compañero que transformará el aprendizaje de los más pequeños en aventuras mágicas sin pantallas.</p>

              <p><strong>¿Qué puedes esperar?</strong></p>
              <ul>
                <li> Acceso anticipado a ofertas especiales</li>
                <li> Contenido exclusivo sobre educación sin pantallas</li>
                <li> Las últimas novedades sobre Nebu</li>
                <li> Tips de crianza y desarrollo infantil</li>
              </ul>

              <p style="text-align: center;">
                <a href="${BUSINESS.website}/pre-order" class="button">
                  Pre-ordena tu Nebu con descuento
                </a>
              </p>

              <p>Si tienes alguna pregunta, simplemente responde a este email. ¡Estamos aquí para ayudarte!</p>

              <p>Con cariño,<br>
              <strong>El equipo de Nebu</strong></p>
            </div>
            <div class="footer">
              <p>${BUSINESS.name} | ${BUSINESS.address.full}</p>
              <p>Has recibido este email porque te suscribiste en ${BUSINESS.website.replace('https://', '')}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Pre-order confirmation email
   */
  preOrderConfirmation: (data: {
    email: string;
    firstName: string;
    lastName: string;
    quantity: number;
    color: string;
    totalPrice: number;
  }) => ({
    from: EMAIL_FROM,
    to: data.email,
    subject: "¡Pre-orden confirmada!  - Nebu",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e0e0e0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
            .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .emoji { font-size: 48px; margin: 20px 0; }
            .price { font-size: 24px; font-weight: bold; color: #FF6B35; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji"></div>
              <h1 style="margin: 0;">¡Pre-orden confirmada!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.firstName}</strong>,</p>

              <p>¡Gracias por pre-ordenar tu Nebu! Eres parte de algo especial. </p>

              <div class="order-details">
                <h3>Detalles de tu pre-orden:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li> <strong>Producto:</strong> Peluche Nebu Dino (Edición Limitada)</li>
                  <li> <strong>Color:</strong> ${data.color}</li>
                  <li> <strong>Cantidad:</strong> ${data.quantity}</li>
                  <li> <strong>Total del pedido:</strong> S/${data.totalPrice}</li>
                  <li class="price"> <strong>A pagar ahora (50%):</strong> S/${data.totalPrice * 0.5}</li>
                  <li> <strong>Resto contra entrega:</strong> S/${data.totalPrice * 0.5}</li>
                </ul>
              </div>

              <p><strong>¿Qué sigue?</strong></p>
              <ol>
                <li>Nuestro equipo te enviará las instrucciones de pago en las próximas 24 horas</li>
                <li>Paga el 50% de adelanto (S/${data.totalPrice * 0.5}) vía Yape o tarjeta</li>
                <li>Una vez confirmado el pago, ¡tu Nebu Dino entrará en producción!</li>
                <li>El resto lo pagas cuando recibas tu pedido</li>
                <li>Envío estimado: 4-6 semanas</li>
              </ol>

              <p> <strong>Beneficios de esta pre-orden:</strong></p>
              <ul>
                <li>Edición limitada - Solo 20 unidades disponibles</li>
                <li>Reserva con solo el 50% de adelanto</li>
                <li>Envío gratis a todo Perú</li>
                <li>Pago sin comisiones con Yape</li>
                <li>Contenido exclusivo para early adopters</li>
              </ul>

              <p>Si tienes alguna pregunta, responde a este email o escríbenos por WhatsApp al +51 970 116 770.</p>

              <p>¡Gracias por confiar en Nebu!</p>

              <p>Con mucho cariño,<br>
              <strong>El equipo de Nebu</strong></p>
            </div>
            <div class="footer">
              <p>${BUSINESS.name} | ${BUSINESS.address.full}</p>
              <p>Pre-orden realizada en ${BUSINESS.website.replace('https://', '')}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Internal notification for new pre-order
   */
  preOrderNotification: (data: {
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
  }) => ({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: ` Nueva Pre-orden: ${data.firstName} ${data.lastName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4ECDC4; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 20px; border: 1px solid #e0e0e0; }
            .info-box { background: #f9f9f9; padding: 15px; border-left: 4px solid #FF6B35; margin: 15px 0; }
            .price { font-size: 24px; font-weight: bold; color: #FF6B35; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;"> Nueva Pre-orden Recibida</h2>
            </div>
            <div class="content">
              <div class="info-box">
                <h3>Datos del Cliente</h3>
                <p><strong>Nombre:</strong> ${data.firstName} ${data.lastName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Teléfono:</strong> ${data.phone}</p>
              </div>

              <div class="info-box">
                <h3>Dirección de Envío</h3>
                <p>${data.address}</p>
                <p>${data.city}, ${data.postalCode}</p>
              </div>

              <div class="info-box">
                <h3>Detalles del Pedido</h3>
                <p><strong>Producto:</strong> Peluche Nebu Dino (Edición Limitada)</p>
                <p><strong>Color:</strong> ${data.color}</p>
                <p><strong>Cantidad:</strong> ${data.quantity}</p>
                <p><strong>Método de pago:</strong> ${data.paymentMethod === 'yape' ? '💜 Yape (Recomendado)' : data.paymentMethod}</p>
                <p><strong>Total del pedido:</strong> S/${data.totalPrice}</p>
                <p class="price"><strong>Reserva (50%):</strong> S/${data.totalPrice * 0.5}</p>
                <p><strong>Saldo contra entrega:</strong> S/${data.totalPrice * 0.5}</p>
              </div>

              <p><strong>Próximos pasos:</strong></p>
              <ol>
                <li>Contactar al cliente en las próximas 24 horas</li>
                <li>Enviar instrucciones de pago ${data.paymentMethod === 'yape' ? '(QR de Yape)' : ''}</li>
                <li>Confirmar pago de la reserva (50%)</li>
                <li>Marcar pedido como confirmado en el sistema</li>
                <li>Coordinar entrega y cobro del saldo restante</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcome(email: string) {
  try {
    const client = getResendClient();
    if (!client) {
      console.warn("Resend client not initialized - missing RESEND_API_KEY");
      return { success: false, error: "Email service not configured" };
    }
    const emailData = emailTemplates.newsletterWelcome(email);
    const response = await client.emails.send(emailData);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending newsletter welcome email:", error);
    return { success: false, error };
  }
}

/**
 * Send pre-order confirmation email to customer
 */
export async function sendPreOrderConfirmation(data: {
  email: string;
  firstName: string;
  lastName: string;
  quantity: number;
  color: string;
  totalPrice: number;
}) {
  try {
    const client = getResendClient();
    if (!client) {
      console.warn("Resend client not initialized - missing RESEND_API_KEY");
      return { success: false, error: "Email service not configured" };
    }
    const emailData = emailTemplates.preOrderConfirmation(data);
    const response = await client.emails.send(emailData);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending pre-order confirmation:", error);
    return { success: false, error };
  }
}

/**
 * Send pre-order notification to internal team
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
  try {
    const client = getResendClient();
    if (!client) {
      console.warn("Resend client not initialized - missing RESEND_API_KEY");
      return { success: false, error: "Email service not configured" };
    }
    const emailData = emailTemplates.preOrderNotification(data);
    const response = await client.emails.send(emailData);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending pre-order notification:", error);
    return { success: false, error };
  }
}
