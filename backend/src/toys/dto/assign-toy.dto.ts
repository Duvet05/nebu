import { IsUUID, IsOptional, IsString, IsNotEmpty, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignToyDto {
  @ApiPropertyOptional({
    description: '⚠️ PREFERIR deviceId. Device ID del juguete a asignar (recomendado)',
    example: 'ESP32_8CBFEA877D0C',
  })
  @IsOptional()
  @IsString()
  @ValidateIf(o => !o.macAddress)
  @IsNotEmpty({ message: 'Debe proporcionar macAddress o deviceId' })
  deviceId?: string;

  @ApiPropertyOptional({
    description: '⚠️ LEGACY. MAC address del juguete a asignar (solo si deviceId no está disponible)',
    example: '8C:BF:EA:87:7D:0C',
  })
  @IsOptional()
  @IsString()
  @ValidateIf(o => !o.deviceId)
  @IsNotEmpty({ message: 'Debe proporcionar macAddress o deviceId' })
  macAddress?: string;

  @ApiProperty({
    description: 'ID del usuario al que asignar el juguete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Nombre opcional para renombrar el juguete al asignarlo',
    example: 'Mi Robot Personalizado',
  })
  @IsOptional()
  @IsString()
  toyName?: string;
}

export class AssignToyResponseDto {
  @ApiProperty({
    description: 'Indica si la asignación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Juguete asignado exitosamente al usuario',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Datos del juguete actualizado',
  })
  toy?: {
    id: string;
    name: string;
    macAddress?: string;
    deviceId?: string;
    userId?: string;
  };
}
