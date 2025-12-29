import { IsString, IsOptional, IsEnum, IsObject, IsNotEmpty, Length, Matches, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToyStatus } from '../entities/toy.entity';

export class CreateToyDto {
  @ApiPropertyOptional({
    description: '⚠️ PREFERIR deviceId. Device ID del ESP32 obtenido vía BLE (recomendado)',
    example: 'ESP32_8CBFEA877D0C',
  })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  @ValidateIf(o => !o.macAddress)
  @IsNotEmpty({ message: 'Debe proporcionar macAddress o deviceId' })
  deviceId?: string;

  @ApiPropertyOptional({
    description: '⚠️ LEGACY. MAC address del dispositivo IoT (solo usar si deviceId no está disponible)',
    example: '8C:BF:EA:87:7D:0C',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, {
    message: 'MAC address debe tener formato XX:XX:XX:XX:XX:XX o XX-XX-XX-XX-XX-XX',
  })
  @ValidateIf(o => !o.deviceId)
  @IsNotEmpty({ message: 'Debe proporcionar macAddress o deviceId' })
  macAddress?: string;

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
}
