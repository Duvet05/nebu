import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { SendNotificationDto } from '../dto/send-notification.dto';
import {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
} from '../entities/notification.entity';

@Injectable()
export class NotificationValidator {
  /**
   * Validates and sanitizes notification parameters with secure defaults
   */
  validateCreateNotification(dto: CreateNotificationDto): CreateNotificationDto {
    // Validate and set secure defaults
    const validatedDto: CreateNotificationDto = {
      ...dto,
      type: this.validateNotificationType(dto.type),
      priority: this.validatePriority(dto.priority),
      maxRetries: this.validateMaxRetries(dto.maxRetries),
      title: this.sanitizeTitle(dto.title),
      message: this.sanitizeMessage(dto.message),
      scheduledAt: this.validateScheduledAt(dto.scheduledAt),
    };

    // Handle data separately since it needs different handling
    if (dto.data) {
      const validatedDataString = this.validateData(dto.data);
      if (validatedDataString) {
        validatedDto.data = JSON.parse(validatedDataString);
      }
    }

    return validatedDto;
  }

  /**
   * Validates and sanitizes bulk notification parameters
   */
  validateSendNotification(dto: SendNotificationDto): SendNotificationDto {
    // Validate user IDs array
    if (!dto.userIds || !Array.isArray(dto.userIds) || dto.userIds.length === 0) {
      throw new BadRequestException('userIds debe ser un array no vacío');
    }

    if (dto.userIds.length > 1000) {
      throw new BadRequestException(
        'No se pueden enviar notificaciones a más de 1000 usuarios a la vez'
      );
    }

    // Validate each userId
    const validUserIds = dto.userIds.filter(id => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return typeof id === 'string' && uuidRegex.test(id);
    });

    if (validUserIds.length !== dto.userIds.length) {
      throw new BadRequestException('Todos los userIds deben ser UUIDs válidos');
    }

    const validatedDto: SendNotificationDto = {
      ...dto,
      userIds: validUserIds,
      type: this.validateNotificationType(dto.type),
      priority: this.validatePriority(dto.priority),
      title: this.sanitizeTitle(dto.title),
      message: this.sanitizeMessage(dto.message),
      scheduledAt: this.validateScheduledAt(dto.scheduledAt),
    };

    // Handle data separately since it needs different handling
    if (dto.data) {
      const validatedDataString = this.validateData(dto.data);
      if (validatedDataString) {
        validatedDto.data = JSON.parse(validatedDataString);
      }
    }

    return validatedDto;
  }

  /**
   * Validates notification type with secure default
   */
  private validateNotificationType(type?: NotificationType): NotificationType {
    if (!type) {
      return NotificationType.IN_APP; // Secure default
    }

    if (!Object.values(NotificationType).includes(type)) {
      throw new BadRequestException(`Tipo de notificación inválido: ${type}`);
    }

    return type;
  }

  /**
   * Validates priority with secure default
   */
  private validatePriority(priority?: NotificationPriority): NotificationPriority {
    if (!priority) {
      return NotificationPriority.MEDIUM; // Secure default
    }

    if (!Object.values(NotificationPriority).includes(priority)) {
      throw new BadRequestException(`Prioridad inválida: ${priority}`);
    }

    return priority;
  }

  /**
   * Validates max retries with secure limits
   */
  private validateMaxRetries(maxRetries?: number): number {
    if (!maxRetries) {
      return 3; // Secure default
    }

    if (!Number.isInteger(maxRetries) || maxRetries < 1 || maxRetries > 10) {
      throw new BadRequestException('maxRetries debe ser un entero entre 1 y 10');
    }

    return maxRetries;
  }

  /**
   * Sanitizes title to prevent XSS and enforce limits
   */
  private sanitizeTitle(title: string): string {
    if (!title || typeof title !== 'string') {
      throw new BadRequestException('El título es requerido');
    }

    // Remove HTML tags and dangerous characters
    const sanitized = title
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim();

    if (sanitized.length === 0) {
      throw new BadRequestException('El título no puede estar vacío');
    }

    if (sanitized.length > 255) {
      throw new BadRequestException('El título no puede exceder 255 caracteres');
    }

    return sanitized;
  }

  /**
   * Sanitizes message to prevent XSS and enforce limits
   */
  private sanitizeMessage(message: string): string {
    if (!message || typeof message !== 'string') {
      throw new BadRequestException('El mensaje es requerido');
    }

    // Remove HTML tags and dangerous characters
    const sanitized = message
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim();

    if (sanitized.length === 0) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }

    if (sanitized.length > 1000) {
      throw new BadRequestException('El mensaje no puede exceder 1000 caracteres');
    }

    return sanitized;
  }

  /**
   * Validates and sanitizes data object
   */
  private validateData(data?: Record<string, any>): string | null {
    if (!data) {
      return null;
    }

    try {
      // Ensure data is serializable and not too large
      const serialized = JSON.stringify(data);

      if (serialized.length > 5000) {
        throw new BadRequestException('Los datos no pueden exceder 5000 caracteres');
      }

      // Check for dangerous patterns
      const dangerousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /data:/i, /vbscript:/i];

      const dataString = JSON.stringify(data).toLowerCase();
      for (const pattern of dangerousPatterns) {
        if (pattern.test(dataString)) {
          throw new BadRequestException('Los datos contienen contenido potencialmente peligroso');
        }
      }

      return serialized;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Los datos deben ser un objeto JSON válido');
    }
  }

  /**
   * Validates scheduled date
   */
  private validateScheduledAt(scheduledAt?: Date): Date | null {
    if (!scheduledAt) {
      return null;
    }

    const now = new Date();
    const scheduled = new Date(scheduledAt);

    if (isNaN(scheduled.getTime())) {
      throw new BadRequestException('Fecha programada inválida');
    }

    // Don't allow scheduling more than 1 year in the future
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (scheduled > oneYearFromNow) {
      throw new BadRequestException(
        'No se puede programar una notificación más de 1 año en el futuro'
      );
    }

    // Don't allow scheduling in the past (with 5 minute tolerance)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    if (scheduled < fiveMinutesAgo) {
      throw new BadRequestException('No se puede programar una notificación en el pasado');
    }

    return scheduled;
  }

  /**
   * Validates notification status transitions
   */
  validateStatusTransition(
    currentStatus: NotificationStatus,
    newStatus: NotificationStatus
  ): boolean {
    const validTransitions: Record<NotificationStatus, NotificationStatus[]> = {
      [NotificationStatus.PENDING]: [NotificationStatus.SENT, NotificationStatus.FAILED],
      [NotificationStatus.SENT]: [
        NotificationStatus.DELIVERED,
        NotificationStatus.FAILED,
        NotificationStatus.READ,
      ],
      [NotificationStatus.DELIVERED]: [NotificationStatus.READ, NotificationStatus.FAILED],
      [NotificationStatus.FAILED]: [NotificationStatus.PENDING, NotificationStatus.SENT],
      [NotificationStatus.READ]: [], // Read is final state
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}
