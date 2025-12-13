import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Metadata DTO - User and toy information
 */
export class DeviceMetadataDto {
  @ApiProperty({
    description: 'Owner/child name (the person who uses the toy)',
    example: 'Lucas',
  })
  owner_name: string;

  @ApiProperty({
    description: 'AI agent prompt for the toy',
    example: 'Eres un asistente amigable que ayuda a niños a aprender...',
  })
  agent_prompt: string;

  @ApiPropertyOptional({
    description: 'Owner interests',
    example: ['dinosaurios', 'espacio', 'robots'],
  })
  owner_interests?: string[];

  @ApiPropertyOptional({
    description: 'Learning goals',
    example: ['idiomas', 'matemáticas'],
  })
  learning_goals?: string[];

  @ApiPropertyOptional({
    description: 'Owner preferred language',
    example: 'es',
  })
  preferred_language?: string;

  @ApiPropertyOptional({
    description: 'Owner timezone',
    example: 'America/Lima',
  })
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Toy name',
    example: 'Mi Robot Azul',
  })
  toy_name?: string;

  @ApiPropertyOptional({
    description: 'Toy model',
    example: 'NebuBot Pro',
  })
  toy_model?: string;

  @ApiPropertyOptional({
    description: 'Owner age',
    example: 7,
  })
  owner_age?: number;
}

/**
 * Device Token Response DTO
 */
export class DeviceTokenResponseDto {
  @ApiProperty({
    description: 'LiveKit access token for real-time communication',
    example: 'eyJhbGciOiJIUzI1NiJ9.eyJtZXRhZGF0YSI6IntcInR5cGVcI...',
  })
  access_token: string;

  @ApiProperty({
    description: 'LiveKit room name where the device will connect',
    example: 'iot-device-a4538271-c9a3-43c8-8754-76fdd9a90520',
  })
  room_name: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900,
  })
  expires_in: number;

  @ApiProperty({
    description: 'LiveKit server URL',
    example: 'wss://brody-v541z1he.livekit.cloud',
  })
  server_url: string;

  @ApiProperty({
    description: 'Participant identity for LiveKit',
    example: 'ESP32_AA:BB:CC:DD:EE:FF',
  })
  participant_identity: string;

  @ApiPropertyOptional({
    description: 'User and toy metadata (only included if getMetadata=true)',
    type: DeviceMetadataDto,
  })
  metadata?: DeviceMetadataDto;
}

/**
 * Device Heartbeat DTO
 */
export class DeviceHeartbeatDto {
  @ApiProperty({
    description: 'Device ID',
    example: 'ESP32_8CBFEA877D0C',
  })
  @IsString()
  @IsNotEmpty()
  device_id: string;

  @ApiPropertyOptional({
    description: 'Battery level (0-100)',
    example: 85,
  })
  @IsNumber()
  @IsOptional()
  battery_level?: number;

  @ApiPropertyOptional({
    description: 'WiFi signal strength (dBm)',
    example: -45,
  })
  @IsNumber()
  @IsOptional()
  signal_strength?: number;

  @ApiPropertyOptional({
    description: 'Device temperature (°C)',
    example: 42,
  })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({
    description: 'CPU usage (%)',
    example: 35,
  })
  @IsNumber()
  @IsOptional()
  cpu_usage?: number;

  @ApiPropertyOptional({
    description: 'Memory usage (%)',
    example: 60,
  })
  @IsNumber()
  @IsOptional()
  memory_usage?: number;
}
