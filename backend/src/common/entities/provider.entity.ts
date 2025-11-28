import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Person } from '../../users/entities/person.entity';
import { User } from '../../users/entities/user.entity';

export enum ProviderRole {
  AI_AGENT = 'ai_agent',
  HUMAN_OPERATOR = 'human_operator',
  SYSTEM = 'system',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Person, { nullable: true })
  @JoinColumn()
  person: Person;

  @Column({ unique: true })
  identifier: string; // e.g., "AI_AGENT_SALES", "HUMAN_OPERATOR_001"

  @Column({
    type: 'enum',
    enum: ProviderRole,
    default: ProviderRole.SYSTEM,
  })
  role: ProviderRole;

  @Column({ nullable: true })
  name: string; // Display name, e.g., "Sales AI Agent"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

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
