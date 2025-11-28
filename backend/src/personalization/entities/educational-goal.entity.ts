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
import { LearningProfile } from './learning-profile.entity';
import { User } from '../../users/entities/user.entity';

export enum GoalCategory {
  COGNITIVE = 'cognitive',
  MOTOR = 'motor',
  SOCIAL = 'social',
  EMOTIONAL = 'emotional',
  LANGUAGE = 'language',
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ACHIEVED = 'achieved',
  ABANDONED = 'abandoned',
}

@Entity('educational_goals')
@Index(['learningProfileId'])
@Index(['status'])
export class EducationalGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LearningProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learningProfileId' })
  learningProfile: LearningProfile;

  @Column({ type: 'uuid' })
  learningProfileId: string;

  @Column({ length: 200 })
  name: string; // e.g., "Learn Colors", "Count to 10", "Tie Shoelaces"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: GoalCategory,
  })
  category: GoalCategory;

  @Column({ type: 'date', nullable: true })
  targetDate: Date;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.NOT_STARTED,
  })
  status: GoalStatus;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100%

  @Column({ type: 'timestamptz', nullable: true })
  achievedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

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
  get isAchieved(): boolean {
    return this.status === GoalStatus.ACHIEVED;
  }

  get isActive(): boolean {
    return this.status === GoalStatus.IN_PROGRESS;
  }
}
