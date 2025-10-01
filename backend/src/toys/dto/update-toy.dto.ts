import { PartialType } from '@nestjs/swagger';
import { CreateToyDto } from './create-toy.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ToyStatus } from '../entities/toy.entity';

export class UpdateToyDto extends PartialType(CreateToyDto) {
  @ApiPropertyOptional({
    description: 'Nuevo estado del juguete',
    enum: ToyStatus,
  })
  @IsOptional()
  @IsEnum(ToyStatus)
  status?: ToyStatus;

  @ApiPropertyOptional({
    description: 'Nivel de batería actual',
    example: '85%',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  batteryLevel?: string;

  @ApiPropertyOptional({
    description: 'Fuerza de señal WiFi',
    example: '-45dBm',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  signalStrength?: string;

  @ApiPropertyOptional({
    description: 'Última vez que se conectó (ISO string)',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsString()
  lastSeenAt?: string;

  @ApiPropertyOptional({
    description: 'Fecha de activación (ISO string)',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsString()
  activatedAt?: string;
}
