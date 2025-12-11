import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * Helper para generar embeddings usando OpenAI
 * Más eficiente que chromadb-default-embed y no consume memoria del contenedor
 */
@Injectable()
export class OpenAIEmbeddingsHelper {
  private readonly logger = new Logger(OpenAIEmbeddingsHelper.name);
  private openai: OpenAI | null = null;
  private isAvailable = false;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk-your-openai-api-key-here') {
      this.openai = new OpenAI({ apiKey });
      this.isAvailable = true;
      this.logger.log('✅ OpenAI Embeddings disponibles');
    } else {
      this.logger.warn('⚠️  OpenAI API key no configurada, embeddings deshabilitados');
    }
  }

  /**
   * Generar embedding para un texto
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.isAvailable || !this.openai) {
      this.logger.warn('OpenAI no disponible, retornando null');
      return null;
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small', // Modelo más barato y eficiente
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Error generando embedding: ${error.message}`);
      return null;
    }
  }

  /**
   * Generar embeddings para múltiples textos (batch)
   */
  async generateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
    if (!this.isAvailable || !this.openai) {
      this.logger.warn('OpenAI no disponible, retornando array de nulls');
      return texts.map(() => null);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
        encoding_format: 'float',
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      this.logger.error(`Error generando embeddings batch: ${error.message}`);
      return texts.map(() => null);
    }
  }

  /**
   * Verificar si el servicio está disponible
   */
  available(): boolean {
    return this.isAvailable;
  }
}
