import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Toy } from '../../toys/entities/toy.entity';

export enum ActivityType {
  VOICE_COMMAND = 'voice_command',
  CONNECTION = 'connection',
  INTERACTION = 'interaction',
  UPDATE = 'update',
  ERROR = 'error',
  PLAY = 'play',
  SLEEP = 'sleep',
  WAKE = 'wake',
  CHAT = 'chat',
}

@Entity('activities')
@Index(['userId', 'timestamp'])
@Index(['toyId', 'timestamp'])
@Index(['type', 'timestamp'])
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => Toy, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'toyId' })
  toy?: Toy;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  toyId?: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  @Index()
  type: ActivityType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamptz' })
  @Index()
  timestamp: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
