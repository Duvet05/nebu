import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../../email/services/email.service';

@Processor('email-queue')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private emailService: EmailService) {}

  @Process('send-email')
  async sendEmail(
    job: Job<{
      to: string;
      subject: string;
      template: string;
      context: Record<string, any>;
    }>
  ) {
    try {
      this.logger.log(`Sending email to ${job.data.to}`);

      // Use email service to send email
      await this.emailService.sendNotificationEmail({
        to: job.data.to,
        title: job.data.subject,
        message: job.data.context.message || '',
        actionUrl: job.data.context.actionUrl,
        actionText: job.data.context.actionText,
      });

      this.logger.log(`Email sent to ${job.data.to}`);

      return {
        success: true,
        to: job.data.to,
        subject: job.data.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${job.data.to}:`, error);
      throw error;
    }
  }

  @Process('send-welcome-email')
  async sendWelcomeEmail(
    job: Job<{
      userId: string;
      userEmail: string;
      userName: string;
    }>
  ) {
    try {
      this.logger.log(`Sending welcome email to ${job.data.userEmail}`);

      await this.emailService.sendWelcomeEmail(job.data.userEmail, job.data.userName);

      this.logger.log(`Welcome email sent to ${job.data.userEmail}`);

      return {
        success: true,
        userId: job.data.userId,
        userEmail: job.data.userEmail,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${job.data.userEmail}:`, error);
      throw error;
    }
  }

  @Process('send-course-enrollment-email')
  async sendOrderConfirmationEmail(
    job: Job<{
      userEmail: string;
      userName: string;
      orderNumber: string;
      productName: string;
      amount: number;
    }>
  ) {
    try {
      this.logger.log(`Sending order confirmation email to ${job.data.userEmail}`);

      await this.emailService.sendOrderConfirmationEmail(
        job.data.userEmail,
        job.data.orderNumber,
        job.data.productName,
        job.data.amount
      );

      this.logger.log(`Order confirmation email sent to ${job.data.userEmail}`);

      return {
        success: true,
        userEmail: job.data.userEmail,
        orderNumber: job.data.orderNumber,
        productName: job.data.productName,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email to ${job.data.userEmail}:`, error);
      throw error;
    }
  }

  @Process('send-order-shipped-email')
  async sendOrderShippedEmail(
    job: Job<{
      userEmail: string;
      userName: string;
      orderNumber: string;
      trackingNumber: string;
    }>
  ) {
    try {
      this.logger.log(`Sending order shipped email to ${job.data.userEmail}`);

      // Enviar email de pedido enviado usando el servicio de email
      await this.emailService.sendNotificationEmail({
        to: job.data.userEmail,
        title: `Tu pedido #${job.data.orderNumber} ha sido enviado`,
        message: `
          <p>Hola ${job.data.userName},</p>
          <p>Tu pedido <strong>#${job.data.orderNumber}</strong> ha sido enviado.</p>
          ${job.data.trackingNumber ? `<p>Número de seguimiento: <strong>${job.data.trackingNumber}</strong></p>` : ''}
          <p>Tu pedido llegará pronto. ¡Gracias por tu compra!</p>
        `,
      });

      this.logger.log(`Order shipped email sent to ${job.data.userEmail}`);

      return {
        success: true,
        userEmail: job.data.userEmail,
        orderNumber: job.data.orderNumber,
        trackingNumber: job.data.trackingNumber,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send order shipped email to ${job.data.userEmail}:`, error);
      throw error;
    }
  }

  @Process('send-password-reset-email')
  async sendPasswordResetEmail(
    job: Job<{
      userEmail: string;
      userName: string;
      resetToken: string;
    }>
  ) {
    try {
      this.logger.log(`Sending password reset email to ${job.data.userEmail}`);

      await this.emailService.sendPasswordResetEmail(job.data.userEmail, job.data.resetToken);

      this.logger.log(`Password reset email sent to ${job.data.userEmail}`);

      return {
        success: true,
        userEmail: job.data.userEmail,
        resetToken: job.data.resetToken,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${job.data.userEmail}:`, error);
      throw error;
    }
  }

  @Process('send-notification-email')
  async sendNotificationEmail(
    job: Job<{
      userEmail: string;
      userName: string;
      title: string;
      message: string;
      actionUrl?: string;
      actionText?: string;
    }>
  ) {
    try {
      this.logger.log(`Sending notification email to ${job.data.userEmail}`);

      await this.emailService.sendNotificationEmail({
        to: job.data.userEmail,
        title: job.data.title,
        message: job.data.message,
        actionUrl: job.data.actionUrl,
        actionText: job.data.actionText,
      });

      this.logger.log(`Notification email sent to ${job.data.userEmail}`);

      return {
        success: true,
        userEmail: job.data.userEmail,
        title: job.data.title,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send notification email to ${job.data.userEmail}:`, error);
      throw error;
    }
  }
}
