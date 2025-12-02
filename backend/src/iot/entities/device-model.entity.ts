import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { DeviceType } from './device-type.entity';
import { FirmwareVersion } from './firmware-version.entity';
import { DeviceCapability } from './device-capability.entity';
import { User } from '../../users/entities/user.entity';

@Entity('device_models')
@Index(['deviceTypeId'])
@Index(['modelNumber'])
export class DeviceModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DeviceType, { eager: true })
  @JoinColumn({ name: 'deviceTypeId' })
  deviceType: DeviceType;

  @Column({ type: 'uuid' })
  deviceTypeId: string;

  @Column({ length: 200 })
  name: string; // e.g., "ESP32-WROOM-32", "DHT22 Digital Sensor"

  @Column({ length: 100, nullable: true })
  modelNumber: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>; // Technical specs, dimensions, power requirements, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  datasheetUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  // Capabilities relationship
  @OneToMany(() => DeviceCapability, (cap) => cap.deviceModel)
  capabilities: DeviceCapability[];

  // Firmware versions relationship
  @OneToMany(() => FirmwareVersion, (fw) => fw.deviceModel)
  firmwareVersions: FirmwareVersion[];

  // Default firmware
  @ManyToOne(() => FirmwareVersion, { nullable: true })
  @JoinColumn({ name: 'defaultFirmwareId' })
  defaultFirmware: FirmwareVersion;

  @Column({ type: 'uuid', nullable: true })
  defaultFirmwareId: string;

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
