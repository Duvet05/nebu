import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChromaClient, Collection, IncludeEnum } from 'chromadb';
import { OpenAIEmbeddingsHelper } from './openai-embeddings.helper';

export interface ToyPersonalityMetadata {
  toyId: string;
  toyName: string;
  userId: string;
  category?: string;
  topics?: string;
  targetAge?: string;
  style?: string;
  updatedAt: string;
}

export interface ConversationMemoryMetadata {
  sessionId: string;
  toyId: string;
  userId: string;
  timestamp: string;
  topics?: string;
  emotion?: string;
  duration?: number;
  messageCount?: number;
}

export interface KnowledgeBaseMetadata {
  topic: string;
  category: string;
  ageRange: string;
  verified: boolean;
  source?: string;
  language: string;
}

@Injectable()
export class ChromaDBService implements OnModuleInit {
  private client: ChromaClient;
  private toyPersonalities: Collection;
  private conversationMemories: Collection;
  private knowledgeBase: Collection;
  private readonly logger = new Logger(ChromaDBService.name);
  private isAvailable = false;

  constructor(
    private configService: ConfigService,
    private openaiEmbeddings: OpenAIEmbeddingsHelper,
  ) {}

  async onModuleInit() {
    await this.initialize();
  }

  /**
   * Inicializar conexión y colecciones
   */
  async initialize() {
    try {
      const host = this.configService.get('CHROMADB_HOST', 'localhost');
      const port = this.configService.get('CHROMADB_PORT', 8001);

      this.logger.log(`Conectando a ChromaDB en ${host}:${port}...`);
      
      this.client = new ChromaClient({ 
        path: `http://${host}:${port}` 
      });

      // Verificar conexión
      await this.client.heartbeat();
      this.logger.log('✅ ChromaDB heartbeat exitoso');

      // Inicializar colecciones
      await this.initializeCollections();
      
      this.isAvailable = true;
      this.logger.log('✅ ChromaDB Service inicializado correctamente');
    } catch (error) {
      this.isAvailable = false;
      this.logger.error('❌ Error inicializando ChromaDB:', error.message);
      this.logger.warn('⚠️  ChromaDB no disponible - el servicio continuará sin embeddings');
      // NO lanzamos el error - permitimos que el backend funcione sin ChromaDB
    }
  }

  /**
   * Verificar si ChromaDB está disponible
   */
  getAvailability(): boolean {
    return this.isAvailable;
  }

  /**
   * Inicializar colecciones (idempotente)
   */
  private async initializeCollections() {
    // Colección 1: Personalidades de juguetes
    this.toyPersonalities = await this.client.getOrCreateCollection({
      name: 'toy_personalities',
      metadata: {
        description: 'Prompts y personalidades configuradas para cada juguete Nebu',
        'hnsw:space': 'cosine', // Similitud coseno
      },
    });
    this.logger.log('✅ Colección toy_personalities lista');

    // Colección 2: Memorias de conversaciones
    this.conversationMemories = await this.client.getOrCreateCollection({
      name: 'conversation_memories',
      metadata: {
        description: 'Resúmenes semánticos de conversaciones entre niños y juguetes',
        'hnsw:space': 'cosine',
      },
    });
    this.logger.log('✅ Colección conversation_memories lista');

    // Colección 3: Base de conocimiento educativa
    this.knowledgeBase = await this.client.getOrCreateCollection({
      name: 'knowledge_base',
      metadata: {
        description: 'Base de conocimiento educativa curada y verificada',
        'hnsw:space': 'cosine',
      },
    });
    this.logger.log('✅ Colección knowledge_base lista');
  }

  // ========================================
  // TOY PERSONALITIES
  // ========================================

