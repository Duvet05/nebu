import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum Language {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  PT = 'pt',
  IT = 'it',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

@Entity('user_setup')
export class UserSetup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  // Profile
  @Column({ type: 'jsonb', nullable: true })
  profile: {
    name: string;
    email: string;
    avatarUrl?: string;
  };

  // Preferences
  @Column({
    type: 'enum',
    enum: Language,
    default: Language.ES,
  })
  language: Language;

  @Column({
    type: 'enum',
    enum: Theme,
    default: Theme.SYSTEM,
  })
  theme: Theme;

  @Column({ default: true })
  hapticFeedback: boolean;

  @Column({ default: true })
  autoSave: boolean;

  @Column({ default: false })
  analytics: boolean;

  // Notifications
  @Column({ default: true })
  pushNotifications: boolean;

  @Column({ default: true })
  reminders: boolean;

  @Column({ default: true })
  voiceNotifications: boolean;

  @Column({ default: true })
  updates: boolean;

  @Column({ default: false })
  marketing: boolean;

  @Column({ type: 'varchar', length: 5, nullable: true })
  quietHoursStart?: string; // "22:00"

  @Column({ type: 'varchar', length: 5, nullable: true })
  quietHoursEnd?: string; // "08:00"

  // Voice
  @Column({ default: true })
  voiceEnabled: boolean;

  @Column({ nullable: true })
  voiceModel?: string;

  @Column({ type: 'float', default: 1.0 })
  speechRate?: number;

  // Setup completion
  @Column({ default: false })
  setupCompleted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  setupCompletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
