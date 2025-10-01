import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyService } from '../services/company.service';

@ApiTags('company')
@Controller('company-info')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener información de contacto de la empresa' })
  @ApiResponse({
    status: 200,
    description: 'Información de la empresa obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email de contacto' },
        phone: { type: 'string', description: 'Teléfono de contacto' },
        whatsapp: { type: 'string', description: 'Número de WhatsApp' },
        calendly: { type: 'string', description: 'URL de Calendly' },
        address: { type: 'string', description: 'Dirección física' },
        socialMedia: {
          type: 'object',
          properties: {
            facebook: { type: 'string' },
            twitter: { type: 'string' },
            linkedin: { type: 'string' },
            instagram: { type: 'string' },
          },
        },
      },
    },
  })
  async getCompanyInfo() {
    return this.companyService.getCompanyInfo();
  }
}
