import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LiveKitService } from './livekit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GenerateTokenDto,
  CreateRoomDto,
  VoiceAgentTokenDto,
  IoTTokenDto,
  UserTokenDto,
  UserTokenResponseDto,
  MuteParticipantDto,
  SendDataDto,
  LiveKitStatsDto,
  ToyStatsDto,
} from './dto/livekit.dto';

@ApiTags('livekit')
@Controller('livekit')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LiveKitController {
  private readonly logger = new Logger(LiveKitController.name);

  constructor(private readonly livekitService: LiveKitService) {}

  // ==================== Token Endpoints ====================

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar token de acceso para LiveKit' })
  @ApiResponse({ status: 200, description: 'Token generado exitosamente' })
  async generateToken(@Body() generateTokenDto: GenerateTokenDto) {
    const { roomName, participantName, ...options } = generateTokenDto;

    const token = await this.livekitService.generateToken(roomName, participantName, options);

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

    const token = await this.livekitService.generateVoiceAgentToken(userId, sessionId);
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

    const token = await this.livekitService.generateIoTToken(deviceId, roomName);

    return {
      token,
      roomName,
      participantName: `device-${deviceId}`,
      livekitUrl: process.env.LIVEKIT_URL!,
      type: 'iot-device'
    };
  }

  @Post('token/user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar token para usuario web/movil (padre)',
    description: 'Permite que un padre se una a la misma sala que el toy de su hijo para escuchar/hablar'
  })
  @ApiResponse({ status: 200, description: 'Token generado exitosamente', type: UserTokenResponseDto })
  @ApiResponse({ status: 404, description: 'Toy no encontrado' })
  @ApiResponse({ status: 400, description: 'Toy no conectado a ninguna sala activa' })
  async generateUserToken(@Body() userTokenDto: UserTokenDto) {
    const result = await this.livekitService.generateUserToken(
      userTokenDto.toyId,
      userTokenDto.identity,
      userTokenDto.metadata
    );

    return result;
  }

  // ==================== Room Management Endpoints ====================

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
    return {
      rooms,
      count: rooms.length
    };
  }

  @Get('rooms/:roomName')
  @ApiOperation({ summary: 'Obtener informacion de una sala especifica' })
  @ApiResponse({ status: 200, description: 'Informacion de la sala obtenida' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada' })
  @ApiParam({ name: 'roomName', description: 'Nombre de la sala' })
  async getRoom(@Param('roomName') roomName: string) {
    const room = await this.livekitService.getRoom(roomName);
    return room;
  }

  @Delete('rooms/:roomName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar/cerrar sala forzadamente' })
  @ApiResponse({ status: 204, description: 'Sala eliminada' })
  @ApiParam({ name: 'roomName', description: 'Nombre de la sala' })
  async deleteRoom(@Param('roomName') roomName: string) {
    await this.livekitService.deleteRoom(roomName);
  }

  // ==================== Participant Management Endpoints ====================

  @Get('rooms/:roomName/participants')
  @ApiOperation({ summary: 'Listar participantes de una sala' })
  @ApiResponse({ status: 200, description: 'Lista de participantes obtenida' })
  @ApiParam({ name: 'roomName', description: 'Nombre de la sala' })
  async listParticipants(@Param('roomName') roomName: string) {
    const participants = await this.livekitService.listParticipants(roomName);
    return {
      participants,
      count: participants.length
    };
  }

  @Get('rooms/:roomName/participants/:identity')
  @ApiOperation({ summary: 'Obtener informacion de un participante especifico' })
  @ApiResponse({ status: 200, description: 'Informacion del participante obtenida' })
  @ApiResponse({ status: 404, description: 'Participante no encontrado' })
  @ApiParam({ name: 'roomName', description: 'Nombre de la sala' })
  @ApiParam({ name: 'identity', description: 'Identidad del participante' })
  async getParticipant(
    @Param('roomName') roomName: string,
    @Param('identity') identity: string
  ) {
    const participant = await this.livekitService.getParticipant(roomName, identity);
    return participant;
  }

  @Delete('rooms/:roomName/participants/:identity')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Expulsar participante de una sala (kick)' })
  @ApiResponse({ status: 204, description: 'Participante expulsado' })
  @ApiParam({ name: 'roomName', description: 'Nombre de la sala' })
  @ApiParam({ name: 'identity', description: 'Identidad del participante' })
  async removeParticipant(
    @Param('roomName') roomName: string,
    @Param('identity') identity: string
  ) {
    await this.livekitService.removeParticipant(roomName, identity);
  }

  @Post('rooms/:roomName/kick/:identity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Expulsar participante de una sala (alias de DELETE)',
    description: 'Control parental - permite desconectar remotamente a un toy o usuario'
  })
  @ApiResponse({ status: 200, description: 'Participante expulsado' })
  @ApiParam({ name: 'roomName', description: 'Nombre de la sala' })
  @ApiParam({ name: 'identity', description: 'Identidad del participante' })
  async kickParticipant(
    @Param('roomName') roomName: string,
    @Param('identity') identity: string
  ) {
    await this.livekitService.removeParticipant(roomName, identity);
    return {
      success: true,
      message: `Participante ${identity} expulsado de la sala ${roomName}`
    };
  }

  @Post('rooms/:roomName/mute/:identity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Silenciar/activar participante',
    description: 'Control parental - permite silenciar audio/video de un participante remotamente'
  })
  @ApiResponse({ status: 200, description: 'Estado de mute actualizado' })
  @ApiResponse({ status: 404, description: 'Participante no encontrado' })
  @ApiParam({ name: 'roomName', description: 'Nombre de la sala' })
  @ApiParam({ name: 'identity', description: 'Identidad del participante' })
  async muteParticipant(
    @Param('roomName') roomName: string,
    @Param('identity') identity: string,
    @Body() muteDto: MuteParticipantDto
  ) {
    const participant = await this.livekitService.muteParticipant(
      roomName,
      identity,
      muteDto.muteAudio,
      muteDto.muteVideo
    );
    return {
      success: true,
      participant,
      message: `Estado de mute actualizado para ${identity}`
    };
  }

  @Post('rooms/:roomName/data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar datos a participantes de una sala',
    description: 'Permite enviar mensajes/comandos a todos o algunos participantes de la sala'
  })
  @ApiResponse({ status: 200, description: 'Datos enviados exitosamente' })
  @ApiParam({ name: 'roomName', description: 'Nombre de la sala' })
  async sendData(
    @Param('roomName') roomName: string,
    @Body() sendDataDto: SendDataDto
  ) {
    await this.livekitService.sendData(
      roomName,
      sendDataDto.data,
      sendDataDto.destinationIdentities,
      sendDataDto.topic
    );
    return {
      success: true,
      message: sendDataDto.destinationIdentities?.length
        ? `Datos enviados a ${sendDataDto.destinationIdentities.length} participantes`
        : 'Datos enviados a todos los participantes'
    };
  }

  // ==================== Statistics Endpoints ====================

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadisticas generales de LiveKit',
    description: 'Dashboard admin - muestra salas activas, participantes, dispositivos online'
  })
  @ApiResponse({ status: 200, description: 'Estadisticas obtenidas', type: LiveKitStatsDto })
  async getStats() {
    const stats = await this.livekitService.getStats();
    return stats;
  }

  @Get('stats/toy/:toyId')
  @ApiOperation({
    summary: 'Obtener estadisticas de un toy especifico',
    description: 'Analytics - sesiones, tiempo de uso, sala actual'
  })
  @ApiResponse({ status: 200, description: 'Estadisticas del toy obtenidas', type: ToyStatsDto })
  @ApiResponse({ status: 404, description: 'Toy no encontrado' })
  @ApiParam({ name: 'toyId', description: 'ID del toy' })
  async getToyStats(@Param('toyId') toyId: string) {
    const stats = await this.livekitService.getToyStats(toyId);
    return stats;
  }
}
