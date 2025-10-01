import { Module } from '@nestjs/common';
import { LiveKitService } from './livekit.service';
import { LiveKitController } from './livekit.controller';
import { LiveKitWebhookController } from './webhook.controller';

@Module({
  providers: [LiveKitService],
  controllers: [LiveKitController, LiveKitWebhookController],
  exports: [LiveKitService],
})
export class LiveKitModule {}
