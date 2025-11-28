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
import { IoTDevice } from './iot-device.entity';
import { User } from '../../users/entities/user.entity';

export enum CommandStatus {
  PENDING = 'pending',
  SENT = 'sent',
  ACKNOWLEDGED = 'acknowledged',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
}

@Entity('device_commands')
@Index(['deviceId'])
@Index(['status'])
@Index(['sentAt'])
export class DeviceCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IoTDevice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceId' })
  device: IoTDevice;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ length: 100 })
  command: string; // e.g., "SET_VOLUME", "PLAY_SOUND", "MOVE_FORWARD", "SET_LED_COLOR"

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>; // Command parameters

  @Column({
    type: 'enum',
    enum: CommandStatus,
    default: CommandStatus.PENDING,
  })
  status: CommandStatus;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sentById' })
  sentBy: User;

  @Column({ type: 'uuid', nullable: true })
  sentById: string;

  @Column({ type: 'jsonb', nullable: true })
  response: Record<string, any>; // Device response

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', nullable: true })
  retryCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Helper methods
  get isPending(): boolean {
    return this.status === CommandStatus.PENDING || this.status === CommandStatus.SENT;
  }

  get isCompleted(): boolean {
    return this.status === CommandStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === CommandStatus.FAILED || this.status === CommandStatus.TIMEOUT;
  }

  get executionTimeMs(): number | null {
    if (!this.sentAt || !this.completedAt) return null;
    return new Date(this.completedAt).getTime() - new Date(this.sentAt).getTime();
  }
}
