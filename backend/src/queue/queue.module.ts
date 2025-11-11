import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { QueueService } from './services/queue.service';
import { VideoProcessingService } from './services/video-processing.service';
import { EmailQueueService } from './services/email-queue.service';
import { VideoProcessor } from './processors/video.processor';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const password = configService.get('redis.password');
        const redisConfig: any = {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          db: configService.get('redis.db'),
        };

        // Only add password if it's not empty
        if (password && password.trim() !== '') {
          redisConfig.password = password;
        }

        return { redis: redisConfig };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'video-processing' }, { name: 'email-queue' }),
    NotificationsModule,
    EmailModule,
  ],
  providers: [
    QueueService,
    VideoProcessingService,
    EmailQueueService,
    VideoProcessor,
    EmailProcessor,
  ],
  exports: [QueueService, VideoProcessingService, EmailQueueService],
})
export class QueueModule {}
