import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailAccount, EmailAccountType, EmailType } from '../entities/email-account.entity';
import { EmailLog, EmailStatus } from '../entities/email-log.entity';
import { EmailProviderService } from './email-provider.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailProviderService: EmailProviderService,
    @InjectRepository(EmailLog)
    private emailLogRepository: Repository<EmailLog>,
  ) {}

  // ===== EMAIL SENDING =====

  async sendEmail(data: {
    to: string | string[];
    subject: string;
    content: string;
    type: EmailType;
    accountType?: EmailAccountType;
    metadata?: Record<string, any>;
    isHtml?: boolean;
  }): Promise<EmailLog> {
    let emailLog: EmailLog | null = null;
    
    try {
      // Get email account
      const account = await this.getEmailAccount(data.accountType || EmailAccountType.TEAM);
      
      // Create email log
      emailLog = this.emailLogRepository.create({
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        content: data.content,
        type: data.type,
        accountId: account.id,
        metadata: data.metadata,
        status: EmailStatus.PENDING,
      });

      await this.emailLogRepository.save(emailLog);

      // Send email
      await this.sendWithAccount(account, {
        to: data.to,
        subject: data.subject,
        content: data.content,
        isHtml: data.isHtml || false,
      });

      // Update log status
      emailLog.status = EmailStatus.SENT;
      emailLog.sentAt = new Date();
      await this.emailLogRepository.save(emailLog);

      // Increment sent count
      await this.emailProviderService.incrementSentCount(account.id);

      this.logger.log(`Email sent successfully to ${data.to} (${data.type})`);
      return emailLog;

    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      
      // Update log with error
      if (emailLog) {
        emailLog.status = EmailStatus.FAILED;
        emailLog.errorMessage = error.message;
        await this.emailLogRepository.save(emailLog);
      }

      throw error;
    }
  }

  // ===== TEMPLATE EMAILS =====

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailLog> {
    const content = `
      <h1>¡Bienvenido a Nebu!</h1>
      <p>Hola ${userName},</p>
      <p>Gracias por registrarte en nuestra plataforma. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
      <p>¡Comienza tu viaje de aprendizaje hoy!</p>
      <p>Saludos,<br>El equipo de Nebu</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '¡Bienvenido a Nebu!',
      content,
      type: EmailType.WELCOME,
      accountType: EmailAccountType.TEAM,
      isHtml: true,
      metadata: { userName, userEmail },
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<EmailLog> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    
    const content = `
      <h1>Restablecer contraseña</h1>
      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
      <p>Este enlace expirará en 24 horas.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Restablecer contraseña - Nebu',
      content,
      type: EmailType.PASSWORD_RESET,
      accountType: EmailAccountType.NOREPLY,
      isHtml: true,
      metadata: { resetToken, userEmail },
    });
  }

  async sendOrderConfirmationEmail(
    userEmail: string,
    orderNumber: string,
    productName: string,
    amount: number
  ): Promise<EmailLog> {
    const content = `
      <h1>¡Pedido confirmado!</h1>
      <p>Tu pedido <strong>#${orderNumber}</strong> ha sido confirmado.</p>
      <p>Producto: <strong>${productName}</strong></p>
      <p>Total: <strong>$${amount.toFixed(2)}</strong></p>
      <p>Te notificaremos cuando tu pedido sea enviado.</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Pedido confirmado - #${orderNumber}`,
      content,
      type: EmailType.ORDER_CONFIRMATION,
      accountType: EmailAccountType.NOREPLY,
      isHtml: true,
      metadata: { orderNumber, productName, amount, userEmail },
    });
  }

  async sendPaymentConfirmationEmail(
    userEmail: string,
    amount: number,
    orderNumber: string
  ): Promise<EmailLog> {
    const content = `
      <h1>¡Pago confirmado!</h1>
      <p>Tu pago de $${amount.toFixed(2)} ha sido procesado exitosamente.</p>
      <p>Pedido: <strong>#${orderNumber}</strong></p>
      <p>Puedes ver el estado de tu pedido desde tu cuenta.</p>
      <p>Gracias por tu compra.</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Pago confirmado - Nebu',
      content,
      type: EmailType.PAYMENT_CONFIRMATION,
      accountType: EmailAccountType.TEAM,
      isHtml: true,
      metadata: { amount, orderNumber, userEmail },
    });
  }

  async sendVerificationEmail(userEmail: string, verificationToken: string): Promise<EmailLog> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`;

    const content = `
      <h1>Verifica tu cuenta</h1>
      <p>Bienvenido a Nebu. Por favor verifica tu cuenta haciendo clic en el siguiente enlace:</p>
      <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verificar cuenta</a>
      <p>Este enlace expirará en 24 horas.</p>
      <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Verifica tu cuenta - Nebu',
      content,
      type: EmailType.EMAIL_VERIFICATION,
      accountType: EmailAccountType.NOREPLY,
      isHtml: true,
      metadata: { verificationToken, userEmail },
    });
  }

  async sendNotificationEmail(data: {
    to: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  }): Promise<EmailLog> {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title}</h1>
            </div>
            <div class="content">
              <p>${data.message}</p>
              ${data.actionUrl && data.actionText ? `
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${data.actionUrl}" class="button">${data.actionText}</a>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>Este es un mensaje automático, por favor no responda a este correo.</p>
              <p>© ${new Date().getFullYear()} Nebu</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: data.title,
      content,
      type: EmailType.NOTIFICATION,
      accountType: EmailAccountType.TEAM,
      isHtml: true,
      metadata: { title: data.title, actionUrl: data.actionUrl },
    });
  }

  // ===== PRIVATE METHODS =====

  private async getEmailAccount(accountType: EmailAccountType): Promise<EmailAccount> {
    return await this.emailProviderService.getAccountForType(accountType);
  }

  private async sendWithAccount(account: EmailAccount, data: {
    to: string | string[];
    subject: string;
    content: string;
    isHtml: boolean;
  }): Promise<void> {
    // Get provider configuration
    const providerConfig = await this.emailProviderService.getProviderById(account.providerId);
    
    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: providerConfig.host,
      port: providerConfig.port,
      secure: providerConfig.secure,
      auth: {
        user: account.email,
        pass: account.password,
      },
    });

    // Send email
    await this.transporter.sendMail({
      from: `${account.fromName} <${account.email}>`,
      to: data.to,
      subject: data.subject,
      html: data.isHtml ? data.content : undefined,
      text: data.isHtml ? undefined : data.content,
    });
  }

  // ===== EMAIL MANAGEMENT =====

  async getEmailLogs(limit: number = 50, offset: number = 0): Promise<EmailLog[]> {
    return await this.emailLogRepository.find({
      relations: ['account'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getEmailLogById(id: string): Promise<EmailLog> {
    return await this.emailLogRepository.findOne({
      where: { id },
      relations: ['account'],
    });
  }

  async getEmailStats(): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
  }> {
    const [total, sent, failed, pending] = await Promise.all([
      this.emailLogRepository.count(),
      this.emailLogRepository.count({ where: { status: EmailStatus.SENT } }),
      this.emailLogRepository.count({ where: { status: EmailStatus.FAILED } }),
      this.emailLogRepository.count({ where: { status: EmailStatus.PENDING } }),
    ]);

    return { total, sent, failed, pending };
  }
}
