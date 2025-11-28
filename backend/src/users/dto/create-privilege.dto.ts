import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PrivilegeType, PrivilegeScope } from '../entities/privilege.entity';

export class CreatePrivilegeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PrivilegeType)
  type: PrivilegeType = PrivilegeType.READ;

  @IsEnum(PrivilegeScope)
  scope: PrivilegeScope = PrivilegeScope.GLOBAL;
}
