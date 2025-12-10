import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { SearchModule } from '../search/search.module';
import { QueueService } from './services/queue.service';
import { VideoProcessingService } from './services/video-processing.service';
import { EmailQueueService } from './services/email-queue.service';
import { VideoProcessor } from './processors/video.processor';
import { EmailProcessor } from './processors/email.processor';
import { ConversationSummarizerJob } from './jobs/conversation-summarizer.job';
import { VoiceSession } from '../voice/entities/voice-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoiceSession]),
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
    SearchModule, // Para ChromaDBService
  ],
  providers: [
    QueueService,
    VideoProcessingService,
    EmailQueueService,
    VideoProcessor,
    EmailProcessor,
    ConversationSummarizerJob,
  ],
  exports: [QueueService, VideoProcessingService, EmailQueueService, ConversationSummarizerJob],
})
export class QueueModule {}
