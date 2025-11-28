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
import { Person } from './person.entity';
import { RelationshipType } from './relationship-type.entity';
import { User } from './user.entity';

@Entity('relationships')
@Index(['personAId', 'personBId', 'relationshipTypeId'], { unique: true })
export class Relationship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'personAId' })
  personA: Person;

  @Column({ type: 'uuid' })
  personAId: string;

  @ManyToOne(() => RelationshipType, { nullable: false })
  @JoinColumn({ name: 'relationshipTypeId' })
  relationshipType: RelationshipType;

  @Column({ type: 'uuid' })
  relationshipTypeId: string;

  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'personBId' })
  personB: Person;

  @Column({ type: 'uuid' })
  personBId: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

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
  voided: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'voidedById' })
  voidedBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  dateVoided: Date;

  @Column({ nullable: true })
  voidReason: string;
}
