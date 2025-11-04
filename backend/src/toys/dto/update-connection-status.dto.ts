import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToyStatus } from '../entities/toy.entity';

export class UpdateConnectionStatusDto {
  @ApiProperty({
    description: 'Estado actual del juguete',
    enum: ToyStatus,
    example: ToyStatus.CONNECTED,
  })
  @IsEnum(ToyStatus)
  status: ToyStatus;

  @ApiPropertyOptional({
    description: 'Nivel de batería',
    example: '85%',
  })
  @IsOptional()
  @IsString()
  batteryLevel?: string;

  @ApiPropertyOptional({
    description: 'Fuerza de señal WiFi',
    example: '-45dBm',
  })
  @IsOptional()
  @IsString()
  signalStrength?: string;
}
