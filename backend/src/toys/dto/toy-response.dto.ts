import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToyStatus } from '../entities/toy.entity';

export class ToyResponseDto {
  @ApiProperty({
    description: 'ID único del juguete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del dispositivo IoT asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  iotDeviceId: string;

  @ApiProperty({
    description: 'MAC address del dispositivo IoT (obtenido de la relación)',
    example: '00:1B:44:11:3A:B7',
  })
  macAddress: string;

  @ApiProperty({
    description: 'Nombre del juguete',
    example: 'Mi Robot Azul',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Modelo del juguete',
    example: 'NebuBot Pro',
  })
  model?: string;

  @ApiPropertyOptional({
    description: 'Fabricante del juguete',
    example: 'Nebu Technologies',
  })
  manufacturer?: string;

  @ApiProperty({
    description: 'Estado actual del juguete',
    enum: ToyStatus,
    example: ToyStatus.ACTIVE,
  })
  status: ToyStatus;

  @ApiProperty({
    description: 'Texto descriptivo del estado',
    example: 'Activado',
  })
  statusText: string;

  @ApiProperty({
    description: 'Color del estado para UI',
    example: 'green',
  })
  statusColor: string;

  @ApiPropertyOptional({
    description: 'Versión del firmware',
    example: '1.2.3',
  })
  firmwareVersion?: string;

  @ApiPropertyOptional({
    description: 'Nivel de batería',
    example: '85%',
  })
  batteryLevel?: string;

  @ApiPropertyOptional({
    description: 'Fuerza de señal WiFi',
    example: '-45dBm',
  })
  signalStrength?: string;

  @ApiPropertyOptional({
    description: 'Última vez que se conectó',
    example: '2024-01-15T10:30:00Z',
  })
  lastSeenAt?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de activación',
    example: '2024-01-15T10:30:00Z',
  })
  activatedAt?: Date;

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
  capabilities?: {
    voice?: boolean;
    movement?: boolean;
    lights?: boolean;
    sensors?: string[];
    aiFeatures?: string[];
  };

  @ApiPropertyOptional({
    description: 'Configuraciones del juguete',
    example: {
      volume: 70,
      brightness: 80,
      language: 'es',
      timezone: 'America/Mexico_City',
      autoUpdate: true
    },
  })
  settings?: {
    volume?: number;
    brightness?: number;
    language?: string;
    timezone?: string;
    autoUpdate?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Notas adicionales',
    example: 'Regalo de cumpleaños para mi hijo',
  })
  notes?: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  // Métodos helper
  isActive: boolean;
  isConnected: boolean;
  needsAttention: boolean;
}

export class ToyListResponseDto {
  @ApiProperty({
    description: 'Lista de juguetes',
    type: [ToyResponseDto],
  })
  toys: ToyResponseDto[];

  @ApiProperty({
    description: 'Total de juguetes',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Límite por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 2,
  })
  totalPages: number;
}
