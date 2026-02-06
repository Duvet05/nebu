import { Controller, Get, Delete, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentMonitorService } from './agent-monitor.service';
import {
  AgentHealthDto,
  AgentInfoDto,
  AgentSessionDto,
  AgentSessionDetailDto,
  AgentStatusDto,
} from './dto/agent.dto';

@ApiTags('agent')
@Controller('agent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentController {
  constructor(private readonly agentMonitor: AgentMonitorService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get agent health status (fast)' })
  @ApiResponse({ status: 200, description: 'Agent health status', type: AgentHealthDto })
  async getHealth(): Promise<AgentHealthDto> {
    return this.agentMonitor.getHealth();
  }

  @Get('health/full')
  @ApiOperation({ summary: 'Get full agent health check (validates all dependencies)' })
  @ApiResponse({ status: 200, description: 'Full agent health status', type: AgentHealthDto })
  async getFullHealth(): Promise<AgentHealthDto> {
    return this.agentMonitor.getFullHealth();
  }

  @Get('info')
  @ApiOperation({ summary: 'Get agent system information' })
  @ApiResponse({ status: 200, description: 'Agent info', type: AgentInfoDto })
  async getInfo(): Promise<AgentInfoDto> {
    return this.agentMonitor.getInfo();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get combined agent status (health + active sessions)' })
  @ApiResponse({ status: 200, description: 'Agent status with active sessions', type: AgentStatusDto })
  async getStatus(): Promise<AgentStatusDto> {
    return this.agentMonitor.getStatus();
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List active agent sessions (LiveKit rooms with iot-device- prefix)' })
  @ApiResponse({ status: 200, description: 'Active agent sessions', type: [AgentSessionDto] })
  async getActiveSessions(): Promise<AgentSessionDto[]> {
    return this.agentMonitor.getActiveSessions();
  }

  @Get('sessions/:roomName')
  @ApiOperation({ summary: 'Get details of a specific agent session' })
  @ApiParam({ name: 'roomName', description: 'LiveKit room name' })
  @ApiResponse({ status: 200, description: 'Session details with participants', type: AgentSessionDetailDto })
  async getSessionDetail(@Param('roomName') roomName: string): Promise<AgentSessionDetailDto> {
    return this.agentMonitor.getSessionDetail(roomName);
  }

  @Delete('sessions/:roomName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stop an agent session (deletes the LiveKit room)' })
  @ApiParam({ name: 'roomName', description: 'LiveKit room name to stop' })
  @ApiResponse({ status: 200, description: 'Session stopped successfully' })
  async stopSession(@Param('roomName') roomName: string): Promise<{ stopped: boolean; roomName: string }> {
    return this.agentMonitor.stopSession(roomName);
  }
}
