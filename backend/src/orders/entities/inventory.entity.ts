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
import { ProductCatalog } from '../../toys/entities/product-catalog.entity';
import { Location } from '../../common/entities/location.entity';
import { User } from '../../users/entities/user.entity';

@Entity('inventory')
@Index(['productId'])
@Index(['locationId'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductCatalog, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: ProductCatalog;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ type: 'uuid', nullable: true })
  locationId: string;

  @Column({ type: 'int', default: 0 })
  totalUnits: number;

  @Column({ type: 'int', default: 0 })
  reservedUnits: number;

  @Column({ type: 'int', default: 0 })
  soldUnits: number;

  @Column({ type: 'int', default: 0 })
  availableUnits: number;

  @Column({ type: 'int', nullable: true })
  reorderPoint: number; // Minimum quantity before reordering

  @Column({ type: 'int', nullable: true })
  reorderQuantity: number; // How many to order when restocking

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  sku: string; // Stock Keeping Unit

  @Column({ nullable: true })
  batchNumber: string;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

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
  voided: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'voidedById' })
  voidedBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  dateVoided: Date;

  @Column({ nullable: true })
  voidReason: string;

  // Helper methods
  get needsReorder(): boolean {
    if (!this.reorderPoint) return false;
    return this.availableUnits <= this.reorderPoint;
  }

  updateAvailableUnits(): void {
    this.availableUnits = this.totalUnits - this.reservedUnits - this.soldUnits;
  }
}

