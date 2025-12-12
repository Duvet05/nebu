import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailAccount } from '../entities/email-account.entity';

/**
 * Service for managing email accounts
 */
@Injectable()
export class EmailAccountService {
  private readonly logger = new Logger(EmailAccountService.name);

  constructor(
    @InjectRepository(EmailAccount)
    private readonly emailAccountRepository: Repository<EmailAccount>,
  ) {}

  /**
   * Find an email account by email address
   */
  async findByEmail(email: string): Promise<EmailAccount | null> {
    this.logger.log(`Looking for email account: ${email}`);

    const account = await this.emailAccountRepository.findOne({
      where: { email },
      relations: ['provider'],
    });

    if (!account) {
      this.logger.warn(`Email account not found: ${email}`);
      return null;
    }

    return account;
  }

  /**
   * Find all active email accounts
   */
  async findAllActive(): Promise<EmailAccount[]> {
    return this.emailAccountRepository.find({
      where: { isActive: true },
      relations: ['provider'],
    });
  }

  /**
   * Find an email account by ID
   */
  async findById(id: string): Promise<EmailAccount> {
    const account = await this.emailAccountRepository.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!account) {
      throw new NotFoundException(`Email account with ID ${id} not found`);
    }

    return account;
  }

  /**
   * Create a new email account
   */
  async create(data: Partial<EmailAccount>): Promise<EmailAccount> {
    const account = this.emailAccountRepository.create(data);
    return this.emailAccountRepository.save(account);
  }

  /**
   * Update an email account
   */
  async update(id: string, data: Partial<EmailAccount>): Promise<EmailAccount> {
    const account = await this.findById(id);
    Object.assign(account, data);
    return this.emailAccountRepository.save(account);
  }

  /**
   * Delete an email account
   */
  async delete(id: string): Promise<void> {
    const account = await this.findById(id);
    await this.emailAccountRepository.remove(account);
  }
}
