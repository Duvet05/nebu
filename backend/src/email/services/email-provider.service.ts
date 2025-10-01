import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailProvider, EmailProviderType, EmailProviderStatus } from '../entities/email-provider.entity';
import { EmailAccount, EmailAccountType, EmailAccountStatus } from '../entities/email-account.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmailProviderService {
  constructor(
    @InjectRepository(EmailProvider)
    private emailProviderRepository: Repository<EmailProvider>,
    @InjectRepository(EmailAccount)
    private emailAccountRepository: Repository<EmailAccount>,
  ) {}

  // ===== PROVIDER MANAGEMENT =====

  async createProvider(data: {
    name: string;
    host: string;
    port: number;
    secure: boolean;
    type: EmailProviderType;
    description?: string;
    dailyLimit?: number;
    priority?: number;
  }): Promise<EmailProvider> {
    const provider = this.emailProviderRepository.create({
      ...data,
      status: EmailProviderStatus.ACTIVE,
    });

    return await this.emailProviderRepository.save(provider);
  }

  async getProviders(): Promise<EmailProvider[]> {
    return await this.emailProviderRepository.find({
      relations: ['accounts'],
      order: { priority: 'ASC' },
    });
  }

  async getActiveProviders(): Promise<EmailProvider[]> {
    return await this.emailProviderRepository.find({
      where: { status: EmailProviderStatus.ACTIVE },
      relations: ['accounts'],
      order: { priority: 'ASC' },
    });
  }

  async getProviderById(id: string): Promise<EmailProvider> {
    const provider = await this.emailProviderRepository.findOne({
      where: { id },
      relations: ['accounts'],
    });

    if (!provider) {
      throw new NotFoundException('Proveedor de correo no encontrado');
    }

    return provider;
  }

  async updateProvider(id: string, data: Partial<EmailProvider>): Promise<EmailProvider> {
    const provider = await this.getProviderById(id);
    
    Object.assign(provider, data);
    return await this.emailProviderRepository.save(provider);
  }

  async deleteProvider(id: string): Promise<void> {
    const provider = await this.getProviderById(id);
    
    // Verificar que no tenga cuentas asociadas
    const accountCount = await this.emailAccountRepository.count({
      where: { providerId: id },
    });

    if (accountCount > 0) {
      throw new BadRequestException('No se puede eliminar un proveedor con cuentas asociadas');
    }

    await this.emailProviderRepository.remove(provider);
  }

  // ===== ACCOUNT MANAGEMENT =====

  async createAccount(data: {
    email: string;
    password: string;
    fromName: string;
    type: EmailAccountType;
    providerId: string;
    description?: string;
    dailyLimit?: number;
  }): Promise<EmailAccount> {
    // Verificar que el proveedor existe
    await this.getProviderById(data.providerId);

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const account = this.emailAccountRepository.create({
      ...data,
      password: hashedPassword,
    });

    return await this.emailAccountRepository.save(account);
  }

  async getAccounts(): Promise<EmailAccount[]> {
    return await this.emailAccountRepository.find({
      relations: ['provider'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAccountById(id: string): Promise<EmailAccount> {
    const account = await this.emailAccountRepository.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!account) {
      throw new NotFoundException('Cuenta de correo no encontrada');
    }

    return account;
  }

  async getAccountByType(type: EmailAccountType): Promise<EmailAccount | null> {
    return await this.emailAccountRepository.findOne({
      where: { type, status: EmailAccountStatus.ACTIVE },
      relations: ['provider'],
    });
  }

  async updateAccount(id: string, data: Partial<EmailAccount>): Promise<EmailAccount> {
    const account = await this.getAccountById(id);
    
    // Si se actualiza la contraseña, encriptarla
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    Object.assign(account, data);
    return await this.emailAccountRepository.save(account);
  }

  async deleteAccount(id: string): Promise<void> {
    const account = await this.getAccountById(id);
    await this.emailAccountRepository.remove(account);
  }

  // ===== ROUTING LOGIC =====

  async getAccountForType(type: EmailAccountType): Promise<EmailAccount> {
    // Buscar cuenta específica para el tipo
    let account = await this.getAccountByType(type);
    
    if (!account) {
      // Si no hay cuenta específica, usar la cuenta por defecto
      account = await this.getAccountByType(EmailAccountType.TEAM);
    }

    if (!account) {
      throw new NotFoundException(`No hay cuenta de correo disponible para el tipo: ${type}`);
    }

    return account;
  }

  async getBestProvider(): Promise<EmailProvider> {
    const providers = await this.getActiveProviders();
    
    if (providers.length === 0) {
      throw new NotFoundException('No hay proveedores de correo activos');
    }

    // Filtrar proveedores que no hayan alcanzado su límite
    const availableProviders = providers.filter(provider => !provider.hasReachedLimit);
    
    if (availableProviders.length === 0) {
      throw new BadRequestException('Todos los proveedores han alcanzado su límite diario');
    }

    // Retornar el de mayor prioridad (menor número)
    return availableProviders[0];
  }

  // ===== QUOTA MANAGEMENT =====

  async resetDailyQuotas(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Resetear contadores de proveedores
    await this.emailProviderRepository
      .createQueryBuilder()
      .update(EmailProvider)
      .set({ 
        sentToday: 0,
        lastResetDate: today,
      })
      .where('lastResetDate < :today OR lastResetDate IS NULL', { today })
      .execute();

    // Resetear contadores de cuentas
    await this.emailAccountRepository
      .createQueryBuilder()
      .update(EmailAccount)
      .set({ 
        sentToday: 0,
        lastResetDate: today,
      })
      .where('lastResetDate < :today OR lastResetDate IS NULL', { today })
      .execute();
  }

  async incrementSentCount(accountId: string): Promise<void> {
    const account = await this.getAccountById(accountId);
    
    // Incrementar contador de la cuenta
    account.sentToday += 1;
    account.lastUsedAt = new Date();
    await this.emailAccountRepository.save(account);

    // Incrementar contador del proveedor
    const provider = await this.getProviderById(account.providerId);
    provider.sentToday += 1;
    await this.emailProviderRepository.save(provider);
  }
}

