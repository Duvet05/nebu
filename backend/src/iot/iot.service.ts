import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { IoTDevice, DeviceStatus, DeviceType } from './entities/iot-device.entity';
import { LiveKitService } from '../livekit/livekit.service';
import { CreateIoTDeviceDto, UpdateIoTDeviceDto, IoTDeviceFilters } from './dto/iot-device.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class IoTService {
  private readonly logger = new Logger(IoTService.name);

  constructor(
    @InjectRepository(IoTDevice)
    private iotDeviceRepository: Repository<IoTDevice>,
    private livekitService: LiveKitService,
  ) {}

  async create(createIoTDeviceDto: CreateIoTDeviceDto): Promise<IoTDevice> {
    // Validar que no exista un dispositivo con el mismo macAddress o deviceId
    if (createIoTDeviceDto.macAddress) {
      const normalizedMac = IoTDevice.normalizeMacAddress(createIoTDeviceDto.macAddress);
      const existingByMac = await this.iotDeviceRepository.findOne({
        where: { macAddress: normalizedMac },
      });

      if (existingByMac) {
        throw new ConflictException(
          `Ya existe un dispositivo registrado con la dirección MAC: ${normalizedMac}`
        );
      }

      createIoTDeviceDto.macAddress = normalizedMac;

      // Si no se proporcionó deviceId, derivarlo de macAddress
      if (!createIoTDeviceDto.deviceId) {
        createIoTDeviceDto.deviceId = IoTDevice.deriveDeviceIdFromMac(normalizedMac);
      }
    }

    if (createIoTDeviceDto.deviceId) {
      const existingByDeviceId = await this.iotDeviceRepository.findOne({
        where: { deviceId: createIoTDeviceDto.deviceId },
      });

      if (existingByDeviceId) {
        throw new ConflictException(
          `Ya existe un dispositivo registrado con el deviceId: ${createIoTDeviceDto.deviceId}`
        );
      }
    }

    const device = this.iotDeviceRepository.create(createIoTDeviceDto);
    const savedDevice = await this.iotDeviceRepository.save(device);

    this.logger.log(`IoT device created: ${savedDevice.name} (${savedDevice.id})`);
    return savedDevice;
  }

  async findAll(filters: IoTDeviceFilters = {}): Promise<IoTDevice[]> {
    const query = this.iotDeviceRepository.createQueryBuilder('device');

    if (filters.userId) {
      query.andWhere('device.userId = :userId', { userId: filters.userId });
    }

    if (filters.status) {
      query.andWhere('device.status = :status', { status: filters.status });
    }

    if (filters.deviceType) {
      query.andWhere('device.deviceType = :deviceType', { deviceType: filters.deviceType });
    }

    if (filters.location) {
      query.andWhere('device.location ILIKE :location', { location: `%${filters.location}%` });
    }

    return query
      .orderBy('device.updatedAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<IoTDevice> {
    const device = await this.iotDeviceRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException(`IoT device with ID ${id} not found`);
    }
    return device;
  }

  async update(id: string, updateIoTDeviceDto: UpdateIoTDeviceDto): Promise<IoTDevice> {
    const device = await this.findOne(id);
    Object.assign(device, updateIoTDeviceDto);
    device.updatedAt = new Date();
    
    const updatedDevice = await this.iotDeviceRepository.save(device);
    this.logger.log(`IoT device updated: ${updatedDevice.name} (${updatedDevice.id})`);
    
    return updatedDevice;
  }

  async remove(id: string): Promise<void> {
    const device = await this.iotDeviceRepository.findOne({
      where: { id },
      relations: ['toy'],
    });

    if (!device) {
      throw new NotFoundException(`IoT device with ID ${id} not found`);
    }

    // Verificar que no tenga un Toy asignado activo
    if (device.toy && device.toy.userId) {
      throw new ConflictException(
        `Cannot delete IoT device: it is currently assigned to a Toy (${device.toy.name}). Please unassign the toy first.`
      );
    }

    await this.iotDeviceRepository.remove(device);
    this.logger.log(`IoT device removed: ${device.name} (${id})`);
  }

  async updateDeviceStatus(id: string, status: DeviceStatus): Promise<IoTDevice> {
    const device = await this.findOne(id);
    device.status = status;
    device.updateLastSeen();
    
    const updatedDevice = await this.iotDeviceRepository.save(device);
    this.logger.log(`Device ${device.name} status updated to: ${status}`);
    
    return updatedDevice;
  }

  async updateSensorData(id: string, sensorData: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    batteryLevel?: number;
    signalStrength?: number;
  }): Promise<IoTDevice> {
    const device = await this.findOne(id);
    device.updateSensorData(sensorData);
    
    const updatedDevice = await this.iotDeviceRepository.save(device);
    this.logger.log(`Sensor data updated for device: ${device.name}`);
    
    return updatedDevice;
  }

  async getDevicesByUser(userId: string): Promise<IoTDevice[]> {
    return this.iotDeviceRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' }
    });
  }

  async getOnlineDevices(): Promise<IoTDevice[]> {
    return this.iotDeviceRepository.find({
      where: { status: 'online' },
      order: { lastSeen: 'DESC' }
    });
  }

  async getDevicesByType(deviceType: DeviceType): Promise<IoTDevice[]> {
    return this.iotDeviceRepository.find({
      where: { deviceType },
      order: { updatedAt: 'DESC' }
    });
  }

  async generateLiveKitTokenForDevice(deviceId: string): Promise<{
    token: string;
    roomName: string;
    participantName: string;
    livekitUrl: string;
  }> {
    this.logger.log(` Generating LiveKit token for device: ${deviceId}`);

    // Buscar el dispositivo por deviceId
    const device = await this.iotDeviceRepository.findOne({
      where: { deviceId }
    });

    // Si no existe, lanzar excepción
    if (!device) {
      this.logger.error(` Device not found: ${deviceId}`);
      throw new NotFoundException(`Device with ID ${deviceId} not found. Please register the device first.`);
    }

    // Actualizar lastSeen
    device.lastSeen = new Date();
    device.status = 'online';
    await this.iotDeviceRepository.save(device);

    // Generate unique room name for EACH request (like your friend's implementation)
    const roomName = `iot-device-${randomUUID()}`;

    // Always generate a new token with fresh timestamp and unique room
    const token = await this.livekitService.generateIoTToken(deviceId, roomName);

    this.logger.log(`LiveKit token generated successfully for device: ${deviceId}`);
    this.logger.log(` Room: ${roomName}`);
    this.logger.log(`⏱️ TTL: 900 seconds`);
    this.logger.log(` NEW TOKEN GENERATED - Fresh timestamp: ${new Date().toISOString()}`);

    return {
      token,
      roomName,
      participantName: deviceId, // Use device_id directly as participant name
      livekitUrl: process.env.LIVEKIT_URL!,
    };
  }

  async getDeviceMetrics(): Promise<{
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    devicesByType: Record<DeviceType, number>;
    averageBatteryLevel: number;
  }> {
    const [devices, totalDevices] = await this.iotDeviceRepository.findAndCount();
    
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const offlineDevices = totalDevices - onlineDevices;
    
    const devicesByType = devices.reduce((acc, device) => {
      acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<DeviceType, number>);

    const devicesWithBattery = devices.filter(d => d.batteryLevel !== null && d.batteryLevel !== undefined);
    const averageBatteryLevel = devicesWithBattery.length > 0
      ? devicesWithBattery.reduce((sum, d) => sum + d.batteryLevel!, 0) / devicesWithBattery.length
      : 0;

    return {
      totalDevices,
      onlineDevices,
      offlineDevices,
      devicesByType,
      averageBatteryLevel: Math.round(averageBatteryLevel * 100) / 100,
    };
  }

  async markDeviceOfflineIfInactive(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const result = await this.iotDeviceRepository
      .createQueryBuilder()
      .update(IoTDevice)
      .set({ status: 'offline' })
      .where('status = :status', { status: 'online' })
      .andWhere('lastSeen < :threshold', { threshold: fiveMinutesAgo })
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log(`Marked ${result.affected} devices as offline due to inactivity`);
    }
  }

  /**
   * MÉTODO MEJORADO: getESP32Token con gestión inteligente de sesiones
   *
   * Edge Cases manejados:
   * 1. Primera conexión → Crear nuevo room único
   * 2. Reconexión rápida (< 5 min) → Crear nuevo room (por diseño)
   * 3. Device no existe → Crear automáticamente
   * 4. Actualizar métricas del dispositivo
   */
  async getESP32Token(
    deviceId: string,
    metadata?: {
      firmwareVersion?: string;
      batteryLevel?: number;
      signalStrength?: number;
    },
  ): Promise<{
    access_token: string;
    room_name: string;
    expires_in: number;
    server_url: string;
    participant_identity: string;
    device_info?: any;
  }> {
    this.logger.log(`🔧 ESP32 Token Request from device: ${deviceId}`);

    // 1. Buscar o crear el dispositivo por deviceId
    let device = await this.iotDeviceRepository.findOne({
      where: { deviceId },
    });

    if (!device) {
      this.logger.log(`📱 Device not found, creating new device: ${deviceId}`);
      device = this.iotDeviceRepository.create({
        name: `ESP32-${deviceId.substring(0, 8)}`,
        deviceId: deviceId,
        deviceType: 'controller' as DeviceType,
        status: 'online' as DeviceStatus,
        lastSeen: new Date(),
        batteryLevel: metadata?.batteryLevel,
        signalStrength: metadata?.signalStrength,
      });
      device = await this.iotDeviceRepository.save(device);
    } else {
      // 2. Actualizar información del dispositivo
      device.lastSeen = new Date();
      device.status = 'online' as DeviceStatus;

      if (metadata?.batteryLevel !== undefined) {
        device.batteryLevel = metadata.batteryLevel;
      }
      if (metadata?.signalStrength !== undefined) {
        device.signalStrength = metadata.signalStrength;
      }

      await this.iotDeviceRepository.save(device);
      this.logger.log(`📱 Device updated: ${device.name} (last seen: ${device.lastSeen.toISOString()})`);
    }

    // 3. Generar nombre de room único (un nuevo room por cada request)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const roomName = `iot-device-${deviceId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${timestamp}-${random}`;

    // 4. Obtener metadata del toy/owner para configurar el agente
    const toyMetadata = await this.getDeviceMetadata(deviceId);

    // 5. Crear room en LiveKit con metadata del agente
    try {
      await this.livekitService.createRoom(roomName, {
        maxParticipants: 10,
        emptyTimeout: 300, // 5 minutos cuando está vacío
        metadata: JSON.stringify({
          // Metadata técnica del device
          deviceId,
          deviceName: device.name,
          createdAt: new Date().toISOString(),
          firmwareVersion: metadata?.firmwareVersion,
          // Metadata del agente (prompt, toy_name, owner_name, etc.)
          ...(toyMetadata || {}),
        }),
      });
      this.logger.log(`🏠 Room created: ${roomName}`);
      if (toyMetadata) {
        this.logger.log(`📦 Agent metadata included: ${toyMetadata.toy_name || 'N/A'} for ${toyMetadata.owner_name || 'N/A'}`);
      }
    } catch (error) {
      // Room ya existe (poco probable con UUID), solo log
      this.logger.warn(`⚠️  Room ${roomName} already exists or error: ${error.message}`);
    }

    // 6. Generar token de acceso para el ESP32
    const token = await this.livekitService.generateIoTToken(deviceId, roomName);

    this.logger.log(`✅ ESP32 Token generated successfully`);
    this.logger.log(`   Device: ${device.name}`);
    this.logger.log(`   Room: ${roomName}`);
    this.logger.log(`   TTL: 3600 seconds (1 hour)`);
    this.logger.log(`   Battery: ${device.batteryLevel || 'N/A'}%`);
    this.logger.log(`   Signal: ${device.signalStrength || 'N/A'} dBm`);

    return {
      access_token: token,
      room_name: roomName,
      expires_in: 3600, // 1 hora para ESP32
      server_url: process.env.LIVEKIT_URL!,
      participant_identity: deviceId,
      device_info: {
        device_id: device.id,
        device_name: device.name,
        status: device.status,
        battery_level: device.batteryLevel,
        signal_strength: device.signalStrength,
      },
    };
  }

  /**
   * CRON JOB: Limpiar rooms vacíos de LiveKit cada 10 minutos
   *
   * Busca rooms que:
   * - No tienen participantes
   * - Llevan más de 15 minutos vacíos
   * - Pertenecen a dispositivos IoT (room name empieza con "iot-device-")
   */
  @Cron('*/10 * * * *') // Cada 10 minutos
  async cleanupEmptyESP32Rooms(): Promise<void> {
    this.logger.log('🧹 Running cleanup of empty IoT device rooms...');

    try {
      // Obtener todos los rooms de LiveKit
      const rooms = await this.livekitService.listRooms();

      let cleanedCount = 0;

      for (const room of rooms) {
        // Solo procesar rooms de dispositivos IoT
        if (!room.name.startsWith('iot-device-')) {
          continue;
        }

        // Verificar si el room está vacío
        const participants = await this.livekitService.listParticipants(room.name);

        if (participants.length === 0) {
          // Calcular tiempo vacío
          const roomCreatedAt = new Date(room.creationTime * 1000);
          const emptyDuration = Date.now() - roomCreatedAt.getTime();
          const emptyMinutes = emptyDuration / (1000 * 60);

          // Si lleva más de 15 minutos vacío, eliminar
          if (emptyMinutes > 15) {
            this.logger.log(
              `🗑️  Deleting empty room: ${room.name} (empty for ${emptyMinutes.toFixed(1)} min)`,
            );

            await this.livekitService.deleteRoom(room.name);
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        this.logger.log(`✅ Cleanup completed: ${cleanedCount} empty rooms deleted`);
      } else {
        this.logger.log('✅ Cleanup completed: No empty rooms to delete');
      }
    } catch (error) {
      this.logger.error('❌ Error during empty rooms cleanup:', error);
    }
  }

  /**
   * Registrar heartbeat de un dispositivo IoT
   */
  async recordDeviceHeartbeat(
    deviceId: string,
    metrics?: {
      batteryLevel?: number;
      signalStrength?: number;
      temperature?: number;
      cpuUsage?: number;
      memoryUsage?: number;
    },
  ): Promise<void> {
    const device = await this.iotDeviceRepository.findOne({
      where: { deviceId },
    });

    if (!device) {
      this.logger.warn(`Heartbeat from unknown device: ${deviceId}`);
      return;
    }

    // Actualizar last seen y métricas
    device.lastSeen = new Date();
    device.status = 'online' as DeviceStatus;

    if (metrics?.batteryLevel !== undefined) {
      device.batteryLevel = metrics.batteryLevel;
    }
    if (metrics?.signalStrength !== undefined) {
      device.signalStrength = metrics.signalStrength;
    }
    if (metrics?.temperature !== undefined) {
      device.temperature = metrics.temperature;
    }

    await this.iotDeviceRepository.save(device);

    this.logger.debug(`💓 Heartbeat received from ${device.name}`);
  }

  /**
   * Get device metadata including user/child and toy information
   */
  async getDeviceMetadata(deviceId: string): Promise<any> {
    this.logger.log(`📦 Fetching metadata for device: ${deviceId}`);

    // Find device with toy, owner (person), and user relationships
    const device = await this.iotDeviceRepository.findOne({
      where: { deviceId },
      relations: ['toy', 'toy.owner', 'toy.user', 'toy.productCatalog'],
    });

    if (!device) {
      this.logger.warn(`Device not found: ${deviceId}`);
      return null;
    }

    if (!device.toy) {
      this.logger.warn(`Device ${deviceId} has no toy assigned`);
      return null;
    }

    const toy = device.toy;
    const owner = toy.owner; // The specific Person (child) who owns the toy
    const user = toy.user;   // The User account (parent)

    if (!owner && !user) {
      this.logger.warn(`Toy ${toy.id} has no owner or user assigned`);
      return null;
    }

    // Build metadata object
    // owner_name: Use the owner's name if available, otherwise fallback to user data
    const metadata: any = {
      owner_name: owner?.firstName || user?.person?.firstName || user?.username || 'Unknown',
      agent_prompt: toy.prompt || 'Eres un asistente amigable que ayuda a niños a aprender y divertirse.',
    };

    // Add optional fields from owner (person) metadata/preferences
    if (owner?.metadata?.interests) {
      metadata.owner_interests = owner.metadata.interests;
    }
    if (owner?.metadata?.learning_goals) {
      metadata.learning_goals = owner.metadata.learning_goals;
    }
    if (owner?.preferredLanguage) {
      metadata.preferred_language = owner.preferredLanguage;
    }
    if (owner?.timezone) {
      metadata.timezone = owner.timezone;
    }
    if (toy.name) {
      metadata.toy_name = toy.name;
    }
    if (toy.model) {
      metadata.toy_model = toy.model;
    }
    if (owner?.age) {
      metadata.owner_age = owner.age;
    }

    this.logger.log(`✅ Metadata retrieved for device ${deviceId}`);
    return metadata;
  }

  /**
   * Asignar un Toy existente a un dispositivo IoT
   * 
   * Este método vincula un juguete (Toy) con un dispositivo IoT físico,
   * permitiendo que el agente de IA use el prompt configurado en el Toy.
   * 
   * @param deviceId - deviceId del dispositivo IoT (ej: "ESP32_AABBCCDDEEFF")
   * @param toyId - UUID del Toy a asignar
   * @returns El dispositivo IoT actualizado con el Toy asignado
   */
  async assignToyToDevice(deviceId: string, toyId: string): Promise<IoTDevice> {
    this.logger.log(`🔗 Assigning Toy ${toyId} to device ${deviceId}`);

    // 1. Buscar el dispositivo IoT por deviceId
    const device = await this.iotDeviceRepository.findOne({
      where: { deviceId },
      relations: ['toy'],
    });

    if (!device) {
      throw new NotFoundException(`IoT device with deviceId ${deviceId} not found`);
    }

    // 2. Verificar que el Toy existe y no esté ya asignado a otro dispositivo
    const toyRepository = this.iotDeviceRepository.manager.getRepository('Toy');
    const toy = await toyRepository.findOne({
      where: { id: toyId },
      relations: ['iotDevice'],
    });

    if (!toy) {
      throw new NotFoundException(`Toy with ID ${toyId} not found`);
    }

    // 3. Verificar que el Toy no esté ya asignado a otro dispositivo
    if (toy.iotDevice && toy.iotDevice.id !== device.id) {
      throw new ConflictException(
        `Toy ${toy.name} is already assigned to another device (${toy.iotDevice.name})`
      );
    }

    // 4. Asignar el Toy al dispositivo
    device.toy = toy;
    toy.iotDevice = device;
    toy.iotDeviceId = device.id;

    // 5. Guardar cambios
    await this.iotDeviceRepository.save(device);
    await toyRepository.save(toy);

    this.logger.log(`✅ Toy "${toy.name}" assigned to device "${device.name}" (${deviceId})`);
    this.logger.log(`   Prompt configurado: ${toy.prompt ? 'Sí' : 'No (usará fallback)'}`);

    // 6. Retornar el dispositivo actualizado con las relaciones cargadas
    return this.iotDeviceRepository.findOne({
      where: { id: device.id },
      relations: ['toy', 'toy.owner', 'toy.user'],
    });
  }

}
