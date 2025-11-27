import { Module } from '@nestjs/common';
import { HealthController, HealthService } from './controllers/health.controller';
import { InternalController } from './controllers/internal.controller';

@Module({
  controllers: [HealthController, InternalController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
