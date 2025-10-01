import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
// Using string references to avoid circular dependencies

export enum PrivilegeType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  EXECUTE = 'execute',
  MANAGE = 'manage',
}

export enum PrivilegeScope {
  GLOBAL = 'global',
  MODULE = 'module',
  RESOURCE = 'resource',
  FIELD = 'field',
}

@Entity('privileges')
export class Privilege {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'timestamptz', nullable: true })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PrivilegeType,
    default: PrivilegeType.READ,
  })
  type: PrivilegeType;

  @Column({
    type: 'enum',
    enum: PrivilegeScope,
    default: PrivilegeScope.RESOURCE,
  })
  scope: PrivilegeScope;

  @Column({ type: 'timestamptz', nullable: true })
  resource: string; // e.g., 'courses', 'users', 'analytics'

  @Column({ type: 'timestamptz', nullable: true })
  action: string; // e.g., 'create', 'update', 'delete', 'view'

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations using string references to avoid circular dependencies
  @ManyToMany('Role', 'privileges')
  roles: any[];

  // Virtual properties
  get fullName(): string {
    if (this.resource && this.action) {
      return `${this.resource}:${this.action}`;
    }
    return this.name;
  }

  get isGlobal(): boolean {
    return this.scope === PrivilegeScope.GLOBAL;
  }

  get isModule(): boolean {
    return this.scope === PrivilegeScope.MODULE;
  }

  get isResource(): boolean {
    return this.scope === PrivilegeScope.RESOURCE;
  }

  get isField(): boolean {
    return this.scope === PrivilegeScope.FIELD;
  }
}
