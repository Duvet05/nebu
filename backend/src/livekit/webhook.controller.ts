import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// import { Public } from '../auth/decorators/public.decorator';
//TODO PROTEGER CON JWT POR EL MOMENTO ESTA PUBLICO PARA LAS PRUEBAS
@ApiTags('livekit-webhook')
@Controller('livekit')
export class LiveKitWebhookController {
  
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook público para eventos de LiveKit Cloud' })
  @ApiResponse({ status: 200, description: 'Webhook procesado exitosamente' })
  async handleWebhook(@Body() webhookData: any) {
    // Procesar eventos de LiveKit Cloud
    console.log('LiveKit Cloud Webhook received:', JSON.stringify(webhookData, null, 2));
    
    // Procesar diferentes tipos de eventos
    switch (webhookData.event) {
      case 'participant_joined':
        console.log(` Participant ${webhookData.participant?.identity} joined room ${webhookData.room?.name}`);
        break;
      case 'participant_left':
        console.log(` Participant ${webhookData.participant?.identity} left room ${webhookData.room?.name}`);
        break;
      case 'track_published':
        console.log(`📹 Track published in room ${webhookData.room?.name}`);
        break;
      case 'track_unpublished':
        console.log(`📹 Track unpublished in room ${webhookData.room?.name}`);
        break;
      case 'room_finished':
        console.log(`🏁 Room ${webhookData.room?.name} finished`);
        break;
      case 'room_started':
        console.log(` Room ${webhookData.room?.name} started`);
        break;
      default:
        console.log(`❓ Unknown event: ${webhookData.event}`);
    }

    return { 
      status: 'ok', 
      event: webhookData.event,
      room: webhookData.room?.name,
      timestamp: new Date().toISOString()
    };
  }
}
