import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { PersonsService } from '../services/persons.service';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { PaginationDto } from '../../common/dto';

@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personsService.create(createPersonDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.personsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.personsService.update(id, updatePersonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personsService.remove(id);
  }
}
