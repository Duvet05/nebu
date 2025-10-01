import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  HttpCode,
  HttpStatus,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LiveKitService } from './livekit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class GenerateTokenDto {
  roomName: string;
  participantName: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
  metadata?: string;
}

class CreateRoomDto {
  roomName: string;
  maxParticipants?: number;
  emptyTimeout?: number;
  metadata?: string;
}

class VoiceAgentTokenDto {
  userId: string;
  sessionId: string;
}

class IoTTokenDto {
  deviceId: string;
  roomName: string;
}

@ApiTags('livekit')
@Controller('livekit')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LiveKitController {
  constructor(private readonly livekitService: LiveKitService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar token de acceso para LiveKit' })
  @ApiResponse({ status: 200, description: 'Token generado exitosamente' })
  async generateToken(@Body() generateTokenDto: GenerateTokenDto) {
    const { roomName, participantName, ...options } = generateTokenDto;
    
    const token = this.livekitService.generateToken(roomName, participantName, options);
    
    return {
      token,
      roomName,
      participantName,
      livekitUrl: process.env.LIVEKIT_URL!,
    };
  }

  @Post('voice-agent/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar token para Voice Agent' })
  @ApiResponse({ status: 200, description: 'Token para Voice Agent generado' })
  async generateVoiceAgentToken(@Body() voiceAgentTokenDto: VoiceAgentTokenDto) {
    const { userId, sessionId } = voiceAgentTokenDto;
    
    const token = this.livekitService.generateVoiceAgentToken(userId, sessionId);
    const roomName = `voice-agent-${userId}-${sessionId}`;
    
    return {
      token,
      roomName,
      participantName: `user-${userId}`,
      livekitUrl: process.env.LIVEKIT_URL!,
      type: 'voice-agent'
    };
  }

  @Post('iot/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar token para dispositivo IoT' })
  @ApiResponse({ status: 200, description: 'Token para IoT generado' })
  async generateIoTToken(@Body() iotTokenDto: IoTTokenDto) {
    const { deviceId, roomName } = iotTokenDto;
    
    const token = this.livekitService.generateIoTToken(deviceId, roomName);
    
    return {
      token,
      roomName,
      participantName: `device-${deviceId}`,
      livekitUrl: process.env.LIVEKIT_URL!,
      type: 'iot-device'
    };
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Crear nueva sala' })
  @ApiResponse({ status: 201, description: 'Sala creada exitosamente' })
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    const { roomName, ...options } = createRoomDto;
    const room = await this.livekitService.createRoom(roomName, options);
    return room;
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Listar todas las salas activas' })
  @ApiResponse({ status: 200, description: 'Lista de salas obtenida' })
  async listRooms() {
    const rooms = await this.livekitService.listRooms();
    return { rooms };
  }

  @Get('rooms/:roomName')
  @ApiOperation({ summary: 'Obtener información de una sala específica' })
  @ApiResponse({ status: 200, description: 'Información de la sala obtenida' })
  async getRoom(@Param('roomName') roomName: string) {
    const room = await this.livekitService.getRoom(roomName);
    return room;
  }

  @Get('rooms/:roomName/participants')
  @ApiOperation({ summary: 'Listar participantes de una sala' })
  @ApiResponse({ status: 200, description: 'Lista de participantes obtenida' })
  async listParticipants(@Param('roomName') roomName: string) {
    const participants = await this.livekitService.listParticipants(roomName);
    return { participants };
  }

  @Delete('rooms/:roomName/participants/:participantIdentity')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover participante de una sala' })
  @ApiResponse({ status: 204, description: 'Participante removido' })
  async removeParticipant(
    @Param('roomName') roomName: string,
    @Param('participantIdentity') participantIdentity: string
  ) {
    await this.livekitService.removeParticipant(roomName, participantIdentity);
  }

  @Delete('rooms/:roomName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar sala' })
  @ApiResponse({ status: 204, description: 'Sala eliminada' })
  async deleteRoom(@Param('roomName') roomName: string) {
    await this.livekitService.deleteRoom(roomName);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook para eventos de LiveKit' })
  @ApiResponse({ status: 200, description: 'Webhook procesado' })
  async handleWebhook(@Body() webhookData: any) {
    // Aquí puedes procesar los eventos de LiveKit
    // Por ejemplo: participante conectado, desconectado, etc.
    
    // eslint-disable-next-line no-console
    console.log('LiveKit Webhook received:', webhookData);
    
    // Procesar diferentes tipos de eventos
    switch (webhookData.event) {
      case 'participant_joined':
        // eslint-disable-next-line no-console
        console.log(`Participant ${webhookData.participant.identity} joined room ${webhookData.room.name}`);
        break;
      case 'participant_left':
        // eslint-disable-next-line no-console
        console.log(`Participant ${webhookData.participant.identity} left room ${webhookData.room.name}`);
        break;
      case 'track_published':
        // eslint-disable-next-line no-console
        console.log(`Track published in room ${webhookData.room.name}`);
        break;
      case 'track_unpublished':
        // eslint-disable-next-line no-console
        console.log(`Track unpublished in room ${webhookData.room.name}`);
        break;
      case 'room_finished':
        // eslint-disable-next-line no-console
        console.log(`Room ${webhookData.room.name} finished`);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(`Unknown event: ${webhookData.event}`);
    }

    return { status: 'ok' };
  }
}
