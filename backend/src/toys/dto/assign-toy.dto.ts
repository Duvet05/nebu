import { IsUUID, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignToyDto {
  @ApiProperty({
    description: 'MAC address del juguete a asignar',
    example: 'AA:BB:CC:DD:EE:FF',
  })
  @IsString()
  @IsNotEmpty()
  macAddress: string;

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
