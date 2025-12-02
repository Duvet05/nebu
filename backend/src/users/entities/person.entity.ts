import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PersonName } from './person-name.entity';
import { PersonAttribute } from './person-attribute.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}

export enum PersonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEAD = 'dead',
}

@Entity('persons')
@Index(['email'])
@Index(['status'])
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
  })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ default: false })
  birthdateEstimated: boolean;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({
    type: 'enum',
    enum: PersonStatus,
    default: PersonStatus.ACTIVE,
  })
  status: PersonStatus;

  @Column({ default: false })
  dead: boolean;

  @Column({ type: 'date', nullable: true })
  deathDate: Date;

  @Column({ type: 'uuid', nullable: true })
  causeOfDeath: string; // Concept ID in future

  // Contact Information
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  // Professional Information
  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  github: string;

  @Column({ nullable: true })
  twitter: string;

  // Preferences
  @Column({ default: 'es' })
  preferredLanguage: string;

  @Column({ default: 'America/Lima' })
  timezone: string;

  @Column({ type: 'json', nullable: true })
  preferences: Record<string, any>;

  // Metadata
  @Column({ type: 'json', nullable: true })
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
  voided: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'voidedById' })
  voidedBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  dateVoided: Date;

  @Column({ nullable: true })
  voidReason: string;

  // OpenMRS-style relationships
  @OneToMany(() => PersonName, (name) => name.person)
  names: PersonName[];

  @OneToMany(() => PersonAttribute, (attr) => attr.person)
  attributes: PersonAttribute[];

  @OneToMany('Relationship', 'personA')
  relationshipsAsA: any[];

  @OneToMany('Relationship', 'personB')
  relationshipsAsB: any[];

  // Relación inversa con User (opcional - una Person puede no tener usuario del sistema)
  @OneToOne(() => User, user => user.person, { nullable: true })
  user?: User;

  // Virtual properties - now use PersonName
  get preferredName(): PersonName | undefined {
    return this.names?.find(n => n.preferred);
  }

  get fullName(): string {
    const preferred = this.preferredName;
    if (!preferred) return 'Unknown';
    return preferred.fullName;
  }

  get displayName(): string {
    return this.fullName;
  }

  get firstName(): string {
    return this.preferredName?.givenName || '';
  }

  get lastName(): string {
    return this.preferredName?.familyName || '';
  }

  get age(): number | null {
    if (!this.birthDate) return null;
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  get isActive(): boolean {
    return this.status === PersonStatus.ACTIVE;
  }
}
