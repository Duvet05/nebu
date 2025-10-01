import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, IsObject, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DeviceType, DeviceStatus } from '../entities/iot-device.entity';

export class CreateIoTDeviceDto {
  @ApiProperty({ description: 'Device name', example: 'Living Room Sensor' })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Type of IoT device',
    enum: ['sensor', 'actuator', 'camera', 'microphone', 'speaker', 'controller'],
    example: 'sensor'
  })
  @IsEnum(['sensor', 'actuator', 'camera', 'microphone', 'speaker', 'controller'])
  deviceType: DeviceType;

  @ApiProperty({ description: 'MAC address', example: '00:1B:44:11:3A:B7' })
  @IsNotEmpty()
  @IsString()
  macAddress: string;

  @ApiPropertyOptional({ description: 'IP address', example: '192.168.1.100' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ 
    description: 'Device status',
    enum: ['online', 'offline', 'error', 'maintenance'],
    example: 'offline'
  })
  @IsOptional()
  @IsEnum(['online', 'offline', 'error', 'maintenance'])
  status?: DeviceStatus;

  @ApiPropertyOptional({ description: 'Physical location', example: 'Living Room' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'User ID who owns this device' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'LiveKit room name' })
  @IsOptional()
  @IsString()
  roomName?: string;

  @ApiPropertyOptional({ description: 'Temperature in Celsius', example: 23.5 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Humidity percentage', example: 65.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity?: number;

  @ApiPropertyOptional({ description: 'Pressure in hPa', example: 1013.25 })
  @IsOptional()
  @IsNumber()
  pressure?: number;

  @ApiPropertyOptional({ description: 'Battery level percentage', example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Signal strength percentage', example: 78 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  signalStrength?: number;
}

export class UpdateIoTDeviceDto extends PartialType(CreateIoTDeviceDto) {}

export class IoTDeviceFilters {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by device status',
    enum: ['online', 'offline', 'error', 'maintenance']
  })
  @IsOptional()
  @IsEnum(['online', 'offline', 'error', 'maintenance'])
  status?: DeviceStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by device type',
    enum: ['sensor', 'actuator', 'camera', 'microphone', 'speaker', 'controller']
  })
  @IsOptional()
  @IsEnum(['sensor', 'actuator', 'camera', 'microphone', 'speaker', 'controller'])
  deviceType?: DeviceType;

  @ApiPropertyOptional({ description: 'Filter by location (partial match)' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateSensorDataDto {
  @ApiPropertyOptional({ description: 'Temperature in Celsius' })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Humidity percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity?: number;

  @ApiPropertyOptional({ description: 'Pressure in hPa' })
  @IsOptional()
  @IsNumber()
  pressure?: number;

  @ApiPropertyOptional({ description: 'Battery level percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Signal strength percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  signalStrength?: number;
}

export class UpdateDeviceStatusDto {
  @ApiProperty({ 
    description: 'New device status',
    enum: ['online', 'offline', 'error', 'maintenance']
  })
  @IsEnum(['online', 'offline', 'error', 'maintenance'])
  status: DeviceStatus;
}
