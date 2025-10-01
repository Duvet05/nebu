import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty()
  expiresIn: number;
}

export class RefreshTokenDto {
  @ApiProperty()
  refreshToken: string;
}
