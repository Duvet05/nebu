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
import { DeviceModel } from './device-model.entity';
import { User } from '../../users/entities/user.entity';

@Entity('firmware_versions')
@Index(['deviceModelId'])
@Index(['version'])
@Index(['isLatest'])
export class FirmwareVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DeviceModel, (model) => model.firmwareVersions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceModelId' })
  deviceModel: DeviceModel;

  @Column({ type: 'uuid' })
  deviceModelId: string;

  @Column({ length: 50 })
  version: string; // e.g., "1.2.3", "2.0.0-beta"

  @Column({ type: 'date' })
  releaseDate: Date;

  @Column({ nullable: true })
  downloadUrl: string;

  @Column({ type: 'text', nullable: true })
  changelog: string;

  @Column({ type: 'text', nullable: true })
  releaseNotes: string;

  @Column({ default: true })
  isStable: boolean;

  @Column({ default: false })
  isLatest: boolean;

  @Column({ default: false })
  isBeta: boolean;

  @Column({ nullable: true })
  minimumHardwareVersion: string;

  @Column({ type: 'bigint', nullable: true })
  fileSizeBytes: number;

  @Column({ nullable: true })
  checksum: string; // MD5 or SHA256 checksum

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // OpenMRS-style auditing
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

  // Helper properties
  get displayName(): string {
    let name = `v${this.version}`;
    if (this.isBeta) name += ' (Beta)';
    if (this.isLatest) name += ' (Latest)';
    return name;
  }

  get fileSizeMB(): number | null {
    if (!this.fileSizeBytes) return null;
    return this.fileSizeBytes / (1024 * 1024);
  }
}
