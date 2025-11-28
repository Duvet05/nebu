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
import { LearningProfile } from './learning-profile.entity';
import { User } from '../../users/entities/user.entity';

export enum SkillCategory {
  COGNITIVE = 'cognitive',
  MOTOR = 'motor',
  SOCIAL = 'social',
  EMOTIONAL = 'emotional',
  LANGUAGE = 'language',
}

export enum AssessmentType {
  OBSERVATION = 'observation',
  QUIZ = 'quiz',
  GAME = 'game',
  INTERACTION = 'interaction',
}

@Entity('skill_assessments')
@Index(['sessionId'])
@Index(['learningProfileId'])
@Index(['skillCategory'])
@Index(['assessedAt'])
export class SkillAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InteractionSession, (session) => session.assessments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: InteractionSession;

  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => LearningProfile, { nullable: true })
  @JoinColumn({ name: 'learningProfileId' })
  learningProfile: LearningProfile;

  @Column({ type: 'uuid', nullable: true })
  learningProfileId: string;

  @Column({ length: 200 })
  skillName: string; // e.g., "Color Recognition", "Counting", "Shape Identification"

  @Column({
    type: 'enum',
    enum: SkillCategory,
  })
  skillCategory: SkillCategory;

  @Column({
    type: 'enum',
    enum: AssessmentType,
    default: AssessmentType.OBSERVATION,
  })
  assessmentType: AssessmentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  maxScore: number;

  @Column({ default: false })
  passed: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamptz' })
  assessedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Detailed results, questions asked, etc.

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
  get percentageScore(): number {
    if (this.maxScore === 0) return 0;
    return (this.score / this.maxScore) * 100;
  }

  get grade(): string {
    const pct = this.percentageScore;
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
  }
}
