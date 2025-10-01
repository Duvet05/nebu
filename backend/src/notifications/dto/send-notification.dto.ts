import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsDateString,
} from 'class-validator';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

export class SendNotificationDto {
  @ApiProperty({
    description: 'IDs de usuarios destinatarios',
    example: ['uuid1', 'uuid2', 'uuid3'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  userIds: string[];

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.EMAIL,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Mantenimiento programado',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'El sistema estará en mantenimiento el domingo de 2:00 a 4:00 AM',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Datos adicionales en formato JSON',
    example: { maintenanceStart: '2024-01-15T02:00:00Z', maintenanceEnd: '2024-01-15T04:00:00Z' },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Prioridad de la notificación',
    enum: NotificationPriority,
    example: NotificationPriority.HIGH,
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
}
