import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email o nombre de usuario',
    example: 'admin',
    examples: {
      email: {
        summary: 'Login con email',
        value: 'admin@nebu.com',
      },
      username: {
        summary: 'Login con username',
        value: 'admin',
      },
    },
  })
  @IsString({ message: 'Debe ser un texto válido' })
  @IsNotEmpty({ message: 'El email o username es requerido' })
  email: string; // Mantener nombre 'email' para compatibilidad, pero acepta username también

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Admin123',
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
