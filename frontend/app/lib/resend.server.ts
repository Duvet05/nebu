import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || "Nebu <noreply@flow-telligence.com>";
const EMAIL_TO = process.env.EMAIL_TO || "ordenes@flow-telligence.com";

// Email templates
export const emailTemplates = {
  /**
   * Welcome email for newsletter subscribers
   */
  newsletterWelcome: (email: string) => ({
    from: EMAIL_FROM,
    to: email,
    subject: "¡Bienvenido a Nebu! 🤖",
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
              <div class="emoji">🤖✨</div>
              <h1 style="margin: 0;">¡Bienvenido a la familia Nebu!</h1>
            </div>
            <div class="content">
              <p>¡Hola!</p>

              <p>Nos emociona muchísimo que te unas a nuestra comunidad. Nebu es más que un juguete, es un compañero que transformará el aprendizaje de los más pequeños en aventuras mágicas sin pantallas.</p>

              <p><strong>¿Qué puedes esperar?</strong></p>
              <ul>
                <li>🎁 Acceso anticipado a ofertas especiales</li>
                <li>📚 Contenido exclusivo sobre educación sin pantallas</li>
                <li>🌟 Las últimas novedades sobre Nebu</li>
                <li>💡 Tips de crianza y desarrollo infantil</li>
              </ul>

              <p style="text-align: center;">
                <a href="https://flow-telligence.com/pre-order" class="button">
                  Pre-ordena tu Nebu con descuento
                </a>
              </p>

              <p>Si tienes alguna pregunta, simplemente responde a este email. ¡Estamos aquí para ayudarte!</p>

              <p>Con cariño,<br>
              <strong>El equipo de Nebu</strong></p>
            </div>
            <div class="footer">
              <p>Flow-telligence | Lima, Perú</p>
              <p>Has recibido este email porque te suscribiste en flow-telligence.com</p>
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
    subject: "¡Pre-orden confirmada! 🎉 - Nebu",
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
              <div class="emoji">🎉✨</div>
              <h1 style="margin: 0;">¡Pre-orden confirmada!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.firstName}</strong>,</p>

              <p>¡Gracias por pre-ordenar tu Nebu! Eres parte de algo especial. 🚀</p>

              <div class="order-details">
                <h3>Detalles de tu pre-orden:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li>📦 <strong>Producto:</strong> Nebu IoT Companion</li>
                  <li>🎨 <strong>Color:</strong> ${data.color}</li>
                  <li>🔢 <strong>Cantidad:</strong> ${data.quantity}</li>
                  <li class="price">💰 <strong>Total:</strong> S/${data.totalPrice}</li>
                </ul>
              </div>

              <p><strong>¿Qué sigue?</strong></p>
              <ol>
                <li>Nuestro equipo revisará tu pre-orden en las próximas 24 horas</li>
                <li>Te enviaremos instrucciones de pago</li>
                <li>Una vez confirmado el pago, ¡tu Nebu entrará en producción!</li>
                <li>Envío estimado: 6-8 semanas</li>
              </ol>

              <p>🎁 <strong>Beneficios de pre-orden:</strong></p>
              <ul>
                <li>✅ 33% de descuento (S/300 en vez de S/450)</li>
                <li>✅ Envío gratis a todo Perú</li>
                <li>✅ Contenido exclusivo para early adopters</li>
                <li>✅ Soporte prioritario</li>
              </ul>

              <p>Si tienes alguna pregunta, responde a este email o escríbenos por WhatsApp al +51 970 116 770.</p>

              <p>¡Gracias por confiar en Nebu!</p>

              <p>Con mucho cariño,<br>
              <strong>El equipo de Nebu</strong></p>
            </div>
            <div class="footer">
              <p>Flow-telligence | Lima, Perú</p>
              <p>Pre-orden realizada en flow-telligence.com</p>
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
    subject: `🎉 Nueva Pre-orden: ${data.firstName} ${data.lastName}`,
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
              <h2 style="margin: 0;">🎉 Nueva Pre-orden Recibida</h2>
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
                <p><strong>Producto:</strong> Nebu IoT Companion</p>
                <p><strong>Color:</strong> ${data.color}</p>
                <p><strong>Cantidad:</strong> ${data.quantity}</p>
                <p><strong>Método de pago:</strong> ${data.paymentMethod}</p>
                <p class="price"><strong>Total:</strong> S/${data.totalPrice}</p>
              </div>

              <p><strong>Próximos pasos:</strong></p>
              <ol>
                <li>Contactar al cliente para confirmar pago</li>
                <li>Enviar instrucciones de pago</li>
                <li>Marcar pedido como confirmado en el sistema</li>
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
    const emailData = emailTemplates.newsletterWelcome(email);
    const response = await resend.emails.send(emailData);
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
    const emailData = emailTemplates.preOrderConfirmation(data);
    const response = await resend.emails.send(emailData);
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
    const emailData = emailTemplates.preOrderNotification(data);
    const response = await resend.emails.send(emailData);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending pre-order notification:", error);
    return { success: false, error };
  }
}
