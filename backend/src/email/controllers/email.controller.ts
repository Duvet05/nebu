import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { EmailService } from '../services/email.service';
import { EmailProviderService } from '../services/email-provider.service';
import { EmailType, EmailAccountType } from '../entities/email-account.entity';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailProviderService: EmailProviderService,
  ) {}

  // ===== EMAIL SENDING =====

  @Post('send')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email personalizado' })
  @ApiResponse({ status: 200, description: 'Email enviado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async sendEmail(@Body() data: {
    to: string | string[];
    subject: string;
    content: string;
    type: EmailType;
    accountType?: EmailAccountType;
    metadata?: Record<string, any>;
    isHtml?: boolean;
  }) {
    return await this.emailService.sendEmail(data);
  }

  @Post('send-welcome')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de bienvenida' })
  @ApiResponse({ status: 200, description: 'Email de bienvenida enviado' })
  async sendWelcomeEmail(@Body() data: {
    userEmail: string;
    userName: string;
  }) {
    return await this.emailService.sendWelcomeEmail(data.userEmail, data.userName);
  }

  @Post('send-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de restablecimiento de contraseña' })
  @ApiResponse({ status: 200, description: 'Email de restablecimiento enviado' })
  async sendPasswordResetEmail(@Body() data: {
    userEmail: string;
    resetToken: string;
  }) {
    return await this.emailService.sendPasswordResetEmail(data.userEmail, data.resetToken);
  }

  @Post('send-course-enrollment')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de inscripción a curso' })
  @ApiResponse({ status: 200, description: 'Email de inscripción enviado' })
  async sendCourseEnrollmentEmail(@Body() data: {
    userEmail: string;
    courseName: string;
  }) {
    return await this.emailService.sendCourseEnrollmentEmail(data.userEmail, data.courseName);
  }

  @Post('send-payment-confirmation')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de confirmación de pago' })
  @ApiResponse({ status: 200, description: 'Email de confirmación enviado' })
  async sendPaymentConfirmationEmail(@Body() data: {
    userEmail: string;
    amount: number;
    courseName: string;
  }) {
    return await this.emailService.sendPaymentConfirmationEmail(
      data.userEmail,
      data.amount,
      data.courseName
    );
  }

  // ===== EMAIL MANAGEMENT =====

  @Get('logs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener logs de emails' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Logs obtenidos exitosamente' })
  async getEmailLogs(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.emailService.getEmailLogs(limit || 50, offset || 0);
  }

  @Get('logs/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener log de email por ID' })
  @ApiResponse({ status: 200, description: 'Log obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Log no encontrado' })
  async getEmailLogById(@Param('id') id: string) {
    return await this.emailService.getEmailLogById(id);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas de emails' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async getEmailStats() {
    return await this.emailService.getEmailStats();
  }

  // ===== PROVIDER MANAGEMENT =====

  @Get('providers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener proveedores de email' })
  @ApiResponse({ status: 200, description: 'Proveedores obtenidos exitosamente' })
  async getProviders() {
    return await this.emailProviderService.getProviders();
  }

  @Get('providers/active')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener proveedores activos' })
  @ApiResponse({ status: 200, description: 'Proveedores activos obtenidos exitosamente' })
  async getActiveProviders() {
    return await this.emailProviderService.getActiveProviders();
  }

  @Get('accounts')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener cuentas de email' })
  @ApiResponse({ status: 200, description: 'Cuentas obtenidas exitosamente' })
  async getAccounts() {
    return await this.emailProviderService.getAccounts();
  }
}
