import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsDateString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  toyId?: string;

  @ApiProperty({ enum: ActivityType, example: ActivityType.VOICE_COMMAND })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ example: 'User said: "Tell me a story"' })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: { command: 'tell_story', duration: 120, language: 'es' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ example: '2024-12-08T12:00:00Z' })
  @IsDateString()
  timestamp: string;
}

export class ActivityFiltersDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  toyId?: string;

  @ApiPropertyOptional({ enum: ActivityType, example: ActivityType.VOICE_COMMAND })
  @IsEnum(ActivityType)
  @IsOptional()
  type?: ActivityType;

  @ApiPropertyOptional({ example: '2024-12-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-08T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 50, default: 50, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;
}

export class ActivityListResponseDto {
  @ApiProperty({ type: [Object] })
  activities: any[];

  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
