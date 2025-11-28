import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Location } from '../../common/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { DeviceModel } from './device-model.entity';
import { FirmwareVersion } from './firmware-version.entity';

export type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance';
export type DeviceType = 'sensor' | 'actuator' | 'camera' | 'microphone' | 'speaker' | 'controller';

@Entity('iot_devices')
@Index(['deviceModelId'])
@Index(['status'])
@Index(['macAddress'])
@Index(['deviceId'])
@Index(['locationId'])
export class IoTDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Device model reference
  @ManyToOne(() => DeviceModel, { eager: true })
  @JoinColumn({ name: 'deviceModelId' })
  deviceModel: DeviceModel;

  @Column({ type: 'uuid', nullable: true })
  deviceModelId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 32, unique: true, nullable: true })
  @Index()
  macAddress?: string;

  @Column({ length: 64, unique: true, nullable: true })
  @Index()
  deviceId?: string; // Device ID para ESP32 BLE (ej: "ESP32_8CBFEA877D0C")

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({
    type: 'enum',
    enum: ['sensor', 'actuator', 'camera', 'microphone', 'speaker', 'controller'],
    nullable: true,
  })
  deviceType?: DeviceType;

  @Column({
    type: 'enum',
    enum: ['online', 'offline', 'error', 'maintenance'],
    default: 'offline',
  })
  @Index()
  status: DeviceStatus;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'locationId' })
  locationEntity?: Location;

  @Column({ type: 'uuid', nullable: true })
  locationId?: string;

  // Current firmware
  @ManyToOne(() => FirmwareVersion, { nullable: true })
  @JoinColumn({ name: 'currentFirmwareId' })
  currentFirmware?: FirmwareVersion;

  @Column({ type: 'uuid', nullable: true })
  currentFirmwareId?: string;

  // Sensor readings (moved to separate entity)
  @OneToMany('SensorReading', 'device')
  readings?: any[];

  // Commands sent to device
  @OneToMany('DeviceCommand', 'device')
  commands?: any[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  roomName?: string; // LiveKit room association

  @Column({ type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDataReceived?: Date;

  // Sensor data fields
  @Column({ type: 'float', nullable: true })
  temperature?: number;

  @Column({ type: 'float', nullable: true })
  humidity?: number;

  @Column({ type: 'int', nullable: true })
  batteryLevel?: number;

  @Column({ type: 'int', nullable: true })
  signalStrength?: number;

  // Relación opcional con Toy (1:0 o 1:1)
  @OneToOne('Toy', 'iotDevice', { nullable: true })
  toy?: any;

  // OpenMRS-style auditing
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creatorId' })
  creator?: User;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changedById' })
  changedBy?: User;

  @Column({ default: false })
  retired: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'retiredById' })
  retiredBy?: User;

  @Column({ type: 'timestamptz', nullable: true })
  dateRetired?: Date;

  @Column({ nullable: true })
  retireReason?: string;

  // Helper methods
  isOnline(): boolean {
    return this.status === 'online';
  }

  isRegistered(): boolean {
    return !!this.toy;
  }

  getOwnerUserId(): string | null {
    return this.toy?.userId || null;
  }

  updateLastSeen(): void {
    this.lastSeen = new Date();
  }

  updateSensorData(sensorData: {
    temperature?: number;
    humidity?: number;
    batteryLevel?: number;
    signalStrength?: number;
  }): void {
    if (sensorData.temperature !== undefined) {
      this.temperature = sensorData.temperature;
    }
    if (sensorData.humidity !== undefined) {
      this.humidity = sensorData.humidity;
    }
    if (sensorData.batteryLevel !== undefined) {
      this.batteryLevel = sensorData.batteryLevel;
    }
    if (sensorData.signalStrength !== undefined) {
      this.signalStrength = sensorData.signalStrength;
    }
    this.lastDataReceived = new Date();
  }
}
