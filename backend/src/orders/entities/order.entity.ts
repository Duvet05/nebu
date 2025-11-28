import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from '../../users/entities/person.entity';

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
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Customer reference
  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column({ type: 'uuid', nullable: true })
  personId: string;

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

  // Order details
  @Column()
  product: string; // e.g., "Nebu Dino"

  @Column()
  color: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  reserveAmount: number; // 50% of totalPrice

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  // Payment info
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.YAPE,
  })
  paymentMethod: PaymentMethod;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
