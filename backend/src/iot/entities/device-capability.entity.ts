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
import { DeviceModel } from './device-model.entity';
import { User } from '../../users/entities/user.entity';

export enum CapabilityDataType {
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  STRING = 'string',
  JSON = 'json',
}

@Entity('device_capabilities')
@Index(['deviceModelId'])
@Index(['code'])
export class DeviceCapability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DeviceModel, (model) => model.capabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceModelId' })
  deviceModel: DeviceModel;

  @Column({ type: 'uuid' })
  deviceModelId: string;

  @Column({ length: 100 })
  name: string; // e.g., "Temperature Sensing", "Voice Output", "LED Control"

  @Column({ length: 50 })
  code: string; // e.g., "TEMP", "VOICE_OUT", "LED"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CapabilityDataType,
    default: CapabilityDataType.NUMBER,
  })
  dataType: CapabilityDataType;

  @Column({ nullable: true })
  unit: string; // e.g., "°C", "dB", "%", "lux"

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  accuracy: number; // Measurement accuracy

  @Column({ type: 'int', nullable: true })
  sampleRateHz: number; // How often this capability can be sampled

  @Column({ default: true })
  isReadable: boolean; // Can read data from this capability

  @Column({ default: false })
  isWritable: boolean; // Can write/control this capability

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

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
  retired: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'retiredById' })
  retiredBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  dateRetired: Date;

  @Column({ nullable: true })
  retireReason: string;
}
