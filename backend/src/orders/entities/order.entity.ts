import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  // Customer info
  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  // Shipping address
  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  postalCode: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
