import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessToken } from 'livekit-server-sdk';
import { DeviceTokenRequestDto, DeviceTokenResponseDto } from './dto/device-token.dto';

@ApiTags('iot')
@Controller('iot')
export class ESP32TokenController {
  private readonly logger = new Logger(ESP32TokenController.name);
  
  private readonly apiKey = process.env.LIVEKIT_API_KEY!;
  private readonly apiSecret = process.env.LIVEKIT_API_SECRET!;
  private readonly livekitUrl = process.env.LIVEKIT_URL!;

  @Post('esp32/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate ESP32-optimized LiveKit token' })
  @ApiResponse({
    status: 200,
    description: 'ESP32-optimized token generated successfully',
    type: DeviceTokenResponseDto,
  })
  async getESP32Token(@Body() deviceTokenRequest: DeviceTokenRequestDto): Promise<DeviceTokenResponseDto> {
    const { device_id } = deviceTokenRequest;
    
    this.logger.log(` ESP32 Token Request for Device: ${device_id}`);
    this.logger.log(` Request Time: ${new Date().toISOString()}`);

    try {
      // Generate room name
      const roomName = `esp32-${device_id.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
      
      // Create token with ESP32-specific configuration
      const at = new AccessToken(this.apiKey, this.apiSecret, {
        identity: device_id,
        ttl: 3600, // 1 hour for ESP32 devices
      });

      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        hidden: false,
      });

      const token = await at.toJwt();

      this.logger.log(` ESP32 Token generated successfully for ${device_id}`);
      this.logger.log(` Room: ${roomName}`);

      return {
        access_token: token,
        room_name: roomName,
        expires_in: 3600,
        server_url: this.livekitUrl,
        participant_identity: device_id,
      };

    } catch (error) {
      this.logger.error(` Failed to create ESP32 token for device: ${device_id}`);
      this.logger.error(` Error: ${error.message}`);
      throw error;
    }
  }
}
