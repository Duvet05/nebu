import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { Agent } from './entities/agent.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AgentsRuntimeService } from './runtime/agents-runtime.service';
import { AgentsRuntimeController } from './runtime/agents-runtime.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Agent]), HttpModule, ConfigModule],
  providers: [AgentsService, AgentsRuntimeService],
  controllers: [AgentsController, AgentsRuntimeController],
  exports: [AgentsService, AgentsRuntimeService],
})
export class AgentsModule {}
