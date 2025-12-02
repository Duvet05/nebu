import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Toy } from './toy.entity';

@Entity('product_catalog')
@Index(['slug'], { unique: true })
@Index(['active'])
@Index(['inStock'])
export class ProductCatalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200, nullable: true })
  concept: string;

  @Column({ length: 200, nullable: true })
  originalCharacter: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  shortDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  depositAmount: number;

  @Column({ default: false })
  preOrder: boolean;

  @Column({ default: false })
  inStock: boolean;

  @Column({ type: 'int', default: 0 })
  stockCount: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ length: 100, nullable: true })
  videoPlaybackId: string; // Cloudflare Stream ID or YouTube ID

  @Column({ length: 20, nullable: true })
  videoProvider: string; // 'cloudflare' | 'youtube' | null

  @Column({ length: 500, nullable: true })
  videoThumbnail: string; // Optional thumbnail URL (auto-generated if not provided)

  @Column('jsonb', { nullable: true })
  colors: any[];

  @Column({ length: 50, nullable: true })
  ageRange: string;

  @Column('simple-array', { nullable: true })
  features: string[];

  @Column({ length: 50, default: 'plushie' })
  category: string;

  @Column({ length: 50, nullable: true })
  badge: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  orderCount: number;

  // Relación inversa con Toy - Un producto del catálogo puede tener múltiples juguetes físicos
  @OneToMany(() => Toy, toy => toy.productCatalog)
  toys: Toy[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
