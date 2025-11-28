import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IoTDevice } from './iot-device.entity';
import { DeviceCapability } from './device-capability.entity';

export enum ReadingQuality {
  GOOD = 'good',
  POOR = 'poor',
  ERROR = 'error',
  CALIBRATING = 'calibrating',
}

@Entity('sensor_readings')
@Index(['deviceId', 'timestamp'])
@Index(['capabilityId'])
@Index(['timestamp'])
export class SensorReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IoTDevice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceId' })
  device: IoTDevice;

  @Column({ type: 'uuid' })
  deviceId: string;

  @ManyToOne(() => DeviceCapability, { eager: true })
  @JoinColumn({ name: 'capabilityId' })
  capability: DeviceCapability;

  @Column({ type: 'uuid' })
  capabilityId: string;

  @Column({ type: 'text' })
  value: string; // Stored as string, can be parsed based on capability.dataType

  @Column({ nullable: true })
  unit: string;

  @Column({
    type: 'enum',
    enum: ReadingQuality,
    default: ReadingQuality.GOOD,
  })
  quality: ReadingQuality;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional context, calibration data, etc.

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Helper methods
  getNumericValue(): number | null {
    try {
      return parseFloat(this.value);
    } catch {
      return null;
    }
  }

  getBooleanValue(): boolean | null {
    if (this.value === 'true' || this.value === '1') return true;
    if (this.value === 'false' || this.value === '0') return false;
    return null;
  }

  getJsonValue(): any | null {
    try {
      return JSON.parse(this.value);
    } catch {
      return null;
    }
  }
}
