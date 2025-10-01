import {
  Controller,
  Post,
  Get,
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
import { EmailService } from '../services/email.service';
import { EmailProviderService } from '../services/email-provider.service';
import { EmailType } from '../entities/email-account.entity';

@ApiTags('Email Test')
@Controller('email/test')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmailTestController {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailProviderService: EmailProviderService,
  ) {}

  @Post('send-mock')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de prueba (simulado)' })
  @ApiResponse({ status: 200, description: 'Email simulado enviado exitosamente' })
  async sendMockEmail(@Body() data: {
    to: string;
    subject: string;
    content: string;
    type: EmailType;
  }) {
    // Simular envío de email sin usar SMTP real
    console.log('📧 MOCK EMAIL SENT:');
    console.log(`   To: ${data.to}`);
    console.log(`   Subject: ${data.subject}`);
    console.log(`   Type: ${data.type}`);
    console.log(`   Content: ${data.content.substring(0, 100)}...`);
    
    return {
      success: true,
      message: 'Email simulado enviado exitosamente',
      data: {
        to: data.to,
        subject: data.subject,
        type: data.type,
        timestamp: new Date().toISOString(),
        mock: true,
      }
    };
  }

  @Get('providers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener proveedores de email' })
  @ApiResponse({ status: 200, description: 'Proveedores obtenidos exitosamente' })
  async getProviders() {
    return await this.emailProviderService.getProviders();
  }

  @Get('accounts')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener cuentas de email' })
  @ApiResponse({ status: 200, description: 'Cuentas obtenidas exitosamente' })
  async getAccounts() {
    return await this.emailProviderService.getAccounts();
  }

  @Post('test-connection')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Probar conexión SMTP' })
  @ApiResponse({ status: 200, description: 'Conexión probada' })
  async testConnection() {
    try {
      const providers = await this.emailProviderService.getProviders();
      const accounts = await this.emailProviderService.getAccounts();
      
      return {
        success: true,
        message: 'Configuración de email cargada correctamente',
        data: {
          providers: providers.length,
          accounts: accounts.length,
          providersList: providers.map(p => ({
            id: p.id,
            name: p.name,
            host: p.host,
            port: p.port,
            status: p.status,
          })),
          accountsList: accounts.map(a => ({
            id: a.id,
            email: a.email,
            type: a.type,
            status: a.status,
            provider: a.provider?.name,
          })),
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al cargar configuración de email',
        error: error.message,
      };
    }
  }
}
