import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EmailProvider } from './email-provider.entity';
import { EmailLog } from './email-log.entity';

export enum EmailAccountType {
  TEAM = 'team',
  NOREPLY = 'noreply',
  ADMIN = 'admin',
  SUPPORT = 'support',
  MARKETING = 'marketing',
}

export enum EmailAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
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

@Entity('email_accounts')
export class EmailAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string; // Encriptado

  @Column()
  fromName: string;

  @Column({
    type: 'enum',
    enum: EmailAccountType,
  })
  type: EmailAccountType;

  @Column({
    type: 'enum',
    enum: EmailAccountStatus,
    default: EmailAccountStatus.ACTIVE,
  })
  status: EmailAccountStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  config: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  dailyLimit: number;

  @Column({ type: 'int', default: 0 })
  sentToday: number;

  @Column({ type: 'timestamp', nullable: true })
  lastResetDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => EmailProvider, provider => provider.accounts)
  @JoinColumn({ name: 'providerId' })
  provider: EmailProvider;

  @Column()
  providerId: string;

  @OneToMany(() => EmailLog, log => log.account)
  logs: EmailLog[];

  // Virtual properties
  get isActive(): boolean {
    return this.status === EmailAccountStatus.ACTIVE;
  }

  get hasReachedLimit(): boolean {
    if (this.dailyLimit === 0) return false;
    return this.sentToday >= this.dailyLimit;
  }

  get remainingQuota(): number {
    if (this.dailyLimit === 0) return Infinity;
    return Math.max(0, this.dailyLimit - this.sentToday);
  }
}

