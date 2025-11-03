import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgentsRuntimeService } from './agents-runtime.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('agents-runtime')
@Controller('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentsRuntimeController {
  constructor(private readonly runtime: AgentsRuntimeService) {}

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply agent profile to runtime (local embed or webhook)' })
  async apply(@Param('id') id: string) {
    return this.runtime.applyAgentProfile(id);
  }
}
