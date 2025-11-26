import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Toy, ToyStatus } from '../entities/toy.entity';
import { CreateToyDto } from '../dto/create-toy.dto';
import { UpdateToyDto } from '../dto/update-toy.dto';
import { AssignToyDto, AssignToyResponseDto } from '../dto/assign-toy.dto';
import { ToyResponseDto, ToyListResponseDto } from '../dto/toy-response.dto';
import { User } from '../../users/entities/user.entity';
import { IoTDevice } from '../../iot/entities/iot-device.entity';

@Injectable()
export class ToysService {
  constructor(
    @InjectRepository(Toy)
    private readonly toyRepository: Repository<Toy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(IoTDevice)
    private readonly iotDeviceRepository: Repository<IoTDevice>,
  ) {}

  /**
   * Crear un nuevo juguete con macAddress o deviceId
   * @param createToyDto - Datos del juguete con macAddress o deviceId
   * @param userId - ID del usuario (opcional, se obtiene del JWT en el controller)
   */
  async create(createToyDto: CreateToyDto, userId?: string): Promise<ToyResponseDto> {
    // Validar que venga al menos uno
    if (!createToyDto.macAddress && !createToyDto.deviceId) {
      throw new BadRequestException('Debe proporcionar macAddress o deviceId');
    }

    // 1. Buscar o crear IoTDevice por MAC address o Device ID
    let iotDevice: IoTDevice;
    
    if (createToyDto.deviceId) {
      // Buscar por Device ID (ESP32 BLE)
      iotDevice = await this.iotDeviceRepository.findOne({
        where: { deviceId: createToyDto.deviceId },
      });

      if (!iotDevice) {
        // Crear nuevo IoTDevice con Device ID
        iotDevice = this.iotDeviceRepository.create({
          name: createToyDto.name,
          deviceId: createToyDto.deviceId,
          deviceType: 'controller',
          status: 'offline',
          userId: userId || null,
        });
        iotDevice = await this.iotDeviceRepository.save(iotDevice);
      }
    } else {
      // Buscar por MAC address (flujo legacy)
      const normalizedMacAddress = this.normalizeMacAddress(createToyDto.macAddress);
      iotDevice = await this.iotDeviceRepository.findOne({
        where: { macAddress: normalizedMacAddress },
      });

      if (!iotDevice) {
        // Crear nuevo IoTDevice con MAC address
        iotDevice = this.iotDeviceRepository.create({
          name: createToyDto.name,
          macAddress: normalizedMacAddress,
          deviceType: 'controller',
          status: 'offline',
          userId: userId || null,
        });
        iotDevice = await this.iotDeviceRepository.save(iotDevice);
      }
    }

    // 2. Verificar si ya existe un toy con este IoTDevice
    const existingToy = await this.toyRepository.findOne({
      where: { iotDeviceId: iotDevice.id },
    });

    if (existingToy) {
      const identifier = iotDevice.deviceId || iotDevice.macAddress;
      throw new ConflictException(
        `Ya existe un juguete registrado con el dispositivo ${identifier}`
      );
    }

    // 3. Verificar usuario si se proporciona
    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }
    }

    // 4. Crear el juguete
    const toy = this.toyRepository.create({
      name: createToyDto.name,
      model: createToyDto.model,
      manufacturer: createToyDto.manufacturer,
      status: createToyDto.status || ToyStatus.INACTIVE,
      firmwareVersion: createToyDto.firmwareVersion,
      capabilities: createToyDto.capabilities,
      settings: createToyDto.settings,
      notes: createToyDto.notes,
      iotDeviceId: iotDevice.id,
      userId: userId || null,
      activatedAt: createToyDto.status === ToyStatus.ACTIVE ? new Date() : null,
    });

    const savedToy = await this.toyRepository.save(toy);

    // Cargar relaciones antes de mapear
    const toyWithRelations = await this.toyRepository.findOne({
      where: { id: savedToy.id },
      relations: ['user', 'iotDevice'],
    });

    return this.mapToyToResponseDto(toyWithRelations);
  }

  /**
   * Obtener todos los juguetes con paginación y filtros
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: ToyStatus,
    userId?: string,
    search?: string,
  ): Promise<ToyListResponseDto> {
    const queryBuilder = this.toyRepository
      .createQueryBuilder('toy')
      .leftJoinAndSelect('toy.user', 'user')
      .leftJoinAndSelect('toy.iotDevice', 'iotDevice')
      .orderBy('toy.createdAt', 'DESC');

    // Aplicar filtros
    if (status) {
      queryBuilder.andWhere('toy.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('toy.userId = :userId', { userId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(toy.name ILIKE :search OR toy.model ILIKE :search OR toy.manufacturer ILIKE :search OR iotDevice.macAddress ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [toys, total] = await queryBuilder.getManyAndCount();

    return {
      toys: toys.map(toy => this.mapToyToResponseDto(toy)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un juguete por ID
   */
  async findOne(id: string): Promise<ToyResponseDto> {
    const toy = await this.toyRepository.findOne({
      where: { id },
      relations: ['user', 'iotDevice'],
    });

    if (!toy) {
      throw new NotFoundException(`Juguete con ID ${id} no encontrado`);
    }

    return this.mapToyToResponseDto(toy);
  }

  /**
   * Obtener un juguete por MAC address
   */
  async findByMacAddress(macAddress: string): Promise<ToyResponseDto> {
    const normalizedMacAddress = this.normalizeMacAddress(macAddress);

    const toy = await this.toyRepository.findOne({
      where: {
        iotDevice: { macAddress: normalizedMacAddress }
      },
      relations: ['user', 'iotDevice'],
    });

    if (!toy) {
      throw new NotFoundException(`Juguete con MAC address ${normalizedMacAddress} no encontrado`);
    }

    return this.mapToyToResponseDto(toy);
  }

  /**
   * Obtener juguetes de un usuario específico
   */
  async findByUserId(userId: string): Promise<ToyResponseDto[]> {
    const toys = await this.toyRepository.find({
      where: { userId },
      relations: ['user', 'iotDevice'],
      order: { createdAt: 'DESC' },
    });

    return toys.map(toy => this.mapToyToResponseDto(toy));
  }

  /**
   * Actualizar un juguete
   */
  async update(id: string, updateToyDto: UpdateToyDto): Promise<ToyResponseDto> {
    const toy = await this.toyRepository.findOne({
      where: { id },
      relations: ['iotDevice', 'user']
    });

    if (!toy) {
      throw new NotFoundException(`Juguete con ID ${id} no encontrado`);
    }

    // MAC address no se puede actualizar directamente, se maneja via IoTDevice

    // Verificar usuario si se está actualizando
    if (updateToyDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateToyDto.userId },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${updateToyDto.userId} no encontrado`);
      }
    }

    // Manejar cambio de estado
    if (updateToyDto.status && updateToyDto.status !== toy.status) {
      if (updateToyDto.status === ToyStatus.ACTIVE && !toy.activatedAt) {
        updateToyDto.activatedAt = new Date().toISOString();
      }
    }

    // Convertir strings de fecha a Date objects
    if (updateToyDto.lastSeenAt) {
      updateToyDto.lastSeenAt = new Date(updateToyDto.lastSeenAt).toISOString();
    }
    if (updateToyDto.activatedAt) {
      updateToyDto.activatedAt = new Date(updateToyDto.activatedAt).toISOString();
    }

    await this.toyRepository.update(id, updateToyDto);
    const updatedToy = await this.toyRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    return this.mapToyToResponseDto(updatedToy);
  }

  /**
   * Eliminar un juguete
   */
  async remove(id: string): Promise<void> {
    const toy = await this.toyRepository.findOne({ where: { id } });

    if (!toy) {
      throw new NotFoundException(`Juguete con ID ${id} no encontrado`);
    }

    await this.toyRepository.remove(toy);
  }

  /**
   * Asignar juguete a un usuario usando macAddress
   */
  async assignToy(assignToyDto: AssignToyDto): Promise<AssignToyResponseDto> {
    const normalizedMacAddress = this.normalizeMacAddress(assignToyDto.macAddress);

    // Buscar toy por MAC address
    const toy = await this.toyRepository.findOne({
      where: {
        iotDevice: { macAddress: normalizedMacAddress }
      },
      relations: ['user', 'iotDevice'],
    });

    if (!toy) {
      throw new NotFoundException(
        `Juguete con MAC address ${normalizedMacAddress} no encontrado`
      );
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: assignToyDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${assignToyDto.userId} no encontrado`);
    }

    // Actualizar el toy
    toy.userId = assignToyDto.userId;
    if (assignToyDto.toyName) {
      toy.name = assignToyDto.toyName;
    }

    await this.toyRepository.save(toy);

    return {
      success: true,
      message: 'Juguete asignado exitosamente al usuario',
      toy: this.mapToyToResponseDto(toy),
    };
  }

  /**
   * Actualizar estado de conexión de un juguete (usado por dispositivos IoT)
   */
  async updateConnectionStatus(
    macAddress: string,
    status: ToyStatus,
    batteryLevel?: string,
    signalStrength?: string,
  ): Promise<ToyResponseDto> {
    const normalizedMacAddress = this.normalizeMacAddress(macAddress);

    const toy = await this.toyRepository.findOne({
      where: {
        iotDevice: { macAddress: normalizedMacAddress }
      },
      relations: ['user', 'iotDevice'],
    });

    if (!toy) {
      throw new NotFoundException(`Juguete con MAC address ${normalizedMacAddress} no encontrado`);
    }

    const updateData: Partial<Toy> = {
      status,
      lastSeenAt: new Date(),
    };

    if (batteryLevel) {
      updateData.batteryLevel = batteryLevel;
    }

    if (signalStrength) {
      updateData.signalStrength = signalStrength;
    }

    await this.toyRepository.update(toy.id, updateData);

    const updatedToy = await this.toyRepository.findOne({
      where: { id: toy.id },
      relations: ['user'],
    });

    return this.mapToyToResponseDto(updatedToy);
  }

  /**
   * Obtener estadísticas de juguetes
   */
  async getStatistics() {
    const totalToys = await this.toyRepository.count();
    
    const statusCounts = await this.toyRepository
      .createQueryBuilder('toy')
      .select('toy.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('toy.status')
      .getRawMany();

    const assignedToys = await this.toyRepository.count({
      where: { userId: Not(null) },
    });

    const unassignedToys = totalToys - assignedToys;

    return {
      total: totalToys,
      assigned: assignedToys,
      unassigned: unassignedToys,
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  /**
   * Normalizar MAC address a formato estándar (XX:XX:XX:XX:XX:XX)
   */
  private normalizeMacAddress(macAddress: string): string {
    // Remover cualquier carácter que no sea hexadecimal
    const cleaned = macAddress.replace(/[^0-9A-Fa-f]/g, '');
    
    // Verificar que tenga exactamente 12 caracteres
    if (cleaned.length !== 12) {
      throw new BadRequestException('MAC address debe tener exactamente 12 caracteres hexadecimales');
    }

    // Formatear como XX:XX:XX:XX:XX:XX
    return cleaned.match(/.{2}/g).join(':').toUpperCase();
  }

  /**
   * Mapear entidad Toy a ToyResponseDto
   */
  private mapToyToResponseDto(toy: Toy): ToyResponseDto {
    return {
      ...toy,
      macAddress: toy.iotDevice?.macAddress || toy.getMacAddress(),
      deviceId: toy.iotDevice?.deviceId || undefined,
      statusText: toy.getStatusText(),
      statusColor: toy.getStatusColor(),
      isActive: toy.isActive,
      isConnected: toy.isConnected,
      needsAttention: toy.needsAttention,
    };
  }
}
