import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VoiceService } from './voice.service';
import {
  CreateVoiceSessionDto,
  CreateConversationDto,
  VoiceSessionFilters,
  EndSessionDto,
  VoiceAgentTokenRequestDto,
} from './dto/voice.dto';
import { VoiceSession } from './entities/voice-session.entity';
import { AiConversation } from './entities/ai-conversation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('voice')
@Controller('voice')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new voice session' })
  @ApiResponse({ status: 201, description: 'Session created successfully', type: VoiceSession })
  async createSession(@Body() createSessionDto: CreateVoiceSessionDto): Promise<VoiceSession> {
    return this.voiceService.createSession(createSessionDto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get voice sessions with optional filters' })
  @ApiResponse({ status: 200, description: 'List of sessions', type: [VoiceSession] })
  async findAllSessions(@Query() filters: VoiceSessionFilters): Promise<VoiceSession[]> {
    return this.voiceService.findAllSessions(filters);
  }

  @Get('sessions/metrics')
  @ApiOperation({ summary: 'Get voice session metrics and statistics' })
  @ApiResponse({ status: 200, description: 'Session metrics' })
  async getSessionMetrics() {
    return this.voiceService.getSessionMetrics();
  }

  @Get('sessions/active')
  @ApiOperation({ summary: 'Get all active voice sessions' })
  @ApiResponse({ status: 200, description: 'List of active sessions', type: [VoiceSession] })
  async getActiveSessions(): Promise<VoiceSession[]> {
    return this.voiceService.getActiveSessions();
  }

  @Get('sessions/user/:userId')
  @ApiOperation({ summary: 'Get sessions by user ID' })
  @ApiResponse({ status: 200, description: 'List of user sessions', type: [VoiceSession] })
  async getUserSessions(@Param('userId') userId: string): Promise<VoiceSession[]> {
    return this.voiceService.getUserSessions(userId);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a specific voice session with conversations' })
  @ApiResponse({ status: 200, description: 'Session details', type: VoiceSession })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findSession(@Param('id') id: string): Promise<VoiceSession> {
    return this.voiceService.findSession(id);
  }

  @Post('sessions/:id/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End a voice session' })
  @ApiResponse({ status: 200, description: 'Session ended successfully', type: VoiceSession })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async endSession(
    @Param('id') id: string,
    @Body() _endSessionDto?: EndSessionDto,
  ): Promise<VoiceSession> {
    return this.voiceService.endSession(id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Add a conversation message to a session' })
  @ApiResponse({ status: 201, description: 'Conversation added successfully', type: AiConversation })
  async addConversation(@Body() createConversationDto: CreateConversationDto): Promise<AiConversation> {
    return this.voiceService.addConversation(createConversationDto);
  }

  @Get('sessions/:id/conversations')
  @ApiOperation({ summary: 'Get all conversations for a session' })
  @ApiResponse({ status: 200, description: 'List of conversations', type: [AiConversation] })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSessionConversations(@Param('id') sessionId: string): Promise<AiConversation[]> {
    return this.voiceService.getSessionConversations(sessionId);
  }

  @Post('agent/token')
  @ApiOperation({ summary: 'Generate token for voice agent session' })
  @ApiResponse({ status: 200, description: 'Voice agent token generated' })
  async generateVoiceAgentToken(@Body() tokenRequest: VoiceAgentTokenRequestDto) {
    return this.voiceService.generateVoiceAgentToken(tokenRequest.userId);
  }

  @Post('maintenance/cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cleanup old voice sessions (maintenance endpoint)' })
  @ApiResponse({ status: 200, description: 'Old sessions cleaned up' })
  async cleanupOldSessions(@Query('days') days?: string): Promise<{ message: string }> {
    const daysToKeep = days ? parseInt(days, 10) : 30;
    await this.voiceService.cleanupOldSessions(daysToKeep);
    return { message: `Old sessions older than ${daysToKeep} days have been cleaned up` };
  }
}
