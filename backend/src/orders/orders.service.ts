import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { InventoryService } from './inventory.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private inventoryService: InventoryService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Calculate reserve amount (50%)
      const reserveAmount = createOrderDto.totalPrice * 0.5;

      // Reserve inventory units
      try {
        await this.inventoryService.reserveUnits(createOrderDto.product, createOrderDto.quantity);
        this.logger.log(`Reserved ${createOrderDto.quantity} units of ${createOrderDto.product}`);
      } catch (inventoryError) {
        this.logger.error(`Failed to reserve inventory: ${inventoryError.message}`);
        // Continue creating order even if inventory fails (for backward compatibility)
      }

      const order = this.ordersRepository.create({
        ...createOrderDto,
        reserveAmount,
        paidAmount: 0,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await this.ordersRepository.save(order);

      this.logger.log(`Order created: ${savedOrder.id} - ${createOrderDto.email}`);

      return savedOrder;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    return this.ordersRepository.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.ordersRepository.update(id, { status });
    return this.findOne(id);
  }

  async updatePaidAmount(id: string, amount: number): Promise<Order> {
    const order = await this.findOne(id);

    const newPaidAmount = order.paidAmount + amount;
    const updates: Partial<Order> = { paidAmount: newPaidAmount };

    // Auto-update status based on payment
    if (newPaidAmount >= order.reserveAmount && order.status === OrderStatus.PENDING) {
      updates.status = OrderStatus.RESERVED;
    } else if (newPaidAmount >= order.totalPrice) {
      updates.status = OrderStatus.CONFIRMED;
    }

    await this.ordersRepository.update(id, updates);
    return this.findOne(id);
  }

  async markEmailSent(id: string): Promise<void> {
    await this.ordersRepository.update(id, { emailSent: true });
  }

  async getStats() {
    const [total, pending, reserved, confirmed, shipped, delivered, cancelled] = await Promise.all([
      this.ordersRepository.count(),
      this.ordersRepository.count({ where: { status: OrderStatus.PENDING } }),
      this.ordersRepository.count({ where: { status: OrderStatus.RESERVED } }),
      this.ordersRepository.count({ where: { status: OrderStatus.CONFIRMED } }),
      this.ordersRepository.count({ where: { status: OrderStatus.SHIPPED } }),
      this.ordersRepository.count({ where: { status: OrderStatus.DELIVERED } }),
      this.ordersRepository.count({ where: { status: OrderStatus.CANCELLED } }),
    ]);

    const totalRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.paidAmount)', 'sum')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .getRawOne();

    return {
      total,
      byStatus: {
        pending,
        reserved,
        confirmed,
        shipped,
        delivered,
        cancelled,
      },
      revenue: parseFloat(totalRevenue?.sum || '0'),
    };
  }
}
