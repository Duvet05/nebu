import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { VoiceSession } from './voice-session.entity';

export type MessageType = 'user' | 'assistant' | 'system';

@Entity('ai_conversations')
export class AiConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'uuid' })
  @Index()
  sessionId: string;

  @Column({
    type: 'enum',
    enum: ['user', 'assistant', 'system'],
  })
  messageType: MessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  audioUrl?: string;

  @Column({ type: 'int', nullable: true })
  tokensUsed?: number;

  @Column({ type: 'int', nullable: true })
  processingTimeMs?: number;

  @Column({ type: 'float', nullable: true })
  cost?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => VoiceSession, session => session.conversations, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'sessionId' })
  session: VoiceSession;

  // Helper methods
  isUserMessage(): boolean {
    return this.messageType === 'user';
  }

  isAssistantMessage(): boolean {
    return this.messageType === 'assistant';
  }

  hasAudio(): boolean {
    return !!this.audioUrl;
  }
}
