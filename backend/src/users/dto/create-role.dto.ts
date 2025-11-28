import { IsString, IsOptional, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { RoleType, RoleStatus } from '../entities/role.entity';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @IsEnum(RoleType)
  type: RoleType = RoleType.CUSTOM;

  @IsEnum(RoleStatus)
  status: RoleStatus = RoleStatus.ACTIVE;
}
