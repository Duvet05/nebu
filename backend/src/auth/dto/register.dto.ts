import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@nebu.com',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede tener más de 50 caracteres' })
  lastName: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiPassword123!',
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede tener más de 128 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número',
  })
  password: string;

  @ApiProperty({
    description: 'Nombre de usuario (opcional)',
    example: 'juan_perez',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser un texto' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'El nombre de usuario no puede tener más de 30 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos',
  })
  username?: string;

  @ApiProperty({
    description: 'Idioma preferido',
    example: 'es',
    required: false,
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;
}
