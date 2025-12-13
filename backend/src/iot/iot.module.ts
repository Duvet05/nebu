import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoTService } from './iot.service';
import { IoTController } from './iot.controller';
import { IoTPublicController } from './iot-public.controller';
import { IoTDevice } from './entities/iot-device.entity';
import { DeviceModel } from './entities/device-model.entity';
import { DeviceType } from './entities/device-type.entity';
import { DeviceCapability } from './entities/device-capability.entity';
import { FirmwareVersion } from './entities/firmware-version.entity';
import { CommonModule } from '../common/common.module';
import { LiveKitModule } from '../livekit/livekit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IoTDevice, DeviceModel, DeviceType, DeviceCapability, FirmwareVersion]),
    CommonModule,
    LiveKitModule,
    // JwtModule is already globally configured in app.module.ts
  ],
  providers: [IoTService],
  controllers: [
    IoTController,        // Admin endpoints (requires JWT)
    IoTPublicController,  // Public endpoints for devices (no JWT required)
  ],
  exports: [IoTService],
})
export class IoTModule {}
