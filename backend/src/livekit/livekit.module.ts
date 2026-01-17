import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveKitService } from './livekit.service';
import { LiveKitController } from './livekit.controller';
import { LiveKitWebhookController } from './webhook.controller';
import { IoTDevice } from '../iot/entities/iot-device.entity';
import { Toy } from '../toys/entities/toy.entity';
import { VoiceSession } from '../voice/entities/voice-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IoTDevice, Toy, VoiceSession]),
  ],
  providers: [LiveKitService],
  controllers: [LiveKitController, LiveKitWebhookController],
  exports: [LiveKitService],
})
export class LiveKitModule {}
