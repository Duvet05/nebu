import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';
import { LeadSource } from './entities/lead-source.entity';
import { LeadStatus } from './entities/lead-status.entity';
import { LeadActivity } from './entities/lead-activity.entity';
import { Campaign } from './entities/campaign.entity';
import { Opportunity } from './entities/opportunity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      LeadSource,
      LeadStatus,
      LeadActivity,
      Campaign,
      Opportunity,
    ]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
