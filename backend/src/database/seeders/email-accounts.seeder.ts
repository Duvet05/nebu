import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EmailProvider, EmailProviderType, EmailProviderStatus } from '../../email/entities/email-provider.entity';
import { EmailAccount, EmailAccountType, EmailAccountStatus } from '../../email/entities/email-account.entity';

const logger = new Logger('EmailAccountsSeeder');

/**
 * Seed Email Providers and Accounts
 *
 * Creates email configuration for Flow-telligence business emails:
 * - admin@flow-telligence.com
 * - contacto@flow-telligence.com
 * - facturacion@flow-telligence.com
 * - info@flow-telligence.com
 * - soporte@flow-telligence.com
 * - ventas@flow-telligence.com
 */
export async function seedEmailAccounts(dataSource: DataSource) {
  logger.log('📧 Seeding Email Providers and Accounts...');

  const providerRepo = dataSource.getRepository(EmailProvider);
  const accountRepo = dataSource.getRepository(EmailAccount);

  try {
    // Check if provider already exists
    let provider = await providerRepo.findOne({ where: { name: 'Resend' } });

    if (!provider) {
      logger.log('  → Creating Resend email provider...');
      provider = providerRepo.create({
        name: 'Resend',
        host: 'smtp.resend.com',
        port: 587,
        secure: true,
        type: EmailProviderType.SMTP,
        status: EmailProviderStatus.ACTIVE,
        description: 'Resend email service provider for Flow-telligence',
        priority: 1,
        dailyLimit: 10000, // Adjust based on your Resend plan
        sentToday: 0,
        config: {
          apiKey: process.env.RESEND_API_KEY || '',
          fromDomain: 'flow-telligence.com',
        },
      });
      await providerRepo.save(provider);
      logger.log('  ✅ Resend provider created');
    } else {
      logger.log('  ℹ️ Resend provider already exists');
    }

    // Email accounts configuration
    const emailConfigs = [
      {
        email: 'admin@flow-telligence.com',
        fromName: 'Flow-telligence Admin',
        type: EmailAccountType.ADMIN,
        description: 'Administrative emails and system notifications',
        dailyLimit: 1000,
      },
      {
        email: 'contacto@flow-telligence.com',
        fromName: 'Flow-telligence Contacto',
        type: EmailAccountType.TEAM,
        description: 'General contact and inquiries',
        dailyLimit: 2000,
      },
      {
        email: 'facturacion@flow-telligence.com',
        fromName: 'Flow-telligence Facturación',
        type: EmailAccountType.TEAM,
        description: 'Billing and invoicing',
        dailyLimit: 1000,
      },
      {
        email: 'info@flow-telligence.com',
        fromName: 'Flow-telligence Info',
        type: EmailAccountType.MARKETING,
        description: 'General information and announcements',
        dailyLimit: 3000,
      },
      {
        email: 'soporte@flow-telligence.com',
        fromName: 'Flow-telligence Soporte',
        type: EmailAccountType.SUPPORT,
        description: 'Customer support and technical assistance',
        dailyLimit: 2000,
      },
      {
        email: 'ventas@flow-telligence.com',
        fromName: 'Flow-telligence Ventas',
        type: EmailAccountType.TEAM,
        description: 'Sales inquiries and pre-orders',
        dailyLimit: 2000,
      },
    ];

    // Create or update email accounts
    for (const config of emailConfigs) {
      const existing = await accountRepo.findOne({ where: { email: config.email } });

      if (!existing) {
        logger.log(`  → Creating ${config.email}...`);
        const account = accountRepo.create({
          ...config,
          password: '', // Password will be managed via Resend API key
          status: EmailAccountStatus.ACTIVE,
          providerId: provider.id,
          sentToday: 0,
          config: {
            useApiKey: true, // Using Resend API instead of SMTP credentials
          },
        });
        await accountRepo.save(account);
        logger.log(`  ✅ ${config.email} created`);
      } else {
        logger.log(`  ℹ️ ${config.email} already exists`);
      }
    }

    logger.log('✅ Email accounts seeding completed');
  } catch (error) {
    logger.error('❌ Error seeding email accounts:', error);
    throw error;
  }
}
