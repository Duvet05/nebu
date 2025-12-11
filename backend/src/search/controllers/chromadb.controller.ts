import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ChromaDBService } from '../services/chromadb.service';
import { ChromaDBSeederService } from '../services/chromadb-seeder.service';

// ========================================
// DTOs
// ========================================

class SavePersonalityDto {
  toyId: string;
  prompt: string;
  toyName?: string;
  category?: string;
  topics?: string;
  targetAge?: string;
  style?: string;
}

class SearchPersonalitiesDto {
  prompt: string;
  limit?: number;
  excludeToyId?: string;
}

class SaveConversationMemoryDto {
  sessionId: string;
  toyId: string;
  summary: string;
  topics?: string;
  emotion?: string;
  duration?: number;
  messageCount?: number;
}

class SearchMemoriesDto {
  toyId: string;
  query: string;
  limit?: number;
  daysBack?: number;
}

class SearchKnowledgeDto {
  query: string;
  ageRange?: string;
  category?: string;
  language?: string;
  limit?: number;
}

class BuildContextDto {
  toyId: string;
  currentMessage: string;
  includePersonality?: boolean;
  includeMemories?: boolean;
  includeKnowledge?: boolean;
  memoriesLimit?: number;
  knowledgeLimit?: number;
  ageRange?: string;
}

// ========================================
// CONTROLLER
// ========================================

@ApiTags('ChromaDB - Semantic Search')
@Controller('chromadb')
export class ChromaDBController {
  constructor(
    private readonly chromaDBService: ChromaDBService,
    private readonly seederService: ChromaDBSeederService,
  ) {}

  // ========================================
  // TOY PERSONALITIES
  // ========================================

  @Post('personalities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guardar personalidad de un juguete' })
  @ApiResponse({ status: 201, description: 'Personalidad guardada exitosamente' })
  async savePersonality(
    @CurrentUser() user: any,
    @Body() dto: SavePersonalityDto,
  ) {
    return this.chromaDBService.saveToyPersonality(dto.toyId, dto.prompt, {
      toyName: dto.toyName,
      userId: user.id,
      category: dto.category,
      topics: dto.topics,
      targetAge: dto.targetAge,
      style: dto.style,
    });
  }

  @Get('personalities/:toyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener personalidad de un juguete' })
  async getPersonality(@Param('toyId') toyId: string) {
    const result = await this.chromaDBService.getToyPersonality(toyId);
    if (!result) {
      return { found: false, message: 'No personality found for this toy' };
    }
    return { found: true, ...result };
  }

  @Post('personalities/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar personalidades similares' })
  @ApiResponse({ status: 200, description: 'Lista de personalidades similares' })
  async searchSimilarPersonalities(@Body() dto: SearchPersonalitiesDto) {
    return this.chromaDBService.findSimilarPersonalities(
      dto.prompt,
      dto.limit || 5,
      dto.excludeToyId,
    );
  }

  @Delete('personalities/:toyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar personalidad de un juguete' })
  async deletePersonality(@Param('toyId') toyId: string) {
    await this.chromaDBService.deleteToyPersonality(toyId);
  }

  // ========================================
  // CONVERSATION MEMORIES
  // ========================================

  @Post('memories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guardar resumen de conversación' })
  @ApiResponse({ status: 201, description: 'Memoria guardada exitosamente' })
  async saveMemory(@CurrentUser() user: any, @Body() dto: SaveConversationMemoryDto) {
    return this.chromaDBService.saveConversationMemory(dto.sessionId, dto.summary, {
      toyId: dto.toyId,
      userId: user.id,
      topics: dto.topics,
      emotion: dto.emotion,
      duration: dto.duration,
      messageCount: dto.messageCount,
    });
  }

  @Post('memories/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar conversaciones relevantes' })
  @ApiResponse({ status: 200, description: 'Lista de conversaciones relevantes' })
  async searchMemories(@Body() dto: SearchMemoriesDto) {
    return this.chromaDBService.searchRelevantMemories(
      dto.toyId,
      dto.query,
      dto.limit || 3,
      dto.daysBack || 30,
    );
  }

  @Get('memories/:toyId/recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener conversaciones recientes de un juguete' })
  async getRecentMemories(
    @Param('toyId') toyId: string,
    @Query('limit') limit?: number,
  ) {
    return this.chromaDBService.getRecentConversations(toyId, limit || 10);
  }

  // ========================================
  // KNOWLEDGE BASE
  // ========================================

  @Post('knowledge/search')
  @ApiOperation({ summary: 'Buscar en base de conocimiento (público)' })
  @ApiResponse({ status: 200, description: 'Lista de conocimientos relevantes' })
  async searchKnowledge(@Body() dto: SearchKnowledgeDto) {
    return this.chromaDBService.searchKnowledge(
      dto.query,
      {
        ageRange: dto.ageRange,
        category: dto.category,
        language: dto.language || 'es',
      },
      dto.limit || 5,
    );
  }

  // ========================================
  // AGENT CONTEXT (Para LiveKit Agent)
  // ========================================

  @Post('context/build')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Construir contexto completo para el agente de IA' })
  @ApiResponse({ status: 200, description: 'Contexto generado exitosamente' })
  async buildAgentContext(@Body() dto: BuildContextDto) {
    const context = await this.chromaDBService.buildAgentContext(
      dto.toyId,
      dto.currentMessage,
      {
        includePersonality: dto.includePersonality ?? true,
        includeMemories: dto.includeMemories ?? true,
        includeKnowledge: dto.includeKnowledge ?? true,
        memoriesLimit: dto.memoriesLimit || 3,
        knowledgeLimit: dto.knowledgeLimit || 2,
        ageRange: dto.ageRange || '4-12',
      },
    );

    return {
      context,
      metadata: {
        toyId: dto.toyId,
        query: dto.currentMessage,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // ========================================
  // ADMIN & STATS
  // ========================================

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de ChromaDB' })
  @ApiResponse({ status: 200, description: 'Estadísticas de colecciones' })
  async getStats() {
    return this.chromaDBService.getStats();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Inicializar base de conocimiento (solo desarrollo)' })
  @ApiResponse({ status: 201, description: 'Base de conocimiento inicializada' })
  async seed() {
    return this.seederService.seedAll();
  }

  @Delete('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Limpiar todas las colecciones (solo desarrollo)' })
  async clearAll() {
    await this.seederService.clearAll();
  }
}
