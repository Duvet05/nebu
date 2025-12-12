import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from '../../email/entities/email-template.entity';

const logger = new Logger('EmailTemplatesSeeder');

/**
 * Seed Email Templates
 *
 * Creates email templates for various use cases:
 * - Newsletter welcome
 * - Order confirmations
 * - Pre-order confirmations
 * - System notifications
 */
export async function seedEmailTemplates(dataSource: DataSource) {
  logger.log('📧 Seeding Email Templates...');

  const templateRepo = dataSource.getRepository(EmailTemplate);

  const templates = [
    {
      name: 'newsletter-welcome',
      subject: '¡Bienvenido a Nebu! 🦖',
      type: EmailTemplateType.NEWSLETTER,
      description: 'Email de bienvenida para nuevos suscriptores del newsletter',
      status: EmailTemplateStatus.ACTIVE,
      isActive: true,
      previewText: 'Gracias por suscribirte al newsletter de Nebu',
      variables: JSON.stringify({
        email: 'Email del suscriptor',
        name: 'Nombre del suscriptor (opcional)',
      }),
      content: `Hola {{name}},

¡Gracias por suscribirte al newsletter de Nebu!

Te mantendremos informado sobre:
- Novedades y actualizaciones de productos
- Ofertas especiales y pre-ordenes
- Consejos y trucos para aprovechar al máximo tu Nebu
- Contenido exclusivo para nuestra comunidad

¡Bienvenido a la familia Nebu!

El equipo de Nebu - Flow-telligence`,
      htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .logo { font-size: 48px; margin-bottom: 10px; }
      .content { padding: 40px 30px; }
      .welcome-box { background: #f8f9ff; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin: 25px 0; }
      .features { margin: 30px 0; }
      .feature-item { display: flex; align-items: start; margin-bottom: 20px; }
      .feature-icon { font-size: 24px; margin-right: 15px; }
      .feature-text { flex: 1; }
      .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 6px; margin: 25px 0; font-weight: bold; }
      .footer { padding: 30px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; border-radius: 0 0 8px 8px; }
      .footer-links { margin: 15px 0; }
      .footer-links a { color: #667eea; text-decoration: none; margin: 0 10px; }
      h2 { color: #333; margin-top: 0; }
      .highlight { color: #667eea; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🦖</div>
        <h1 style="margin: 0; font-size: 32px;">¡Bienvenido a Nebu!</h1>
      </div>

      <div class="content">
        <div class="welcome-box">
          <p style="margin: 0; font-size: 18px;">
            <strong>Hola {{name}},</strong>
          </p>
          <p style="margin: 10px 0 0 0;">
            ¡Gracias por unirte a nuestra comunidad! 🎉
          </p>
        </div>

        <h2>¿Qué puedes esperar de nosotros?</h2>

        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">🚀</div>
            <div class="feature-text">
              <strong>Novedades y Actualizaciones</strong><br>
              Sé el primero en conocer las nuevas características y productos
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">💎</div>
            <div class="feature-text">
              <strong>Ofertas Especiales</strong><br>
              Acceso anticipado a pre-ordenes y descuentos exclusivos
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">📚</div>
            <div class="feature-text">
              <strong>Consejos y Trucos</strong><br>
              Aprende a sacar el máximo provecho de tu Nebu Dino
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">🎁</div>
            <div class="feature-text">
              <strong>Contenido Exclusivo</strong><br>
              Recursos y contenido disponible solo para suscriptores
            </div>
          </div>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://flow-telligence.com/productos" class="button">Explorar Productos</a>
        </p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Estamos emocionados de tenerte en nuestra familia. Si tienes alguna pregunta,
          no dudes en contactarnos respondiendo a este correo.
        </p>

        <p style="margin-top: 30px;">
          <strong>¡Gracias por confiar en Nebu!</strong><br>
          El equipo de <span class="highlight">Flow-telligence</span>
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0 0 10px 0;">
          <strong>Nebu - Flow-telligence</strong>
        </p>
        <div class="footer-links">
          <a href="https://flow-telligence.com">Sitio Web</a> |
          <a href="https://flow-telligence.com/productos">Productos</a> |
          <a href="https://flow-telligence.com/contacto">Contacto</a>
        </div>
        <p style="margin: 15px 0 5px 0; color: #999;">
          Recibiste este email porque te suscribiste al newsletter de Nebu
        </p>
        <p style="margin: 5px 0;">
          <a href="{{unsubscribeUrl}}" style="color: #999;">Cancelar suscripción</a>
        </p>
        <p style="margin: 15px 0 0 0;">
          © {{year}} Nebu - Flow-telligence. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </body>
</html>`
    },
    {
      name: 'pre-order-confirmation',
      subject: '✅ Pre-orden Confirmada - Nebu Dino',
      type: EmailTemplateType.PREORDER_AVAILABLE,
      description: 'Confirmación de pre-orden para el cliente',
      status: EmailTemplateStatus.ACTIVE,
      isActive: true,
      previewText: 'Tu pre-orden ha sido confirmada exitosamente',
      variables: JSON.stringify({
        firstName: 'Nombre del cliente',
        lastName: 'Apellido del cliente',
        productName: 'Nombre del producto',
        color: 'Color seleccionado',
        quantity: 'Cantidad',
        totalPrice: 'Precio total',
      }),
      content: `Hola {{firstName}} {{lastName}},

¡Gracias por tu pre-orden de Nebu Dino!

DETALLES DE TU PEDIDO:
- Producto: {{productName}}
- Color: {{color}}
- Cantidad: {{quantity}}
- Total: S/ {{totalPrice}}

MODALIDAD DE PRE-ORDEN (50%)
- A pagar ahora: S/ {{reserveAmount}}
- Saldo al entregar: S/ {{remainingAmount}}

Pronto te enviaremos las instrucciones de pago para completar tu reserva.

¡Gracias por confiar en Nebu!

El equipo de Nebu - Flow-telligence`,
      htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
      .content { padding: 40px 30px; }
      .order-box { background: #f0fdf4; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0; }
      .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
      .detail-label { color: #6b7280; }
      .detail-value { font-weight: bold; color: #111827; }
      .payment-box { background: #eff6ff; padding: 25px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0; }
      .amount { font-size: 28px; font-weight: bold; color: #3b82f6; margin: 10px 0; }
      .footer { padding: 30px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; }
      .checkmark { font-size: 48px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="checkmark">✅</div>
        <h1 style="margin: 10px 0 0 0; font-size: 28px;">¡Pre-orden Confirmada!</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px;">Hola <strong>{{firstName}} {{lastName}}</strong>,</p>
        <p>¡Gracias por tu pre-orden! Tu pedido ha sido registrado exitosamente.</p>
        <div class="order-box">
          <h3 style="margin-top: 0; color: #10b981;">📦 Detalles de tu Pedido</h3>
          <div class="detail-row"><span class="detail-label">Producto</span><span class="detail-value">{{productName}}</span></div>
          <div class="detail-row"><span class="detail-label">Color</span><span class="detail-value">{{color}}</span></div>
          <div class="detail-row"><span class="detail-label">Cantidad</span><span class="detail-value">{{quantity}}</span></div>
          <div class="detail-row" style="border-bottom: none;"><span class="detail-label" style="font-size: 18px; color: #111827;">Total</span><span class="detail-value" style="font-size: 20px; color: #10b981;">S/ {{totalPrice}}</span></div>
        </div>
        <div class="payment-box">
          <h3 style="margin-top: 0; color: #3b82f6;">💰 Modalidad de Pre-orden (50%)</h3>
          <p style="margin: 0 0 10px 0;"><strong>A pagar ahora (reserva):</strong></p>
          <div class="amount">S/ {{reserveAmount}}</div>
          <p style="margin: 10px 0 0 0; color: #6b7280;">Saldo al entregar: <strong>S/ {{remainingAmount}}</strong></p>
        </div>
        <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;"><strong>📧 Próximos pasos:</strong><br>Te enviaremos un correo con las instrucciones de pago para completar tu reserva.</p>
        <p style="margin-top: 30px;"><strong>¡Gracias por confiar en Nebu!</strong><br>El equipo de Flow-telligence</p>
      </div>
      <div class="footer">
        <p style="margin: 0;">© {{year}} Nebu - Flow-telligence. Todos los derechos reservados.</p>
      </div>
    </div>
  </body>
</html>`,
    },
    {
      name: 'order-confirmation',
      subject: '📦 Confirmación de Orden - Nebu Dino',
      type: EmailTemplateType.ORDER_CONFIRMATION,
      description: 'Confirmación de orden completa (checkout)',
      status: EmailTemplateStatus.ACTIVE,
      isActive: true,
      previewText: 'Tu orden ha sido confirmada',
      variables: JSON.stringify({
        firstName: 'Nombre del cliente',
        lastName: 'Apellido del cliente',
        orderId: 'ID de la orden',
        itemsList: 'Lista de items renderizada',
        subtotal: 'Subtotal',
        total: 'Total',
        reserveAmount: 'Monto de reserva',
        remainingAmount: 'Saldo restante',
        address: 'Dirección de envío',
        city: 'Ciudad',
        postalCode: 'Código postal',
        phone: 'Teléfono',
        year: 'Año actual',
      }),
      content: `Hola {{firstName}} {{lastName}},

¡Gracias por tu orden!

PEDIDO #{{orderId}}
{{itemsList}}

Subtotal: S/ {{subtotal}}
Envío: GRATIS
Total: S/ {{total}}

MODALIDAD DE PRE-ORDEN (50%)
A pagar ahora: S/ {{reserveAmount}}
Saldo al entregar: S/ {{remainingAmount}}

DIRECCIÓN DE ENVÍO
{{address}}
{{city}}, {{postalCode}}
📱 {{phone}}

Te enviaremos un enlace de pago para completar la reserva.

¡Gracias por confiar en Nebu!

El equipo de Nebu - Flow-telligence`,
      htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 40px 20px; text-align: center; }
      .content { padding: 40px 30px; }
      .order-number { background: #dbeafe; color: #1e40af; padding: 10px 20px; border-radius: 6px; display: inline-block; font-weight: bold; margin: 10px 0; }
      .summary-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
      .summary-total { font-size: 20px; font-weight: bold; color: #111827; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px; }
      .payment-highlight { background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
      .address-box { background: #f0fdfa; padding: 20px; border-radius: 8px; border-left: 4px solid #14b8a6; margin: 20px 0; }
      .footer { padding: 30px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div style="font-size: 48px; margin-bottom: 10px;">📦</div>
        <h1 style="margin: 0; font-size: 28px;">Confirmación de Pre-orden</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px;">Hola <strong>{{firstName}} {{lastName}}</strong>,</p>
        <p>¡Gracias por tu pre-orden! Aquí están los detalles:</p>
        <div style="text-align: center; margin: 20px 0;"><div class="order-number">Pedido #{{orderId}}</div></div>
        <h3 style="color: #111827; margin-top: 30px;">📋 Productos</h3>
        <div style="margin: 20px 0;">{{itemsList}}</div>
        <div class="summary-box">
          <div class="summary-row"><span>Subtotal</span><span>S/ {{subtotal}}</span></div>
          <div class="summary-row"><span>Envío</span><span style="color: #10b981; font-weight: bold;">GRATIS</span></div>
          <div class="summary-row summary-total"><span>Total</span><span>S/ {{total}}</span></div>
        </div>
        <div class="payment-highlight">
          <h3 style="margin-top: 0; color: #3b82f6;">💰 Modalidad de Pre-orden (50%)</h3>
          <div style="font-size: 18px; margin: 15px 0;"><strong>A pagar ahora:</strong> <span style="font-size: 24px; color: #3b82f6; font-weight: bold;">S/ {{reserveAmount}}</span></div>
          <div style="color: #6b7280;">Saldo al entregar: <strong>S/ {{remainingAmount}}</strong></div>
        </div>
        <div class="address-box">
          <h3 style="margin-top: 0; color: #14b8a6;">📍 Dirección de Envío</h3>
          <p style="margin: 5px 0;">{{address}}</p>
          <p style="margin: 5px 0;">{{city}}, {{postalCode}}</p>
          <p style="margin: 5px 0;">📱 {{phone}}</p>
        </div>
        <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 30px 0;"><strong>📧 Próximos pasos:</strong><br>Te enviaremos un enlace de pago para completar la reserva del 50%.</p>
        <p style="margin-top: 30px;"><strong>¡Gracias por confiar en Nebu!</strong><br>El equipo de Flow-telligence</p>
      </div>
      <div class="footer">
        <p style="margin: 0;">© {{year}} Nebu - Flow-telligence. Todos los derechos reservados.</p>
      </div>
    </div>
  </body>
</html>`,
    },
  ];

  try {
    for (const templateData of templates) {
      const existing = await templateRepo.findOne({ where: { name: templateData.name } });

      if (!existing) {
        logger.log(`  → Creating template: ${templateData.name}...`);
        const template = templateRepo.create(templateData);
        await templateRepo.save(template);
        logger.log(`  ✅ Template ${templateData.name} created`);
      } else {
        logger.log(`  ℹ️ Template ${templateData.name} already exists`);
      }
    }

    logger.log('✅ Email templates seeding completed');
  } catch (error) {
    logger.error('❌ Error seeding email templates:', error);
    throw error;
  }
}
