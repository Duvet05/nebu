import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CulqiWebhookService } from './culqi-webhook.service';
import { Public } from '../auth/decorators/public.decorator';
import { DuplicateRequestGuard } from '../common/guards/duplicate-request.guard';
import { PreventDuplicateRequest } from '../common/decorators/duplicate-request.decorator';

/**
 * Controlador para recibir webhooks de Culqi
 *
 * Los webhooks de Culqi NO incluyen firma/verificación automática.
 * Para producción, considera implementar:
 * 1. IP Whitelisting (solo IPs de Culqi)
 * 2. Token secreto en headers
 * 3. Rate limiting
 */
@ApiTags('Webhooks')
@Controller('webhooks/culqi')
@UseGuards(DuplicateRequestGuard)
export class CulqiWebhookController {
  private readonly logger = new Logger(CulqiWebhookController.name);

  constructor(private readonly webhookService: CulqiWebhookService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @PreventDuplicateRequest({ ttl: 60, fields: ['id', 'object'], message: 'Webhook duplicado - ya fue procesado.' })
  @ApiOperation({ summary: 'Recibir eventos de webhook de Culqi' })
  @ApiResponse({ status: 200, description: 'Webhook procesado exitosamente' })
  @ApiResponse({ status: 400, description: 'Evento inválido' })
  async handleWebhook(@Body() event: any) {
    try {
      this.logger.log(`Webhook recibido: ${event.object || 'unknown'}`);

      await this.webhookService.processWebhookEvent(event);

      return { received: true };
    } catch (error) {
      this.logger.error('Error procesando webhook:', error.message);
      throw error;
    }
  }
}
