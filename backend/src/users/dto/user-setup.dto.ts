import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Language, Theme } from '../entities/user-setup.entity';

export class ProfileDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class PreferencesDto {
  @ApiProperty({ enum: Language, example: Language.ES })
  @IsEnum(Language)
  language: Language;

  @ApiProperty({ enum: Theme, example: Theme.SYSTEM })
  @IsEnum(Theme)
  theme: Theme;

  @ApiProperty({ example: true })
  @IsBoolean()
  hapticFeedback: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  autoSave: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  analytics: boolean;
}

export class NotificationsDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  push: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  reminders: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  voice: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  updates: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  marketing: boolean;

  @ApiPropertyOptional({ example: '22:00' })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'quietHoursStart must be in HH:mm format',
  })
  quietHoursStart?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'quietHoursEnd must be in HH:mm format',
  })
  quietHoursEnd?: string;
}

export class VoiceDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ example: 'es-ES-Standard-A' })
  @IsString()
  @IsOptional()
  voiceModel?: string;

  @ApiPropertyOptional({ example: 1.0, minimum: 0.5, maximum: 2.0 })
  @IsNumber()
  @IsOptional()
  @Min(0.5)
  @Max(2.0)
  speechRate?: number;
}

export class CreateUserSetupDto {
  @ApiProperty({ type: ProfileDto })
  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;

  @ApiProperty({ type: PreferencesDto })
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences: PreferencesDto;

  @ApiProperty({ type: NotificationsDto })
  @ValidateNested()
  @Type(() => NotificationsDto)
  notifications: NotificationsDto;

  @ApiProperty({ type: VoiceDto })
  @ValidateNested()
  @Type(() => VoiceDto)
  voice: VoiceDto;
}

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional({ enum: Language })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiPropertyOptional({ enum: Theme })
  @IsEnum(Theme)
  @IsOptional()
  theme?: Theme;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hapticFeedback?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  autoSave?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  analytics?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  reminders?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  voiceNotifications?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  updates?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  marketing?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'quietHoursStart must be in HH:mm format',
  })
  quietHoursStart?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'quietHoursEnd must be in HH:mm format',
  })
  quietHoursEnd?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  voiceEnabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  voiceModel?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0.5)
  @Max(2.0)
  speechRate?: number;
}

export class UserSetupResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  setupCompleted: boolean;
}
