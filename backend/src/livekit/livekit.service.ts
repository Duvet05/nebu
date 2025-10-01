import { Injectable, Logger } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private readonly logger = new Logger(LiveKitService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly livekitUrl: string;
  private roomService: RoomServiceClient;

  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY!;
    this.apiSecret = process.env.LIVEKIT_API_SECRET!;
    this.livekitUrl = process.env.LIVEKIT_URL!;
    
    if (!this.apiKey || !this.apiSecret || !this.livekitUrl) {
      throw new Error('LiveKit configuration is missing. Please check LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL environment variables.');
    }
    
    this.roomService = new RoomServiceClient(this.livekitUrl, this.apiKey, this.apiSecret);
  }

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
   * Obtiene información de una sala específica
   */
  async getRoom(roomName: string): Promise<any> {
    try {
      const room = await this.roomService.listRooms([roomName]);
      return room[0] || null;
    } catch (error) {
      this.logger.error(`Failed to get room ${roomName}:`, error);
      throw error;
    }
  }

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
   * Desconecta a un participante de una sala
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

  /**
   * Genera token para Voice Agent (configuración específica)
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
   * Genera token para IoT Device (configuración específica)
   */
  async generateIoTToken(deviceId: string, roomName: string): Promise<string> {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: deviceId, // Use device_id directly as identity like your friend's implementation
      ttl: 900, // 900 seconds = 15 minutes (exactly like your friend's implementation)
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,      // ✅ Can publish tracks
      canSubscribe: true,    // ✅ Can subscribe to tracks
      canPublishData: true,  // ✅ Can publish to data channel
      hidden: false          // ❌ Hidden/invisible participant
    });

    const token = await at.toJwt();

    this.logger.log(`IoT Token generated for ${deviceId} in room ${roomName} (TTL: 900s)`);
    return token;
  }
}
