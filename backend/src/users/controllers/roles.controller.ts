import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Paginate } from '../../common/decorators/paginate.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('users')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Paginate()
  @ApiOperation({ summary: 'Obtener lista paginada de roles' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de roles obtenida exitosamente' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  findAll(@Req() request: Request) {
    return this.rolesService.findAll((request as any).pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rol encontrado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Rol no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Rol no encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rol eliminado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Rol no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
