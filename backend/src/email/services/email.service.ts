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

  async sendCourseEnrollmentEmail(userEmail: string, courseName: string): Promise<EmailLog> {
    const content = `
      <h1>¡Te has inscrito exitosamente!</h1>
      <p>Has sido inscrito en el curso: <strong>${courseName}</strong></p>
      <p>Puedes acceder a tu curso desde tu dashboard.</p>
      <p>¡Que tengas un excelente aprendizaje!</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Inscripción exitosa - ${courseName}`,
      content,
      type: EmailType.COURSE_ENROLLMENT,
      accountType: EmailAccountType.NOREPLY,
      isHtml: true,
      metadata: { courseName, userEmail },
    });
  }

  async sendPaymentConfirmationEmail(userEmail: string, amount: number, courseName: string): Promise<EmailLog> {
    const content = `
      <h1>¡Pago confirmado!</h1>
      <p>Tu pago de $${amount} ha sido procesado exitosamente.</p>
      <p>Curso: <strong>${courseName}</strong></p>
      <p>Ya puedes acceder a tu curso desde tu dashboard.</p>
      <p>Gracias por tu compra.</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Pago confirmado - Nebu',
      content,
      type: EmailType.PAYMENT_CONFIRMATION,
      accountType: EmailAccountType.TEAM,
      isHtml: true,
      metadata: { amount, courseName, userEmail },
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
