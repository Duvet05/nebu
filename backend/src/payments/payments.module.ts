import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CulqiService } from './services/culqi.service';
import { CulqiWebhookController } from './culqi-webhook.controller';
import { CulqiWebhookService } from './culqi-webhook.service';
import { Order } from '../orders/entities/order.entity';
import { PaymentTransaction } from '../orders/entities/payment-transaction.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Order, PaymentTransaction]),
    EmailModule,
  ],
  controllers: [CulqiWebhookController],
  providers: [CulqiService, CulqiWebhookService],
  exports: [CulqiService, CulqiWebhookService],
})
export class PaymentsModule {}
