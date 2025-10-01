import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EmailAccount } from './email-account.entity';

export enum EmailProviderType {
  SMTP = 'smtp',
  SENDGRID = 'sendgrid',
  MAILGUN = 'mailgun',
  SES = 'ses',
}

export enum EmailProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('email_providers')
export class EmailProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  host: string;

  @Column({ type: 'int' })
  port: number;

  @Column({ type: 'boolean', default: false })
  secure: boolean;

  @Column({
    type: 'enum',
    enum: EmailProviderType,
    default: EmailProviderType.SMTP,
  })
  type: EmailProviderType;

  @Column({
    type: 'enum',
    enum: EmailProviderStatus,
    default: EmailProviderStatus.ACTIVE,
  })
  status: EmailProviderStatus;

  @Column({ type: 'json', nullable: true })
  config: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  priority: number; // Para load balancing

  @Column({ type: 'int', default: 0 })
  dailyLimit: number; // Límite diario de emails

  @Column({ type: 'int', default: 0 })
  sentToday: number; // Emails enviados hoy

  @Column({ type: 'timestamp', nullable: true })
  lastResetDate: Date; // Para resetear contador diario

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => EmailAccount, account => account.provider)
  accounts: EmailAccount[];

  // Virtual properties
  get isActive(): boolean {
    return this.status === EmailProviderStatus.ACTIVE;
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