import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { VoiceSession } from '../../voice/entities/voice-session.entity';

export enum HeartbeatStatus {
  ACTIVE = 'active',           // Activamente en uso
  IDLE = 'idle',               // Conectado pero sin actividad
  DISCONNECTED = 'disconnected', // Desconectado
  RECONNECTING = 'reconnecting', // Intentando reconectar
}

@Entity('session_heartbeats')
@Index(['sessionId', 'timestamp'])
@Index(['status'])
export class SessionHeartbeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => VoiceSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: VoiceSession;

  @Column({
    type: 'enum',
    enum: HeartbeatStatus,
    default: HeartbeatStatus.ACTIVE,
  })
  status: HeartbeatStatus;

  @Column({ type: 'jsonb', nullable: true })
  metrics?: {
    audioQuality?: number;      // 0-1
    latency?: number;           // ms
    batteryLevel?: number;      // 0-100
    signalStrength?: number;    // dBm
    userEngagement?: number;    // 0-1 (estimado por sensores)
    cpuUsage?: number;          // % (del ESP32)
    memoryUsage?: number;       // % (del ESP32)
    temperature?: number;       // Celsius (del ESP32)
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceId?: string; // MAC address del juguete

  @Column({ type: 'text', nullable: true })
  errorMessage?: string; // Si status = ERROR

  @CreateDateColumn()
  @Index()
  timestamp: Date;

  // Helper methods
  isHealthy(): boolean {
    if (!this.metrics) return false;

    const {
      audioQuality = 1,
      latency = 0,
      batteryLevel = 100,
      signalStrength = -40,
    } = this.metrics;

    return (
      audioQuality > 0.6 &&
      latency < 500 &&
      batteryLevel > 10 &&
      signalStrength > -80
    );
  }

  getHealthScore(): number {
    if (!this.metrics) return 0;

    let score = 1.0;

    // Penalizar latencia alta
    if (this.metrics.latency > 500) score -= 0.3;
    else if (this.metrics.latency > 200) score -= 0.1;

    // Penalizar calidad de audio baja
    if (this.metrics.audioQuality < 0.7) score -= 0.2;

    // Penalizar batería baja
    if (this.metrics.batteryLevel < 20) score -= 0.2;
    else if (this.metrics.batteryLevel < 10) score -= 0.4;

    // Penalizar señal débil
    if (this.metrics.signalStrength < -70) score -= 0.15;

    return Math.max(score, 0);
  }
}
