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
      name: 'course_enrollment',
      subject: '¡Te has inscrito en {{courseName}}!',
      content: `Hola {{firstName}},

¡Felicitaciones! Te has inscrito exitosamente en el curso "{{courseName}}".

Detalles del curso:
- Curso: {{courseName}}
- Instructor: {{instructorName}}
- Duración: {{courseDuration}}
- Nivel: {{courseLevel}}

Puedes acceder al curso en cualquier momento desde tu panel de usuario.

¡Que tengas un excelente aprendizaje!

El equipo de Nebu`,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Inscripción al curso</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .course-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Inscripción Exitosa!</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{{firstName}}</strong>,</p>
            <p>¡Felicitaciones! Te has inscrito exitosamente en el curso "{{courseName}}".</p>
            
            <div class="course-info">
                <h3>Detalles del curso:</h3>
                <ul>
                    <li><strong>Curso:</strong> {{courseName}}</li>
                    <li><strong>Instructor:</strong> {{instructorName}}</li>
                    <li><strong>Duración:</strong> {{courseDuration}}</li>
                    <li><strong>Nivel:</strong> {{courseLevel}}</li>
                </ul>
            </div>
            
            <p style="text-align: center;">
                <a href="{{courseUrl}}" class="button">Acceder al Curso</a>
            </p>
            
            <p>Puedes acceder al curso en cualquier momento desde tu panel de usuario.</p>
            <p>¡Que tengas un excelente aprendizaje!</p>
        </div>
        <div class="footer">
            <p>El equipo de Nebu</p>
        </div>
    </div>
</body>
</html>`,
      type: EmailTemplateType.COURSE_ENROLLMENT,
      status: EmailTemplateStatus.ACTIVE,
      description: 'Plantilla para confirmación de inscripción a curso',
      variables: '["firstName", "courseName", "instructorName", "courseDuration", "courseLevel", "courseUrl"]',
      previewText: '¡Te has inscrito exitosamente en el curso!',
    },
  ];

  for (const templateData of templates) {
    const existingTemplate = await emailTemplateRepository.findOne({
      where: { name: templateData.name },
    });

    if (!existingTemplate) {
      const template = emailTemplateRepository.create(templateData);
      await emailTemplateRepository.save(template);
      console.log(` Plantilla "${templateData.name}" creada exitosamente`);
    } else {
      console.log(`⚠️ Plantilla "${templateData.name}" ya existe`);
    }
  }

  console.log(' Plantillas de email sembradas exitosamente');
}
