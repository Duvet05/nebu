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
    // ...otros templates omitidos por brevedad...
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
