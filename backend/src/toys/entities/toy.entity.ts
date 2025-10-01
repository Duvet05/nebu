import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ToyStatus {
  INACTIVE = 'inactive',      // Sin activar
  ACTIVE = 'active',          // Activado y funcionando
  CONNECTED = 'connected',    // Conectado y en uso
  DISCONNECTED = 'disconnected', // Desconectado
  MAINTENANCE = 'maintenance', // En mantenimiento
  ERROR = 'error',           // Con errores
  BLOCKED = 'blocked',       // Bloqueado por seguridad
}

@Entity('toys')
@Index(['status']) // Índice para búsquedas por estado
@Index(['userId']) // Índice para búsquedas por usuario
@Index(['iotDeviceId']) // Índice para búsquedas por dispositivo IoT
export class Toy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // Nombre del juguete (ej: "Mi Robot Azul")

  @Column({ type: 'varchar', length: 50, nullable: true })
  model: string; // Modelo del juguete (ej: "NebuBot Pro")

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string; // Fabricante (ej: "Nebu Technologies")

  @Column({
    type: 'enum',
    enum: ToyStatus,
    default: ToyStatus.INACTIVE,
  })
  status: ToyStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  firmwareVersion: string; // Versión del firmware

  @Column({ type: 'varchar', length: 20, nullable: true })
  batteryLevel: string; // Nivel de batería (ej: "85%")

  @Column({ type: 'varchar', length: 20, nullable: true })
  signalStrength: string; // Fuerza de señal WiFi (ej: "-45dBm")

  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt: Date; // Última vez que se conectó

  @Column({ type: 'timestamp', nullable: true })
  activatedAt: Date; // Fecha de activación

  @Column({ type: 'jsonb', nullable: true })
  capabilities: {
    // Capacidades del juguete
    voice?: boolean;
    movement?: boolean;
    lights?: boolean;
    sensors?: string[];
    aiFeatures?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    // Configuraciones del juguete
    volume?: number;
    brightness?: number;
    language?: string;
    timezone?: string;
    autoUpdate?: boolean;
  };

  @Column({ type: 'text', nullable: true })
  notes: string; // Notas adicionales del usuario

  // Relación obligatoria con IoTDevice (1:1)
  @OneToOne('IoTDevice', 'toy')
  @JoinColumn({ name: 'iotDeviceId' })
  iotDevice: any;

  @Column({ type: 'uuid' })
  iotDeviceId: string;

  // Relación obligatoria con User - Un juguete siempre pertenece a un usuario
  @ManyToOne(() => User, user => user.toys, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  // Metadatos de auditoría
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos helper
  isActive(): boolean {
    return this.status === ToyStatus.ACTIVE || this.status === ToyStatus.CONNECTED;
  }

  isConnected(): boolean {
    return this.status === ToyStatus.CONNECTED;
  }

  needsAttention(): boolean {
    return [
      ToyStatus.ERROR,
      ToyStatus.MAINTENANCE,
      ToyStatus.BLOCKED,
    ].includes(this.status);
  }

  getMacAddress(): string {
    return this.iotDevice?.macAddress;
  }

  getStatusColor(): string {
    switch (this.status) {
      case ToyStatus.ACTIVE:
      case ToyStatus.CONNECTED:
        return 'green';
      case ToyStatus.INACTIVE:
        return 'gray';
      case ToyStatus.DISCONNECTED:
        return 'yellow';
      case ToyStatus.ERROR:
        return 'red';
      case ToyStatus.MAINTENANCE:
        return 'orange';
      case ToyStatus.BLOCKED:
        return 'red';
      default:
        return 'gray';
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case ToyStatus.INACTIVE:
        return 'Sin activar';
      case ToyStatus.ACTIVE:
        return 'Activado';
      case ToyStatus.CONNECTED:
        return 'Conectado';
      case ToyStatus.DISCONNECTED:
        return 'Desconectado';
      case ToyStatus.MAINTENANCE:
        return 'En mantenimiento';
      case ToyStatus.ERROR:
        return 'Con errores';
      case ToyStatus.BLOCKED:
        return 'Bloqueado';
      default:
        return 'Desconocido';
    }
  }
}
