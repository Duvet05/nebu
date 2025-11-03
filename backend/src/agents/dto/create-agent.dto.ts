import { IsString, IsOptional, IsBoolean, IsObject, Length } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @Length(2, 128)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  persona?: Record<string, any>;

  @IsOptional()
  @IsObject()
  voiceSettings?: Record<string, any>;

  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
