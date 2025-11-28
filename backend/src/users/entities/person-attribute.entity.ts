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
import { PersonAttributeType } from './person-attribute-type.entity';
import { User } from './user.entity';

@Entity('person_attributes')
@Index(['personId', 'attributeTypeId'])
export class PersonAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column({ type: 'uuid' })
  personId: string;

  @ManyToOne(() => PersonAttributeType, { nullable: false })
  @JoinColumn({ name: 'attributeTypeId' })
  attributeType: PersonAttributeType;

  @Column({ type: 'uuid' })
  attributeTypeId: string;

  @Column({ type: 'text' })
  value: string; // Stored as string, parsed based on attributeType.format

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
