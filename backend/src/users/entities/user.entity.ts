import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  // ManyToMany,
  // JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
// Using string references to avoid circular dependencies
// Relations will be loaded via repositories when needed

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
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

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
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

  @Column({ default: 'es' })
  preferredLanguage: string;

  @Column({ default: 'America/Lima' })
  timezone: string;

  @Column({ type: 'json', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // OAuth fields
  @Column({ nullable: true })
  oauthProvider: string;

  @Column({ nullable: true })
  oauthId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relaciones a Course eliminadas por no existir entidad Course
  // Relaciones eliminadas: Progress, Subscription, Purchase, Review, UserCourseEnrollment, UserProgress, Order (no existen entidades)

  @OneToMany('Toy', 'user')
  toys: any[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim() || this.username;
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

  get isInstructor(): boolean {
    return this.role === UserRole.INSTRUCTOR || this.role === UserRole.ADMIN;
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  get isStudent(): boolean {
    return this.role === UserRole.STUDENT;
  }


  get completedCoursesCount(): number {
    // TODO: Implement when course system is added
    return 0;
  }

  get totalProgressCount(): number {
    // TODO: Implement when course system is added
    return 0;
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
