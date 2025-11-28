import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
// Using string references to avoid circular dependencies

export enum RoleType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

export enum RoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
}

@Entity('roles')
@Index(['status'])
@Index(['type'])
@Index(['name', 'status'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.CUSTOM,
  })
  type: RoleType;

  @Column({
    type: 'enum',
    enum: RoleStatus,
    default: RoleStatus.ACTIVE,
  })
  status: RoleStatus;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: false })
  isSystemRole: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations using string references to avoid circular dependencies
  @ManyToMany('User')
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  users: any[];

  @ManyToMany('Privilege', 'roles')
  @JoinTable({
    name: 'role_privileges',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'privilegeId', referencedColumnName: 'id' },
  })
  privileges: any[];

  // Virtual properties
  get isActive(): boolean {
    return this.status === RoleStatus.ACTIVE;
  }

  get isCustom(): boolean {
    return this.type === RoleType.CUSTOM;
  }
}
