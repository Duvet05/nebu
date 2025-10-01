import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';
import { Toy } from '../toys/entities/toy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Toy])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
