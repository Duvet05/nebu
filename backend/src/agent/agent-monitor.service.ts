import { Injectable, Logger } from '@nestjs/common';
import { LiveKitService } from '../livekit/livekit.service';
import {
  AgentHealthDto,
  AgentInfoDto,
  AgentSessionDto,
  AgentSessionDetailDto,
  AgentStatusDto,
} from './dto/agent.dto';

@Injectable()
export class AgentMonitorService {
  private readonly logger = new Logger(AgentMonitorService.name);
  private readonly agentApiUrl: string;

  constructor(private readonly livekitService: LiveKitService) {
    this.agentApiUrl = (process.env.AGENT_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  }

  // ==================== Health Proxy ====================

  async getHealth(): Promise<AgentHealthDto> {
    return this.fetchAgent<AgentHealthDto>('/health');
  }

  async getFullHealth(): Promise<AgentHealthDto> {
    return this.fetchAgent<AgentHealthDto>('/health/full');
  }

  async isReady(): Promise<{ ready: boolean; status: string }> {
    return this.fetchAgent<{ ready: boolean; status: string }>('/ready');
  }

  async getInfo(): Promise<AgentInfoDto> {
    return this.fetchAgent<AgentInfoDto>('/info');
  }

  // ==================== Sesiones Activas (via LiveKit) ====================

  async getActiveSessions(): Promise<AgentSessionDto[]> {
    const rooms = await this.livekitService.listRooms();

    return rooms
      .filter((room: any) => room.name?.startsWith('iot-device-'))
      .map((room: any) => ({
        roomName: room.name,
        participantCount: Number(room.numParticipants || 0),
        metadata: this.parseMetadata(room.metadata),
        createdAt: Number(room.creationTime || 0),
      }));
  }

  async getSessionDetail(roomName: string): Promise<AgentSessionDetailDto> {
    const room = await this.livekitService.getRoom(roomName);
    const participants = await this.livekitService.listParticipants(roomName);

    return {
      roomName: room.name,
      participantCount: Number(room.numParticipants || 0),
      metadata: this.parseMetadata(room.metadata),
      createdAt: Number(room.creationTime || 0),
      participants: participants.map((p: any) => ({
        identity: p.identity,
        name: p.name,
        metadata: p.metadata,
        state: p.state !== undefined ? String(p.state) : undefined,
      })),
    };
  }

  // ==================== Control ====================

  async stopSession(roomName: string): Promise<{ stopped: boolean; roomName: string }> {
    this.logger.warn(`Stopping agent session: ${roomName}`);
    await this.livekitService.deleteRoom(roomName);
    return { stopped: true, roomName };
  }

  // ==================== Status Combinado ====================

  async getStatus(): Promise<AgentStatusDto> {
    const [health, activeSessions] = await Promise.all([
      this.getHealth(),
      this.getActiveSessions(),
    ]);

    return {
      health,
      activeSessions,
      totalSessions: activeSessions.length,
    };
  }

  // ==================== Helpers ====================

  private async fetchAgent<T>(path: string): Promise<T> {
    const url = `${this.agentApiUrl}${path}`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        this.logger.warn(`Agent API returned ${response.status} for ${path}`);
        return { status: 'error', message: `Agent returned ${response.status}` } as T;
      }

      return await response.json() as T;
    } catch (error) {
      this.logger.warn(`Agent unreachable at ${url}: ${error.message}`);
      return { status: 'unreachable', message: error.message } as T;
    }
  }

  private parseMetadata(metadata?: string): Record<string, any> | undefined {
    if (!metadata) return undefined;
    try {
      return JSON.parse(metadata);
    } catch {
      return { raw: metadata };
    }
  }
}
