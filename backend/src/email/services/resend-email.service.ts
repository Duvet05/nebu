import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * Servicio de Email usando Resend
 *
 * Resend es un servicio de email moderno y fácil de usar.
 * Características:
 * - API simple y moderna
 * - Templates integrados
 * - Tracking de emails
 * - Webhooks de estado
 * - Free tier: 3,000 emails/mes
 *
 * Para empezar:
 * 1. Crear cuenta en https://resend.com/
 * 2. Obtener API key
 * 3. Verificar dominio (o usar onboarding@resend.dev en desarrollo)
 * 4. Configurar RESEND_API_KEY en .env
 */
@Injectable()
export class ResendEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private resend: Resend | null = null;
  private readonly enabled: boolean;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
    this.fromName = this.configService.get<string>('RESEND_FROM_NAME') || 'Nebu';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.enabled = true;
      this.logger.log('✅ Resend email service initialized');
    } else {
      this.enabled = false;
      this.logger.warn('⚠️  Resend is not configured. Set RESEND_API_KEY in .env');
    }
  }

  /**
   * Verifica si el servicio está habilitado
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Envía un email básico
   */
  async sendEmail(data: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string; // Email from address (optional, uses default if not provided)
    fromName?: string; // From name (optional, uses default if not provided)
    replyTo?: string;
    tags?: { name: string; value: string }[];
  }): Promise<{ id: string; success: boolean }> {
    if (!this.enabled || !this.resend) {
      throw new Error('Resend email service is not configured');
    }

    try {
      // Use provided from address or default
      const fromEmail = data.from || this.fromEmail;
      const fromName = data.fromName || this.fromName;
      const fromField = `${fromName} <${fromEmail}>`;

      this.logger.log(`Sending email from: ${fromField} to: ${data.to}`);

      // Detect if this is a newsletter (por convención: subject o tags)
      const isNewsletter = (data.subject && data.subject.toLowerCase().includes('newsletter')) || (data.tags && data.tags.some(t => t.name === 'category' && t.value === 'newsletter'));

      // Construir headers personalizados
      let headers: Record<string, string> = {};
      if (isNewsletter && typeof data.to === 'string') {
        // List-Unsubscribe header (mailto y link)
        const unsubscribeMail = `mailto:unsubscribe@flow-telligence.com?subject=Unsubscribe`;
        const unsubscribeUrl = `https://flow-telligence.com/unsubscribe?email=${encodeURIComponent(data.to)}`;
        headers['List-Unsubscribe'] = `<${unsubscribeMail}>, <${unsubscribeUrl}>`;
        headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
        headers['Feedback-ID'] = `newsletter.flow-telligence.com`;
      }

      // Log headers si existen
      if (Object.keys(headers).length > 0) {
        this.logger.log(`Custom email headers: ${JSON.stringify(headers)}`);
      }

      // Enviar email con headers personalizados si hay
      const result = await this.resend.emails.send({
        from: fromField,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        replyTo: data.replyTo,
        tags: data.tags,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });

      if (result.error) {
        this.logger.error('Resend error:', result.error);
        throw new Error(result.error.message);
      }

      this.logger.log(`Email sent successfully: ${result.data?.id}`);
      if (result.data?.id) {
        this.logger.log(`Message-ID: ${result.data.id}`);
      }
      return { id: result.data?.id || '', success: true };
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Email de bienvenida
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<{ id: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 40px 20px; background: #fff; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a Nebu!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Gracias por registrarte en Nebu. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
              <p>Con Nebu, tus hijos podrán aprender y divertirse con nuestros compañeros IoT inteligentes.</p>
              <p style="text-align: center;">
                <a href="${this.configService.get('FRONTEND_URL')}/dashboard" class="button">Explorar Nebu</a>
              </p>
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <p>¡Saludos!<br>El equipo de Nebu</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático, por favor no responda a este correo.</p>
              <p>© ${new Date().getFullYear()} Nebu - Flow-telligence. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '¡Bienvenido a Nebu!',
      html,
      tags: [
        { name: 'type', value: 'welcome' },
        { name: 'user_name', value: userName },
      ],
    });
  }

  /**
   * Email de confirmación de orden
   */
  async sendOrderConfirmationEmail(
    userEmail: string,
    orderNumber: string,
    productName: string,
    amount: number,
  ): Promise<{ id: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 40px 20px; background: #fff; }
            .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .order-details table { width: 100%; }
            .order-details td { padding: 8px 0; }
            .total { font-size: 18px; font-weight: bold; color: #10b981; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ ¡Pedido Confirmado!</h1>
            </div>
            <div class="content">
              <p>Tu pedido ha sido confirmado exitosamente.</p>

              <div class="order-details">
                <h3>Detalles del Pedido</h3>
                <table>
                  <tr>
                    <td>Número de Pedido:</td>
                    <td><strong>#${orderNumber}</strong></td>
                  </tr>
                  <tr>
                    <td>Producto:</td>
                    <td>${productName}</td>
                  </tr>
                  <tr>
                    <td class="total">Total:</td>
                    <td class="total">S/ ${amount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <p>Te notificaremos cuando tu pedido sea enviado.</p>
              <p>Puedes ver el estado de tu pedido en tu cuenta.</p>
            </div>
            <div class="footer">
              <p>Gracias por tu compra</p>
              <p>© ${new Date().getFullYear()} Nebu. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Pedido confirmado - #${orderNumber}`,
      html,
      tags: [
        { name: 'type', value: 'order_confirmation' },
        { name: 'order_number', value: orderNumber },
      ],
    });
  }

  /**
   * Email de confirmación de pago
   */
  async sendPaymentConfirmationEmail(
    userEmail: string,
    amount: number,
    orderNumber: string,
  ): Promise<{ id: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 40px 20px; background: #fff; }
            .payment-box { background: #eff6ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .amount { font-size: 32px; font-weight: bold; color: #3b82f6; margin: 10px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Pago Confirmado</h1>
            </div>
            <div class="content">
              <p>Tu pago ha sido procesado exitosamente.</p>

              <div class="payment-box">
                <p style="margin: 0; color: #64748b;">Monto pagado</p>
                <div class="amount">S/ ${amount.toFixed(2)}</div>
                <p style="margin: 0; color: #64748b;">Pedido #${orderNumber}</p>
              </div>

              <p>Recibirás un email cuando tu pedido sea enviado.</p>
              <p>Gracias por tu compra.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nebu. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Pago confirmado - Pedido #${orderNumber}`,
      html,
      tags: [
        { name: 'type', value: 'payment_confirmation' },
        { name: 'order_number', value: orderNumber },
        { name: 'amount', value: amount.toString() },
      ],
    });
  }

  /**
   * Email de pedido enviado
   */
  async sendOrderShippedEmail(
    userEmail: string,
    orderNumber: string,
    trackingNumber?: string,
  ): Promise<{ id: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 40px 20px; background: #fff; }
            .tracking { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .tracking-number { font-size: 24px; font-weight: bold; color: #f59e0b; font-family: monospace; margin: 10px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 ¡Tu pedido va en camino!</h1>
            </div>
            <div class="content">
              <p>Tu pedido <strong>#${orderNumber}</strong> ha sido enviado.</p>

              ${
                trackingNumber
                  ? `
              <div class="tracking">
                <p style="margin: 0;">Número de seguimiento</p>
                <div class="tracking-number">${trackingNumber}</div>
                <p style="margin: 0; color: #92400e; font-size: 12px;">Usa este número para rastrear tu paquete</p>
              </div>
              `
                  : ''
              }

              <p>Tu pedido llegará pronto. ¡Estamos emocionados de que pruebes Nebu!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nebu. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Tu pedido #${orderNumber} ha sido enviado`,
      html,
      tags: [
        { name: 'type', value: 'order_shipped' },
        { name: 'order_number', value: orderNumber },
      ],
    });
  }

  /**
   * Email de restablecimiento de contraseña
   */
  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<{ id: string }> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 40px 20px; background: #fff; }
            .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; color: #991b1b; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Restablecer Contraseña</h1>
            </div>
            <div class="content">
              <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>

              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </p>

              <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas.
              </div>

              <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nebu. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Restablecer contraseña - Nebu',
      html,
      tags: [{ name: 'type', value: 'password_reset' }],
    });
  }

  /**
   * Email de notificación genérica
   */
  async sendNotificationEmail(data: {
    to: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  }): Promise<{ id: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 40px 20px; background: #fff; }
            .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title}</h1>
            </div>
            <div class="content">
              ${data.message}
              ${
                data.actionUrl && data.actionText
                  ? `
                <p style="text-align: center;">
                  <a href="${data.actionUrl}" class="button">${data.actionText}</a>
                </p>
              `
                  : ''
              }
            </div>
            <div class="footer">
              <p>Este es un mensaje automático, por favor no responda a este correo.</p>
              <p>© ${new Date().getFullYear()} Nebu. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: data.title,
      html,
      tags: [{ name: 'type', value: 'notification' }],
    });
  }
}
