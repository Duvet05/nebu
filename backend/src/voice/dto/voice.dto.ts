import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type SessionStatus = 'active' | 'ended' | 'paused' | 'error';
export type MessageType = 'user' | 'assistant' | 'system';

export class CreateVoiceSessionDto {
  @ApiPropertyOptional({ description: 'User ID who owns this session' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Session token from LiveKit' })
  @IsOptional()
  @IsString()
  sessionToken?: string;

  @ApiPropertyOptional({ description: 'LiveKit room name' })
  @IsOptional()
  @IsString()
  roomName?: string;

  @ApiPropertyOptional({ 
    description: 'Session language',
    example: 'es',
    default: 'es'
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Additional session metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateConversationDto {
  @ApiProperty({ description: 'Session ID this conversation belongs to' })
  @IsUUID()
  sessionId: string;

  @ApiPropertyOptional({ description: 'User ID who sent this message' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ 
    description: 'Type of message',
    enum: ['user', 'assistant', 'system'],
    example: 'user'
  })
  @IsEnum(['user', 'assistant', 'system'])
  messageType: MessageType;

  @ApiProperty({ description: 'Message content', example: 'Hello, how are you?' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'URL to audio file if available' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Number of tokens used for this message' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tokensUsed?: number;

  @ApiPropertyOptional({ description: 'Processing time in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  processingTimeMs?: number;

  @ApiPropertyOptional({ description: 'Cost for this message processing' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'Additional message metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class VoiceSessionFilters {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by session status',
    enum: ['active', 'ended', 'paused', 'error']
  })
  @IsOptional()
  @IsEnum(['active', 'ended', 'paused', 'error'])
  status?: SessionStatus;

  @ApiPropertyOptional({ description: 'Filter by language' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class EndSessionDto {
  @ApiPropertyOptional({ description: 'Optional end reason or notes' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class VoiceAgentTokenRequestDto {
  @ApiProperty({ description: 'User ID requesting the token' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ 
    description: 'Preferred language for the session',
    example: 'es',
    default: 'es'
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Additional metadata for the session' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
