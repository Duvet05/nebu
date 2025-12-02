import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoTService } from './iot.service';
import { IoTController } from './iot.controller';
import { DeviceTokenController } from './device-token.controller';
import { ESP32TokenController } from './esp32-token.controller';
import { IoTDevice } from './entities/iot-device.entity';
import { DeviceModel } from './entities/device-model.entity';
import { FirmwareVersion } from './entities/firmware-version.entity';
import { LiveKitModule } from '../livekit/livekit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IoTDevice, DeviceModel, FirmwareVersion]),
    LiveKitModule,
    // JwtModule is already globally configured in app.module.ts
  ],
  providers: [IoTService],
  controllers: [IoTController, DeviceTokenController, ESP32TokenController],
  exports: [IoTService],
})
export class IoTModule {}
