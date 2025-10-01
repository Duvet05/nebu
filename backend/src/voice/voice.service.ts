import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoiceSession } from './entities/voice-session.entity';
import { AiConversation } from './entities/ai-conversation.entity';
import { LiveKitService } from '../livekit/livekit.service';
import {
  CreateVoiceSessionDto,
  CreateConversationDto,
  VoiceSessionFilters,
} from './dto/voice.dto';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  constructor(
    @InjectRepository(VoiceSession)
    private voiceSessionRepository: Repository<VoiceSession>,
    @InjectRepository(AiConversation)
    private conversationRepository: Repository<AiConversation>,
    private livekitService: LiveKitService,
  ) {}

  async createSession(createSessionDto: CreateVoiceSessionDto): Promise<VoiceSession> {
    const session = this.voiceSessionRepository.create(createSessionDto);
    const savedSession = await this.voiceSessionRepository.save(session);
    
    this.logger.log(`Voice session created: ${savedSession.id} for user ${savedSession.userId}`);
    return savedSession;
  }

  async findAllSessions(filters: VoiceSessionFilters = {}): Promise<VoiceSession[]> {
    const query = this.voiceSessionRepository.createQueryBuilder('session');

    if (filters.userId) {
      query.andWhere('session.userId = :userId', { userId: filters.userId });
    }

    if (filters.status) {
      query.andWhere('session.status = :status', { status: filters.status });
    }

    if (filters.language) {
      query.andWhere('session.language = :language', { language: filters.language });
    }

    return query
      .orderBy('session.startedAt', 'DESC')
      .getMany();
  }

  async findSession(id: string): Promise<VoiceSession> {
    const session = await this.voiceSessionRepository.findOne({
      where: { id },
      relations: ['conversations'],
    });
    
    if (!session) {
      throw new NotFoundException(`Voice session with ID ${id} not found`);
    }
    
    return session;
  }

  async endSession(id: string): Promise<VoiceSession> {
    const session = await this.findSession(id);
    session.endSession();
    
    const updatedSession = await this.voiceSessionRepository.save(session);
    this.logger.log(`Voice session ended: ${id} (duration: ${session.durationSeconds}s)`);
    
    return updatedSession;
  }

  async addConversation(createConversationDto: CreateConversationDto): Promise<AiConversation> {
    const { sessionId, ...conversationData } = createConversationDto;
    
    // Verify session exists and is active
    const session = await this.findSession(sessionId);
    if (!session.isActive()) {
      throw new Error(`Cannot add conversation to inactive session: ${sessionId}`);
    }

    const conversation = this.conversationRepository.create({
      ...conversationData,
      sessionId,
    });
    
    const savedConversation = await this.conversationRepository.save(conversation);
    
    // Update session statistics
    session.addMessage(
      createConversationDto.tokensUsed || 0,
      createConversationDto.cost || 0
    );
    await this.voiceSessionRepository.save(session);
    
    this.logger.log(`Conversation added to session ${sessionId}: ${savedConversation.messageType}`);
    return savedConversation;
  }

  async getSessionConversations(sessionId: string): Promise<AiConversation[]> {
    return this.conversationRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async getUserSessions(userId: string): Promise<VoiceSession[]> {
    return this.voiceSessionRepository.find({
      where: { userId },
      order: { startedAt: 'DESC' },
    });
  }

  async getActiveSessions(): Promise<VoiceSession[]> {
    return this.voiceSessionRepository.find({
      where: { status: 'active' },
      order: { startedAt: 'DESC' },
    });
  }

  async generateVoiceAgentToken(userId: string): Promise<{
    token: string;
    roomName: string;
    participantName: string;
    livekitUrl: string;
    sessionId: string;
  }> {
    // Create a new voice session
    const session = await this.createSession({
      userId,
      language: 'es',
      metadata: { type: 'voice-agent', createdBy: 'mobile-app' }
    });

    // Generate LiveKit token
    const sessionId = session.id;
    const token = await this.livekitService.generateVoiceAgentToken(userId, sessionId);

    // Update session with room info
    session.roomName = `voice-session-${sessionId}`;
    session.sessionToken = token;
    await this.voiceSessionRepository.save(session);

    return {
      token,
      roomName: session.roomName,
      participantName: `user-${userId}`,
      livekitUrl: process.env.LIVEKIT_WS_URL || 'ws://localhost:7880',
      sessionId: session.id,
    };
  }

  async getSessionMetrics(): Promise<{
    totalSessions: number;
    activeSessions: number;
    totalConversations: number;
    averageSessionDuration: number;
    totalTokensUsed: number;
    totalCost: number;
  }> {
    const [sessions, totalSessions] = await this.voiceSessionRepository.findAndCount();
    const activeSessions = sessions.filter(s => s.status === 'active').length;
    
    const totalConversations = await this.conversationRepository.count();
    
    const completedSessions = sessions.filter(s => s.durationSeconds !== null);
    const averageSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / completedSessions.length
      : 0;

    const totalTokensUsed = sessions.reduce((sum, s) => sum + s.totalTokensUsed, 0);
    const totalCost = sessions.reduce((sum, s) => sum + s.totalCost, 0);

    return {
      totalSessions,
      activeSessions,
      totalConversations,
      averageSessionDuration: Math.round(averageSessionDuration * 100) / 100,
      totalTokensUsed,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  }

  async cleanupOldSessions(olderThanDays: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.voiceSessionRepository
      .createQueryBuilder()
      .delete()
      .where('startedAt < :cutoffDate', { cutoffDate })
      .andWhere('status != :activeStatus', { activeStatus: 'active' })
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log(`Cleaned up ${result.affected} old voice sessions`);
    }
  }
}
