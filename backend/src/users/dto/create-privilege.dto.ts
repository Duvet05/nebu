import { IsString, IsOptional, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { PrivilegeType, PrivilegeScope } from '../entities/privilege.entity';

export class CreatePrivilegeDto {
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

  @IsEnum(PrivilegeType)
  type: PrivilegeType = PrivilegeType.READ;

  @IsEnum(PrivilegeScope)
  scope: PrivilegeScope = PrivilegeScope.GLOBAL;
}
