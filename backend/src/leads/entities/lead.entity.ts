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
import { LeadSource } from './lead-source.entity';
import { LeadStatus } from './lead-status.entity';
import { Campaign } from './campaign.entity';
import { Order } from '../../orders/entities/order.entity';

export enum LeadTemperature {
  COLD = 'cold',
  WARM = 'warm',
  HOT = 'hot',
}

@Entity('leads')
@Index(['personId'])
@Index(['leadSourceId'])
@Index(['leadStatusId'])
@Index(['assignedToId'])
@Index(['temperature'])
@Index(['createdAt'])
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Person reference (optional - can be anonymous initially)
  @ManyToOne(() => Person, { nullable: true, eager: true })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column({ type: 'uuid', nullable: true })
  personId: string;

  // Lead source
  @ManyToOne(() => LeadSource, { eager: true })
  @JoinColumn({ name: 'leadSourceId' })
  leadSource: LeadSource;

  @Column({ type: 'uuid' })
  leadSourceId: string;

  // Lead status (pipeline stage)
  @ManyToOne(() => LeadStatus, { eager: true })
  @JoinColumn({ name: 'leadStatusId' })
  leadStatus: LeadStatus;

  @Column({ type: 'uuid' })
  leadStatusId: string;

  // Assigned sales rep
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string;

  // Campaign (optional)
  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column({ type: 'uuid', nullable: true })
  campaignId: string;

  // Lead scoring and qualification
  @Column({ type: 'int', default: 0 })
  score: number; // Lead score (0-100)

  @Column({
    type: 'enum',
    enum: LeadTemperature,
    default: LeadTemperature.COLD,
  })
  temperature: LeadTemperature;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedValue: number; // Estimated deal value

  @Column({ type: 'date', nullable: true })
  expectedCloseDate: Date;

  // Contact info (if person not yet created)
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  company: string;

  // Notes and metadata
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Conversion tracking
  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'convertedToOrderId' })
  convertedToOrder: Order;

  @Column({ type: 'uuid', nullable: true })
  convertedToOrderId: string;

  @Column({ type: 'timestamptz', nullable: true })
  convertedAt: Date;

  // Activities relationship
  @OneToMany('LeadActivity', 'lead')
  activities: any[];

  // Opportunities relationship
  @OneToMany('Opportunity', 'lead')
  opportunities: any[];

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
  get fullName(): string {
    if (this.person) return this.person.fullName;
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'Unknown';
  }

  get isConverted(): boolean {
    return !!this.convertedToOrderId;
  }

  get isQualified(): boolean {
    return this.score >= 50; // Example threshold
  }

  get daysSinceCreated(): number {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }
}
