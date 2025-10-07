import nodemailer from "nodemailer";

interface PreOrderData {
  name: string;
  email: string;
  phone: string;
  color: string;
  quantity: number;
  address: string;
  notes?: string;
}

// Configurar el transporter de nodemailer
// NOTA: Debes configurar las variables de entorno en .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPreOrderEmail(data: PreOrderData) {
  const { name, email, phone, color, quantity, address, notes } = data;

  // Email al equipo de Flow-telligence
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Nebu - Flow-telligence" <noreply@flow-telligence.com>',
    to: process.env.EMAIL_TO || "ordenes@flow-telligence.com",
    subject: `Nueva Pre-orden de Nebu - ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Nueva Pre-orden de Nebu</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Detalles del Cliente</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Nombre:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Teléfono:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${phone}</td>
            </tr>
          </table>

          <h2 style="color: #1f2937; margin-top: 30px;">Detalles del Pedido</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Color:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${color}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Cantidad:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${quantity}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Precio Total:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">S/ ${quantity * 300}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Dirección:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${address}</td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Notas:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${notes}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Flow-telligence © 2025 - Educación sin pantallas para el futuro</p>
        </div>
      </div>
    `,
  });

  // Email de confirmación al cliente
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Nebu - Flow-telligence" <noreply@flow-telligence.com>',
    to: email,
    subject: "¡Pre-orden confirmada! - Nebu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">¡Gracias por tu pre-orden!</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #1f2937;">Hola ${name},</p>

          <p style="font-size: 16px; color: #1f2937;">
            ¡Estamos emocionados de que hayas pre-ordenado tu Nebu! Tu pedido ha sido recibido exitosamente.
          </p>

          <h2 style="color: #1f2937;">Resumen de tu pedido:</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Color:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${color}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Cantidad:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${quantity}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Total:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>S/ ${quantity * 300}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Tiempo de envío:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">6-8 semanas</td>
            </tr>
          </table>

          <p style="font-size: 16px; color: #1f2937;">
            Pronto nos pondremos en contacto contigo para confirmar los detalles de pago y envío.
          </p>

          <p style="font-size: 16px; color: #1f2937;">
            Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este email.
          </p>

          <p style="font-size: 16px; color: #1f2937; margin-top: 30px;">
            ¡Gracias por confiar en Nebu!<br/>
            El equipo de Flow-telligence
          </p>
        </div>

        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Flow-telligence © 2025 - Educación sin pantallas para el futuro</p>
          <p>
            <a href="https://flow-telligence.com" style="color: #FF6B35;">flow-telligence.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const { name, email, subject, message } = data;

  // Email al equipo
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Nebu - Flow-telligence" <noreply@flow-telligence.com>',
    to: process.env.EMAIL_TO || "contacto@flow-telligence.com",
    replyTo: email,
    subject: `Contacto Web: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Nuevo mensaje de contacto</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Nombre:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Asunto:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${subject}</td>
            </tr>
          </table>

          <h2 style="color: #1f2937; margin-top: 30px;">Mensaje:</h2>
          <div style="padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #FF6B35;">
            <p style="color: #1f2937; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      </div>
    `,
  });

  // Confirmación al remitente
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Nebu - Flow-telligence" <noreply@flow-telligence.com>',
    to: email,
    subject: "Hemos recibido tu mensaje - Nebu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">¡Gracias por contactarnos!</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #1f2937;">Hola ${name},</p>

          <p style="font-size: 16px; color: #1f2937;">
            Hemos recibido tu mensaje y te responderemos lo antes posible.
          </p>

          <p style="font-size: 16px; color: #1f2937; margin-top: 30px;">
            Saludos,<br/>
            El equipo de Flow-telligence
          </p>
        </div>

        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Flow-telligence © 2025</p>
        </div>
      </div>
    `,
  });
}
