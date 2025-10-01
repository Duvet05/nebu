import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoiceService } from './voice.service';
import { VoiceController } from './voice.controller';
import { VoiceSession } from './entities/voice-session.entity';
import { AiConversation } from './entities/ai-conversation.entity';
import { LiveKitModule } from '../livekit/livekit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoiceSession, AiConversation]),
    LiveKitModule,
  ],
  providers: [VoiceService],
  controllers: [VoiceController],
  exports: [VoiceService],
})
export class VoiceModule {}
