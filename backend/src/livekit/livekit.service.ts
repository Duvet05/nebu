import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessToken, RoomServiceClient, DataPacket_Kind } from 'livekit-server-sdk';
import { IoTDevice, DeviceStatus } from '../iot/entities/iot-device.entity';
import { Toy, ToyStatus } from '../toys/entities/toy.entity';
import { VoiceSession } from '../voice/entities/voice-session.entity';

@Injectable()
export class LiveKitService {
  private readonly logger = new Logger(LiveKitService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly livekitUrl: string;
  private readonly livekitWsUrl: string;
  private roomService: RoomServiceClient;

  constructor(
    @InjectRepository(IoTDevice)
    private iotDeviceRepository: Repository<IoTDevice>,
    @InjectRepository(Toy)
    private toyRepository: Repository<Toy>,
    @InjectRepository(VoiceSession)
    private voiceSessionRepository: Repository<VoiceSession>,
  ) {
    this.apiKey = process.env.LIVEKIT_API_KEY!;
    this.apiSecret = process.env.LIVEKIT_API_SECRET!;
    this.livekitUrl = process.env.LIVEKIT_URL!;
    this.livekitWsUrl = process.env.LIVEKIT_WS_URL || this.livekitUrl?.replace('http', 'ws');

    if (!this.apiKey || !this.apiSecret || !this.livekitUrl) {
      throw new Error('LiveKit configuration is missing. Please check LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL environment variables.');
    }

    this.roomService = new RoomServiceClient(this.livekitUrl, this.apiKey, this.apiSecret);
  }

  // ==================== Token Generation ====================

  /**
   * Genera un token JWT para conectarse a una sala de LiveKit
   */
  async generateToken(
    roomName: string,
    participantName: string,
    options: {
      canPublish?: boolean;
      canSubscribe?: boolean;
      canPublishData?: boolean;
      metadata?: string;
    } = {}
  ): Promise<string> {
    const {
      canPublish = true,
      canSubscribe = true,
      canPublishData = true,
      metadata = ''
    } = options;

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantName,
      metadata,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish,
      canSubscribe,
      canPublishData,
    });

    const token = await at.toJwt();

