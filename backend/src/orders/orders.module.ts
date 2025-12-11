import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { InventoryController } from './inventory.controller';
import { InventoryPublicController } from './inventory-public.controller';
import { InventoryService } from './inventory.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderType } from './entities/order-type.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { ShippingMethod } from './entities/shipping-method.entity';
import { Inventory } from './entities/inventory.entity';
import { ToysModule } from '../toys/toys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderType,
      OrderStatusHistory,
      PaymentTransaction,
      ShippingMethod,
      Inventory
    ]),
    ToysModule,
  ],
  controllers: [OrdersController, InventoryController, InventoryPublicController],
  providers: [OrdersService, InventoryService],
  exports: [OrdersService, InventoryService],
})
export class OrdersModule {}
