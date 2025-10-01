import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { AiConversation } from './ai-conversation.entity';

export type SessionStatus = 'active' | 'ended' | 'paused' | 'error';

@Entity('voice_sessions')
export class VoiceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  sessionToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  roomName?: string;

  @Column({
    type: 'enum',
    enum: ['active', 'ended', 'paused', 'error'],
    default: 'active',
  })
  @Index()
  status: SessionStatus;

  @Column({ type: 'varchar', length: 10, default: 'es' })
  language: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  @Column({ type: 'int', nullable: true })
  durationSeconds?: number;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'int', default: 0 })
  totalTokensUsed: number;

  @Column({ type: 'float', default: 0 })
  totalCost: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AiConversation, conversation => conversation.session)
  conversations: AiConversation[];

  // Helper methods
  endSession(): void {
    this.status = 'ended';
    this.endedAt = new Date();
    if (this.startedAt) {
      this.durationSeconds = Math.floor(
        (this.endedAt.getTime() - this.startedAt.getTime()) / 1000
      );
    }
  }

  addMessage(tokensUsed: number = 0, cost: number = 0): void {
    this.messageCount++;
    this.totalTokensUsed += tokensUsed;
    this.totalCost += cost;
  }

  isActive(): boolean {
    return this.status === 'active';
  }
}
