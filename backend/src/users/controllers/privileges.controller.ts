import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PrivilegesService } from '../services/privileges.service';
import { CreatePrivilegeDto } from '../dto/create-privilege.dto';
import { UpdatePrivilegeDto } from '../dto/update-privilege.dto';
import { Paginate } from '../../common/decorators/paginate.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('users')
@Controller('privileges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PrivilegesController {
  constructor(private readonly privilegesService: PrivilegesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo privilegio' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Privilegio creado exitosamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  create(@Body() createPrivilegeDto: CreatePrivilegeDto) {
    return this.privilegesService.create(createPrivilegeDto);
  }

  @Get()
  @Paginate()
  @ApiOperation({ summary: 'Obtener lista paginada de privilegios' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de privilegios obtenida exitosamente' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  findAll(@Req() request: Request) {
    return this.privilegesService.findAll((request as any).pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un privilegio por ID' })
  @ApiParam({ name: 'id', description: 'ID del privilegio' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Privilegio encontrado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Privilegio no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  findOne(@Param('id') id: string) {
    return this.privilegesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un privilegio' })
  @ApiParam({ name: 'id', description: 'ID del privilegio' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Privilegio actualizado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Privilegio no encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  update(@Param('id') id: string, @Body() updatePrivilegeDto: UpdatePrivilegeDto) {
    return this.privilegesService.update(id, updatePrivilegeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un privilegio' })
  @ApiParam({ name: 'id', description: 'ID del privilegio' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Privilegio eliminado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Privilegio no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  remove(@Param('id') id: string) {
    return this.privilegesService.remove(id);
  }
}
