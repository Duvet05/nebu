import { DataSource } from 'typeorm';
import { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from '../entities/email-template.entity';

export async function seedEmailTemplates(dataSource: DataSource) {
  const emailTemplateRepository = dataSource.getRepository(EmailTemplate);

  const templates = [
    {
      name: 'welcome',
      subject: '¡Bienvenido a Nebu!',
      content: `Hola {{firstName}},

¡Bienvenido a Nebu! Estamos emocionados de tenerte como parte de nuestra comunidad.

Tu cuenta ha sido creada exitosamente:
- Email: {{email}}
- Usuario: {{username}}

Para comenzar, te recomendamos:
1. Completar tu perfil
2. Explorar nuestros cursos disponibles
3. Unirte a nuestra comunidad

Si tienes alguna pregunta, no dudes en contactarnos.

¡Bienvenido a bordo!

El equipo de Nebu`,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>¡Bienvenido a Nebu!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a Nebu!</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{{firstName}}</strong>,</p>
            <p>¡Bienvenido a Nebu! Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
            
            <p>Tu cuenta ha sido creada exitosamente:</p>
            <ul>
                <li>Email: {{email}}</li>
                <li>Usuario: {{username}}</li>
            </ul>
            
            <p>Para comenzar, te recomendamos:</p>
            <ol>
                <li>Completar tu perfil</li>
                <li>Explorar nuestros cursos disponibles</li>
                <li>Unirte a nuestra comunidad</li>
            </ol>
            
            <p style="text-align: center;">
                <a href="{{loginUrl}}" class="button">Comenzar Ahora</a>
            </p>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>¡Bienvenido a bordo!</p>
        </div>
        <div class="footer">
            <p>El equipo de Nebu</p>
        </div>
    </div>
</body>
</html>`,
      type: EmailTemplateType.WELCOME,
      status: EmailTemplateStatus.ACTIVE,
      description: 'Plantilla de bienvenida para nuevos usuarios',
      variables: '["firstName", "email", "username", "loginUrl"]',
      previewText: '¡Bienvenido a Nebu! Tu cuenta ha sido creada exitosamente.',
    },
    {
      name: 'password_reset',
      subject: 'Restablecer contraseña - Nebu',
      content: `Hola {{firstName}},

Hemos recibido una solicitud para restablecer tu contraseña.

Para crear una nueva contraseña, haz clic en el siguiente enlace:
{{resetUrl}}

Este enlace expirará en {{expirationTime}} horas.

Si no solicitaste este cambio, puedes ignorar este email.

El equipo de Nebu`,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Restablecer contraseña</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .warning { background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Restablecer Contraseña</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{{firstName}}</strong>,</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
            
            <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
            <p style="text-align: center;">
                <a href="{{resetUrl}}" class="button">Restablecer Contraseña</a>
            </p>
            
            <div class="warning">
                <p><strong>Importante:</strong> Este enlace expirará en {{expirationTime}} horas.</p>
            </div>
            
            <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        </div>
        <div class="footer">
            <p>El equipo de Nebu</p>
        </div>
    </div>
</body>
</html>`,
      type: EmailTemplateType.PASSWORD_RESET,
      status: EmailTemplateStatus.ACTIVE,
      description: 'Plantilla para restablecer contraseña',
      variables: '["firstName", "resetUrl", "expirationTime"]',
      previewText: 'Restablece tu contraseña de Nebu',
    },
    {
      name: 'order_confirmation',
      subject: 'Pedido confirmado #{{orderNumber}}',
      content: `Hola {{firstName}},

¡Tu pedido ha sido confirmado!

Detalles del pedido:
- Número de pedido: {{orderNumber}}
- Producto: {{productName}}
- Total: \${{totalAmount}}

Te notificaremos cuando tu pedido sea enviado.

Gracias por tu compra,
El equipo de Nebu`,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pedido confirmado</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .order-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Pedido Confirmado!</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{{firstName}}</strong>,</p>
            <p>Tu pedido <strong>#{{orderNumber}}</strong> ha sido confirmado.</p>

            <div class="order-info">
                <h3>Detalles del pedido:</h3>
                <ul>
                    <li><strong>Pedido:</strong> #{{orderNumber}}</li>
                    <li><strong>Producto:</strong> {{productName}}</li>
                    <li><strong>Total:</strong> \${{totalAmount}}</li>
                </ul>
            </div>

            <p style="text-align: center;">
                <a href="{{orderUrl}}" class="button">Ver Mi Pedido</a>
            </p>

            <p>Te notificaremos cuando tu pedido sea enviado.</p>
            <p>Gracias por tu compra!</p>
        </div>
        <div class="footer">
            <p>El equipo de Nebu</p>
        </div>
    </div>
</body>
</html>`,
      type: EmailTemplateType.ORDER_CONFIRMATION,
      status: EmailTemplateStatus.ACTIVE,
      description: 'Plantilla para confirmación de pedido',
      variables: '["firstName", "orderNumber", "productName", "totalAmount", "orderUrl"]',
      previewText: '¡Tu pedido ha sido confirmado!',
    },
  ];

  for (const templateData of templates) {
    const existingTemplate = await emailTemplateRepository.findOne({
      where: { name: templateData.name },
    });

    if (!existingTemplate) {
      const template = emailTemplateRepository.create(templateData);
      await emailTemplateRepository.save(template);
      // eslint-disable-next-line no-console
      console.log(` Plantilla "${templateData.name}" creada exitosamente`);
    } else {
      // eslint-disable-next-line no-console
      console.log(` Plantilla "${templateData.name}" ya existe`);
    }
  }

  // eslint-disable-next-line no-console
  console.log(' Plantillas de email sembradas exitosamente');
}
