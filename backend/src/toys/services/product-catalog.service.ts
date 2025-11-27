import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCatalog } from '../entities/product-catalog.entity';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from '../dto/product-catalog.dto';

@Injectable()
export class ProductCatalogService {
  constructor(
    @InjectRepository(ProductCatalog)
    private readonly productRepository: Repository<ProductCatalog>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductCatalog> {
    // Verificar si el slug ya existe
    const existing = await this.productRepository.findOne({
      where: { slug: createProductDto.slug },
    });

    if (existing) {
      throw new ConflictException(`Product with slug "${createProductDto.slug}" already exists`);
    }

    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(
    includeInactive = false,
    filters?: {
      category?: string;
      badge?: string;
      maxPrice?: number;
      minPrice?: number;
      inStock?: boolean;
      preOrder?: boolean;
    },
  ): Promise<ProductCatalog[]> {
    const query = this.productRepository.createQueryBuilder('product');

    if (!includeInactive) {
      query.where('product.active = :active', { active: true });
    }

    // Aplicar filtros opcionales
    if (filters?.category) {
      query.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters?.badge) {
      query.andWhere('product.badge = :badge', { badge: filters.badge });
    }

    if (filters?.maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters?.minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.inStock !== undefined) {
      query.andWhere('product.inStock = :inStock', { inStock: filters.inStock });
    }

    if (filters?.preOrder !== undefined) {
      query.andWhere('product.preOrder = :preOrder', { preOrder: filters.preOrder });
    }

    query.orderBy('product.createdAt', 'DESC');

    return await query.getMany();
  }

  /**
   * Health check para el catálogo de productos
   */
  async getHealth(): Promise<{
    status: string;
    productsCount: number;
    activeProducts: number;
    inStockProducts: number;
    preOrderProducts: number;
    timestamp: Date;
  }> {
    const [total, active, inStock, preOrder] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.count({ where: { active: true } }),
      this.productRepository.count({ where: { inStock: true, active: true } }),
      this.productRepository.count({ where: { preOrder: true, active: true } }),
    ]);

    return {
      status: 'ok',
      productsCount: total,
      activeProducts: active,
      inStockProducts: inStock,
      preOrderProducts: preOrder,
      timestamp: new Date(),
    };
  }

  async findOne(id: string): Promise<ProductCatalog> {
    const product = await this.productRepository.findOne({ where: { id } });
    
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    
    return product;
  }

  async findBySlug(slug: string): Promise<ProductCatalog> {
    const product = await this.productRepository.findOne({ where: { slug } });
    
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    
    // Incrementar contador de vistas
    await this.productRepository.increment({ id: product.id }, 'viewCount', 1);
    
    return product;
  }

  async findInStock(): Promise<ProductCatalog[]> {
    return await this.productRepository.find({
      where: { inStock: true, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findPreOrders(): Promise<ProductCatalog[]> {
    return await this.productRepository.find({
      where: { preOrder: true, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductCatalog> {
    const product = await this.findOne(id);
    
    // Si se está cambiando el slug, verificar que no exista
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existing = await this.productRepository.findOne({
        where: { slug: updateProductDto.slug },
      });
      
      if (existing) {
        throw new ConflictException(`Product with slug "${updateProductDto.slug}" already exists`);
      }
    }
    
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto): Promise<ProductCatalog> {
    const product = await this.findOne(id);
    
    product.stockCount = updateStockDto.stockCount;
    
    // Auto-actualizar estado inStock si se especifica
    if (updateStockDto.updateInStock !== false) {
      product.inStock = updateStockDto.stockCount > 0;
    }
    
    return await this.productRepository.save(product);
  }

  async incrementOrderCount(id: string): Promise<void> {
    await this.productRepository.increment({ id }, 'orderCount', 1);
  }

  async decrementStock(id: string, quantity = 1): Promise<ProductCatalog> {
    const product = await this.findOne(id);
    
    if (product.stockCount < quantity) {
      throw new ConflictException(`Insufficient stock for product "${product.name}"`);
    }
    
    product.stockCount -= quantity;
    product.inStock = product.stockCount > 0;
    
    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async softDelete(id: string): Promise<ProductCatalog> {
    const product = await this.findOne(id);
    product.active = false;
    return await this.productRepository.save(product);
  }
}
