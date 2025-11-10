import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MemoryContext } from './entities/memory-context.entity';
import { SessionHeartbeat } from './entities/session-heartbeat.entity';
import { UserProfile } from './entities/user-profile.entity';
import { VoiceSession } from '../voice/entities/voice-session.entity';
import { AiConversation } from '../voice/entities/ai-conversation.entity';
import { ChromaService } from './services/chroma.service';
import { MemoryService } from './services/memory.service';
import { RedisModule } from '../config/redis.module';
// import { AgentsModule } from '../agents/agents.module'; // Module disabled

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemoryContext,
      SessionHeartbeat,
      UserProfile,
      VoiceSession,
      AiConversation,
    ]),
    ConfigModule,
    RedisModule,
    // forwardRef(() => AgentsModule), // <-- NUEVO: Para evitar dependencias circulares - DISABLED
  ],
  providers: [ChromaService, MemoryService],
  exports: [ChromaService, MemoryService],
})
export class MemoryModule {}
