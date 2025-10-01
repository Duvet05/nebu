import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User, UserStatus } from '../../users/entities/user.entity';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
}

interface DeviceToken {
  userId: string;
  token: string;
  platform: 'web' | 'android' | 'ios';
  isActive: boolean;
}

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private deviceTokens: Map<string, DeviceToken[]> = new Map();

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async sendPush(notification: Notification): Promise<void> {
    try {
      // Parse notification data if it's a string
      let parsedData: Record<string, any> = {};
      if (notification.data) {
        if (typeof notification.data === 'string') {
          try {
            parsedData = JSON.parse(notification.data);
          } catch {
            parsedData = { raw: notification.data };
          }
        } else {
          parsedData = notification.data;
        }
      }

      const payload: PushPayload = {
        title: notification.title,
        body: notification.message,
        data: parsedData,
        actionUrl: parsedData.actionUrl || undefined,
      };

      await this.sendNotificationToUser(notification.userId, payload);
      this.logger.log(`Push notification sent for notification ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send push notification for ${notification.id}:`, error);
      throw error;
    }
  }

  async sendBulkPush(notifications: Notification[]): Promise<void> {
    const pushPromises = notifications.map(notification => this.sendPush(notification));
    const results = await Promise.allSettled(pushPromises);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    this.logger.log(`Bulk push notifications: ${successful} sent, ${failed} failed`);
  }

  async sendNotificationToUser(userId: string, payload: PushPayload): Promise<boolean> {
    try {
      const userTokens = this.deviceTokens.get(userId) || [];
      const activeTokens = userTokens.filter(token => token.isActive);

      if (activeTokens.length === 0) {
        this.logger.warn(`No active device tokens found for user ${userId}`);
        return false;
      }

      // Enviar a todos los dispositivos del usuario
      for (const deviceToken of activeTokens) {
        await this.sendToDevice(deviceToken, payload);
      }

      this.logger.log(
        `Push notification sent to ${activeTokens.length} devices for user ${userId}`
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${userId}:`, error);
      return false;
    }
  }

  async sendToAllActiveUsers(payload: PushPayload): Promise<{ sent: number; failed: number }> {
    const users = await this.userRepository.find({
      select: ['id'],
      where: { status: UserStatus.ACTIVE },
    });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      const success = await this.sendNotificationToUser(user.id, payload);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    this.logger.log(`Broadcast notification complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  async subscribeUser(
    userId: string,
    deviceToken: string,
    platform: 'web' | 'android' | 'ios' = 'web'
  ): Promise<void> {
    const userTokens = this.deviceTokens.get(userId) || [];

    // Verificar si el token ya existe
    const existingTokenIndex = userTokens.findIndex(t => t.token === deviceToken);

    if (existingTokenIndex >= 0) {
      // Actualizar token existente
      userTokens[existingTokenIndex] = {
        userId,
        token: deviceToken,
        platform,
        isActive: true,
      };
    } else {
      // Agregar nuevo token
      userTokens.push({
        userId,
        token: deviceToken,
        platform,
        isActive: true,
      });
    }

    this.deviceTokens.set(userId, userTokens);
    this.logger.log(`User ${userId} subscribed with device token on ${platform}`);
  }

  async unsubscribeUser(userId: string, deviceToken: string): Promise<void> {
    const userTokens = this.deviceTokens.get(userId) || [];
    const updatedTokens = userTokens.filter(t => t.token !== deviceToken);

    if (updatedTokens.length !== userTokens.length) {
      this.deviceTokens.set(userId, updatedTokens);
      this.logger.log(`User ${userId} unsubscribed device token`);
    }
  }

  private async sendToDevice(deviceToken: DeviceToken, payload: PushPayload): Promise<void> {
    // Implementación simulada - En producción usar Firebase FCM o OneSignal
    this.logger.debug(`Sending push notification to ${deviceToken.platform} device:`, {
      token: deviceToken.token.substring(0, 10) + '...',
      title: payload.title,
      body: payload.body,
    });

    // En producción, aquí se haría la llamada a Firebase FCM:
    /*
    const notificationData = {
      to: deviceToken.token,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      image: payload.imageUrl,
      click_action: payload.actionUrl,
      platform: deviceToken.platform
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${this.configService.get('FIREBASE_SERVER_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });
    */

    // Simular envío exitoso
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Métodos de conveniencia para notificaciones específicas
  async sendCourseEnrollmentNotification(userId: string, courseName: string): Promise<boolean> {
    return this.sendNotificationToUser(userId, {
      title: '🎓 ¡Inscripción exitosa!',
      body: `Te has inscrito exitosamente en "${courseName}"`,
      data: { type: 'enrollment', courseName },
      actionUrl: '/my-courses',
    });
  }

  async sendLessonCompletionNotification(
    userId: string,
    lessonName: string,
    courseName: string
  ): Promise<boolean> {
    return this.sendNotificationToUser(userId, {
      title: ' ¡Lección completada!',
      body: `Has completado "${lessonName}" en ${courseName}`,
      data: { type: 'lesson_complete', lessonName, courseName },
      actionUrl: '/my-courses',
    });
  }

  async sendCourseCompletionNotification(userId: string, courseName: string): Promise<boolean> {
    return this.sendNotificationToUser(userId, {
      title: ' ¡Curso completado!',
      body: `¡Felicidades! Has completado "${courseName}"`,
      data: { type: 'course_complete', courseName },
      actionUrl: '/certificates',
    });
  }

  async sendPaymentSuccessNotification(userId: string, courseName: string): Promise<boolean> {
    return this.sendNotificationToUser(userId, {
      title: '💳 Pago procesado',
      body: `Tu pago para "${courseName}" ha sido procesado exitosamente`,
      data: { type: 'payment_success', courseName },
      actionUrl: '/my-courses',
    });
  }
}
