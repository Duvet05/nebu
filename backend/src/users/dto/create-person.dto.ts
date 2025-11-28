import { IsString, IsOptional, IsEnum, IsEmail, IsUrl, IsDateString } from 'class-validator';
import { Gender, PersonStatus } from '../entities/person.entity';

export class CreatePersonDto {
  @IsString()
  givenName: string; // firstName -> givenName para compatibilidad con PersonName

  @IsString()
  familyName: string; // lastName -> familyName para compatibilidad con PersonName

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  prefix?: string; // Dr., Mr., Mrs., etc.

  @IsEnum(Gender)
  gender: Gender = Gender.UNKNOWN;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  birthPlace?: string;

  @IsEnum(PersonStatus)
  status: PersonStatus = PersonStatus.ACTIVE;

  @IsOptional()
  @IsEmail()
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
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  github?: string;

  @IsOptional()
  @IsUrl()
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
