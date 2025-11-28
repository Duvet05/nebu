import { IsString, IsOptional, IsEnum } from 'class-validator';
import { RoleType, RoleStatus } from '../entities/role.entity';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RoleType)
  type: RoleType = RoleType.CUSTOM;

  @IsEnum(RoleStatus)
  status: RoleStatus = RoleStatus.ACTIVE;
}
