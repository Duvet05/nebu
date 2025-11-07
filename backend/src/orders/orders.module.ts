import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Order } from './entities/order.entity';
import { Inventory } from './entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Inventory])],
  controllers: [OrdersController, InventoryController],
  providers: [OrdersService, InventoryService],
  exports: [OrdersService, InventoryService],
})
export class OrdersModule {}
