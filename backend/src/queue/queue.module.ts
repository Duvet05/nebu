import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';
import { QueueService } from './services/queue.service';
import { VideoProcessingService } from './services/video-processing.service';
import { EmailQueueService } from './services/email-queue.service';
import { VideoProcessor } from './processors/video.processor';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'video-processing' }, { name: 'email-queue' }),
    NotificationsModule,
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
