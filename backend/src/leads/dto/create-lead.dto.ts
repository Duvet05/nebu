import { IsEmail, IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum LeadSource {
  WEBSITE_FORM = 'WEBSITE',
  NEWSLETTER = 'NEWSLETTER',
  PRE_ORDER = 'PRE_ORDER',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  WHATSAPP = 'WHATSAPP',
  REFERRAL = 'REFERRAL',
  OTHER = 'OTHER',
}

export enum LeadTemperature {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT',
}

export class CreateLeadDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEnum(LeadSource)
  leadSource: LeadSource;

  @IsEnum(LeadTemperature)
  @IsOptional()
  temperature?: LeadTemperature;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  score?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateNewsletterLeadDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

export class CreatePreOrderLeadDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  productSlug?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
