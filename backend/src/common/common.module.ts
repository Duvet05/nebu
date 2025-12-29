import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Activity } from './entities/activity.entity';
import { ActivityService } from './services/activity.service';
import { ActivityController } from './controllers/activity.controller';
import { DuplicateRequestGuard } from './guards/duplicate-request.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Activity])],
  controllers: [ActivityController],
  providers: [ActivityService, DuplicateRequestGuard],
  exports: [TypeOrmModule, ActivityService, DuplicateRequestGuard],
})
export class CommonModule {}
