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
import { Lead } from './lead.entity';
import { User } from '../../users/entities/user.entity';

export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  NOTE = 'note',
  WHATSAPP = 'whatsapp',
  DEMO = 'demo',
  PROPOSAL = 'proposal',
  FOLLOW_UP = 'follow_up',
}

@Entity('lead_activities')
@Index(['leadId'])
@Index(['performedById'])
@Index(['activityType'])
@Index(['scheduledAt'])
export class LeadActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lead, (lead) => lead.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column({ type: 'uuid' })
  leadId: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.NOTE,
  })
  activityType: ActivityType;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  outcome: string; // e.g., "Interested", "Not interested", "Call back later"

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performedById' })
  performedBy: User;

  @Column({ type: 'uuid', nullable: true })
  performedById: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Call recording URL, email thread ID, etc.

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
  get isCompleted(): boolean {
    return !!this.completedAt;
  }

  get isPending(): boolean {
    return !this.completedAt && !!this.scheduledAt;
  }

  get isOverdue(): boolean {
    if (!this.scheduledAt || this.completedAt) return false;
    return new Date() > new Date(this.scheduledAt);
  }
}
