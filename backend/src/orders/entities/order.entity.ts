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
import { OrderType } from './order-type.entity';
import { ShippingMethod } from './shipping-method.entity';
import { OrderItem } from './order-item.entity';
import { PaymentTransaction } from './payment-transaction.entity';
import { OrderStatusHistory } from './order-status-history.entity';

export enum OrderStatus {
  PENDING = 'pending',
  RESERVED = 'reserved', // 50% paid
  CONFIRMED = 'confirmed', // 100% paid
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  YAPE = 'yape',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

@Entity('orders')
@Index(['personId'])
@Index(['status'])
@Index(['orderNumber'], { unique: true })
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  orderNumber: string; // e.g., "ORD-2024-00001"

  // Customer reference
  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column({ type: 'uuid', nullable: true })
  personId: string;

  // Order type (pre-order, regular, subscription, etc.)
  @ManyToOne(() => OrderType, { eager: true })
  @JoinColumn({ name: 'orderTypeId' })
  orderType: OrderType;

  @Column({ type: 'uuid', nullable: true })
  orderTypeId: string;

  // Shipping method
  @ManyToOne(() => ShippingMethod, { eager: true })
  @JoinColumn({ name: 'shippingMethodId' })
  shippingMethod: ShippingMethod;

  @Column({ type: 'uuid', nullable: true })
  shippingMethodId: string;

  // Shipping address (can be different from person's address)
  @Column()
  shippingAddress: string;

  @Column()
  shippingCity: string;

  @Column({ nullable: true })
  shippingPostalCode: string;

  @Column({ nullable: true })
  shippingCountry: string;

  // Contact info (snapshot at order time)
  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  // Order items (normalized)
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  // Payment transactions
  @OneToMany(() => PaymentTransaction, (payment) => payment.order, { cascade: true })
  payments: PaymentTransaction[];

  // Status history
  @OneToMany(() => OrderStatusHistory, (history) => history.order, { cascade: true })
  statusHistory: OrderStatusHistory[];

  // Order totals (calculated from items)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number; // Sum of all item subtotals

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number; // Order-level discount

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number; // subtotal + shippingCost + tax - discount

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  reserveAmount: number; // Amount required for reservation (usually 50% for pre-orders)

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // Additional data
  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  customerNotes: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ type: 'timestamptz', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: Date;

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

  // Calculated properties
  get paidAmount(): number {
    if (!this.payments) return 0;
    return this.payments
      .filter(p => p.status === 'completed' && !p.voided)
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }

  get remainingAmount(): number {
    return this.totalAmount - this.paidAmount;
  }

  get isFullyPaid(): boolean {
    return this.paidAmount >= this.totalAmount;
  }

  get itemCount(): number {
    if (!this.items) return 0;
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalPrice(): number {
    return this.totalAmount;
  }
}
