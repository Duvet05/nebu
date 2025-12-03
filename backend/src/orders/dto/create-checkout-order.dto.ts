import { IsEmail, IsString, IsNumber, IsArray, IsBoolean, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  colorId: string;

  @IsString()
  colorName: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateCheckoutOrderDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  shipping: number;

  @IsNumber()
  @Min(0)
  total: number;

  @IsNumber()
  @Min(0)
  reserveAmount: number;

  @IsBoolean()
  agreeTerms: boolean;

  @IsBoolean()
  subscribeNewsletter: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}
