import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, IsNumber } from 'class-validator';

// ==================== Token DTOs ====================

export class GenerateTokenDto {
  @ApiProperty({ description: 'Nombre de la sala' })
  @IsString()
  roomName: string;

  @ApiProperty({ description: 'Nombre del participante' })
  @IsString()
  participantName: string;

  @ApiPropertyOptional({ description: 'Puede publicar tracks' })
  @IsOptional()
  @IsBoolean()
  canPublish?: boolean;

  @ApiPropertyOptional({ description: 'Puede suscribirse a tracks' })
  @IsOptional()
  @IsBoolean()
  canSubscribe?: boolean;

  @ApiPropertyOptional({ description: 'Metadata adicional' })
  @IsOptional()
  @IsString()
  metadata?: string;
}

export class CreateRoomDto {
  @ApiProperty({ description: 'Nombre de la sala' })
  @IsString()
  roomName: string;

  @ApiPropertyOptional({ description: 'Numero maximo de participantes' })
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @ApiPropertyOptional({ description: 'Timeout de sala vacia (segundos)' })
  @IsOptional()
  @IsNumber()
  emptyTimeout?: number;

  @ApiPropertyOptional({ description: 'Metadata de la sala' })
  @IsOptional()
  @IsString()
  metadata?: string;
}

export class VoiceAgentTokenDto {
  @ApiProperty({ description: 'ID del usuario' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'ID de la sesion' })
  @IsString()
  sessionId: string;
}

export class IoTTokenDto {
  @ApiProperty({ description: 'ID del dispositivo' })
  @IsString()
  deviceId: string;

  @ApiProperty({ description: 'Nombre de la sala' })
  @IsString()
  roomName: string;
}

// ==================== User Token DTO ====================

export class UserTokenDto {
  @ApiProperty({ description: 'ID del toy al que conectarse' })
  @IsString()
  toyId: string;

  @ApiPropertyOptional({ description: 'Identidad del usuario (opcional, se genera si no se proporciona)' })
  @IsOptional()
  @IsString()
  identity?: string;

  @ApiPropertyOptional({ description: 'Metadata adicional del usuario' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UserTokenResponseDto {
  @ApiProperty({ description: 'Token JWT para LiveKit' })
  token: string;

  @ApiProperty({ description: 'Nombre de la sala' })
  roomName: string;

  @ApiProperty({ description: 'URL del servidor LiveKit WebSocket' })
  serverUrl: string;

  @ApiProperty({ description: 'Identidad del participante' })
  participantIdentity: string;

  @ApiProperty({ description: 'Nombre del toy' })
  toyName: string;

  @ApiProperty({ description: 'ID del toy' })
  toyId: string;
}

// ==================== Control DTOs ====================

export class MuteParticipantDto {
  @ApiPropertyOptional({ description: 'Silenciar audio' })
  @IsOptional()
  @IsBoolean()
  muteAudio?: boolean;

  @ApiPropertyOptional({ description: 'Silenciar video' })
  @IsOptional()
  @IsBoolean()
  muteVideo?: boolean;
}

export class SendDataDto {
  @ApiProperty({ description: 'Datos a enviar (se convertiran a JSON)' })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ description: 'Identidades destino (vacio = todos)' })
  @IsOptional()
  @IsString({ each: true })
  destinationIdentities?: string[];

  @ApiPropertyOptional({ description: 'Topic del mensaje' })
  @IsOptional()
  @IsString()
  topic?: string;
}

// ==================== Stats DTOs ====================

export class LiveKitStatsDto {
  @ApiProperty({ description: 'Total de salas activas' })
  totalRooms: number;

  @ApiProperty({ description: 'Total de participantes' })
  totalParticipants: number;

  @ApiProperty({ description: 'Salas por tipo' })
  roomsByType: Record<string, number>;

  @ApiProperty({ description: 'Dispositivos online' })
  devicesOnline: number;

  @ApiProperty({ description: 'Toys conectados' })
  toysConnected: number;
}

export class ToyStatsDto {
  @ApiProperty({ description: 'ID del toy' })
  toyId: string;

  @ApiProperty({ description: 'Nombre del toy' })
  toyName: string;

  @ApiProperty({ description: 'Estado actual' })
  status: string;

  @ApiProperty({ description: 'Sesiones totales' })
  totalSessions: number;

  @ApiProperty({ description: 'Tiempo total de uso (segundos)' })
  totalUsageSeconds: number;

  @ApiProperty({ description: 'Ultima sesion' })
  lastSession?: Date;

  @ApiProperty({ description: 'Sala activa actual' })
  currentRoom?: string;

  @ApiProperty({ description: 'Participantes en sala' })
  currentParticipants?: number;
}

// ==================== Webhook DTOs ====================

export class WebhookEventDto {
  @ApiProperty({ description: 'Tipo de evento' })
  event: string;

  @ApiPropertyOptional({ description: 'Informacion de la sala' })
  room?: {
    name: string;
    sid?: string;
    metadata?: string;
    numParticipants?: number;
    creationTime?: number;
  };

  @ApiPropertyOptional({ description: 'Informacion del participante' })
  participant?: {
    identity: string;
    sid?: string;
    name?: string;
    metadata?: string;
    state?: string;
    joinedAt?: number;
  };

  @ApiPropertyOptional({ description: 'Informacion del track' })
  track?: {
    sid?: string;
    type?: string;
    name?: string;
    muted?: boolean;
    source?: string;
  };

  @ApiPropertyOptional({ description: 'Timestamp del evento' })
  createdAt?: number;

  @ApiPropertyOptional({ description: 'ID del evento' })
  id?: string;
}
