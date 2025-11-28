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
import { Person } from '../../users/entities/person.entity';
import { User } from '../../users/entities/user.entity';

@Entity('person_names')
@Index(['personId', 'preferred'])
export class PersonName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column({ type: 'uuid' })
  personId: string;

  @Column({ default: false })
  preferred: boolean;

  @Column({ nullable: true })
  prefix: string; // Dr., Mr., Mrs., etc.

  @Column()
  givenName: string; // First name

  @Column({ nullable: true })
  middleName: string;

  @Column()
  familyName: string; // Last name

  @Column({ nullable: true })
  familyName2: string; // Second last name (common in Spanish)

  @Column({ nullable: true })
  suffix: string; // Jr., Sr., III, etc.

  @Column({ nullable: true })
  degree: string; // MD, PhD, etc.

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

  // Virtual property
  get fullName(): string {
    const parts = [
      this.prefix,
      this.givenName,
      this.middleName,
      this.familyName,
      this.familyName2,
      this.suffix,
      this.degree,
    ].filter(Boolean);
    return parts.join(' ');
  }
}