    this.logger.log(`Token generated for ${participantName} in room ${roomName}`);
    return token;
  }

  /**
   * Genera token para Voice Agent (configuracion especifica)
   */
  async generateVoiceAgentToken(userId: string, sessionId: string): Promise<string> {
    const roomName = `voice-agent-${userId}-${sessionId}`;
    return await this.generateToken(roomName, `user-${userId}`, {
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      metadata: JSON.stringify({
        type: 'voice-agent',
        userId,
        sessionId,
        timestamp: Date.now()
      })
    });
  }

  /**
   * Genera token para IoT Device (configuracion especifica)
   */
  async generateIoTToken(deviceId: string, roomName: string): Promise<string> {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: deviceId,
      ttl: 900, // 15 minutes
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      hidden: false
    });

    const token = await at.toJwt();

    this.logger.log(`IoT Token generated for ${deviceId} in room ${roomName} (TTL: 900s)`);
    return token;
  }

  /**
   * Genera token para usuario web/movil que quiere conectarse a la sala de un toy
   */
  async generateUserToken(
    toyId: string,
    userIdentity?: string,
    metadata?: Record<string, any>
  ): Promise<{
    token: string;
    roomName: string;
    serverUrl: string;
    participantIdentity: string;
    toyName: string;
    toyId: string;
  }> {
    // Buscar el toy con su dispositivo IoT
    const toy = await this.toyRepository.findOne({
      where: { id: toyId },
      relations: ['iotDevice', 'user'],
    });

    if (!toy) {
      throw new NotFoundException(`Toy con ID ${toyId} no encontrado`);
    }

    if (!toy.iotDevice) {
      throw new BadRequestException(`El toy ${toyId} no tiene un dispositivo IoT asociado`);
    }

    // Buscar sala activa del dispositivo
    let roomName = toy.iotDevice.roomName;

    // Si no hay sala activa, buscar en las salas de LiveKit
    if (!roomName) {
      const rooms = await this.listRooms();
      const deviceRoom = rooms.find(r =>
        r.name.includes(toy.iotDevice.deviceId) ||
        r.name.includes(toy.id)
      );

      if (deviceRoom) {
        roomName = deviceRoom.name;
      }
    }

    if (!roomName) {
      throw new BadRequestException(`El toy ${toy.name} no esta conectado a ninguna sala activa`);
    }

    // Generar identidad del usuario
    const identity = userIdentity || `user-parent-${Date.now()}`;

    // Generar token con permisos de solo escucha y habla
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      ttl: 3600, // 1 hora
      metadata: JSON.stringify({
        type: 'parent-user',
        toyId,
        toyName: toy.name,
        ...(metadata || {})
      }),
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,      // Puede hablar
      canSubscribe: true,    // Puede escuchar
      canPublishData: true,  // Puede enviar datos
    });

    const token = await at.toJwt();

    this.logger.log(`User token generated for ${identity} to join toy ${toy.name} in room ${roomName}`);

    return {
      token,
      roomName,
      serverUrl: this.livekitWsUrl,
      participantIdentity: identity,
      toyName: toy.name,
      toyId: toy.id,
    };
  }

  // ==================== Room Management ====================

  /**
   * Crea una nueva sala en LiveKit
   */
  async createRoom(roomName: string, options: {
    maxParticipants?: number;
    emptyTimeout?: number;
    metadata?: string;
  } = {}): Promise<any> {
    try {
      const room = await this.roomService.createRoom({
        name: roomName,
        maxParticipants: options.maxParticipants || 50,
        emptyTimeout: options.emptyTimeout || 300,
        metadata: options.metadata || '',
      });

      this.logger.log(`Room created: ${roomName}`);
      return room;
    } catch (error) {
      this.logger.error(`Failed to create room ${roomName}:`, error);
      throw error;
    }
  }

  /**
   * Lista todas las salas activas
   */
  async listRooms(): Promise<any[]> {
    try {
      const rooms = await this.roomService.listRooms();
      return rooms;
    } catch (error) {
      this.logger.error('Failed to list rooms:', error);
      throw error;
    }
  }

  /**
   * Obtiene informacion de una sala especifica
   */
  async getRoom(roomName: string): Promise<any> {
    try {
      const rooms = await this.roomService.listRooms([roomName]);
      if (!rooms || rooms.length === 0) {
        throw new NotFoundException(`Sala ${roomName} no encontrada`);
      }
      return rooms[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to get room ${roomName}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una sala
   */
  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.roomService.deleteRoom(roomName);
      this.logger.log(`Room deleted: ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to delete room ${roomName}:`, error);
      throw error;
    }
  }

  // ==================== Participant Management ====================

  /**
   * Lista participantes de una sala
   */
  async listParticipants(roomName: string): Promise<any[]> {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants;
    } catch (error) {
      this.logger.error(`Failed to list participants for room ${roomName}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene informacion de un participante especifico
   */
  async getParticipant(roomName: string, identity: string): Promise<any> {
    try {
      const participant = await this.roomService.getParticipant(roomName, identity);
      return participant;
    } catch (error) {
      this.logger.error(`Failed to get participant ${identity} in room ${roomName}:`, error);
      throw error;
    }
  }

  /**
   * Desconecta a un participante de una sala (kick)
   */
  async removeParticipant(roomName: string, participantIdentity: string): Promise<void> {
    try {
      await this.roomService.removeParticipant(roomName, participantIdentity);
      this.logger.log(`Participant ${participantIdentity} removed from room ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to remove participant ${participantIdentity} from room ${roomName}:`, error);
      throw error;
    }
  }

  /**
   * Silencia/activa tracks de un participante (mute/unmute)
   */
  async muteParticipant(
    roomName: string,
    identity: string,
    muteAudio?: boolean,
    muteVideo?: boolean
  ): Promise<any> {
    try {
      // Obtener participante para ver sus tracks
      const participant = await this.roomService.getParticipant(roomName, identity);

      if (!participant) {
        throw new NotFoundException(`Participante ${identity} no encontrado en sala ${roomName}`);
      }

      // Mute audio tracks
      if (muteAudio !== undefined) {
        const audioTracks = participant.tracks?.filter((t: any) =>
          t.type === 'AUDIO' || t.source === 'MICROPHONE'
        ) || [];

        for (const track of audioTracks) {
          await this.roomService.mutePublishedTrack(roomName, identity, track.sid, muteAudio);
        }
      }

      // Mute video tracks
      if (muteVideo !== undefined) {
        const videoTracks = participant.tracks?.filter((t: any) =>
          t.type === 'VIDEO' || t.source === 'CAMERA'
        ) || [];

        for (const track of videoTracks) {
          await this.roomService.mutePublishedTrack(roomName, identity, track.sid, muteVideo);
        }
      }

      this.logger.log(`Participant ${identity} mute status updated - audio: ${muteAudio}, video: ${muteVideo}`);

      // Retornar estado actualizado
      return await this.roomService.getParticipant(roomName, identity);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to mute participant ${identity} in room ${roomName}:`, error);
      throw error;
    }
  }

  /**
   * Envia datos a participantes en una sala
   */
  async sendData(
    roomName: string,
    data: Record<string, any>,
    destinationIdentities?: string[],
    topic?: string
  ): Promise<void> {
    try {
      const encoder = new TextEncoder();
      const payload = encoder.encode(JSON.stringify(data));

      await this.roomService.sendData(
        roomName,
        payload,
        DataPacket_Kind.RELIABLE,
        {
          destinationIdentities: destinationIdentities || [],
          topic: topic || 'default',
        }
      );

      this.logger.log(`Data sent to room ${roomName}${destinationIdentities?.length ? ` (to: ${destinationIdentities.join(', ')})` : ' (broadcast)'}`);
    } catch (error) {
      this.logger.error(`Failed to send data to room ${roomName}:`, error);
      throw error;
    }
  }

  // ==================== Webhook Handlers ====================

  /**
   * Procesa evento participant_joined - Actualiza estado a online/connected
   */
  async handleParticipantJoined(
    roomName: string,
    participantIdentity: string,
    _participantMetadata?: string
  ): Promise<void> {
    this.logger.log(`Processing participant_joined: ${participantIdentity} in ${roomName}`);

    try {
      // Intentar identificar si es un dispositivo IoT
      const device = await this.iotDeviceRepository.findOne({
        where: [
          { deviceId: participantIdentity },
          { macAddress: participantIdentity }
        ],
        relations: ['toy'],
      });

      if (device) {
        // Actualizar IoTDevice
        device.status = 'online' as DeviceStatus;
        device.lastSeen = new Date();
        device.roomName = roomName;
        await this.iotDeviceRepository.save(device);

        // Actualizar Toy asociado
        if (device.toy) {
          const toy = await this.toyRepository.findOne({ where: { id: device.toy.id } });
          if (toy) {
            toy.status = ToyStatus.CONNECTED;
            toy.lastSeenAt = new Date();
            await this.toyRepository.save(toy);
            this.logger.log(`Toy ${toy.name} marked as CONNECTED`);
          }
        }

        this.logger.log(`Device ${device.name || device.deviceId} marked as online in room ${roomName}`);
        return;
      }

      // Verificar si es una sesion de voz por el nombre de la sala
      if (roomName.startsWith('voice-agent-') || roomName.startsWith('voice-session-')) {
        const session = await this.voiceSessionRepository.findOne({
          where: { roomName }
        });

        if (session && session.status !== 'active') {
          session.status = 'active';
          await this.voiceSessionRepository.save(session);
          this.logger.log(`Voice session ${session.id} marked as active`);
        }
      }
    } catch (error) {
      this.logger.error(`Error processing participant_joined: ${error.message}`);
    }
  }

  /**
   * Procesa evento participant_left - Actualiza estado a offline/disconnected
   */
  async handleParticipantLeft(
    roomName: string,
    participantIdentity: string
  ): Promise<void> {
    this.logger.log(`Processing participant_left: ${participantIdentity} from ${roomName}`);

    try {
      // Intentar identificar si es un dispositivo IoT
      const device = await this.iotDeviceRepository.findOne({
        where: [
          { deviceId: participantIdentity },
          { macAddress: participantIdentity }
        ],
        relations: ['toy'],
      });

      if (device) {
        // Verificar si hay otros participantes del mismo dispositivo en otras salas
        // antes de marcarlo como offline
        device.status = 'offline' as DeviceStatus;
        device.roomName = null;
        await this.iotDeviceRepository.save(device);

        // Actualizar Toy asociado
        if (device.toy) {
          const toy = await this.toyRepository.findOne({ where: { id: device.toy.id } });
          if (toy) {
            toy.status = ToyStatus.DISCONNECTED;
            await this.toyRepository.save(toy);
            this.logger.log(`Toy ${toy.name} marked as DISCONNECTED`);
          }
        }

        this.logger.log(`Device ${device.name || device.deviceId} marked as offline`);
        return;
      }
    } catch (error) {
      this.logger.error(`Error processing participant_left: ${error.message}`);
    }
  }

  /**
   * Procesa evento room_finished - Cierra sesiones de voz automaticamente
   */
  async handleRoomFinished(roomName: string): Promise<void> {
    this.logger.log(`Processing room_finished: ${roomName}`);

    try {
      // Buscar sesiones de voz asociadas a esta sala
      const session = await this.voiceSessionRepository.findOne({
        where: { roomName, status: 'active' }
      });

      if (session) {
        session.endSession();
        await this.voiceSessionRepository.save(session);
        this.logger.log(`Voice session ${session.id} ended (room finished)`);
      }

      // Actualizar dispositivos que estaban en esta sala
      const devices = await this.iotDeviceRepository.find({
        where: { roomName }
      });

      for (const device of devices) {
        device.roomName = null;
        device.status = 'offline' as DeviceStatus;
        await this.iotDeviceRepository.save(device);
      }

      if (devices.length > 0) {
        this.logger.log(`${devices.length} devices marked as offline (room finished)`);
      }
    } catch (error) {
      this.logger.error(`Error processing room_finished: ${error.message}`);
    }
  }

  /**
   * Procesa evento track_published - Registra cuando empieza a transmitir
   */
  async handleTrackPublished(
    roomName: string,
    participantIdentity: string,
    trackType?: string
  ): Promise<void> {
    this.logger.log(`Track ${trackType || 'unknown'} published by ${participantIdentity} in ${roomName}`);

    // Por ahora solo log, se puede extender para analytics
  }

  // ==================== Statistics ====================

  /**
   * Obtiene estadisticas generales de LiveKit
   */
  async getStats(): Promise<{
    totalRooms: number;
    totalParticipants: number;
    roomsByType: Record<string, number>;
    devicesOnline: number;
    toysConnected: number;
  }> {
    try {
      const rooms = await this.listRooms();

      let totalParticipants = 0;
      const roomsByType: Record<string, number> = {
        'voice-agent': 0,
        'voice-session': 0,
        'iot-device': 0,
        'esp32': 0,
        'other': 0,
      };

      for (const room of rooms) {
        totalParticipants += room.numParticipants || 0;

        if (room.name.startsWith('voice-agent-')) {
          roomsByType['voice-agent']++;
        } else if (room.name.startsWith('voice-session-')) {
          roomsByType['voice-session']++;
        } else if (room.name.startsWith('iot-device-')) {
          roomsByType['iot-device']++;
        } else if (room.name.startsWith('esp32-')) {
          roomsByType['esp32']++;
        } else {
          roomsByType['other']++;
        }
      }

      // Contar dispositivos online
      const devicesOnline = await this.iotDeviceRepository.count({
        where: { status: 'online' as DeviceStatus }
      });

      // Contar toys conectados
      const toysConnected = await this.toyRepository.count({
        where: { status: ToyStatus.CONNECTED }
      });

      return {
        totalRooms: rooms.length,
        totalParticipants,
        roomsByType,
        devicesOnline,
        toysConnected,
      };
    } catch (error) {
      this.logger.error('Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadisticas de un toy especifico
   */
  async getToyStats(toyId: string): Promise<{
    toyId: string;
    toyName: string;
    status: string;
    totalSessions: number;
    totalUsageSeconds: number;
    lastSession?: Date;
    currentRoom?: string;
    currentParticipants?: number;
  }> {
    const toy = await this.toyRepository.findOne({
      where: { id: toyId },
      relations: ['iotDevice'],
    });

    if (!toy) {
      throw new NotFoundException(`Toy con ID ${toyId} no encontrado`);
    }

    // Buscar sesiones de voz del usuario del toy
    const sessions = toy.userId ? await this.voiceSessionRepository.find({
      where: { userId: toy.userId },
      order: { startedAt: 'DESC' },
    }) : [];

    const totalUsageSeconds = sessions.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0
    );

    // Verificar sala activa
    let currentRoom: string | undefined;
    let currentParticipants = 0;

    if (toy.iotDevice?.roomName) {
      try {
        const room = await this.getRoom(toy.iotDevice.roomName);
        if (room) {
          currentRoom = room.name;
          currentParticipants = room.numParticipants || 0;
        }
      } catch {
        // Sala no existe, ignorar
      }
    }

    return {
      toyId: toy.id,
      toyName: toy.name,
      status: toy.status,
      totalSessions: sessions.length,
      totalUsageSeconds,
      lastSession: sessions[0]?.startedAt,
      currentRoom,
      currentParticipants,
    };
  }
}
