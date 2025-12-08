import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivityService } from '../services/activity.service';
import {
  CreateActivityDto,
  ActivityFiltersDto,
  ActivityListResponseDto,
} from '../dto/activity.dto';
import { Activity } from '../entities/activity.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('activities')
@Controller('activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new activity log entry',
    description: 'Logs a user activity such as voice commands, interactions, or connections.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Activity logged successfully',
    type: Activity,
  })
  async create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
    return this.activityService.create(createActivityDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get activities with filters and pagination',
    description:
      'Retrieves activity logs with optional filters. userId is required. Supports pagination.',
  })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID (UUID)' })
  @ApiQuery({
    name: 'toyId',
    required: false,
    description: 'Filter by Toy ID (UUID)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by activity type',
    enum: [
      'voice_command',
      'connection',
      'interaction',
      'update',
      'error',
      'play',
      'sleep',
      'wake',
      'chat',
    ],
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter from date (ISO 8601)',
    example: '2024-12-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter to date (ISO 8601)',
    example: '2024-12-08T23:59:59Z',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
    example: 50,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activities retrieved successfully',
    type: ActivityListResponseDto,
  })
  async findAll(@Query() filters: ActivityFiltersDto): Promise<ActivityListResponseDto> {
    return this.activityService.findAll(filters);
  }

  @Get('stats/:userId')
  @ApiOperation({
    summary: 'Get activity statistics for a user',
    description: 'Retrieves activity statistics including totals, by type, and recent counts.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalActivities: { type: 'number', example: 150 },
        byType: {
          type: 'object',
          additionalProperties: { type: 'number' },
          example: { voice_command: 50, connection: 30, interaction: 70 },
        },
        last24Hours: { type: 'number', example: 15 },
        last7Days: { type: 'number', example: 45 },
      },
    },
  })
  async getStats(@Param('userId') userId: string) {
    return this.activityService.getStatsByUser(userId);
  }
}
