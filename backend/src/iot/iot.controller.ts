import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IoTService } from './iot.service';
import {
  CreateIoTDeviceDto,
  UpdateIoTDeviceDto,
  IoTDeviceFilters,
  UpdateSensorDataDto,
  UpdateDeviceStatusDto,
} from './dto/iot-device.dto';
import { IoTDevice } from './entities/iot-device.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('iot')
@Controller('iot')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IoTController {
  constructor(private readonly iotService: IoTService) {}

  @Post('devices')
  @ApiOperation({ summary: 'Create a new IoT device' })
  @ApiResponse({ status: 201, description: 'Device created successfully', type: IoTDevice })
  async create(@Body() createIoTDeviceDto: CreateIoTDeviceDto): Promise<IoTDevice> {
    return this.iotService.create(createIoTDeviceDto);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get all IoT devices with optional filters' })
  @ApiResponse({ status: 200, description: 'List of devices', type: [IoTDevice] })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by device status' })
  @ApiQuery({ name: 'deviceType', required: false, description: 'Filter by device type' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location' })
  async findAll(@Query() filters: IoTDeviceFilters): Promise<IoTDevice[]> {
    return this.iotService.findAll(filters);
  }

  @Get('devices/metrics')
  @ApiOperation({ summary: 'Get IoT devices metrics and statistics' })
  @ApiResponse({ status: 200, description: 'Device metrics' })
  async getMetrics() {
    return this.iotService.getDeviceMetrics();
  }

  @Get('devices/online')
  @ApiOperation({ summary: 'Get all online devices' })
  @ApiResponse({ status: 200, description: 'List of online devices', type: [IoTDevice] })
  async getOnlineDevices(): Promise<IoTDevice[]> {
    return this.iotService.getOnlineDevices();
  }

  @Get('devices/user/:userId')
  @ApiOperation({ summary: 'Get devices by user ID' })
  @ApiResponse({ status: 200, description: 'List of user devices', type: [IoTDevice] })
  async getDevicesByUser(@Param('userId') userId: string): Promise<IoTDevice[]> {
    return this.iotService.getDevicesByUser(userId);
  }

  @Get('devices/:id')
  @ApiOperation({ summary: 'Get a specific IoT device' })
  @ApiResponse({ status: 200, description: 'Device details', type: IoTDevice })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async findOne(@Param('id') id: string): Promise<IoTDevice> {
    return this.iotService.findOne(id);
  }

  @Patch('devices/:id')
  @ApiOperation({ summary: 'Update an IoT device' })
  @ApiResponse({ status: 200, description: 'Device updated successfully', type: IoTDevice })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async update(
    @Param('id') id: string,
    @Body() updateIoTDeviceDto: UpdateIoTDeviceDto,
  ): Promise<IoTDevice> {
    return this.iotService.update(id, updateIoTDeviceDto);
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an IoT device' })
  @ApiResponse({ status: 204, description: 'Device deleted successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.iotService.remove(id);
  }

  @Patch('devices/:id/status')
  @ApiOperation({ summary: 'Update device status' })
  @ApiResponse({ status: 200, description: 'Device status updated', type: IoTDevice })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateDeviceStatusDto,
  ): Promise<IoTDevice> {
    return this.iotService.updateDeviceStatus(id, updateStatusDto.status);
  }

  @Patch('devices/:id/sensor-data')
  @ApiOperation({ summary: 'Update device sensor data' })
  @ApiResponse({ status: 200, description: 'Sensor data updated', type: IoTDevice })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async updateSensorData(
    @Param('id') id: string,
    @Body() sensorData: UpdateSensorDataDto,
  ): Promise<IoTDevice> {
    return this.iotService.updateSensorData(id, sensorData);
  }

  @Post('devices/:id/livekit-token')
  @ApiOperation({ summary: 'Generate LiveKit token for device' })
  @ApiResponse({ status: 200, description: 'LiveKit token generated' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async generateLiveKitToken(@Param('id') id: string) {
    return this.iotService.generateLiveKitTokenForDevice(id);
  }

  @Post('maintenance/offline-inactive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark inactive devices as offline (maintenance endpoint)' })
  @ApiResponse({ status: 200, description: 'Inactive devices marked as offline' })
  async markInactiveDevicesOffline(): Promise<{ message: string }> {
    await this.iotService.markDeviceOfflineIfInactive();
    return { message: 'Inactive devices have been marked as offline' };
  }

}
