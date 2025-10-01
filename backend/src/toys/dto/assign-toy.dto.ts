import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignToyDto {
  @ApiProperty({
    description: 'ID del juguete a asignar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  toyId: string;

  @ApiPropertyOptional({
    description: 'ID del usuario al que asignar el juguete (null para desasignar)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
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
    macAddress: string;
    userId?: string;
  };
}
