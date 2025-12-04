import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CulqiService } from './services/culqi.service';

@Module({
  imports: [ConfigModule],
  providers: [CulqiService],
  exports: [CulqiService],
})
export class PaymentsModule {}
