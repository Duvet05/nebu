import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Person } from '../../users/entities/person.entity';
import { User } from '../../users/entities/user.entity';
import { Toy } from '../../toys/entities/toy.entity';
import { InteractionType } from './interaction-type.entity';
import { Provider } from '../../common/entities/provider.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  PAUSED = 'paused',
  ERROR = 'error',
}

@Entity('interaction_sessions')
@Index(['personId'])
@Index(['toyId'])
@Index(['interactionTypeId'])
@Index(['providerId'])
@Index(['status'])
@Index(['startedAt'])
export class InteractionSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column({ type: 'uuid', nullable: true })
  personId: string;

  @ManyToOne(() => Toy, { nullable: true })
  @JoinColumn({ name: 'toyId' })
  toy: Toy;

  @Column({ type: 'uuid', nullable: true })
  toyId: string;

  @ManyToOne(() => InteractionType, { eager: true })
  @JoinColumn({ name: 'interactionTypeId' })
  interactionType: InteractionType;

  @Column({ type: 'uuid' })
  interactionTypeId: string;

  @ManyToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column({ type: 'uuid', nullable: true })
  providerId: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  sessionToken: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  roomName: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({ type: 'varchar', length: 10, default: 'es' })
  language: string;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number;

  // Activities and assessments
  @OneToMany('LearningActivity', 'session')
  activities: any[];

  @OneToMany('SkillAssessment', 'session')
  assessments: any[];

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

  // Helper methods
  endSession(): void {
    this.status = SessionStatus.ENDED;
    this.endedAt = new Date();
    if (this.startedAt) {
      this.durationSeconds = Math.floor(
        (this.endedAt.getTime() - this.startedAt.getTime()) / 1000
      );
    }
  }

  get isActive(): boolean {
    return this.status === SessionStatus.ACTIVE;
  }

  get durationMinutes(): number | null {
    if (!this.durationSeconds) return null;
    return Math.round(this.durationSeconds / 60);
  }
}
