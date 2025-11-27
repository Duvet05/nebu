import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'sawbite-pochita', description: 'URL-friendly identifier' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 'Sawbite', description: 'Product name' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Motor Pup', description: 'Alternative name/concept' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  concept?: string;

  @ApiPropertyOptional({ example: 'Pochita (Chainsaw Man)', description: 'Original character inspiration' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  originalCharacter?: string;

  @ApiProperty({ example: 'Perrito naranja redondo con engranaje en la cabeza', description: 'Full product description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Adorable criatura mecánica para niños', description: 'Short description' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 380, description: 'Price in soles' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 450, description: 'Original price before discount' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ example: 190, description: 'Deposit amount for pre-orders' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional({ example: true, description: 'Is available for pre-order' })
  @IsBoolean()
  @IsOptional()
  preOrder?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is currently in stock' })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({ example: 10, description: 'Available stock quantity' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stockCount?: number;

  @ApiPropertyOptional({ example: ['/assets/products/sawbite-1.jpg'], description: 'Product images' })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ 
    example: [{ id: 'orange', name: 'Naranja', hex: '#FF6B35' }], 
    description: 'Available colors' 
  })
  @IsArray()
  @IsOptional()
  colors?: any[];

  @ApiPropertyOptional({ example: '4-9 años', description: 'Recommended age range' })
  @IsString()
  @IsOptional()
  ageRange?: string;

  @ApiPropertyOptional({ 
    example: ['IA conversacional', 'WiFi integrado'], 
    description: 'Product features' 
  })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ example: 'plushie', description: 'Product category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'new', description: 'Product badge' })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiPropertyOptional({ example: true, description: 'Is product active' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'sawbite-pochita', description: 'URL-friendly identifier' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ example: 'Sawbite', description: 'Product name' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Motor Pup', description: 'Alternative name/concept' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  concept?: string;

  @ApiPropertyOptional({ example: 'Pochita (Chainsaw Man)', description: 'Original character inspiration' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  originalCharacter?: string;

  @ApiPropertyOptional({ example: 'Perrito naranja redondo con engranaje en la cabeza', description: 'Full product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Adorable criatura mecánica para niños', description: 'Short description' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 380, description: 'Price in soles' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 450, description: 'Original price before discount' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ example: 190, description: 'Deposit amount for pre-orders' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional({ example: true, description: 'Is available for pre-order' })
  @IsBoolean()
  @IsOptional()
  preOrder?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is currently in stock' })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({ example: 10, description: 'Available stock quantity' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stockCount?: number;

  @ApiPropertyOptional({ example: ['/assets/products/sawbite-1.jpg'], description: 'Product images' })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ 
    example: [{ id: 'orange', name: 'Naranja', hex: '#FF6B35' }], 
    description: 'Available colors' 
  })
  @IsArray()
  @IsOptional()
  colors?: any[];

  @ApiPropertyOptional({ example: '4-9 años', description: 'Recommended age range' })
  @IsString()
  @IsOptional()
  ageRange?: string;

  @ApiPropertyOptional({ 
    example: ['IA conversacional', 'WiFi integrado'], 
    description: 'Product features' 
  })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ example: 'plushie', description: 'Product category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'new', description: 'Product badge' })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiPropertyOptional({ example: true, description: 'Is product active' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateStockDto {
  @ApiProperty({ example: 10, description: 'New stock quantity' })
  @IsNumber()
  @Min(0)
  stockCount: number;

  @ApiPropertyOptional({ example: true, description: 'Update inStock status automatically' })
  @IsBoolean()
  @IsOptional()
  updateInStock?: boolean;
}
