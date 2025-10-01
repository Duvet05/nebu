import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceTokenRequestDto {
  @ApiProperty({
    description: 'Device ID (MAC address or unique identifier)',
    example: 'ESP32_AA:BB:CC:DD:EE:FF',
  })
  @IsString()
  @IsNotEmpty()
  device_id: string;
}

export class DeviceTokenResponseDto {
  @ApiProperty({
    description: 'LiveKit access token for real-time communication',
    example: 'eyJhbGciOiJIUzI1NiJ9.eyJtZXRhZGF0YSI6IntcInR5cGVcI...',
  })
  access_token: string;

  @ApiProperty({
    description: 'LiveKit room name where the device will connect',
    example: 'iot-device-a4538271-c9a3-43c8-8754-76fdd9a90520',
  })
  room_name: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900,
  })
  expires_in: number;

  @ApiProperty({
    description: 'LiveKit server URL',
    example: 'wss://brody-v541z1he.livekit.cloud',
  })
  server_url: string;

  @ApiProperty({
    description: 'Participant identity for LiveKit',
    example: 'ESP32_AA:BB:CC:DD:EE:FF',
  })
  participant_identity: string;
}
