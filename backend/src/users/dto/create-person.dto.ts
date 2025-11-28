import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Gender, PersonStatus } from '../entities/person.entity';

export class CreatePersonDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  preferredName?: string;

  @IsEnum(Gender)
  gender: Gender = Gender.UNKNOWN;

  @IsOptional()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  birthPlace?: string;

  @IsEnum(PersonStatus)
  status: PersonStatus = PersonStatus.ACTIVE;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  preferences?: Record<string, any>;

  @IsOptional()
  metadata?: Record<string, any>;
}
