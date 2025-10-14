import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { PushNotificationsService } from './services/push-notifications.service';
import { NotificationValidator } from './validators/notification.validator';
import { Notification } from './entities/notification.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { User } from '../users/entities/user.entity';
import { FeaturesConfig } from '../config/features.config';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule,
    EmailModule,
    TypeOrmModule.forFeature([Notification, NotificationTemplate, User])
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    PushNotificationsService,
    NotificationValidator,
    FeaturesConfig,
  ],
  exports: [
    NotificationsService,
    PushNotificationsService,
    NotificationValidator,
    FeaturesConfig,
  ],
})
export class NotificationsModule {}
