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

@Entity('order_types')
@Index(['code'], { unique: true })
@Index(['active'])
export class OrderType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string; // e.g., "Pre-order", "Regular Purchase", "Subscription", "Gift"

  @Column({ unique: true, length: 50 })
  code: string; // e.g., "PREORDER", "REGULAR", "SUBSCRIPTION", "GIFT"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  requiresDeposit: boolean; // Does this order type require a deposit?

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50.0 })
  depositPercentage: number; // Percentage of total price for deposit (e.g., 50.0 = 50%)

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number; // For sorting in UI

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
