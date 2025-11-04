import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ToysService } from '../services/toys.service';
import { CreateToyDto } from '../dto/create-toy.dto';
import { UpdateToyDto } from '../dto/update-toy.dto';
import { AssignToyDto, AssignToyResponseDto } from '../dto/assign-toy.dto';
import { ToyResponseDto, ToyListResponseDto } from '../dto/toy-response.dto';
import { UpdateConnectionStatusDto } from '../dto/update-connection-status.dto';
import { ToyStatus } from '../entities/toy.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('toys')
@Controller('toys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ToysController {
  constructor(private readonly toysService: ToysService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar nuevo juguete',
    description: 'Registra un nuevo juguete IoT con MAC address. El userId se obtiene del token JWT.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Juguete registrado exitosamente',
    type: ToyResponseDto,
  })
  async create(
    @Body() createToyDto: CreateToyDto,
    @CurrentUser() user: User,
  ): Promise<ToyResponseDto> {
    return this.toysService.create(createToyDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los juguetes',
    description: 'Obtiene todos los juguetes con paginación y filtros opcionales'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados por página', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ToyStatus, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por ID de usuario' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, modelo, fabricante o MAC' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de juguetes con paginación',
    type: ToyListResponseDto,
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ToyStatus,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
  ): Promise<ToyListResponseDto> {
    return this.toysService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status,
      userId,
      search,
    );
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Obtener estadísticas de juguetes',
    description: 'Obtiene estadísticas generales de todos los juguetes del sistema'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas de juguetes',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total de juguetes' },
        assigned: { type: 'number', description: 'Juguetes asignados' },
        unassigned: { type: 'number', description: 'Juguetes sin asignar' },
        byStatus: {
          type: 'object',
          description: 'Conteo por estado',
          additionalProperties: { type: 'number' }
        }
      }
    }
  })
  async getStatistics() {
    return this.toysService.getStatistics();
  }

  @Get('my-toys')
  @ApiOperation({
    summary: 'Mis juguetes',
    description: 'Obtiene los juguetes asignados a mi cuenta'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de mis juguetes',
    type: [ToyResponseDto],
  })
  async findMyToys(@CurrentUser() user: User): Promise<ToyResponseDto[]> {
    return this.toysService.findByUserId(user.id);
  }

  @Get('mac/:macAddress')
  @ApiOperation({
    summary: 'Obtener juguete por MAC address',
    description: 'Busca un juguete específico por su dirección MAC'
  })
  @ApiParam({ name: 'macAddress', description: 'MAC address del juguete (formato: XX:XX:XX:XX:XX:XX)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juguete encontrado',
    type: ToyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Juguete no encontrado',
  })
  async findByMacAddress(@Param('macAddress') macAddress: string): Promise<ToyResponseDto> {
    return this.toysService.findByMacAddress(macAddress);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener juguete por ID',
    description: 'Busca un juguete específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del juguete (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juguete encontrado',
    type: ToyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Juguete no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<ToyResponseDto> {
    return this.toysService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar juguete',
    description: 'Actualiza la información de un juguete existente'
  })
  @ApiParam({ name: 'id', description: 'ID del juguete (UUID)' })
  @ApiBody({ type: UpdateToyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juguete actualizado exitosamente',
    type: ToyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Juguete no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateToyDto: UpdateToyDto,
  ): Promise<ToyResponseDto> {
    return this.toysService.update(id, updateToyDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar juguete',
    description: 'Elimina un juguete del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del juguete (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juguete eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Juguete no encontrado',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.toysService.remove(id);
    return { message: 'Juguete eliminado exitosamente' };
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Asignar juguete a mi cuenta',
    description: 'Asigna un juguete existente a mi cuenta de usuario usando MAC address'
  })
  @ApiBody({ type: AssignToyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juguete asignado exitosamente',
    type: AssignToyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Juguete con el MAC address especificado no encontrado',
  })
  async assignToy(
    @Body() assignToyDto: AssignToyDto,
    @CurrentUser() user: User,
  ): Promise<AssignToyResponseDto> {
    // Agregar userId del usuario autenticado
    return this.toysService.assignToy({
      ...assignToyDto,
      userId: user.id,
    });
  }

  @Patch('connection/:macAddress')
  @ApiOperation({
    summary: 'Actualizar estado de conexión del juguete',
    description: 'Actualiza el estado de conexión, batería y señal del juguete usando MAC address'
  })
  @ApiParam({ name: 'macAddress', description: 'MAC address del juguete (formato: XX:XX:XX:XX:XX:XX)' })
  @ApiBody({ type: UpdateConnectionStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado actualizado exitosamente',
    type: ToyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Juguete no encontrado',
  })
  async updateConnectionStatus(
    @Param('macAddress') macAddress: string,
    @Body() updateStatusDto: UpdateConnectionStatusDto,
  ): Promise<ToyResponseDto> {
    return this.toysService.updateConnectionStatus(
      macAddress,
      updateStatusDto.status,
      updateStatusDto.batteryLevel,
      updateStatusDto.signalStrength,
    );
  }
}
