import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({
    description: 'Token from the social provider (Google, Facebook, Apple)',
    example: 'ya29.a0AfH6SMC...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Social provider type',
    enum: ['google', 'facebook', 'apple'],
    example: 'google',
  })
  @IsString()
  @IsNotEmpty()
  provider: 'google' | 'facebook' | 'apple';

  @ApiProperty({
    description: 'User email from social provider',
    example: 'user@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User name from social provider',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User avatar URL from social provider',
    example: 'https://lh3.googleusercontent.com/a/ACg8ocK...',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