  /**
   * Guardar o actualizar personalidad de un juguete
   */
  async saveToyPersonality(
    toyId: string,
    prompt: string,
    metadata: Partial<ToyPersonalityMetadata>,
  ) {
    if (!this.isAvailable) {
      this.logger.warn('ChromaDB no disponible - omitiendo guardado de personalidad');
      return { success: false, reason: 'ChromaDB not available' };
    }

    const document = this.buildPersonalityDocument(prompt, metadata);
    const meta: ToyPersonalityMetadata = {
      toyId,
      toyName: metadata.toyName || 'Unknown',
      userId: metadata.userId || 'system',
      category: metadata.category || 'general',
      topics: metadata.topics || '',
      targetAge: metadata.targetAge || '4-12',
      style: metadata.style || 'amigable',
      updatedAt: new Date().toISOString(),
    };

    // Generar embedding con OpenAI
    const embedding = await this.openaiEmbeddings.generateEmbedding(document);

    const upsertParams: any = {
      ids: [toyId],
      documents: [document],
      metadatas: [meta as any],
    };

    if (embedding) {
      upsertParams.embeddings = [embedding];
    }

    await this.toyPersonalities.upsert(upsertParams);

    this.logger.log(`✅ Personalidad guardada para toy: ${toyId}`);
    return { success: true, toyId };
  }

  /**
   * Buscar personalidades similares a un prompt
   */
  async findSimilarPersonalities(prompt: string, limit = 5, excludeToyId?: string) {
    const results = await this.toyPersonalities.query({
      queryTexts: [prompt],
      nResults: limit + (excludeToyId ? 1 : 0), // Pedimos uno extra si vamos a excluir
      include: [IncludeEnum.Documents, IncludeEnum.Metadatas, IncludeEnum.Distances],
    });

    if (!results.ids || !results.ids[0] || results.ids[0].length === 0) {
      return [];
    }

    return results.ids[0]
      .map((id, i) => ({
        toyId: id,
        similarity: (1 - results.distances[0][i]) * 100,
        metadata: results.metadatas[0][i],
        document: results.documents[0][i],
      }))
      .filter((item) => item.toyId !== excludeToyId)
      .slice(0, limit);
  }

  /**
   * Obtener personalidad de un juguete específico
   */
  async getToyPersonality(toyId: string) {
    const result = await this.toyPersonalities.get({
      ids: [toyId],
      include: [IncludeEnum.Documents, IncludeEnum.Metadatas],
    });

    if (!result.ids || result.ids.length === 0) {
      return null;
    }

    return {
      toyId: result.ids[0],
      document: result.documents[0],
      metadata: result.metadatas[0],
    };
  }

  /**
   * Eliminar personalidad de un juguete
   */
  async deleteToyPersonality(toyId: string) {
    await this.toyPersonalities.delete({
      ids: [toyId],
    });
    this.logger.log(`🗑️  Personalidad eliminada para toy: ${toyId}`);
  }

  // ========================================
  // CONVERSATION MEMORIES
  // ========================================

  /**
   * Guardar resumen de una conversación
   */
  async saveConversationMemory(
    sessionId: string,
    summary: string,
    metadata: Partial<ConversationMemoryMetadata>,
  ) {
    if (!this.isAvailable) {
      this.logger.warn('ChromaDB no disponible - omitiendo guardado de memoria');
      return { success: false, reason: 'ChromaDB not available' };
    }

    const document = this.buildConversationDocument(summary, metadata);
    const meta: ConversationMemoryMetadata = {
      sessionId,
      toyId: metadata.toyId,
      userId: metadata.userId,
      timestamp: metadata.timestamp || new Date().toISOString(),
      topics: metadata.topics || '',
      emotion: metadata.emotion || 'neutral',
      duration: metadata.duration || 0,
      messageCount: metadata.messageCount || 0,
    };

    // Generar embedding con OpenAI
    const embedding = await this.openaiEmbeddings.generateEmbedding(document);

    const addParams: any = {
      ids: [`session_${sessionId}`],
      documents: [document],
      metadatas: [meta as any],
    };

    if (embedding) {
      addParams.embeddings = [embedding];
    }

    await this.conversationMemories.add(addParams);

    this.logger.log(`✅ Memoria guardada para sesión: ${sessionId}`);
    return { success: true, sessionId };
  }

  /**
   * Buscar conversaciones relevantes para contexto
   */
  async searchRelevantMemories(
    toyId: string,
    query: string,
    limit = 3,
    daysBack = 30,
  ) {
    // Filtrar por fecha si es necesario
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - daysBack);

    const results = await this.conversationMemories.query({
      queryTexts: [query],
      nResults: limit,
      where: { toyId },
      include: [IncludeEnum.Documents, IncludeEnum.Metadatas, IncludeEnum.Distances],
    });

