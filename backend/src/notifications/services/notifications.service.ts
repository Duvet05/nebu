import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from '../entities/notification.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { EmailNotificationsService } from './email-notifications.service';
import { PushNotificationsService } from './push-notifications.service';
import { NotificationValidator } from '../validators/notification.validator';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    private emailService: EmailNotificationsService,
    private pushService: PushNotificationsService,
    private validator: NotificationValidator
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    // Validate and sanitize input with secure defaults
    const validatedDto = this.validator.validateCreateNotification(createNotificationDto);

    const notification = this.notificationRepository.create({
      ...validatedDto,
      data: validatedDto.data ? JSON.stringify(validatedDto.data) : null,
    });

    return this.notificationRepository.save(notification);
  }

  async sendBulk(sendNotificationDto: SendNotificationDto): Promise<Notification[]> {
    // Validate and sanitize input with secure defaults
    const validatedDto = this.validator.validateSendNotification(sendNotificationDto);

    const notifications: Notification[] = [];

    for (const userId of validatedDto.userIds) {
      const notification = this.notificationRepository.create({
        userId,
        type: validatedDto.type,
        title: validatedDto.title,
        message: validatedDto.message,
        data: validatedDto.data ? JSON.stringify(validatedDto.data) : null,
        priority: validatedDto.priority,
        scheduledAt: validatedDto.scheduledAt,
        maxRetries: 3, // Secure default
      });

      notifications.push(notification);
    }

    return this.notificationRepository.save(notifications);
  }

  async sendFromTemplate(
    templateName: string,
    userIds: string[],
    variables: Record<string, any> = {}
  ): Promise<Notification[]> {
    const template = await this.templateRepository.findOne({
      where: { name: templateName, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template '${templateName}' not found`);
    }

    const processedContent = this.processTemplate(template.content, variables);
    const processedSubject = this.processTemplate(template.subject, variables);

    const notifications: Notification[] = [];

    for (const userId of userIds) {
      const notification = this.notificationRepository.create({
        userId,
        type: template.type,
        title: processedSubject,
        message: processedContent,
        data: JSON.stringify(variables),
      });

      notifications.push(notification);
    }

    return this.notificationRepository.save(notifications);
  }

  async findByUser(userId: string, limit = 20, offset = 0): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        userId,
        status: In([NotificationStatus.SENT, NotificationStatus.DELIVERED]),
        readAt: null,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.readAt = new Date();
    notification.status = NotificationStatus.READ;

    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      {
        userId,
        status: In([NotificationStatus.SENT, NotificationStatus.DELIVERED]),
        readAt: null,
      },
      {
        readAt: new Date(),
        status: NotificationStatus.READ,
      }
    );
  }

  async getStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
  }> {
    const [total, unread, byType] = await Promise.all([
      this.notificationRepository.count({ where: { userId } }),
      this.notificationRepository.count({
        where: {
          userId,
          status: In([NotificationStatus.SENT, NotificationStatus.DELIVERED]),
          readAt: null,
        },
      }),
      this.getNotificationsByType(userId),
    ]);

    return { total, unread, byType };
  }

  async processPendingNotifications(): Promise<void> {
    const pendingNotifications = await this.notificationRepository.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduledAt: Between(new Date(0), new Date()),
      },
      take: 100,
    });

    for (const notification of pendingNotifications) {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        await this.handleNotificationError(notification, error);
      }
    }
  }

  private async sendNotification(notification: Notification): Promise<void> {
    switch (notification.type) {
      case NotificationType.EMAIL:
        await this.emailService.sendEmail(notification);
        break;
      case NotificationType.PUSH:
        await this.pushService.sendPush(notification);
        break;
      case NotificationType.IN_APP:
        // In-app notifications are already "sent" when created
        notification.status = NotificationStatus.SENT;
        break;
      default:
        throw new BadRequestException(`Unsupported notification type: ${notification.type}`);
    }

    notification.sentAt = new Date();
    notification.status = NotificationStatus.DELIVERED;
    await this.notificationRepository.save(notification);
  }

  private async handleNotificationError(notification: Notification, error: Error): Promise<void> {
    notification.retryCount += 1;
    notification.errorMessage = error.message;

    if (notification.retryCount >= notification.maxRetries) {
      notification.status = NotificationStatus.FAILED;
    }

    await this.notificationRepository.save(notification);
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private async getNotificationsByType(userId: string): Promise<Record<NotificationType, number>> {
    const results = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.type')
      .getRawMany();

    const byType = Object.values(NotificationType).reduce(
      (acc, type) => {
        acc[type] = 0;
        return acc;
      },
      {} as Record<NotificationType, number>
    );

    results.forEach(({ type, count }) => {
      byType[type] = parseInt(count);
    });

    return byType;
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return notification;
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);
  }
}
