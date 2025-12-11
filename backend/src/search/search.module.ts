import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';
import { ChromaDBService } from './services/chromadb.service';
import { ChromaDBSeederService } from './services/chromadb-seeder.service';
import { OpenAIEmbeddingsHelper } from './services/openai-embeddings.helper';
import { ChromaDBController } from './controllers/chromadb.controller';
import { Toy } from '../toys/entities/toy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Toy])],
  controllers: [SearchController, ChromaDBController],
  providers: [
    SearchService,
    ChromaDBService,
    ChromaDBSeederService,
    OpenAIEmbeddingsHelper,
  ],
  exports: [SearchService, ChromaDBService],
})
export class SearchModule {}
