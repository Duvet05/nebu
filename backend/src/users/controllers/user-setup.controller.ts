import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserSetupService } from '../services/user-setup.service';
import {
  CreateUserSetupDto,
  UpdateUserPreferencesDto,
  UserSetupResponseDto,
} from '../dto/user-setup.dto';
import { UserSetup } from '../entities/user-setup.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserSetupController {
  constructor(private readonly userSetupService: UserSetupService) {}

  @Post(':userId/setup')
  @ApiOperation({
    summary: 'Save Setup Wizard configuration',
    description:
      'Saves the complete setup configuration from the Setup Wizard. This operation is atomic (transaction-based).',
  })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Setup configuration saved successfully',
    type: UserSetupResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async createSetup(
    @Param('userId') userId: string,
    @Body() createSetupDto: CreateUserSetupDto,
  ): Promise<UserSetupResponseDto> {
    return this.userSetupService.createSetup(userId, createSetupDto);
  }

  @Get(':userId/setup')
  @ApiOperation({
    summary: 'Get user setup configuration',
    description:
      'Retrieves the setup configuration for a user. If no configuration exists, creates a default one.',
  })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Setup configuration retrieved successfully',
    type: UserSetup,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getSetup(@Param('userId') userId: string): Promise<UserSetup> {
    return this.userSetupService.getSetup(userId);
  }

  @Patch(':userId/preferences')
  @ApiOperation({
    summary: 'Update user preferences',
    description: 'Updates specific user preferences without affecting other setup data.',
  })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preferences updated successfully',
    type: UserSetup,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async updatePreferences(
    @Param('userId') userId: string,
    @Body() updatePreferencesDto: UpdateUserPreferencesDto,
  ): Promise<UserSetup> {
    return this.userSetupService.updatePreferences(userId, updatePreferencesDto);
  }
}
