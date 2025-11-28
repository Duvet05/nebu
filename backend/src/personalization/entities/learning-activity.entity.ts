import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InteractionSession } from './interaction-session.entity';
import { User } from '../../users/entities/user.entity';

export enum ActivityOutcome {
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed',
  INTERRUPTED = 'interrupted',
}

export enum EngagementLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('learning_activities')
@Index(['sessionId'])
@Index(['activityType'])
@Index(['startedAt'])
export class LearningActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InteractionSession, (session) => session.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: InteractionSession;

  @Column({ type: 'uuid' })
  sessionId: string;

  @Column({ length: 100 })
  activityType: string; // e.g., "Song", "Story", "Game", "Question", "Puzzle"

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({
    type: 'enum',
    enum: ActivityOutcome,
    nullable: true,
  })
  outcome: ActivityOutcome;

  @Column({
    type: 'enum',
    enum: EngagementLevel,
    nullable: true,
  })
  engagementLevel: EngagementLevel;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Responses, scores, interactions, etc.

  // OpenMRS-style auditing
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changedById' })
  changedBy: User;

  @Column({ default: false })
  voided: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'voidedById' })
  voidedBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  dateVoided: Date;

  @Column({ nullable: true })
  voidReason: string;

  // Helper properties
  get durationSeconds(): number | null {
    if (!this.startedAt || !this.completedAt) return null;
    return Math.floor(
      (new Date(this.completedAt).getTime() - new Date(this.startedAt).getTime()) / 1000
    );
  }

  get isCompleted(): boolean {
    return this.outcome === ActivityOutcome.COMPLETED;
  }
}
