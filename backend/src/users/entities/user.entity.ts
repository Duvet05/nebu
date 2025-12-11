import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Person } from './person.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  SUPPORT = 'support',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  systemId: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ nullable: true })
  @Exclude()
  secretQuestion: string;

  @Column({ nullable: true })
  @Exclude()
  secretAnswer: string;

  @Column({ unique: true })
  email: string;

  @OneToOne(() => Person, { cascade: true, eager: true })
  @JoinColumn()
  person: Person;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ type: 'timestamptz', nullable: true })
  passwordResetExpires: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  // OAuth fields
  @Column({ nullable: true })
  oauthProvider: string;

  @Column({ nullable: true })
  oauthId: string;

  @Column({ nullable: true })
  culqiCustomerId: string;

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

  @OneToMany('Toy', 'user')
  toys: any[];

  @ManyToMany('Role', 'users')
  roles: any[];

  // Compatibility getters for moved fields (readonly - use PersonName entity to modify)
  get firstName(): string {
    return this.person?.firstName;
  }

  get lastName(): string {
    return this.person?.lastName;
  }

  get avatar(): string {
    return this.person?.metadata?.avatar;
  }

  set avatar(value: string) {
    if (this.person) {
        if (!this.person.metadata) this.person.metadata = {};
        this.person.metadata.avatar = value;
    }
  }

  get preferredLanguage(): string {
    return this.person?.preferredLanguage;
  }

  set preferredLanguage(value: string) {
    if (this.person) this.person.preferredLanguage = value;
  }

  get timezone(): string {
    return this.person?.timezone;
  }

  set timezone(value: string) {
    if (this.person) this.person.timezone = value;
  }

  get preferences(): Record<string, any> {
    return this.person?.preferences;
  }

  set preferences(value: Record<string, any>) {
    if (this.person) this.person.preferences = value;
  }
  
  get metadata(): Record<string, any> {
      return this.person?.metadata;
  }

  set metadata(value: Record<string, any>) {
      if (this.person) this.person.metadata = value;
  }


  // Virtual properties
  get fullName(): string {
    return this.person?.fullName || this.username;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get hasRole(): (roleName: string) => boolean {
    return (roleName: string) => {
      return this.role === roleName;
    };
  }

  get hasPrivilege(): (privilegeName: string) => boolean {
    return (_privilegeName: string) => {
      // For now, simplified privilege system
      return this.role === UserRole.ADMIN;
    };
  }

  get isSupport(): boolean {
    return this.role === UserRole.SUPPORT || this.role === UserRole.ADMIN;
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  get isCustomer(): boolean {
    return this.role === UserRole.CUSTOMER;
  }


  get toysCount(): number {
    return this.toys ? this.toys.length : 0;
  }

  get activeToysCount(): number {
    if (!this.toys) return 0;
    return this.toys.filter(toy => 
      toy.status === 'active' || toy.status === 'connected'
    ).length;
  }
}
