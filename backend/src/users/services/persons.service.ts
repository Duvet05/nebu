import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = this.personRepository.create(createPersonDto);
    return this.personRepository.save(person);
  }

  async findAll(paginationDto: PaginationDto): Promise<[Person[], number]> {
    return this.personRepository.findAndCount({
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Person | null> {
    return this.personRepository.findOne({ where: { id } });
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const person = await this.findOne(id);
    if (!person) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    await this.personRepository.update(id, updatePersonDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const person = await this.findOne(id);
    if (!person) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    await this.personRepository.delete(id);
  }
}
