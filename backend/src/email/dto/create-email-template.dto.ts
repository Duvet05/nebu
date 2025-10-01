import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailTemplateType } from '../entities/email-template.entity';

export class CreateEmailTemplateDto {
  @ApiProperty({
    description: 'Nombre de la plantilla',
    example: 'Bienvenida Usuario'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Asunto del email',
    example: 'Bienvenido a Nebu'
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Contenido HTML de la plantilla',
    example: '<h1>Bienvenido {{user.name}}</h1>'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Contenido HTML adicional',
    required: false
  })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiProperty({
    description: 'Tipo de plantilla',
    enum: EmailTemplateType
  })
  @IsEnum(EmailTemplateType)
  type: EmailTemplateType;

  @ApiProperty({
    description: 'Descripción de la plantilla',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Variables disponibles en la plantilla (JSON string)',
    example: '{"user": {"name": "string", "email": "string"}}',
    required: false
  })
  @IsOptional()
  @IsString()
  variables?: string;

  @ApiProperty({
    description: 'CSS adicional para la plantilla',
    required: false
  })
  @IsOptional()
  @IsString()
  css?: string;

  @ApiProperty({
    description: 'Texto de vista previa',
    required: false
  })
  @IsOptional()
  @IsString()
  previewText?: string;
}