    if (!results.ids || !results.ids[0] || results.ids[0].length === 0) {
      return [];
    }

    return results.ids[0].map((id, i) => ({
      sessionId: id.replace('session_', ''),
      summary: results.documents[0][i],
      relevance: (1 - results.distances[0][i]) * 100,
      metadata: results.metadatas[0][i],
    }));
  }

  /**
   * Obtener últimas conversaciones de un juguete
   */
  async getRecentConversations(toyId: string, limit = 10) {
    const results = await this.conversationMemories.get({
      where: { toyId },
      limit,
      include: [IncludeEnum.Documents, IncludeEnum.Metadatas],
    });

    if (!results.ids || results.ids.length === 0) {
      return [];
    }

    return results.ids.map((id, i) => ({
      sessionId: id.replace('session_', ''),
      summary: results.documents[i],
      metadata: results.metadatas[i],
    }));
  }

  // ========================================
  // KNOWLEDGE BASE
  // ========================================

  /**
   * Agregar conocimiento a la base de datos
   */
  async addKnowledge(
    id: string,
    content: string,
    metadata: Partial<KnowledgeBaseMetadata>,
  ) {
    const meta: KnowledgeBaseMetadata = {
      topic: metadata.topic || 'general',
      category: metadata.category || 'educativo',
      ageRange: metadata.ageRange || '4-12',
      verified: metadata.verified ?? true,
      source: metadata.source || 'curated',
      language: metadata.language || 'es',
    };

    // Generar embedding con OpenAI
    const embedding = await this.openaiEmbeddings.generateEmbedding(content);

    const addParams: any = {
      ids: [id],
      documents: [content],
      metadatas: [meta as any],
    };

    // Solo agregar embeddings si están disponibles
    // Sin embeddings, ChromaDB usa búsqueda lexical en lugar de semántica
    if (embedding) {
      addParams.embeddings = [embedding];
    }

    await this.knowledgeBase.add(addParams);

    const embeddingStatus = embedding ? 'con embeddings' : 'sin embeddings (búsqueda lexical)';
    this.logger.log(`✅ Conocimiento agregado: ${id} (${embeddingStatus})`);
  }

  /**
   * Buscar conocimiento relevante
   */
  async searchKnowledge(
    query: string,
    filters?: {
      ageRange?: string;
      category?: string;
      language?: string;
    },
    limit = 5,
  ) {
    const where: any = {};
    if (filters?.ageRange) where.ageRange = filters.ageRange;
    if (filters?.category) where.category = filters.category;
    if (filters?.language) where.language = filters.language;

    const results = await this.knowledgeBase.query({
      queryTexts: [query],
      nResults: limit,
      where: Object.keys(where).length > 0 ? where : undefined,
      include: [IncludeEnum.Documents, IncludeEnum.Metadatas, IncludeEnum.Distances],
    });

    if (!results.ids || !results.ids[0] || results.ids[0].length === 0) {
      return [];
    }

    return results.documents[0].map((doc, i) => ({
      id: results.ids[0][i],
      content: doc,
      relevance: (1 - results.distances[0][i]) * 100,
      metadata: results.metadatas[0][i],
    }));
  }

  /**
   * Actualizar conocimiento existente
   */
  async updateKnowledge(id: string, content: string, metadata?: Partial<KnowledgeBaseMetadata>) {
    // ChromaDB no tiene update directo, usamos upsert
    const existing = await this.knowledgeBase.get({ ids: [id] });
    
    if (!existing.ids || existing.ids.length === 0) {
      throw new Error(`Knowledge with id ${id} not found`);
    }

    const updatedMeta = {
      ...existing.metadatas[0],
      ...metadata,
    };

    await this.knowledgeBase.upsert({
      ids: [id],
      documents: [content],
      metadatas: [updatedMeta as any],
    });

    this.logger.log(`✅ Conocimiento actualizado: ${id}`);
  }

  // ========================================
  // CONTEXT BUILDING (Para LiveKit Agent)
  // ========================================

  /**
   * Construir contexto completo para el agente de IA
   */
  async buildAgentContext(
    toyId: string,
    currentMessage: string,
    options?: {
      includePersonality?: boolean;
      includeMemories?: boolean;
      includeKnowledge?: boolean;
      memoriesLimit?: number;
      knowledgeLimit?: number;
      ageRange?: string;
    },
  ) {
    const {
      includePersonality = true,
      includeMemories = true,
      includeKnowledge = true,
      memoriesLimit = 3,
      knowledgeLimit = 2,
      ageRange = '4-12',
    } = options || {};

    const contextParts: string[] = [];

    // 1. Personalidad del juguete
    if (includePersonality) {
      const personality = await this.getToyPersonality(toyId);
      if (personality) {
        contextParts.push('# Tu personalidad:');
        contextParts.push(personality.document);
        contextParts.push('');
      }
    }

    // 2. Conversaciones previas relevantes
    if (includeMemories) {
      const memories = await this.searchRelevantMemories(
        toyId,
        currentMessage,
        memoriesLimit,
      );

      if (memories.length > 0) {
        contextParts.push('# Conversaciones anteriores relevantes:');
        memories.forEach((mem, i) => {
          contextParts.push(
            `\n## Conversación ${i + 1} (${mem.relevance.toFixed(1)}% relevante):`,
          );
          contextParts.push(mem.summary);
        });
        contextParts.push('');
      }
    }

    // 3. Conocimiento educativo verificado
    if (includeKnowledge) {
      const knowledge = await this.searchKnowledge(
        currentMessage,
        { ageRange, language: 'es' },
        knowledgeLimit,
      );

      if (knowledge.length > 0) {
        contextParts.push('# Información educativa verificada:');
        knowledge.forEach((k, i) => {
          contextParts.push(`\n## Dato ${i + 1} (${k.relevance.toFixed(1)}% relevante):`);
          contextParts.push(k.content);
        });
        contextParts.push('');
      }
    }

    return contextParts.join('\n');
  }

  // ========================================
  // HELPERS
  // ========================================

  private buildPersonalityDocument(
    prompt: string,
    metadata: Partial<ToyPersonalityMetadata>,
  ): string {
    const parts = [prompt];

    if (metadata.category) parts.push(`\nCategoría: ${metadata.category}`);
    if (metadata.topics) parts.push(`Temas: ${metadata.topics}`);
    if (metadata.targetAge) parts.push(`Edad objetivo: ${metadata.targetAge}`);
    if (metadata.style) parts.push(`Estilo: ${metadata.style}`);

    return parts.join('\n').trim();
  }

  private buildConversationDocument(
    summary: string,
    metadata: Partial<ConversationMemoryMetadata>,
  ): string {
    const parts = [`SESIÓN: ${metadata.timestamp || new Date().toISOString()}`, summary];

    if (metadata.topics) parts.push(`\nTemas discutidos: ${metadata.topics}`);
    if (metadata.emotion) parts.push(`Emoción del niño: ${metadata.emotion}`);
    if (metadata.duration) parts.push(`Duración: ${metadata.duration} segundos`);
    if (metadata.messageCount) parts.push(`Mensajes intercambiados: ${metadata.messageCount}`);

    return parts.join('\n').trim();
  }

  // ========================================
  // ADMIN / STATS
  // ========================================

  /**
   * Obtener estadísticas de las colecciones
   */
  async getStats() {
    const [personalitiesCount, memoriesCount, knowledgeCount] = await Promise.all([
      this.toyPersonalities.count(),
      this.conversationMemories.count(),
      this.knowledgeBase.count(),
    ]);

    return {
      collections: {
        toy_personalities: personalitiesCount,
        conversation_memories: memoriesCount,
        knowledge_base: knowledgeCount,
      },
      total: personalitiesCount + memoriesCount + knowledgeCount,
    };
  }

  /**
   * Limpiar colecciones (solo para desarrollo/testing)
   */
  async clearAllCollections() {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('Cannot clear collections in production');
    }

    await this.client.deleteCollection({ name: 'toy_personalities' });
    await this.client.deleteCollection({ name: 'conversation_memories' });
    await this.client.deleteCollection({ name: 'knowledge_base' });

    await this.initializeCollections();
    this.logger.warn('⚠️  Todas las colecciones limpiadas');
  }
}
