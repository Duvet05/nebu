import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VoiceSession } from '../../voice/entities/voice-session.entity';
// import { Agent } from '../../agents/entities/agent.entity'; // Module disabled

export enum MemoryType {
  EPISODIC = 'episodic',     // Recuerdos de conversaciones pasadas
  SEMANTIC = 'semantic',      // Conocimiento sobre el usuario
  PROCEDURAL = 'procedural',  // Patrones de comportamiento
}

export enum MemoryCategory {
  CONVERSATION = 'conversation',
  INTEREST = 'interest',
  EMOTION = 'emotion',
  ACHIEVEMENT = 'achievement',
  ROUTINE = 'routine',
  PREFERENCE = 'preference',
  LEARNING = 'learning',
  FAMILY = 'family',
  OTHER = 'other',
}

@Entity('memory_contexts')
@Index(['userId', 'memoryType'])
@Index(['userId', 'agentId', 'memoryType'])
@Index(['sessionId'])
@Index(['importance'])
@Index(['createdAt'])
export class MemoryContext {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  sessionId?: string;

  @ManyToOne(() => VoiceSession, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sessionId' })
  session?: VoiceSession;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  agentId?: string;

  // @ManyToOne(() => Agent, { nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'agentId' })
  // agent?: Agent;

  @Column({
    type: 'enum',
    enum: MemoryType,
    default: MemoryType.EPISODIC,
  })
  memoryType: MemoryType;

  @Column({
    type: 'enum',
    enum: MemoryCategory,
    default: MemoryCategory.CONVERSATION,
  })
  category: MemoryCategory;

  @Column({ type: 'text' })
  content: string; // El contenido del recuerdo

  @Column({ type: 'text', nullable: true })
  summary?: string; // Resumen generado por IA (opcional)

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    tags?: string[];           // ej: ['dinosaurios', 'aprendizaje']
    emotions?: string[];       // ej: ['happy', 'excited']
    topics?: string[];         // ej: ['science', 'nature']
    entities?: string[];       // ej: ['T-Rex', 'Mamá', 'Perro Max']
    language?: string;         // ej: 'es', 'en'
    confidence?: number;       // 0-1 (confianza en la información)
    source?: string;           // 'conversation', 'user_input', 'inferred'
    [key: string]: any;
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  chromaCollectionId?: string; // ID del documento en ChromaDB

  @Column({ type: 'varchar', length: 50, nullable: true })
  chromaCollectionName?: string; // Nombre de la colección en ChromaDB

  @Column({ type: 'float', default: 0.5 })
  importance: number; // 0-1 scale (prioridad del recuerdo)

  @Column({ type: 'int', default: 0 })
  accessCount: number; // Veces que se ha recuperado este recuerdo

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date; // Para memoria episódica (auto-cleanup)

  // Helper methods
  incrementAccess(): void {
    this.accessCount++;
    this.lastAccessedAt = new Date();
    // Aumentar importancia con el uso (máximo 1.0)
    this.importance = Math.min(this.importance + 0.05, 1.0);
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
  }

  decay(decayRate: number = 0.1): void {
    // Decaimiento natural de la importancia con el tiempo
    this.importance = Math.max(this.importance - decayRate, 0);
  }
}
