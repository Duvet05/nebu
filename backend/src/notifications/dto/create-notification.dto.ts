import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.IN_APP,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Nuevo curso disponible',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Se ha publicado un nuevo curso que podría interesarte',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Datos adicionales en formato JSON',
    example: { courseId: 'uuid', courseName: 'React Avanzado' },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Prioridad de la notificación',
    enum: NotificationPriority,
    example: NotificationPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'Fecha programada para envío',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @ApiPropertyOptional({
    description: 'Número máximo de reintentos',
    example: 3,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxRetries?: number;
}
