import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Activity } from './entities/activity.entity';
import { ActivityService } from './services/activity.service';
import { ActivityController } from './controllers/activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Activity])],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [TypeOrmModule, ActivityService],
})
export class CommonModule {}
