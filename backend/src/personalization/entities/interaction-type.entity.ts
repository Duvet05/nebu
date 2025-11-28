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
import { User } from '../../users/entities/user.entity';

export enum InteractionCategory {
  EDUCATIONAL = 'educational',
  ENTERTAINMENT = 'entertainment',
  ASSESSMENT = 'assessment',
  THERAPY = 'therapy',
  FREE_PLAY = 'free_play',
}

@Entity('interaction_types')
@Index(['code'], { unique: true })
@Index(['category'])
export class InteractionType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string; // e.g., "Educational Play", "Free Play", "Story Time", "Skill Assessment"

  @Column({ unique: true, length: 50 })
  code: string; // e.g., "EDU_PLAY", "FREE_PLAY", "STORY", "ASSESSMENT"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: InteractionCategory,
    default: InteractionCategory.EDUCATIONAL,
  })
  category: InteractionCategory;

  @Column({ type: 'int', nullable: true })
  recommendedDurationMinutes: number;

  @Column({ nullable: true })
  ageAppropriate: string; // e.g., "3-5 years", "5-8 years"

  @Column({ default: true })
  active: boolean;

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
  retired: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'retiredById' })
  retiredBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  dateRetired: Date;

  @Column({ nullable: true })
  retireReason: string;
}
