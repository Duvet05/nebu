import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const device = await this.findOne(id);
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
    this.logger.log(`🔧 Generating LiveKit token for device: ${deviceId}`);

    // Buscar o crear el dispositivo por macAddress
    let device = await this.iotDeviceRepository.findOne({
      where: { macAddress: deviceId }
    });

    // Si no existe, crear un dispositivo básico
    if (!device) {
      this.logger.log(`📱 Device not found, creating new device: ${deviceId}`);
      device = this.iotDeviceRepository.create({
        name: `Device ${deviceId}`,
        macAddress: deviceId,
        deviceType: 'sensor',
        status: 'online',
        lastSeen: new Date(),
      });
      device = await this.iotDeviceRepository.save(device);
    } else {
      // Actualizar lastSeen
      device.lastSeen = new Date();
      device.status = 'online';
      await this.iotDeviceRepository.save(device);
    }

    // Generate unique room name for EACH request (like your friend's implementation)
    const roomName = `iot-device-${randomUUID()}`;

    // Always generate a new token with fresh timestamp and unique room
    const token = await this.livekitService.generateIoTToken(deviceId, roomName);

    this.logger.log(`✅ LiveKit token generated successfully for device: ${deviceId}`);
    this.logger.log(`🏠 Room: ${roomName}`);
    this.logger.log(`⏱️ TTL: 900 seconds`);
    this.logger.log(`🔄 NEW TOKEN GENERATED - Fresh timestamp: ${new Date().toISOString()}`);

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

}
