import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IoTService } from './iot.service';
import { DeviceTokenRequestDto, DeviceTokenResponseDto } from './dto/device-token.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * DTOs adicionales para ESP32
 */
export class ESP32TokenRequestDto extends DeviceTokenRequestDto {
  firmware_version?: string;
  battery_level?: number;
  signal_strength?: number;
}

export class ESP32HeartbeatDto {
  device_id: string;
  battery_level?: number;
  signal_strength?: number;
  temperature?: number;
  cpu_usage?: number;
  memory_usage?: number;
}

@ApiTags('iot')
@Controller('iot')
export class ESP32TokenController {
  private readonly logger = new Logger(ESP32TokenController.name);

  constructor(private readonly iotService: IoTService) {}

  /**
   * ENDPOINT PRINCIPAL: Obtener token para ESP32
   *
   * POST /api/v1/iot/esp32/token
   *
   * El ESP32 llama a este endpoint al encenderse o reconectarse.
   * Retorna un nuevo room de LiveKit y token de acceso.
   *
   * Edge cases manejados:
   * - Primera conexión → Crear dispositivo y room
   * - Reconexión → Crear nuevo room (por diseño, cada request = nuevo room)
   * - Actualizar métricas del dispositivo
   */
  @Public()
  @Post('esp32/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate ESP32-optimized LiveKit token with session management' })
  @ApiResponse({
    status: 200,
    description: 'ESP32-optimized token generated successfully',
    type: DeviceTokenResponseDto,
  })
  async getESP32Token(@Body() dto: ESP32TokenRequestDto): Promise<DeviceTokenResponseDto> {
    this.logger.log(`🔧 ESP32 Token Request for Device: ${dto.device_id}`);
    this.logger.log(`   Time: ${new Date().toISOString()}`);
    this.logger.log(`   Firmware: ${dto.firmware_version || 'N/A'}`);
    this.logger.log(`   Battery: ${dto.battery_level || 'N/A'}%`);

    try {
      // Usar el nuevo método mejorado del IoTService
      const result = await this.iotService.getESP32Token(dto.device_id, {
        firmwareVersion: dto.firmware_version,
        batteryLevel: dto.battery_level,
        signalStrength: dto.signal_strength,
      });

      this.logger.log(`✅ Token generated successfully for ${dto.device_id}`);
      this.logger.log(`   Room: ${result.room_name}`);
      this.logger.log(`   Device: ${result.device_info?.device_name || 'Unknown'}`);

      return {
        access_token: result.access_token,
        room_name: result.room_name,
        expires_in: result.expires_in,
        server_url: result.server_url,
        participant_identity: result.participant_identity,
      };
    } catch (error) {
      this.logger.error(`❌ Failed to create ESP32 token for device: ${dto.device_id}`);
      this.logger.error(`   Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * ENDPOINT: Heartbeat del ESP32
   *
   * PATCH /api/v1/iot/esp32/heartbeat
   *
   * El ESP32 envía heartbeats cada 30-60 segundos para:
   * - Mantener el dispositivo como "online"
   * - Reportar métricas (batería, señal, temperatura, etc.)
   * - Detectar desconexiones
   */
  @Public()
  @Patch('esp32/heartbeat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record ESP32 heartbeat with device metrics' })
  @ApiResponse({
    status: 200,
    description: 'Heartbeat recorded successfully',
  })
  async recordHeartbeat(@Body() dto: ESP32HeartbeatDto): Promise<{ status: string; timestamp: string }> {
    this.logger.debug(`💓 Heartbeat from ESP32: ${dto.device_id}`);

    await this.iotService.recordDeviceHeartbeat(dto.device_id, {
      batteryLevel: dto.battery_level,
      signalStrength: dto.signal_strength,
      temperature: dto.temperature,
      cpuUsage: dto.cpu_usage,
      memoryUsage: dto.memory_usage,
    });

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
