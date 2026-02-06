import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { LiveKitService } from './livekit.service';
import { WebhookEventDto } from './dto/livekit.dto';
import { Request } from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';

@ApiTags('livekit-webhook')
@Controller('livekit')
@Public()
export class LiveKitWebhookController {
  private readonly logger = new Logger(LiveKitWebhookController.name);

  constructor(private readonly livekitService: LiveKitService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook publico para eventos de LiveKit Cloud',
    description: 'Recibe eventos de LiveKit y actualiza el estado de dispositivos/sesiones automaticamente'
  })
  @ApiResponse({ status: 200, description: 'Webhook procesado exitosamente' })
  async handleWebhook(
    @Body() webhookData: WebhookEventDto,
    @Headers('authorization') authHeader?: string,
    @Req() req?: RawBodyRequest<Request>
  ) {
    // Validar firma del webhook usando credenciales centralizadas
    const apiKey = this.livekitService.getApiKey();
    const apiSecret = this.livekitService.getApiSecret();

    if (apiKey && apiSecret && authHeader) {
      try {
        const webhookReceiver = new WebhookReceiver(apiKey, apiSecret);
        const rawBody = req?.rawBody?.toString() || JSON.stringify(webhookData);
        const event = await webhookReceiver.receive(rawBody, authHeader);
        // Si la validacion pasa, usar el evento validado
        webhookData = event as any;
      } catch (error) {
        this.logger.warn(`Webhook signature validation failed: ${error.message}`);
        // Continuar procesando de todos modos en desarrollo
        if (process.env.NODE_ENV === 'production') {
          return {
            status: 'error',
            message: 'Invalid webhook signature'
          };
        }
      }
    }

    this.logger.log(`LiveKit Webhook received: ${webhookData.event}`);
    this.logger.debug(`Webhook data: ${JSON.stringify(webhookData, null, 2)}`);

    const roomName = webhookData.room?.name;
    const participantIdentity = webhookData.participant?.identity;
    const participantMetadata = webhookData.participant?.metadata;

    // Procesar diferentes tipos de eventos
    switch (webhookData.event) {
      case 'participant_joined':
        this.logger.log(`Participant ${participantIdentity} joined room ${roomName}`);
        if (roomName && participantIdentity) {
          await this.livekitService.handleParticipantJoined(
            roomName,
            participantIdentity,
            participantMetadata
          );
        }
        break;

      case 'participant_left':
        this.logger.log(`Participant ${participantIdentity} left room ${roomName}`);
        if (roomName && participantIdentity) {
          await this.livekitService.handleParticipantLeft(roomName, participantIdentity);
        }
        break;

      case 'track_published': {
        const trackType = webhookData.track?.type || webhookData.track?.source;
        this.logger.log(`Track ${trackType} published by ${participantIdentity} in room ${roomName}`);
        if (roomName && participantIdentity) {
          await this.livekitService.handleTrackPublished(
            roomName,
            participantIdentity,
            trackType
          );
        }
        break;
      }

      case 'track_unpublished':
        this.logger.log(`Track unpublished by ${participantIdentity} in room ${roomName}`);
        break;

      case 'room_started':
        this.logger.log(`Room ${roomName} started`);
        break;

      case 'room_finished':
        this.logger.log(`Room ${roomName} finished`);
        if (roomName) {
          await this.livekitService.handleRoomFinished(roomName);
        }
        break;

      case 'track_subscribed':
        this.logger.log(`Track subscribed in room ${roomName}`);
        break;

      case 'track_unsubscribed':
        this.logger.log(`Track unsubscribed in room ${roomName}`);
        break;

      case 'egress_started':
        this.logger.log(`Egress started in room ${roomName}`);
        break;

      case 'egress_updated':
        this.logger.log(`Egress updated in room ${roomName}`);
        break;

      case 'egress_ended':
        this.logger.log(`Egress ended in room ${roomName}`);
        break;

      case 'ingress_started':
        this.logger.log(`Ingress started in room ${roomName}`);
        break;

      case 'ingress_ended':
        this.logger.log(`Ingress ended in room ${roomName}`);
        break;

      default:
        this.logger.warn(`Unknown event type: ${webhookData.event}`);
    }

    return {
      status: 'ok',
      event: webhookData.event,
      room: roomName,
      participant: participantIdentity,
      timestamp: new Date().toISOString()
    };
  }
}
