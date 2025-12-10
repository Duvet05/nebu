import { Controller, Get, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateNewsletterLeadDto, CreatePreOrderLeadDto } from './dto/create-lead.dto';
import { Lead } from './entities/lead.entity';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Newsletter subscription endpoint (public)
   */
  @Public()
  @Post('newsletter')
  @HttpCode(HttpStatus.CREATED)
  async subscribeNewsletter(@Body() dto: CreateNewsletterLeadDto): Promise<{ success: boolean; message: string }> {
    await this.leadsService.createNewsletterLead(dto);
    return {
      success: true,
      message: 'Suscripción exitosa al newsletter',
    };
  }

  /**
   * Pre-order lead endpoint (public)
   */
  @Public()
  @Post('pre-order')
  @HttpCode(HttpStatus.CREATED)
  async createPreOrderLead(@Body() dto: CreatePreOrderLeadDto): Promise<{ success: boolean; message: string }> {
    await this.leadsService.createPreOrderLead(dto);
    return {
      success: true,
      message: 'Pre-orden registrada exitosamente',
    };
  }

  /**
   * Get all leads (admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get()
  async findAll(): Promise<Lead[]> {
    return this.leadsService.findAll();
  }
}
