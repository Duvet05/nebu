import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChromaDBService } from '../../search/services/chromadb.service';
import { ConfigService } from '@nestjs/config';
import { VoiceSession } from '../../voice/entities/voice-session.entity';

@Injectable()
export class ConversationSummarizerJob {
  private readonly logger = new Logger(ConversationSummarizerJob.name);
  private isProcessing = false;

  constructor(
    private readonly chromaDBService: ChromaDBService,
    private readonly configService: ConfigService,
    @InjectRepository(VoiceSession)
    private voiceSessionRepo: Repository<VoiceSession>,
  ) {}

  /**
   * Job que se ejecuta cada hora para resumir conversaciones
   * Cron: Cada hora en el minuto 5
   */
  @Cron('5 * * * *', {
    name: 'summarize-conversations',
    timeZone: 'America/Lima',
  })
  async handleHourlySummarization() {
    if (this.isProcessing) {
      this.logger.warn('Job anterior aún en proceso, saltando ejecución');
      return;
    }

    this.isProcessing = true;
    this.logger.log('🔄 Iniciando job de resumen de conversaciones...');

    try {
      await this.summarizeRecentConversations();
      this.logger.log('✅ Job completado exitosamente');
    } catch (error) {
      this.logger.error('❌ Error en job de resumen:', error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Job nocturno para procesamiento más intensivo
   * Cron: Todos los días a las 3:00 AM
   */
  @Cron('0 3 * * *', {
    name: 'nightly-summarization',
    timeZone: 'America/Lima',
  })
  async handleNightlySummarization() {
    this.logger.log('🌙 Iniciando job nocturno de resumen...');

    try {
      await this.summarizeRecentConversations(24); // Últimas 24 horas
      await this.cleanupOldData();
      this.logger.log('✅ Job nocturno completado');
    } catch (error) {
      this.logger.error('❌ Error en job nocturno:', error.message);
    }
  }

  /**
   * Resumir conversaciones recientes no sincronizadas
   */
  private async summarizeRecentConversations(hoursBack = 1) {
    this.logger.log(`📝 Procesando conversaciones de las últimas ${hoursBack} horas...`);

    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursBack);

    const sessions = await this.voiceSessionRepo.find({
      where: {
        chromadbSynced: false,
        status: 'ended',
        endedAt: LessThan(cutoffDate),
      },
      relations: ['conversations'],
      take: 100, // Procesar en lotes de 100
      order: {
        endedAt: 'ASC',
      },
    });

    this.logger.log(`Encontradas ${sessions.length} sesiones para procesar`);

    for (const session of sessions) {
      try {
        const summary = await this.generateSummary(session);
        const topics = this.extractTopics(session);
        const emotion = this.detectEmotion(session);

        // Guardar en ChromaDB
        await this.chromaDBService.saveConversationMemory(
          session.id,
          summary,
          {
            sessionId: session.id,
            toyId: session.userId, // TODO: Obtener toyId real cuando esté disponible
            userId: session.userId,
            timestamp: session.endedAt.toISOString(),
            topics: topics.join(','),
            emotion,
            duration: session.durationSeconds,
            messageCount: session.messageCount,
          },
        );

        // Marcar como sincronizado
        session.markChromaDBSynced(summary, topics, emotion);
        await this.voiceSessionRepo.save(session);

        this.logger.debug(`✅ Sesión ${session.id} resumida y guardada en ChromaDB`);
      } catch (error) {
        this.logger.error(`Error procesando sesión ${session.id}:`, error.message);
      }
    }

    this.logger.log(`✅ ${sessions.length} sesiones procesadas`);
  }

  /**
   * Generar resumen de una conversación usando IA
   */
  private async generateSummary(session: VoiceSession): Promise<string> {
    // TODO: Integrar con tu servicio de LLM (OpenAI, Anthropic, etc.)
    
    if (!session.conversations || session.conversations.length === 0) {
      return `Sesión de voz sin mensajes registrados. Duración: ${session.durationSeconds || 0} segundos.`;
    }

    // Construir prompt para el LLM
    const messages = session.conversations
      .map((conv) => `${conv.messageType}: ${conv.content}`)
      .join('\n');

    // Generar resumen basado en metadata
    // TODO: En producción, usar LLM (OpenAI/Anthropic) con el prompt completo
    // Prompt template disponible para implementación futura:
    // "Resume la siguiente conversación entre un niño y su juguete inteligente Nebu..."
    const topics = session.topics?.join(', ') || 'temas variados';
    return `Conversación sobre ${topics}. El niño mostró interés en aprender más. Duración: ${session.durationSeconds || 0} segundos. ${session.messageCount} mensajes intercambiados. Mensajes: ${messages.split('\n').length}`;
  }

  /**
   * Extraer tópicos de la conversación
   */
  private extractTopics(session: VoiceSession): string[] {
    // TODO: Implementar extracción de tópicos con NLP
    // Por ahora extraemos palabras clave básicas del contenido
    
    if (!session.conversations || session.conversations.length === 0) {
      return ['conversación general'];
    }

    // Análisis básico de palabras clave (placeholder)
    const content = session.conversations
      .map(c => c.content.toLowerCase())
      .join(' ');

    const keywords = [];
    if (content.includes('dinosaurio') || content.includes('dino')) keywords.push('dinosaurios');
    if (content.includes('espacio') || content.includes('planeta')) keywords.push('espacio');
    if (content.includes('animal') || content.includes('mascota')) keywords.push('animales');
    if (content.includes('cuento') || content.includes('historia')) keywords.push('cuentos');
    if (content.includes('música') || content.includes('canción')) keywords.push('música');
    if (content.includes('juego') || content.includes('jugar')) keywords.push('juegos');

    return keywords.length > 0 ? keywords : ['conversación general'];
  }

  /**
   * Detectar emoción predominante
   */
  private detectEmotion(session: VoiceSession): string {
    // TODO: Implementar análisis de sentimiento real
    
    if (!session.conversations || session.conversations.length === 0) {
      return 'neutral';
    }

    // Análisis básico de emociones (placeholder)
    const content = session.conversations
      .map(c => c.content.toLowerCase())
      .join(' ');

    if (content.includes('feliz') || content.includes('genial') || content.includes('me gusta')) {
      return 'alegre';
    }
    if (content.includes('triste') || content.includes('llorar')) {
      return 'triste';
    }
    if (content.includes('miedo') || content.includes('asustado')) {
      return 'asustado';
    }
    if (content.includes('enojado') || content.includes('molesto')) {
      return 'enojado';
    }

    return 'neutral';
  }

  /**
   * Limpiar datos antiguos (opcional)
   */
  private async cleanupOldData() {
    this.logger.log('🧹 Limpiando datos antiguos...');
    
    // Mantener solo últimos 12 meses en ChromaDB
    const retentionDays = this.configService.get('CHROMADB_RETENTION_DAYS', 365);
    
    // TODO: Implementar limpieza de embeddings antiguos si es necesario
    // ChromaDB no tiene TTL automático, tendrías que implementar lógica custom
    
    this.logger.log(`✅ Limpieza completada (retención: ${retentionDays} días)`);
  }

  /**
   * Trigger manual para resumir sesión específica
   */
  async summarizeSession(sessionId: string) {
    this.logger.log(`📝 Resumen manual de sesión: ${sessionId}`);
    
    const session = await this.voiceSessionRepo.findOne({
      where: { id: sessionId },
      relations: ['conversations'],
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'ended') {
      throw new Error('Session must be ended before summarizing');
    }

    const summary = await this.generateSummary(session);
    const topics = this.extractTopics(session);
    const emotion = this.detectEmotion(session);

    await this.chromaDBService.saveConversationMemory(
      session.id,
      summary,
      {
        sessionId: session.id,
        toyId: session.userId, // TODO: Obtener toyId real
        userId: session.userId,
        timestamp: session.endedAt?.toISOString() || new Date().toISOString(),
        topics: topics.join(','),
        emotion,
        duration: session.durationSeconds,
        messageCount: session.messageCount,
      },
    );

    session.markChromaDBSynced(summary, topics, emotion);
    await this.voiceSessionRepo.save(session);

    return { success: true, summary, topics, emotion };
  }
}
