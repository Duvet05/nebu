import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('relationship_types')
export class RelationshipType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  aIsToB: string; // e.g., "Parent", "Tutor", "Guardian"

  @Column({ unique: true })
  bIsToA: string; // e.g., "Child", "Student", "Ward"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  weight: number; // For sorting

  @Column({ default: false })
  preferred: boolean;

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
