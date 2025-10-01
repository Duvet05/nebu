import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @ApiOperation({ summary: 'Buscar contenido en la plataforma' })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['course', 'path', 'article', 'project'] },
              title: { type: 'string' },
              description: { type: 'string' },
              url: { type: 'string' },
              icon: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        query: { type: 'string' },
      },
    },
  })
  async search(@Body() body: { query: string }) {
    return this.searchService.search(body.query);
  }
}
