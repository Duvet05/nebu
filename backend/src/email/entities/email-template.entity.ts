import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  COURSE_ENROLLMENT = 'course_enrollment',
  COURSE_COMPLETION = 'course_completion',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  INVOICE = 'invoice',
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional',
  SYSTEM_NOTIFICATION = 'system_notification',
  CUSTOM = 'custom',
}

export enum EmailTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

@Entity('email_templates')
@Index(['type', 'status'])
@Index(['name'])
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 255 })
  subject: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  htmlContent: string;

  @Column({
    type: 'enum',
    enum: EmailTemplateType,
    default: EmailTemplateType.CUSTOM,
  })
  type: EmailTemplateType;

  @Column({
    type: 'enum',
    enum: EmailTemplateStatus,
    default: EmailTemplateStatus.ACTIVE,
  })
  status: EmailTemplateStatus;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  variables: string; // JSON string with available variables

  @Column('text', { nullable: true })
  css: string; // Custom CSS for HTML templates

  @Column('text', { nullable: true })
  previewText: string; // Text preview for email clients

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
