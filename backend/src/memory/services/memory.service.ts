import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MemoryContext, MemoryType, MemoryCategory } from '../entities/memory-context.entity';
import { VoiceSession } from '../../voice/entities/voice-session.entity';
import { AiConversation } from '../../voice/entities/ai-conversation.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { ChromaService } from './chroma.service';
import { RedisService } from '../../config/redis.service';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';
import { AgentsService } from '../../agents/agents.service';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIContext {
  workingMemory: ConversationMessage[];
  episodicMemories: MemoryContext[];
  semanticKnowledge: any[];
  userProfile: UserProfile;
  agentPersona?: any;
}

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);
  private openai: OpenAI;

  constructor(
    @InjectRepository(MemoryContext)
    private memoryRepo: Repository<MemoryContext>,
    @InjectRepository(VoiceSession)
    private sessionRepo: Repository<VoiceSession>,
    @InjectRepository(AiConversation)
    private conversationRepo: Repository<AiConversation>,
    @InjectRepository(UserProfile)
    private profileRepo: Repository<UserProfile>,
    private chromaService: ChromaService,
    private redisService: RedisService,
    private configService: ConfigService,
    @Inject(forwardRef(() => AgentsService))
    private agentsService: AgentsService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  // ========== WORKING MEMORY (Redis) ==========

  /**
   * Obtener memoria de trabajo (últimos mensajes de la sesión)
   */
  async getWorkingMemory(sessionId: string): Promise<ConversationMessage[]> {
    const key = `working_memory:${sessionId}`;
    const cached = await this.redisService.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    return [];
  }

  /**
   * Actualizar memoria de trabajo
   */
  async updateWorkingMemory(
    sessionId: string,
    message: ConversationMessage,
  ): Promise<void> {
    const key = `working_memory:${sessionId}`;
    const messages = await this.getWorkingMemory(sessionId);

    messages.push(message);

    // Mantener solo los últimos 10 mensajes
    const recentMessages = messages.slice(-10);

    await this.redisService.set(
      key,
      JSON.stringify(recentMessages),
      900, // 15 minutos TTL
    );

    this.logger.debug(`Working memory updated for session ${sessionId}`);
  }

  /**
   * Limpiar memoria de trabajo al finalizar sesión
   */
  async clearWorkingMemory(sessionId: string): Promise<void> {
    const key = `working_memory:${sessionId}`;
    await this.redisService.del(key);
    this.logger.log(`Working memory cleared for session ${sessionId}`);
  }

  // ========== EPISODIC MEMORY (ChromaDB + PostgreSQL) ==========

  /**
   * Almacenar memoria episódica
   */
  async storeEpisodicMemory(
    userId: string,
    sessionId: string,
    content: string,
    metadata: any,
    agentId?: string,
  ): Promise<MemoryContext> {
    if (!userId) {
      throw new Error('userId is required for memory storage');
    }

    try {
      // Generar embedding y guardar en ChromaDB
      const collectionName = `episodic_memories_${userId}`;
      const chromaId = await this.chromaService.addDocument(
        collectionName,
        content,
        {
          ...metadata,
          session_id: sessionId,
          timestamp: new Date().toISOString(),
        },
      );

      // Calcular importancia
      const importance = this.calculateImportance(content, metadata);

      // Calcular expiración (30 días por defecto)
      const retentionDays = this.configService.get<number>('MEMORY_RETENTION_DAYS', 30);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + retentionDays);

      // Guardar referencia en PostgreSQL
      const memory = await this.memoryRepo.save({
        userId,
        sessionId,
        agentId, // <-- NUEVO: Memoria específica del agente
        memoryType: MemoryType.EPISODIC,
        category: metadata.category || MemoryCategory.CONVERSATION,
        content,
        metadata,
        chromaCollectionId: chromaId,
        chromaCollectionName: collectionName,
        importance,
        createdAt: new Date(),
        expiresAt,
      });

      this.logger.log(`Episodic memory stored: ${memory.id} (importance: ${importance})`);
      return memory;
    } catch (error) {
      this.logger.error('Failed to store episodic memory:', error);
      throw error;
    }
  }

  /**
   * Recuperar memorias relevantes mediante búsqueda semántica
   */
  async retrieveRelevantMemories(
    userId: string,
    query: string,
    limit: number = 5,
    agentId?: string,
  ): Promise<MemoryContext[]> {
    try {
      const collectionName = `episodic_memories_${userId}`;

      // Búsqueda semántica en ChromaDB
      const results = await this.chromaService.query(collectionName, query, limit);

      if (results.length === 0) {
        return [];
      }

      // Obtener contexto completo de PostgreSQL
      const memoryIds = results.map(r => r.metadata.id || r.id);

      const queryBuilder = this.memoryRepo
        .createQueryBuilder('memory')
        .where('memory.chromaCollectionId IN (:...ids)', { ids: memoryIds });

      // Filtrar por agente: incluir memorias del agente específico o compartidas (agentId IS NULL)
      if (agentId) {
        queryBuilder.andWhere(
          '(memory.agentId = :agentId OR memory.agentId IS NULL)',
          { agentId }
        );
      }

      const memories = await queryBuilder
        .orderBy('memory.importance', 'DESC')
        .addOrderBy('memory.createdAt', 'DESC')
        .getMany();

      // Incrementar contador de acceso
      for (const memory of memories) {
        memory.incrementAccess();
      }
      await this.memoryRepo.save(memories);

      this.logger.log(`Retrieved ${memories.length} relevant memories for user ${userId}`);
      return memories;
    } catch (error) {
      this.logger.error('Failed to retrieve relevant memories:', error);
      return []; // Retornar array vacío en caso de error (no bloquear AI)
    }
  }

  // ========== SEMANTIC MEMORY (ChromaDB) ==========

  /**
   * Actualizar conocimiento semántico sobre el usuario
   */
  async updateSemanticKnowledge(
    userId: string,
    knowledge: string,
    category: MemoryCategory,
    confidence: number = 0.9,
  ): Promise<void> {
    try {
      const collectionName = `semantic_knowledge_${userId}`;

      await this.chromaService.addDocument(
        collectionName,
        knowledge,
        {
          category,
          confidence,
          last_updated: new Date().toISOString(),
        },
      );

      this.logger.log(`Semantic knowledge updated for user ${userId}: ${knowledge}`);
    } catch (error) {
      this.logger.error('Failed to update semantic knowledge:', error);
      throw error;
    }
  }

  /**
   * Obtener conocimiento semántico relevante
   */
  async getSemanticKnowledge(
    userId: string,
    query: string,
    limit: number = 5,
  ): Promise<any[]> {
    try {
      const collectionName = `semantic_knowledge_${userId}`;
      const results = await this.chromaService.query(collectionName, query, limit);
      return results;
    } catch (error) {
      this.logger.warn('Failed to get semantic knowledge:', error);
      return [];
    }
  }

  // ========== CONTEXT BUILDING FOR AI ==========

  /**
   * Construir contexto completo para el AI
   */
  async buildContextForAI(
    userId: string,
    sessionId: string,
    currentMessage: string,
    agentId?: string,
  ): Promise<string> {
    try {
      // 1. Obtener perfil del agente (si existe)
      let agentPersona = null;
      if (agentId) {
        try {
          const agent = await this.agentsService.findOne(agentId);
          agentPersona = agent.persona;
        } catch (error) {
          this.logger.warn(`Agent ${agentId} not found, continuing without agent persona`);
        }
      }

      // 2. Obtener memoria de trabajo (conversación actual)
      const workingMemory = await this.getWorkingMemory(sessionId);

      // 3. Buscar memorias episódicas relevantes (del agente o compartidas)
      const episodicMemories = await this.retrieveRelevantMemories(
        userId,
        currentMessage,
        3,
        agentId, // <-- NUEVO: Filtrar por agente
      );

      // 4. Obtener conocimiento semántico
      const semanticKnowledge = await this.getSemanticKnowledge(
        userId,
        currentMessage,
        5,
      );

      // 5. Obtener perfil del usuario
      const userProfile = await this.profileRepo.findOne({
        where: { userId },
      });

      // 6. Ensamblar contexto
      return this.assembleContext({
        workingMemory,
        episodicMemories,
        semanticKnowledge,
        userProfile,
        agentPersona, // <-- NUEVO: Personalidad del agente
      });
    } catch (error) {
      this.logger.error('Failed to build context for AI:', error);
      return ''; // Retornar string vacío en caso de error
    }
  }

  /**
   * Ensamblar contexto en formato legible para GPT
   */
  private assembleContext(data: AIContext): string {
    const parts: string[] = [];

    // 1. Personalidad del Agente (si existe)
    if (data.agentPersona) {
      parts.push('=== ROL DEL AGENTE ===');

      if (data.agentPersona.instructions) {
        parts.push(data.agentPersona.instructions);
      }

      if (data.agentPersona.tone) {
        parts.push(`Tono: ${data.agentPersona.tone}`);
      }

      if (data.agentPersona.expertise) {
        parts.push(`Especialidad: ${Array.isArray(data.agentPersona.expertise) ? data.agentPersona.expertise.join(', ') : data.agentPersona.expertise}`);
      }

      if (data.agentPersona.constraints) {
        parts.push(`Restricciones: ${Array.isArray(data.agentPersona.constraints) ? data.agentPersona.constraints.join(', ') : data.agentPersona.constraints}`);
      }

      parts.push('');
    }

    // 2. Perfil del usuario
    if (data.userProfile) {
      const profile = data.userProfile;
      parts.push('=== PERFIL DEL NIÑO ===');
      parts.push(`Nombre: ${profile.user?.firstName || 'Desconocido'}`);
      parts.push(`Edad: ${profile.age || 5} años`);

      if (profile.preferences?.interests) {
        parts.push(`Intereses: ${profile.preferences.interests.join(', ')}`);
      }

      if (profile.developmentMilestones?.language?.nativeLanguage) {
        parts.push(`Idioma: ${profile.developmentMilestones.language.nativeLanguage}`);
      }

      parts.push('');
    }

    // 3. Conocimiento semántico
    if (data.semanticKnowledge.length > 0) {
      parts.push('=== LO QUE SÉ SOBRE EL NIÑO ===');
      data.semanticKnowledge.forEach((item, index) => {
        parts.push(`${index + 1}. ${item.document}`);
      });
      parts.push('');
    }

    // 4. Memorias episódicas relevantes
    if (data.episodicMemories.length > 0) {
      parts.push('=== CONVERSACIONES PASADAS RELEVANTES ===');
      data.episodicMemories.forEach((memory, index) => {
        const daysAgo = Math.floor(
          (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        parts.push(`${index + 1}. (Hace ${daysAgo} días) ${memory.content}`);
      });
      parts.push('');
    }

    // 5. Conversación actual
    if (data.workingMemory.length > 0) {
      parts.push('=== CONVERSACIÓN ACTUAL ===');
      data.workingMemory.forEach(msg => {
        const speaker = msg.role === 'user' ? 'Niño' : 'Asistente';
        parts.push(`${speaker}: ${msg.content}`);
      });
      parts.push('');
    }

    return parts.join('\n');
  }

  // ========== SESSION SUMMARY ==========

  /**
   * Crear resumen de sesión al finalizar
   */
  async createSessionSummary(sessionId: string): Promise<void> {
    try {
      const session = await this.sessionRepo.findOne({
        where: { id: sessionId },
        relations: ['conversations'],
      });

      if (!session) {
        this.logger.warn(`Session ${sessionId} not found for summary`);
        return;
      }

      // Obtener todas las conversaciones
      const conversations = await this.conversationRepo.find({
        where: { sessionId },
        order: { createdAt: 'ASC' },
      });

      if (conversations.length === 0) {
        this.logger.warn(`No conversations found for session ${sessionId}`);
        return;
      }

      // Construir texto completo de la conversación
      const conversationText = conversations
        .map(c => `${c.messageType}: ${c.content}`)
        .join('\n');

      // Generar resumen con GPT-4
      const summary = await this.generateSummaryWithAI(conversationText);

      // Extraer información importante
      const insights = await this.extractInsights(conversationText, summary);

      // Guardar como memoria episódica
      await this.storeEpisodicMemory(
        session.userId,
        sessionId,
        summary,
        {
          category: MemoryCategory.CONVERSATION,
          insights,
          messageCount: conversations.length,
          durationSeconds: session.durationSeconds,
        },
      );

      // Actualizar conocimiento semántico si hay insights
      if (insights.newKnowledge.length > 0) {
        for (const knowledge of insights.newKnowledge) {
          await this.updateSemanticKnowledge(
            session.userId,
            knowledge.text,
            knowledge.category,
            knowledge.confidence,
          );
        }
      }

      this.logger.log(`Session summary created for ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to create session summary for ${sessionId}:`, error);
    }
  }

  /**
   * Generar resumen usando GPT-4
   */
  private async generateSummaryWithAI(conversationText: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente que resume conversaciones entre un niño y un juguete inteligente. ' +
            'Crea un resumen conciso (2-3 oraciones) destacando los temas principales, emociones y logros.',
        },
        {
          role: 'user',
          content: `Resume esta conversación:\n\n${conversationText}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0].message.content || 'No se pudo generar resumen.';
  }

  /**
   * Extraer insights de la conversación
   */
  private async extractInsights(
    conversationText: string,
    summary: string,
  ): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Analiza la conversación y extrae información estructurada en formato JSON:\n' +
              '{\n' +
              '  "topics": ["tema1", "tema2"],\n' +
              '  "emotions": ["emoción1", "emoción2"],\n' +
              '  "entities": ["entidad1", "entidad2"],\n' +
              '  "newKnowledge": [\n' +
              '    {"text": "El niño ama los dinosaurios", "category": "interest", "confidence": 0.9}\n' +
              '  ]\n' +
              '}',
          },
          {
            role: 'user',
            content: `Conversación:\n${conversationText}\n\nResumen:\n${summary}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content || '{}');
    } catch (error) {
      this.logger.error('Failed to extract insights:', error);
      return {
        topics: [],
        emotions: [],
        entities: [],
        newKnowledge: [],
      };
    }
  }

  // ========== MEMORY DECAY & CLEANUP ==========

  /**
   * Aplicar decaimiento de memoria (decay)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async applyMemoryDecay(): Promise<void> {
    const enableDecay = this.configService.get<boolean>('ENABLE_MEMORY_DECAY', true);

    if (!enableDecay) {
      return;
    }

    this.logger.log('Applying memory decay...');

    try {
      const memories = await this.memoryRepo.find({
        where: {
          memoryType: MemoryType.EPISODIC,
        },
      });

      for (const memory of memories) {
        // Calcular edad en días
        const ageInDays = Math.floor(
          (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Decay rate: 0.01 por día (1% diario)
        const decayRate = 0.01 * ageInDays;
        memory.decay(decayRate);
      }

      await this.memoryRepo.save(memories);

      this.logger.log(`Memory decay applied to ${memories.length} memories`);
    } catch (error) {
      this.logger.error('Failed to apply memory decay:', error);
    }
  }

  /**
   * Limpiar memorias expiradas
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredMemories(): Promise<void> {
    this.logger.log('Cleaning up expired memories...');

    try {
      const expiredMemories = await this.memoryRepo.find({
        where: {
          expiresAt: LessThan(new Date()),
        },
      });

      for (const memory of expiredMemories) {
        // Eliminar de ChromaDB
        if (memory.chromaCollectionName && memory.chromaCollectionId) {
          await this.chromaService.deleteDocument(
            memory.chromaCollectionName,
            memory.chromaCollectionId,
          );
        }

        // Eliminar de PostgreSQL
        await this.memoryRepo.remove(memory);
      }

      this.logger.log(`Cleaned up ${expiredMemories.length} expired memories`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired memories:', error);
    }
  }

  // ========== UTILITIES ==========

  /**
   * Calcular importancia de una memoria
   */
  private calculateImportance(content: string, metadata: any): number {
    let importance = 0.5; // Base

    // Aumentar por contenido emocional
    const emotionalWords = [
      'amo',
      'odio',
      'miedo',
      'emocionado',
      'feliz',
      'triste',
      'enojado',
    ];
    const lowerContent = content.toLowerCase();
    if (emotionalWords.some(word => lowerContent.includes(word))) {
      importance += 0.2;
    }

    // Aumentar si fue iniciado por el usuario
    if (metadata.userInitiated) {
      importance += 0.15;
    }

    // Aumentar por longitud (más interacción = más importante)
    if (content.length > 200) {
      importance += 0.1;
    }

    // Aumentar si hay emociones detectadas
    if (metadata.emotions && metadata.emotions.length > 0) {
      importance += 0.1;
    }

    return Math.min(importance, 1.0);
  }

  /**
   * Obtener estadísticas de memoria de un usuario
   */
  async getMemoryStats(userId: string): Promise<any> {
    const episodicCount = await this.memoryRepo.count({
      where: { userId, memoryType: MemoryType.EPISODIC },
    });

    const semanticCount = await this.chromaService.countDocuments(
      `semantic_knowledge_${userId}`,
    );

    const avgImportance = await this.memoryRepo
      .createQueryBuilder('memory')
      .select('AVG(memory.importance)', 'avg')
      .where('memory.userId = :userId', { userId })
      .getRawOne();

    return {
      episodicMemories: episodicCount,
      semanticKnowledge: semanticCount,
      averageImportance: parseFloat(avgImportance?.avg || 0).toFixed(2),
    };
  }
}
