import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoTService } from './iot.service';
import { IoTController } from './iot.controller';
import { DeviceTokenController } from './device-token.controller';
import { IoTDevice } from './entities/iot-device.entity';
import { LiveKitModule } from '../livekit/livekit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IoTDevice]),
    LiveKitModule,
    // JwtModule is already globally configured in app.module.ts
  ],
  providers: [IoTService],
  controllers: [IoTController, DeviceTokenController],
  exports: [IoTService],
})
export class IoTModule {}
