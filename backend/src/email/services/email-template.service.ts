import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from '../entities/email-template.entity';
import { TemplateEngineService, TemplateContext } from './template-engine.service';

export interface CreateEmailTemplateDto {
  name: string;
  subject: string;
  content: string;
  htmlContent?: string;
  type: EmailTemplateType;
  description?: string;
  variables?: string;
  css?: string;
  previewText?: string;
  metadata?: Record<string, any>;
}

export interface UpdateEmailTemplateDto {
  name?: string;
  subject?: string;
  content?: string;
  htmlContent?: string;
  type?: EmailTemplateType;
  status?: EmailTemplateStatus;
  description?: string;
  variables?: string;
  css?: string;
  previewText?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    private templateEngineService: TemplateEngineService,
  ) {}

  async create(createDto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    // Check if name already exists
    const existingTemplate = await this.emailTemplateRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingTemplate) {
      throw new BadRequestException('Template name already exists');
    }

    const template = this.emailTemplateRepository.create(createDto);
    return this.emailTemplateRepository.save(template);
  }

  async findAll(
    type?: EmailTemplateType,
    status?: EmailTemplateStatus,
    isActive?: boolean,
  ): Promise<EmailTemplate[]> {
    const query = this.emailTemplateRepository.createQueryBuilder('template');

    if (type) {
      query.andWhere('template.type = :type', { type });
    }

    if (status) {
      query.andWhere('template.status = :status', { status });
    }

    if (isActive !== undefined) {
      query.andWhere('template.isActive = :isActive', { isActive });
    }

    return query.orderBy('template.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async findByName(name: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { name },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async update(id: string, updateDto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const template = await this.findOne(id);

    // Check if new name already exists (if name is being updated)
    if (updateDto.name && updateDto.name !== template.name) {
      const existingTemplate = await this.emailTemplateRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingTemplate) {
        throw new BadRequestException('Template name already exists');
      }
    }

    Object.assign(template, updateDto);
    return this.emailTemplateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.emailTemplateRepository.remove(template);
  }

  async incrementUsage(id: string): Promise<void> {
    await this.emailTemplateRepository.increment({ id }, 'usageCount', 1);
    await this.emailTemplateRepository.update(id, { lastUsedAt: new Date() });
  }

  async getTemplateTypes(): Promise<EmailTemplateType[]> {
    return Object.values(EmailTemplateType);
  }

  async getTemplateStatuses(): Promise<EmailTemplateStatus[]> {
    return Object.values(EmailTemplateStatus);
  }

  async renderTemplate(
    templateName: string,
    context: TemplateContext,
  ): Promise<{ subject: string; content: string; htmlContent?: string }> {
    const template = await this.findByName(templateName);

    if (!template.isActive || template.status !== EmailTemplateStatus.ACTIVE) {
      throw new BadRequestException('Template is not active');
    }

    // Validate context variables
    const validation = this.templateEngineService.validateVariables(context as any);
    if (!validation.valid) {
      throw new BadRequestException(`Invalid template context: ${validation.errors.join(', ')}`);
    }

    // Increment usage count
    await this.incrementUsage(template.id);

    // Render templates using the advanced engine
    const subject = this.templateEngineService.renderTemplate(template.subject, context);
    const content = this.templateEngineService.renderTemplate(template.content, context);
    const htmlContent = template.htmlContent 
      ? this.templateEngineService.renderTemplate(template.htmlContent, context)
      : undefined;

    return {
      subject,
      content,
      htmlContent,
    };
  }

  async getAvailableVariables(): Promise<any[]> {
    return this.templateEngineService.getAvailableVariables();
  }

  async getVariablesByCategory(category: string): Promise<any[]> {
    return this.templateEngineService.getVariablesByCategory(category);
  }

  async generatePreview(
    templateName: string,
    context: TemplateContext,
  ): Promise<{
    rendered: { subject: string; content: string; htmlContent?: string };
    usedVariables: string[];
    missingVariables: string[];
  }> {
    const template = await this.findByName(templateName);

    const subjectPreview = this.templateEngineService.generateTemplatePreview(template.subject, context);
    const contentPreview = this.templateEngineService.generateTemplatePreview(template.content, context);
    const htmlContentPreview = template.htmlContent 
      ? this.templateEngineService.generateTemplatePreview(template.htmlContent, context)
      : null;

    const allUsedVariables = [
      ...subjectPreview.usedVariables,
      ...contentPreview.usedVariables,
      ...(htmlContentPreview?.usedVariables || []),
    ];

    const allMissingVariables = [
      ...subjectPreview.missingVariables,
      ...contentPreview.missingVariables,
      ...(htmlContentPreview?.missingVariables || []),
    ];

    return {
      rendered: {
        subject: subjectPreview.rendered,
        content: contentPreview.rendered,
        htmlContent: htmlContentPreview?.rendered,
      },
      usedVariables: [...new Set(allUsedVariables)],
      missingVariables: [...new Set(allMissingVariables)],
    };
  }
}
