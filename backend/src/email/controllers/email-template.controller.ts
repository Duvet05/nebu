import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { EmailTemplateService } from '../services/email-template.service';
import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';
import { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from '../entities/email-template.entity';
import { TemplateContext } from '../services/template-engine.service';

@ApiTags('Email Templates')
@Controller('email-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
@ApiBearerAuth()
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva plantilla de email' })
  @ApiBody({ type: CreateEmailTemplateDto })
  @ApiResponse({
    status: 201,
    description: 'Plantilla creada exitosamente',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 400, description: 'Datos de plantilla inválidos' })
  async create(@Body() createEmailTemplateDto: CreateEmailTemplateDto) {
    return this.emailTemplateService.create(createEmailTemplateDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar plantillas de email' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: EmailTemplateType,
    description: 'Filtrar por tipo de plantilla',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EmailTemplateStatus,
    description: 'Filtrar por estado de plantilla',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrar por plantillas activas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de plantillas obtenida exitosamente',
    type: [EmailTemplate],
  })
  async findAll(
    @Query('type') type?: EmailTemplateType,
    @Query('status') status?: EmailTemplateStatus,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.emailTemplateService.findAll(type, status, isActive);
  }

  @Get('types')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tipos de plantillas disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Tipos de plantillas obtenidos exitosamente',
  })
  async getTemplateTypes() {
    return this.emailTemplateService.getTemplateTypes();
  }

  @Get('statuses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener estados de plantillas disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Estados de plantillas obtenidos exitosamente',
  })
  async getTemplateStatuses() {
    return this.emailTemplateService.getTemplateStatuses();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una plantilla de email por ID' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla' })
  @ApiResponse({
    status: 200,
    description: 'Plantilla obtenida exitosamente',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.emailTemplateService.findOne(id);
  }

  @Get('name/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una plantilla de email por nombre' })
  @ApiParam({ name: 'name', description: 'Nombre de la plantilla' })
  @ApiResponse({
    status: 200,
    description: 'Plantilla obtenida exitosamente',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  async findByName(@Param('name') name: string) {
    return this.emailTemplateService.findByName(name);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una plantilla de email' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla' })
  @ApiBody({ type: UpdateEmailTemplateDto })
  @ApiResponse({
    status: 200,
    description: 'Plantilla actualizada exitosamente',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 400, description: 'Datos de plantilla inválidos' })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto,
  ) {
    return this.emailTemplateService.update(id, updateEmailTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una plantilla de email' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla' })
  @ApiResponse({
    status: 204,
    description: 'Plantilla eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  async remove(@Param('id') id: string) {
    await this.emailTemplateService.remove(id);
  }

  @Get('variables')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener variables disponibles para plantillas' })
  @ApiResponse({
    status: 200,
    description: 'Variables disponibles obtenidas exitosamente',
  })
  async getAvailableVariables() {
    return this.emailTemplateService.getAvailableVariables();
  }

  @Get('variables/:category')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener variables por categoría' })
  @ApiParam({ name: 'category', description: 'Categoría de variables (user, course, system, payment, custom)' })
  @ApiResponse({
    status: 200,
    description: 'Variables de la categoría obtenidas exitosamente',
  })
  async getVariablesByCategory(@Param('category') category: string) {
    return this.emailTemplateService.getVariablesByCategory(category);
  }

  @Post(':name/render')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renderizar una plantilla con contexto' })
  @ApiParam({ name: 'name', description: 'Nombre de la plantilla' })
  @ApiBody({
    description: 'Contexto para renderizar la plantilla',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        course: { type: 'object' },
        system: { type: 'object' },
        payment: { type: 'object' },
        custom: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla renderizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string' },
        content: { type: 'string' },
        htmlContent: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Plantilla no activa o datos inválidos' })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  async renderTemplate(
    @Param('name') name: string,
    @Body() context: TemplateContext,
  ) {
    return this.emailTemplateService.renderTemplate(name, context);
  }

  @Post(':name/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar preview de una plantilla con contexto' })
  @ApiParam({ name: 'name', description: 'Nombre de la plantilla' })
  @ApiBody({
    description: 'Contexto para generar el preview',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        course: { type: 'object' },
        system: { type: 'object' },
        payment: { type: 'object' },
        custom: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Preview generado exitosamente',
    schema: {
      type: 'object',
      properties: {
        rendered: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            content: { type: 'string' },
            htmlContent: { type: 'string' },
          },
        },
        usedVariables: { type: 'array', items: { type: 'string' } },
        missingVariables: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  async generatePreview(
    @Param('name') name: string,
    @Body() context: TemplateContext,
  ) {
    return this.emailTemplateService.generatePreview(name, context);
  }
}
