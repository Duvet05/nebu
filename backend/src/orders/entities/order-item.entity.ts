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
import { Order } from './order.entity';
import { ProductCatalog } from '../../toys/entities/product-catalog.entity';
import { User } from '../../users/entities/user.entity';

@Entity('order_items')
@Index(['orderId'])
@Index(['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => ProductCatalog, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: ProductCatalog;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // Price at time of order (snapshot)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number; // Discount amount per unit

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // (unitPrice - discount) * quantity

  @Column({ length: 50, nullable: true })
  color: string; // Selected color variant

  @Column({ type: 'jsonb', nullable: true })
  customization: Record<string, any>; // Custom engraving, special requests, etc.

  @Column({ type: 'text', nullable: true })
  notes: string;

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

  // Helper method to calculate subtotal
  calculateSubtotal(): number {
    return (this.unitPrice - this.discount) * this.quantity;
  }
}
