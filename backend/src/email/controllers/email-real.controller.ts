import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { EmailProviderService } from '../services/email-provider.service';
import { EmailAccountType } from '../entities/email-account.entity';
import * as nodemailer from 'nodemailer';

@ApiTags('Email Real')
@Controller('email/real')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmailRealController {
  constructor(
    private readonly configService: ConfigService,
    private readonly emailProviderService: EmailProviderService,
  ) {}

  @Post('send')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email real usando credenciales de la base de datos' })
  @ApiResponse({ status: 200, description: 'Email enviado exitosamente' })
  async sendRealEmail(@Body() data: {
    to: string;
    subject: string;
    content: string;
    isHtml?: boolean;
  }) {
    try {
      // Obtener cuenta de email desde la base de datos
      const account = await this.emailProviderService.getAccountByType(EmailAccountType.TEAM);
      if (!account) {
        throw new Error('No se encontró cuenta de email team');
      }

      const provider = await this.emailProviderService.getProviderById(account.providerId);
      if (!provider) {
        throw new Error('No se encontró proveedor de email');
      }

      // Crear transporter con credenciales de la base de datos
      const transporter = nodemailer.createTransport({
        host: provider.host,
        port: provider.port,
        secure: provider.secure,
        auth: {
          user: account.email,
          pass: account.password, // Ya está desencriptada por el servicio
        },
      });

      // Verificar conexión
      await transporter.verify();

      // Enviar email
      const result = await transporter.sendMail({
        from: {
          name: account.fromName,
          address: account.email,
        },
        to: data.to,
        subject: data.subject,
        html: data.isHtml ? data.content : undefined,
        text: data.isHtml ? undefined : data.content,
      });

      return {
        success: true,
        message: 'Email enviado exitosamente',
        data: {
          messageId: result.messageId,
          to: data.to,
          subject: data.subject,
          from: account.email,
          provider: provider.name,
          timestamp: new Date().toISOString(),
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Error al enviar email',
        error: error.message,
      };
    }
  }

  @Post('test-connection')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Probar conexión SMTP real' })
  @ApiResponse({ status: 200, description: 'Conexión probada' })
  async testConnection() {
    try {
      // Obtener cuenta de email desde la base de datos
      const account = await this.emailProviderService.getAccountByType(EmailAccountType.TEAM);
      if (!account) {
        throw new Error('No se encontró cuenta de email team');
      }

      const provider = await this.emailProviderService.getProviderById(account.providerId);
      if (!provider) {
        throw new Error('No se encontró proveedor de email');
      }

      const transporter = nodemailer.createTransport({
        host: provider.host,
        port: provider.port,
        secure: provider.secure,
        auth: {
          user: account.email,
          pass: account.password,
        },
      });

      await transporter.verify();

      return {
        success: true,
        message: 'Conexión SMTP exitosa',
        data: {
          host: provider.host,
          port: provider.port,
          user: account.email,
          secure: provider.secure,
          provider: provider.name,
          accountType: account.type,
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión SMTP',
        error: error.message,
      };
    }
  }
}
