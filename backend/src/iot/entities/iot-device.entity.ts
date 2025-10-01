import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';

export type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance';
export type DeviceType = 'sensor' | 'actuator' | 'camera' | 'microphone' | 'speaker' | 'controller';

@Entity('iot_devices')
export class IoTDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['sensor', 'actuator', 'camera', 'microphone', 'speaker', 'controller'],
  })
  deviceType: DeviceType;

  @Column({ length: 32, unique: true })
  @Index()
  macAddress: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({
    type: 'enum',
    enum: ['online', 'offline', 'error', 'maintenance'],
    default: 'offline',
  })
  @Index()
  status: DeviceStatus;

  @Column({ length: 255, nullable: true })
  location?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  roomName?: string; // LiveKit room association

  @Column({ type: 'float', nullable: true })
  temperature?: number;

  @Column({ type: 'float', nullable: true })
  humidity?: number;

  @Column({ type: 'float', nullable: true })
  pressure?: number;

  @Column({ type: 'int', nullable: true })
  batteryLevel?: number;

  @Column({ type: 'float', nullable: true })
  signalStrength?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDataReceived?: Date;

  // Relación opcional con Toy (1:0 o 1:1)
  @OneToOne('Toy', 'iotDevice', { nullable: true })
  toy?: any;

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

  updateSensorData(data: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    batteryLevel?: number;
    signalStrength?: number;
  }): void {
    Object.assign(this, data);
    this.lastDataReceived = new Date();
    this.updateLastSeen();
  }
}
