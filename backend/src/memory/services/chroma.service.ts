import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChromaClient, Collection } from 'chromadb';
import { OpenAI } from 'openai';

export interface QueryResult {
  id: string;
  document: string;
  metadata: any;
  distance: number;
}

@Injectable()
export class ChromaService {
  private readonly logger = new Logger(ChromaService.name);
  private client: ChromaClient;
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const chromaUrl = this.configService.get<string>('CHROMA_URL');

    if (!chromaUrl) {
      throw new Error('CHROMA_URL not configured');
    }

    this.client = new ChromaClient({
      path: chromaUrl,
    });

    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    this.logger.log(`ChromaDB client initialized: ${chromaUrl}`);
  }

  /**
   * Crear una nueva colección
   */
  async createCollection(name: string, metadata?: any): Promise<Collection> {
    try {
      const collection = await this.client.createCollection({
        name,
        metadata: {
          'hnsw:space': 'cosine', // Medida de similitud: coseno
          ...metadata,
        },
      });

      this.logger.log(`Collection created: ${name}`);
      return collection;
    } catch (error) {
      this.logger.error(`Failed to create collection ${name}:`, error);
      throw error;
    }
  }

  /**
   * Obtener colección existente o crear nueva
   */
  async getOrCreateCollection(name: string): Promise<Collection> {
    try {
      // En ChromaDB v1.10.5, getCollection requiere embeddingFunction
      return await this.client.getCollection({
        name,
        embeddingFunction: null // Usar embedding por defecto
      });
    } catch {
      this.logger.log(`Collection ${name} not found, creating...`);
      return this.createCollection(name);
    }
  }

  /**
   * Eliminar una colección
   */
  async deleteCollection(name: string): Promise<void> {
    try {
      await this.client.deleteCollection({ name });
      this.logger.log(`Collection deleted: ${name}`);
    } catch (error) {
      this.logger.warn(`Failed to delete collection ${name}:`, error.message);
    }
  }

  /**
   * Generar embedding usando OpenAI
   */
  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small', // 1536 dimensions, económico
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Failed to create embedding:', error);
      throw error;
    }
  }

  /**
   * Generar embeddings en batch
   */
  async createEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    try {
      // OpenAI permite hasta 2048 inputs por request
      const batchSize = 100;
      const embeddings: number[][] = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);

        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch,
        });

        embeddings.push(...response.data.map(d => d.embedding));
      }

      this.logger.log(`Generated ${embeddings.length} embeddings`);
      return embeddings;
    } catch (error) {
      this.logger.error('Failed to create batch embeddings:', error);
      throw error;
    }
  }

  /**
   * Agregar un documento a una colección
   */
  async addDocument(
    collectionName: string,
    text: string,
    metadata: any,
    id?: string,
  ): Promise<string> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      const embedding = await this.createEmbedding(text);
      const documentId = id || this.generateId();

      await collection.add({
        ids: [documentId],
        embeddings: [embedding],
        documents: [text],
        metadatas: [metadata],
      });

      this.logger.log(`Document added to ${collectionName}: ${documentId}`);
      return documentId;
    } catch (error) {
      this.logger.error(`Failed to add document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Agregar múltiples documentos en batch
   */
  async addDocumentsBatch(
    collectionName: string,
    documents: { text: string; metadata: any; id?: string }[],
  ): Promise<string[]> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);

      const texts = documents.map(d => d.text);
      const embeddings = await this.createEmbeddingsBatch(texts);
      const ids = documents.map(d => d.id || this.generateId());
      const metadatas = documents.map(d => d.metadata);

      await collection.add({
        ids,
        embeddings,
        documents: texts,
        metadatas,
      });

      this.logger.log(`${documents.length} documents added to ${collectionName}`);
      return ids;
    } catch (error) {
      this.logger.error(`Failed to add batch documents to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar o insertar documento (upsert)
   */
  async upsertDocument(
    collectionName: string,
    text: string,
    metadata: any,
    id: string,
  ): Promise<void> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      const embedding = await this.createEmbedding(text);

      await collection.upsert({
        ids: [id],
        embeddings: [embedding],
        documents: [text],
        metadatas: [metadata],
      });

      this.logger.log(`Document upserted in ${collectionName}: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to upsert document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Buscar documentos similares (búsqueda semántica)
   */
  async query(
    collectionName: string,
    queryText: string,
    nResults: number = 5,
    filter?: any,
  ): Promise<QueryResult[]> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      const queryEmbedding = await this.createEmbedding(queryText);

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults,
        where: filter,
      });

      // Convertir resultados al formato esperado
      return results.ids[0].map((id, index) => ({
        id,
        document: results.documents[0][index] as string,
        metadata: results.metadatas[0][index],
        distance: results.distances[0][index],
      }));
    } catch (error) {
      this.logger.error(`Failed to query ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener documento por ID
   */
  async getDocument(collectionName: string, id: string): Promise<QueryResult | null> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);

      const results = await collection.get({
        ids: [id],
      });

      if (results.ids.length === 0) {
        return null;
      }

      return {
        id: results.ids[0],
        document: results.documents[0] as string,
        metadata: results.metadatas[0],
        distance: 0, // No hay distancia en get directo
      };
    } catch (error) {
      this.logger.error(`Failed to get document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar documento
   */
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      await collection.delete({ ids: [id] });
      this.logger.log(`Document deleted from ${collectionName}: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Contar documentos en una colección
   */
  async countDocuments(collectionName: string): Promise<number> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      return await collection.count();
    } catch (error) {
      this.logger.error(`Failed to count documents in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Listar todas las colecciones
   */
  async listCollections(): Promise<string[]> {
    try {
      // En ChromaDB v1.10.5, listCollections devuelve array de strings
      const collections = await this.client.listCollections();
      return collections as string[];
    } catch (error) {
      this.logger.error('Failed to list collections:', error);
      throw error;
    }
  }

  /**
   * Verificar salud de ChromaDB
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.heartbeat();
      return true;
    } catch (error) {
      this.logger.error('ChromaDB health check failed:', error);
      return false;
    }
  }

  /**
   * Generar ID único
   */
  private generateId(): string {
    return `chroma_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
