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

@Entity('opportunities')
@Index(['leadId'])
@Index(['stage'])
@Index(['expectedCloseDate'])
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lead, (lead) => lead.opportunities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column({ type: 'uuid' })
  leadId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'int', default: 50 })
  probability: number; // 0-100%

  @Column({ length: 50 })
  stage: string; // e.g., "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"

  @Column({ type: 'date', nullable: true })
  expectedCloseDate: Date;

  @Column({ type: 'date', nullable: true })
  actualCloseDate: Date;

  @Column({ type: 'text', nullable: true })
  wonReason: string;

  @Column({ type: 'text', nullable: true })
  lostReason: string;

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
  get weightedValue(): number {
    return (this.amount * this.probability) / 100;
  }

  get isWon(): boolean {
    return this.stage.toLowerCase().includes('won');
  }

  get isLost(): boolean {
    return this.stage.toLowerCase().includes('lost');
  }

  get isClosed(): boolean {
    return this.isWon || this.isLost;
  }
}
