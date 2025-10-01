import { IsString, IsOptional, IsEnum, IsObject, IsUUID, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToyStatus } from '../entities/toy.entity';

export class CreateToyDto {
  @ApiProperty({
    description: 'ID del dispositivo IoT al que pertenece este juguete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  iotDeviceId: string;

  @ApiProperty({
    description: 'Nombre del juguete',
    example: 'Mi Robot Azul',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Modelo del juguete',
    example: 'NebuBot Pro',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  model?: string;

  @ApiPropertyOptional({
    description: 'Fabricante del juguete',
    example: 'Nebu Technologies',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Estado inicial del juguete',
    enum: ToyStatus,
    default: ToyStatus.INACTIVE,
  })
  @IsOptional()
  @IsEnum(ToyStatus)
  status?: ToyStatus;

  @ApiPropertyOptional({
    description: 'Versión del firmware',
    example: '1.2.3',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firmwareVersion?: string;

  @ApiPropertyOptional({
    description: 'Capacidades del juguete',
    example: {
      voice: true,
      movement: true,
      lights: true,
      sensors: ['temperature', 'proximity'],
      aiFeatures: ['speech_recognition', 'face_detection']
    },
  })
  @IsOptional()
  @IsObject()
  capabilities?: {
    voice?: boolean;
    movement?: boolean;
    lights?: boolean;
    sensors?: string[];
    aiFeatures?: string[];
  };

  @ApiPropertyOptional({
    description: 'Configuraciones iniciales del juguete',
    example: {
      volume: 70,
      brightness: 80,
      language: 'es',
      timezone: 'America/Mexico_City',
      autoUpdate: true
    },
  })
  @IsOptional()
  @IsObject()
  settings?: {
    volume?: number;
    brightness?: number;
    language?: string;
    timezone?: string;
    autoUpdate?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el juguete',
    example: 'Regalo de cumpleaños para mi hijo',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
