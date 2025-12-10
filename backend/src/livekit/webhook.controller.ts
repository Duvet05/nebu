import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('livekit-webhook')
@Controller('livekit')
@Public()
export class LiveKitWebhookController {
  private readonly logger = new Logger(LiveKitWebhookController.name);

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook público para eventos de LiveKit Cloud' })
  @ApiResponse({ status: 200, description: 'Webhook procesado exitosamente' })
  async handleWebhook(@Body() webhookData: any) {
    // Procesar eventos de LiveKit Cloud
    this.logger.log(`LiveKit Cloud Webhook received: ${JSON.stringify(webhookData, null, 2)}`);

    // Procesar diferentes tipos de eventos
    switch (webhookData.event) {
      case 'participant_joined':
        this.logger.log(`👤 Participant ${webhookData.participant?.identity} joined room ${webhookData.room?.name}`);
        break;
      case 'participant_left':
        this.logger.log(`👋 Participant ${webhookData.participant?.identity} left room ${webhookData.room?.name}`);
        break;
      case 'track_published':
        this.logger.log(`📹 Track published in room ${webhookData.room?.name}`);
        break;
      case 'track_unpublished':
        this.logger.log(`🔇 Track unpublished in room ${webhookData.room?.name}`);
        break;
      case 'room_finished':
        this.logger.log(`🏁 Room ${webhookData.room?.name} finished`);
        break;
      case 'room_started':
        this.logger.log(`🚀 Room ${webhookData.room?.name} started`);
        break;
      default:
        this.logger.warn(`❓ Unknown event: ${webhookData.event}`);
    }

    return {
      status: 'ok',
      event: webhookData.event,
      room: webhookData.room?.name,
      timestamp: new Date().toISOString()
    };
  }
}
