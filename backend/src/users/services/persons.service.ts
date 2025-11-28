import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { PersonName } from '../entities/person-name.entity';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(PersonName)
    private readonly personNameRepository: Repository<PersonName>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const {givenName, familyName, middleName, prefix, ...personData} = createPersonDto;

    // Crear la persona
    const person = this.personRepository.create(personData);
    const savedPerson = await this.personRepository.save(person);

    // Crear el nombre preferido
    const personName = this.personNameRepository.create({
      personId: savedPerson.id,
      givenName,
      familyName,
      middleName,
      prefix,
      preferred: true,
    });
    await this.personNameRepository.save(personName);

    // Recargar person con nombres
    return this.personRepository.findOne({
      where: { id: savedPerson.id },
      relations: ['names'],
    });
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

    const {givenName, familyName, middleName, prefix, ...personData} = updatePersonDto as any;

    // Actualizar datos de persona
    if (Object.keys(personData).length > 0) {
      await this.personRepository.update(id, personData);
    }

    // Actualizar nombre preferido si se proporcionan campos de nombre
    if (givenName || familyName || middleName || prefix) {
      const preferredName = await this.personNameRepository.findOne({
        where: { personId: id, preferred: true },
      });

      if (preferredName) {
        await this.personNameRepository.update(preferredName.id, {
          givenName: givenName || preferredName.givenName,
          familyName: familyName || preferredName.familyName,
          middleName,
          prefix,
        });
      }
    }

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
