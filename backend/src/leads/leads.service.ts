  import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadTemperature } from './entities/lead.entity';
import { LeadSource } from './entities/lead-source.entity';
import { LeadStatus } from './entities/lead-status.entity';
import { CreateLeadDto, CreateNewsletterLeadDto, CreatePreOrderLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(LeadSource)
    private readonly leadSourceRepository: Repository<LeadSource>,
    @InjectRepository(LeadStatus)
    private readonly leadStatusRepository: Repository<LeadStatus>,
  ) {}

  /**
   * Create a general lead
   */
  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    try {
      // Find or create lead source
      let leadSource = await this.leadSourceRepository.findOne({
        where: { code: createLeadDto.leadSource },
      });

      if (!leadSource) {
        leadSource = this.leadSourceRepository.create({
          code: createLeadDto.leadSource,
          name: this.getSourceName(createLeadDto.leadSource),
          active: true,
        });
        await this.leadSourceRepository.save(leadSource);
      }

      // Get "New" status
      let newStatus = await this.leadStatusRepository.findOne({
        where: { name: 'New' },
      });

      if (!newStatus) {
        newStatus = this.leadStatusRepository.create({
          name: 'New',
          code: 'NEW',
          description: 'Nuevo lead sin contactar',
          order: 0,
          active: true,
          isFinal: false,
          color: '#3B82F6',
        });
        await this.leadStatusRepository.save(newStatus);
      }

      // Check if lead already exists
      const existingLead = await this.leadRepository.findOne({
        where: { email: createLeadDto.email },
      });

      if (existingLead) {
        // Update existing lead
        existingLead.score = createLeadDto.score || existingLead.score;
        existingLead.temperature = createLeadDto.temperature || existingLead.temperature;
        if (createLeadDto.firstName) existingLead.firstName = createLeadDto.firstName;
        if (createLeadDto.lastName) existingLead.lastName = createLeadDto.lastName;
        if (createLeadDto.phone) existingLead.phone = createLeadDto.phone;
        if (createLeadDto.company) existingLead.company = createLeadDto.company;
        if (createLeadDto.metadata) {
          existingLead.metadata = {
            ...existingLead.metadata,
            ...createLeadDto.metadata,
          };
        }

        await this.leadRepository.save(existingLead);
        this.logger.log(`Updated existing lead: ${existingLead.email}`);
        return existingLead;
      }

      // Create new lead
      const lead = this.leadRepository.create({
        email: createLeadDto.email,
        firstName: createLeadDto.firstName,
        lastName: createLeadDto.lastName,
        phone: createLeadDto.phone,
        company: createLeadDto.company,
        leadSource,
        leadStatus: newStatus,
        temperature: createLeadDto.temperature || LeadTemperature.COLD,
        score: createLeadDto.score || 0,
        metadata: createLeadDto.metadata,
      });

      const savedLead = await this.leadRepository.save(lead);
      this.logger.log(`Created new lead: ${savedLead.email} from ${createLeadDto.leadSource}`);

      return savedLead;
    } catch (error) {
      this.logger.error(`Failed to create lead: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a newsletter subscription lead
   */
  async createNewsletterLead(dto: CreateNewsletterLeadDto): Promise<Lead> {
    return this.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      leadSource: 'NEWSLETTER' as any,
      temperature: LeadTemperature.WARM,
      score: 20,
      metadata: {
        source: 'website_newsletter',
        subscribedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a pre-order lead
   */
  async createPreOrderLead(dto: CreatePreOrderLeadDto): Promise<Lead> {
    return this.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      leadSource: 'PRE_ORDER' as any,
      temperature: LeadTemperature.HOT,
      score: 80,
      metadata: {
        source: 'website_pre_order',
        productSlug: dto.productSlug,
        requestedAt: new Date().toISOString(),
        ...dto.metadata,
      },
    });
  }

  /**
   * Find all leads
   */
  async findAll(): Promise<Lead[]> {
    return this.leadRepository.find({
      relations: ['leadSource', 'leadStatus'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find lead by email
   */
  async findByEmail(email: string): Promise<Lead | null> {
    return this.leadRepository.findOne({
      where: { email },
      relations: ['leadSource', 'leadStatus'],
    });
  }

  /**
   * Get lead source name
   */
  private getSourceName(code: string): string {
    const sourceNames: Record<string, string> = {
      WEBSITE: 'Website Form',
      NEWSLETTER: 'Newsletter',
      PRE_ORDER: 'Pre-order',
      FACEBOOK: 'Facebook',
      INSTAGRAM: 'Instagram',
      WHATSAPP: 'WhatsApp',
      REFERRAL: 'Referral',
      OTHER: 'Other',
    };
    return sourceNames[code] || code;
  }
}
