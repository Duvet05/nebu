import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductCatalogService } from '../services/product-catalog.service';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from '../dto/product-catalog.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Product Catalog')
@Controller('products')
export class ProductCatalogController {
  constructor(private readonly productCatalogService: ProductCatalogService) {}

  // Public endpoints
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check for product catalog' })
  @ApiResponse({ status: 200, description: 'Returns catalog health status' })
  async health() {
    return await this.productCatalogService.getHealth();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active products' })
  @ApiResponse({ status: 200, description: 'Returns all active products' })
  async findAll(
    @Query('includeInactive') includeInactive?: string,
    @Query('category') category?: string,
    @Query('badge') badge?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minPrice') minPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('preOrder') preOrder?: string,
  ) {
    const include = includeInactive === 'true';
    const filters = {
      category,
      badge,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
      preOrder: preOrder === 'true' ? true : preOrder === 'false' ? false : undefined,
    };

    return await this.productCatalogService.findAll(include, filters);
  }

  @Public()
  @Get('in-stock')
  @ApiOperation({ summary: 'Get products in stock' })
  @ApiResponse({ status: 200, description: 'Returns products currently in stock' })
  async findInStock() {
    return await this.productCatalogService.findInStock();
  }

  @Public()
  @Get('pre-orders')
  @ApiOperation({ summary: 'Get products available for pre-order' })
  @ApiResponse({ status: 200, description: 'Returns products available for pre-order' })
  async findPreOrders() {
    return await this.productCatalogService.findPreOrders();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Returns product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return await this.productCatalogService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiResponse({ status: 200, description: 'Returns product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.productCatalogService.findBySlug(slug);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 409, description: 'Product with slug already exists' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productCatalogService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productCatalogService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product stock' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return await this.productCatalogService.updateStock(id, updateStockDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product permanently' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    await this.productCatalogService.remove(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a product (deactivate)' })
  @ApiResponse({ status: 200, description: 'Product deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async softDelete(@Param('id') id: string) {
    return await this.productCatalogService.softDelete(id);
  }
}
