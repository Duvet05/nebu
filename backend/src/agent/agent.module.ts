import { Module } from '@nestjs/common';
import { LiveKitModule } from '../livekit/livekit.module';
import { AgentController } from './agent.controller';
import { AgentMonitorService } from './agent-monitor.service';

@Module({
  imports: [LiveKitModule],
  controllers: [AgentController],
  providers: [AgentMonitorService],
  exports: [AgentMonitorService],
})
export class AgentModule {}
