import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class EmailNotificationsService {
  private readonly logger = new Logger(EmailNotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('smtp.host'),
      port: this.configService.get<number>('smtp.port'),
      secure: this.configService.get<boolean>('smtp.secure'),
      auth: {
        user: this.configService.get<string>('smtp.user'),
        pass: this.configService.get<string>('smtp.password'),
      },
    });
  }

  async sendEmail(notification: Notification): Promise<void> {
    try {
      const user = notification.user;
      if (!user || !user.email) {
        throw new Error('User email not found');
      }

      const mailOptions = {
        from: this.configService.get<string>('smtp.from'),
        to: user.email,
        subject: notification.title,
        html: this.generateEmailHTML(notification),
        text: notification.message,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${user.email} for notification ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email for notification ${notification.id}:`, error);
      throw error;
    }
  }

  async sendBulkEmails(notifications: Notification[]): Promise<void> {
    const emailPromises = notifications.map(notification => this.sendEmail(notification));
    await Promise.allSettled(emailPromises);
  }

  private generateEmailHTML(notification: Notification): string {
    const data = notification.data ? JSON.parse(notification.data) : {};

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${notification.title}</title>
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
              <h1>${notification.title}</h1>
            </div>
            <div class="content">
              <p>${notification.message}</p>
              ${this.generateActionButtons(data)}
            </div>
            <div class="footer">
              <p>Este es un mensaje automático, por favor no responda a este correo.</p>
              <p>© ${new Date().getFullYear()} Nebu</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateActionButtons(data: Record<string, any>): string {
    if (data.courseId) {
      return `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/courses/${data.courseId}" class="button">
            Ver Curso
          </a>
        </div>
      `;
    }

    if (data.lessonId) {
      return `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/lessons/${data.lessonId}" class="button">
            Ver Lección
          </a>
        </div>
      `;
    }

    return '';
  }
}
