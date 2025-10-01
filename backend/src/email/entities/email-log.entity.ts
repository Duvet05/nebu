import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmailAccount } from './email-account.entity';

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  DELIVERED = 'delivered',
}

export enum EmailType {
  NOTIFICATION = 'notification',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  COURSE_ENROLLMENT = 'course_enrollment',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  ADMIN_ALERT = 'admin_alert',
  MARKETING = 'marketing',
}

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  to: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.PENDING,
  })
  status: EmailStatus;

  @Column({
    type: 'enum',
    enum: EmailType,
  })
  type: EmailType;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  bouncedAt: Date;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => EmailAccount, account => account.logs)
  @JoinColumn({ name: 'accountId' })
  account: EmailAccount;

  @Column()
  accountId: string;
}

