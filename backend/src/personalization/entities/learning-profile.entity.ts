import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Person } from '../../users/entities/person.entity';
import { User } from '../../users/entities/user.entity';

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING = 'reading',
}

export enum AgeGroup {
  TODDLER = 'toddler', // 1-3 years
  PRESCHOOL = 'preschool', // 3-5 years
  EARLY_ELEMENTARY = 'early_elementary', // 5-8 years
  LATE_ELEMENTARY = 'late_elementary', // 8-12 years
}

@Entity('learning_profiles')
@Index(['personId'], { unique: true })
export class LearningProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column({ type: 'uuid' })
  personId: string;

  @Column({
    type: 'enum',
    enum: LearningStyle,
    nullable: true,
  })
  learningStyle: LearningStyle;

  @Column({
    type: 'enum',
    enum: AgeGroup,
    nullable: true,
  })
  ageGroup: AgeGroup;

  @Column({ type: 'simple-array', nullable: true })
  preferredLanguages: string[]; // e.g., ['es', 'en']

  @Column({ type: 'simple-array', nullable: true })
  interests: string[]; // e.g., ['dinosaurs', 'space', 'music']

  @Column({ type: 'simple-array', nullable: true })
  strengths: string[]; // e.g., ['memory', 'creativity', 'problem-solving']

  @Column({ type: 'simple-array', nullable: true })
  areasForImprovement: string[]; // e.g., ['attention-span', 'social-skills']

  @Column({ type: 'text', nullable: true })
  specialNeeds: string;

  @Column({ type: 'jsonb', nullable: true })
  parentalControls: Record<string, any>; // Screen time limits, content filters, etc.

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
}
