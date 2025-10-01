import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
} from '@nestjs/swagger';
import { ToysService } from '../services/toys.service';
import { CreateToyDto } from '../dto/create-toy.dto';
import { AssignToyDto, AssignToyResponseDto } from '../dto/assign-toy.dto';
import { ToyResponseDto } from '../dto/toy-response.dto';
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
    description: 'Registra un nuevo juguete IoT con MAC address'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Juguete registrado exitosamente',
    type: ToyResponseDto,
  })
  async create(@Body() createToyDto: CreateToyDto): Promise<ToyResponseDto> {
    return this.toysService.create(createToyDto);
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

  @Post('assign')
  @ApiOperation({ 
    summary: 'Asignar juguete a mi cuenta',
    description: 'Asigna un juguete existente a mi cuenta de usuario'
  })
  @ApiBody({ type: AssignToyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juguete asignado exitosamente',
    type: AssignToyResponseDto,
  })
  async assignToy(@Body() assignToyDto: AssignToyDto): Promise<AssignToyResponseDto> {
    return this.toysService.assignToy(assignToyDto);
  }

  @Patch('connection/:macAddress')
  @ApiOperation({ 
    summary: 'Actualizar estado del juguete',
    description: 'Actualiza el estado de conexión, batería y señal del juguete'
  })
  @ApiParam({ name: 'macAddress', description: 'MAC address del juguete' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: Object.values(ToyStatus),
          description: 'Estado actual del juguete'
        },
        batteryLevel: { 
          type: 'string', 
          description: 'Nivel de batería (ej: "85%")',
          example: '85%'
        },
        signalStrength: { 
          type: 'string', 
          description: 'Fuerza de señal WiFi (ej: "-45dBm")',
          example: '-45dBm'
        },
      },
      required: ['status']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado actualizado exitosamente',
    type: ToyResponseDto,
  })
  async updateConnectionStatus(
    @Param('macAddress') macAddress: string,
    @Body() body: {
      status: ToyStatus;
      batteryLevel?: string;
      signalStrength?: string;
    },
  ): Promise<ToyResponseDto> {
    return this.toysService.updateConnectionStatus(
      macAddress,
      body.status,
      body.batteryLevel,
      body.signalStrength,
    );
  }
}
