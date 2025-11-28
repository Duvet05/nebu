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

@Entity('lead_statuses')
@Index(['code'], { unique: true })
@Index(['order'])
export class LeadStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string; // e.g., "New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"

  @Column({ unique: true, length: 50 })
  code: string; // e.g., "NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  order: number; // Pipeline order (0 = first stage)

  @Column({ default: false })
  isFinal: boolean; // Is this a final stage (Won/Lost)?

  @Column({ nullable: true })
  isSuccess: boolean; // true for Won, false for Lost, null for in-progress

  @Column({ length: 20, default: '#6B7280' })
  color: string; // Hex color for UI

  @Column({ default: true })
  active: boolean;

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
