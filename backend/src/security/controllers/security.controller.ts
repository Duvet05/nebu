import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityAuditService } from '../security-audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('security')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class SecurityController {
  constructor(private readonly securityAuditService: SecurityAuditService) {}

  @Get('audit')
  @ApiOperation({ summary: 'Ejecutar auditoría de seguridad completa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auditoría de seguridad completada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acceso denegado - Solo administradores',
  })
  async performSecurityAudit() {
    return this.securityAuditService.performSecurityAudit();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas de seguridad' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Métricas de seguridad obtenidas exitosamente',
  })
  async getSecurityMetrics() {
    return this.securityAuditService.getSecurityMetrics();
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar estado de seguridad del sistema' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de seguridad verificado',
  })
  async getSecurityHealth() {
    const audit = await this.securityAuditService.performSecurityAudit();

    return {
      status: audit.criticalIssues === 0 ? 'HEALTHY' : 'CRITICAL',
      score: audit.overallScore,
      criticalIssues: audit.criticalIssues,
      warnings: audit.warnings,
      lastAudit: audit.timestamp,
    };
  }
}
