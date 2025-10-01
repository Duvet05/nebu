import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { EmailNotificationsService } from './services/email-notifications.service';
import { PushNotificationsService } from './services/push-notifications.service';
import { NotificationValidator } from './validators/notification.validator';
import { Notification } from './entities/notification.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { User } from '../users/entities/user.entity';
import { FeaturesConfig } from '../config/features.config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Notification, NotificationTemplate, User])
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailNotificationsService,
    PushNotificationsService,
    NotificationValidator,
    FeaturesConfig,
  ],
  exports: [
    NotificationsService,
    EmailNotificationsService,
    PushNotificationsService,
    NotificationValidator,
    FeaturesConfig,
  ],
})
export class NotificationsModule {}
