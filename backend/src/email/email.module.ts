import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { EmailProvider } from './entities/email-provider.entity';
import { EmailAccount } from './entities/email-account.entity';
import { EmailLog } from './entities/email-log.entity';
import { EmailTemplate } from './entities/email-template.entity';

// Services
import { EmailProviderService } from './services/email-provider.service';
import { EmailService } from './services/email.service';
import { EmailTemplateService } from './services/email-template.service';
import { TemplateEngineService } from './services/template-engine.service';

// Controllers
import { EmailController } from './controllers/email.controller';
// import { EmailTestController } from './controllers/email-test.controller'; // Disabled for production
import { EmailRealController } from './controllers/email-real.controller';
import { EmailTemplateController } from './controllers/email-template.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      EmailProvider,
      EmailAccount,
      EmailLog,
      EmailTemplate,
    ]),
  ],
  providers: [
    EmailProviderService,
    EmailService,
    EmailTemplateService,
    TemplateEngineService,
  ],
  controllers: [
    EmailController,
    // EmailTestController, // Disabled for production
    EmailRealController,
    EmailTemplateController,
  ],
  exports: [
    EmailProviderService,
    EmailService,
    EmailTemplateService,
    TemplateEngineService,
  ],
})
export class EmailModule {}
