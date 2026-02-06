import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgentHealthComponentDto {
  @ApiProperty({ description: 'Estado del componente', example: 'healthy' })
  status: string;
}

export class AgentHealthDto {
  @ApiProperty({ description: 'Estado general del agente', example: 'healthy' })
  status: string;

  @ApiPropertyOptional({ description: 'Timestamp del health check' })
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Tiempo de actividad en segundos' })
  uptime_seconds?: number;

  @ApiPropertyOptional({ description: 'Estado de cada componente' })
  components?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Versión del agente' })
  version?: string;
}

export class AgentInfoDto {
  @ApiProperty({ description: 'Nombre del agente' })
  agent_name: string;

  @ApiProperty({ description: 'Versión del agente' })
  version: string;

  @ApiPropertyOptional({ description: 'Nivel de logging' })
  log_level?: string;

  @ApiPropertyOptional({ description: 'Estado de salud' })
  health_status?: string;

  @ApiPropertyOptional({ description: 'Tiempo de actividad en segundos' })
  uptime_seconds?: number;
}

export class AgentSessionParticipantDto {
  @ApiProperty({ description: 'Identidad del participante' })
  identity: string;

  @ApiPropertyOptional({ description: 'Nombre del participante' })
  name?: string;

  @ApiPropertyOptional({ description: 'Metadata del participante' })
  metadata?: string;

  @ApiPropertyOptional({ description: 'Estado del participante' })
  state?: string;
}

export class AgentSessionDto {
  @ApiProperty({ description: 'Nombre de la sala LiveKit' })
  roomName: string;

  @ApiProperty({ description: 'Número de participantes' })
  participantCount: number;

  @ApiPropertyOptional({ description: 'Metadata de la sala (parsed)' })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Fecha de creación de la sala' })
  createdAt?: number;
}

export class AgentSessionDetailDto extends AgentSessionDto {
  @ApiProperty({ description: 'Lista de participantes', type: [AgentSessionParticipantDto] })
  participants: AgentSessionParticipantDto[];
}

export class AgentStatusDto {
  @ApiProperty({ description: 'Estado de salud del agente' })
  health: AgentHealthDto;

  @ApiProperty({ description: 'Sesiones activas del agente', type: [AgentSessionDto] })
  activeSessions: AgentSessionDto[];

  @ApiProperty({ description: 'Total de sesiones activas' })
  totalSessions: number;
}
