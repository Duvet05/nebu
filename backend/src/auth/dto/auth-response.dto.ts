import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { UserRole, UserStatus } from '../../users/entities/user.entity';

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  preferredLanguage: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  fullName: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;

  @ApiProperty({ example: 86400, description: 'Token expiration time in seconds' })
  expiresIn: number;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'El refresh token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  refreshToken: string;
}
