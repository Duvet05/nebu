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
import { User } from '../../users/entities/user.entity';

export enum DeviceCategory {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  CONTROLLER = 'controller',
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  SPEAKER = 'speaker',
  DISPLAY = 'display',
  MOTOR = 'motor',
}

@Entity('device_types')
@Index(['code'], { unique: true })
@Index(['category'])
export class DeviceType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string; // e.g., "ESP32 Microcontroller", "DHT22 Temperature Sensor"

  @Column({ unique: true, length: 50 })
  code: string; // e.g., "ESP32", "DHT22", "SERVO_MG90S"

  @Column({
    type: 'enum',
    enum: DeviceCategory,
  })
  category: DeviceCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  manufacturer: string;

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
