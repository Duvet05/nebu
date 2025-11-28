import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';

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

  async findAll(): Promise<Person[]> {
    return this.personRepository.find();
  }

  async findOne(id: string): Promise<Person | null> {
    return this.personRepository.findOne({ where: { id } });
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    await this.personRepository.update(id, updatePersonDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.personRepository.delete(id);
  }
}
