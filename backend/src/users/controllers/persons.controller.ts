import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PersonsService } from '../services/persons.service';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { Paginate } from '../../common/decorators/paginate.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('users')
@Controller('persons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva persona' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Persona creada exitosamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personsService.create(createPersonDto);
  }

  @Get()
  @Paginate()
  @ApiOperation({ summary: 'Obtener lista paginada de personas' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de personas obtenida exitosamente' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  findAll(@Req() request: Request) {
    return this.personsService.findAll((request as any).pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una persona por ID' })
  @ApiParam({ name: 'id', description: 'ID de la persona' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Persona encontrada' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Persona no encontrada' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  findOne(@Param('id') id: string) {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una persona' })
  @ApiParam({ name: 'id', description: 'ID de la persona' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Persona actualizada exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Persona no encontrada' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.personsService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una persona' })
  @ApiParam({ name: 'id', description: 'ID de la persona' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Persona eliminada exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Persona no encontrada' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  remove(@Param('id') id: string) {
    return this.personsService.remove(id);
  }
}
