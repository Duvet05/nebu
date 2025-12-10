import { ApiProperty } from '@nestjs/swagger';

export class ToyPromptResponseDto {
  @ApiProperty({
    description: 'ID del juguete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del juguete',
    example: 'Dino el Dinosaurio',
  })
  name: string;

  @ApiProperty({
    description: 'Prompt del agente de IA para el juguete',
    example: 'Eres Dino, un dinosaurio amigable y juguetón. Te encanta contar historias de aventuras prehistóricas...',
    nullable: true,
  })
  prompt: string | null;

  @ApiProperty({
    description: 'Modelo del juguete',
    example: 'Nebu Dino v1',
    nullable: true,
  })
  model: string | null;

  @ApiProperty({
    description: 'Fabricante del juguete',
    example: 'Nebu Technologies',
    nullable: true,
  })
  manufacturer: string | null;
}
