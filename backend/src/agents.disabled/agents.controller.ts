import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('agents')
@Controller('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new agent profile' })
  @ApiResponse({ status: 201, description: 'Agent created' })
  async create(@Body() createDto: CreateAgentDto) {
    return this.agentsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List agent profiles' })
  @ApiResponse({ status: 200, description: 'List of agents' })
  async findAll() {
    return this.agentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an agent profile by id' })
  @ApiResponse({ status: 200, description: 'Agent profile' })
  async findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an agent profile' })
  @ApiResponse({ status: 200, description: 'Agent updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateAgentDto) {
    return this.agentsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an agent profile' })
  @ApiResponse({ status: 200, description: 'Agent deleted' })
  async remove(@Param('id') id: string) {
    await this.agentsService.remove(id);
    return { message: 'Agent deleted' };
  }
}
