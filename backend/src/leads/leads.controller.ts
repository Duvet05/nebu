import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateNewsletterLeadDto, CreatePreOrderLeadDto } from './dto/create-lead.dto';
import { Lead } from './entities/lead.entity';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Newsletter subscription endpoint (public)
   */
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
   * Get all leads (admin only - would need auth guard)
   */
  @Get()
  async findAll(): Promise<Lead[]> {
    return this.leadsService.findAll();
  }
}
