import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Toy } from '../../toys/entities/toy.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Toy)
    private toyRepository: Repository<Toy>
  ) {}

  async search(query: string) {
    if (!query || query.trim().length === 0) {
      return {
        results: [],
        total: 0,
        query: query,
      };
    }

    try {
      // Search in toys
      const toys = await this.toyRepository
        .createQueryBuilder('toy')
        .leftJoinAndSelect('toy.iotDevice', 'iotDevice')
        .where('toy.name ILIKE :query OR toy.model ILIKE :query OR toy.manufacturer ILIKE :query', {
          query: `%${query}%`,
        })
        .andWhere('toy.status IN (:...statuses)', {
          statuses: ['active', 'connected']
        })
        .select([
          'toy.id',
          'toy.name',
          'toy.model',
          'toy.manufacturer',
          'toy.status',
          'iotDevice.macAddress',
        ])
        .limit(10)
        .getMany();

      const results = toys.map(toy => ({
        id: toy.id.toString(),
        type: 'toy' as const,
        title: toy.name,
        description: toy.model || toy.manufacturer || 'Juguete inteligente',
        url: `/toy/${toy.iotDevice?.macAddress || toy.id}`,
        icon: '',
      }));

      return {
        results,
        total: results.length,
        query: query,
      };
    } catch {
      // Search error occurred
      return {
        results: [],
        total: 0,
        query: query,
      };
    }
  }
}
