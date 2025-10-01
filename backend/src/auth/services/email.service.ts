import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
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

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    // Skip email sending if SMTP is not configured (for development)
    const smtpUser = this.configService.get<string>('smtp.user');
    if (!smtpUser) {
      this.logger.warn(`Email verification skipped for ${email}. Token: ${token}`);
      this.logger.warn(`Verification URL: ${verificationUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>('smtp.from'),
      to: email,
      subject: 'Verifica tu cuenta - Nebu',
      html: `
        <h2>Bienvenido a Nebu</h2>
        <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${verificationUrl}">Verificar Cuenta</a>
        <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('smtp.from'),
      to: email,
      subject: 'Restablecer contraseña - Nebu',
      html: `
        <h2>Restablecer Contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">Restablecer Contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
      `,
    });
  }
}
