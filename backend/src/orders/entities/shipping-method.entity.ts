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

@Entity('shipping_methods')
@Index(['code'], { unique: true })
@Index(['active'])
export class ShippingMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string; // e.g., "Standard", "Express", "International", "Local Pickup"

  @Column({ unique: true, length: 50 })
  code: string; // e.g., "STANDARD", "EXPRESS", "INTERNATIONAL", "PICKUP"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseCost: number; // Base shipping cost

  @Column({ type: 'int', nullable: true })
  estimatedDaysMin: number; // Minimum estimated delivery days

  @Column({ type: 'int', nullable: true })
  estimatedDaysMax: number; // Maximum estimated delivery days

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  requiresAddress: boolean; // Does this method require a shipping address?

  @Column({ type: 'int', default: 0 })
  displayOrder: number; // For sorting in UI

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Carrier info, tracking URL template, etc.

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

  // Helper method
  get estimatedDelivery(): string {
    if (!this.estimatedDaysMin && !this.estimatedDaysMax) return 'N/A';
    if (this.estimatedDaysMin === this.estimatedDaysMax) {
      return `${this.estimatedDaysMin} days`;
    }
    return `${this.estimatedDaysMin}-${this.estimatedDaysMax} days`;
  }
}
