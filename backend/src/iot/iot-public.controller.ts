import {
  Controller,
  Get,
  Patch,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IoTService } from './iot.service';
import { DeviceTokenResponseDto, DeviceHeartbeatDto } from './dto/device-token.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('iot')
@Controller('iot')
export class IoTPublicController {
  private readonly logger = new Logger(IoTPublicController.name);

  constructor(private readonly iotService: IoTService) {}

  /**
   * ENDPOINT UNIFICADO: Obtener token LiveKit para dispositivos IoT
   *
   * GET /api/v1/iot/device/token?device_id=ESP32_xxx&getMetadata=true
   *
   * Este endpoint reemplaza tanto /device/token como /esp32/token
   * Soporta métricas opcionales del dispositivo (firmware, batería, señal)
   * Puede incluir metadata del usuario/niño si getMetadata=true
   */
  @Public()
  @Get('device/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get LiveKit access token for IoT device',
    description: 'Unified endpoint for all IoT devices (ESP32, etc.) to obtain LiveKit tokens. Supports optional device metrics and user/toy metadata.'
  })
  @ApiQuery({ name: 'device_id', required: true, description: 'Device ID (MAC address or unique identifier)', example: 'ESP32_8CBFEA877D0C' })
  @ApiQuery({ name: 'getMetadata', required: false, description: 'Include user and toy metadata', type: Boolean, example: false })
  @ApiQuery({ name: 'firmware_version', required: false, description: 'Device firmware version', example: '1.0.0' })
  @ApiQuery({ name: 'battery_level', required: false, description: 'Battery level (0-100)', type: Number, example: 85 })
  @ApiQuery({ name: 'signal_strength', required: false, description: 'WiFi signal strength', type: Number, example: -45 })
  @ApiResponse({
    status: 200,
    description: 'LiveKit session created and token generated successfully',
    type: DeviceTokenResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid device ID' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getDeviceToken(
    @Query('device_id') deviceId: string,
    @Query('getMetadata', new ParseBoolPipe({ optional: true })) getMetadata?: boolean,
    @Query('firmware_version') firmwareVersion?: string,
    @Query('battery_level') batteryLevel?: number,
    @Query('signal_strength') signalStrength?: number,
  ): Promise<DeviceTokenResponseDto> {
    this.logger.log('📱 IoT Device Token Request');
    this.logger.log(`  Device ID: ${deviceId}`);
    this.logger.log(`  Get Metadata: ${getMetadata || false}`);
    if (firmwareVersion) this.logger.log(`  Firmware: ${firmwareVersion}`);
    if (batteryLevel) this.logger.log(`  Battery: ${batteryLevel}%`);
    if (signalStrength) this.logger.log(`  Signal: ${signalStrength}dBm`);

    try {
      // ALWAYS use ESP32 optimized method to ensure room is created with metadata
      // This allows the agent to read toy prompts and personalization data
      const livekitResult = await this.iotService.getESP32Token(deviceId, {
        firmwareVersion,
        batteryLevel,
        signalStrength,
      });

      this.logger.log('✅ LiveKit Session Created');
      this.logger.log(`  Room: ${livekitResult.room_name}`);

      const response: DeviceTokenResponseDto = {
        access_token: livekitResult.access_token,
        room_name: livekitResult.room_name,
        expires_in: livekitResult.expires_in,
        server_url: livekitResult.server_url,
        participant_identity: deviceId,
      };

      // Include metadata if requested
      if (getMetadata) {
        const metadata = await this.iotService.getDeviceMetadata(deviceId);
        if (metadata) {
          response.metadata = metadata;
          this.logger.log('📦 Metadata included in response');
        }
      }

      return response;
    } catch (error) {
      this.logger.error('❌ Failed to create LiveKit session');
      this.logger.error(`  Error: ${error.message}`);
      this.logger.error(`  Device ID: ${deviceId}`);
      throw error;
    }
  }

  /**
   * ENDPOINT UNIFICADO: Heartbeat del dispositivo IoT
   *
   * PATCH /api/v1/iot/device/heartbeat
   *
   * Los dispositivos envían heartbeats periódicos para:
   * - Mantener el estado como "online"
   * - Reportar métricas (batería, señal, temperatura, etc.)
   * - Detectar desconexiones
   */
  @Public()
  @Patch('device/heartbeat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Record device heartbeat with metrics',
    description: 'Unified endpoint for all IoT devices to send heartbeat signals and update metrics.'
  })
  @ApiResponse({
    status: 200,
    description: 'Heartbeat recorded successfully',
  })
  async recordHeartbeat(@Body() dto: DeviceHeartbeatDto): Promise<{ status: string; timestamp: string }> {
    this.logger.debug(`💓 Heartbeat from device: ${dto.device_id}`);

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
