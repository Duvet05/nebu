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

export enum AttributeFormat {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  CONCEPT = 'concept', // Reference to a Concept
  LOCATION = 'location', // Reference to a Location
}

@Entity('person_attribute_types')
export class PersonAttributeType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., "Phone Number", "Emergency Contact", "Preferred Learning Style"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AttributeFormat,
    default: AttributeFormat.STRING,
  })
  format: AttributeFormat;

  @Column({ nullable: true })
  foreignKey: string; // For concept/location references

  @Column({ default: 0 })
  sortWeight: number;

  @Column({ default: true })
  searchable: boolean;

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
