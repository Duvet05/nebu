import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('order_status_history')
@Index(['orderId'])
@Index(['changedAt'])
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    nullable: true,
  })
  fromStatus: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  toStatus: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional context (e.g., tracking number, cancellation reason)

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changedById' })
  changedBy: User;

  @Column({ type: 'uuid', nullable: true })
  changedById: string;

  @CreateDateColumn({ type: 'timestamptz' })
  changedAt: Date;

  // Helper method
  get statusChange(): string {
    const from = this.fromStatus || 'NEW';
    return `${from} → ${this.toStatus}`;
  }
}
