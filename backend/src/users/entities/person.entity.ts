import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
// Using string references to avoid circular dependencies

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
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true })
  preferredName: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
  })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({
    type: 'enum',
    enum: PersonStatus,
    default: PersonStatus.ACTIVE,
  })
  status: PersonStatus;

  @Column({ type: 'date', nullable: true })
  deathDate: Date;

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations using string references to avoid circular dependencies
  @OneToMany('Student', 'person')
  students: any[];

  // Virtual properties
  get fullName(): string {
    if (this.preferredName) {
      return this.preferredName;
    }
    return `${this.firstName} ${this.lastName}`;
  }

  get displayName(): string {
    if (this.preferredName) {
      return this.preferredName;
    }
    const middle = this.middleName ? ` ${this.middleName}` : '';
    return `${this.firstName}${middle} ${this.lastName}`;
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
