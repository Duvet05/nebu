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
      // Calculate reserve amount (50%) and total amount
      const subtotal = createOrderDto.totalPrice;
      const reserveAmount = subtotal * 0.5;
      const totalAmount = subtotal; // For now, no shipping/tax/discount

      // Reserve inventory units (if product field is a name, we need ProductCatalog lookup)
      // For now, skipping inventory reservation as Order entity needs ProductCatalog integration
      // TODO: Add ProductCatalog relation to Order and use productId instead of product name
      this.logger.log(`Order created with product: ${createOrderDto.product} (inventory reservation skipped pending ProductCatalog integration)`);
      
      /*
      try {
        await this.inventoryService.reserveUnitsByProductName(createOrderDto.product, createOrderDto.quantity);
        this.logger.log(`Reserved ${createOrderDto.quantity} units of ${createOrderDto.product}`);
      } catch (inventoryError) {
        this.logger.error(`Failed to reserve inventory: ${inventoryError.message}`);
        // Continue creating order even if inventory fails (for backward compatibility)
      }
      */

      // Map legacy DTO fields to normalized Order schema
      const order = this.ordersRepository.create({
        contactEmail: createOrderDto.email,
        contactPhone: createOrderDto.phone,
        shippingAddress: createOrderDto.address,
        shippingCity: createOrderDto.city,
        shippingPostalCode: createOrderDto.postalCode,
        subtotal,
        totalAmount,
        reserveAmount,
        status: OrderStatus.PENDING,
        metadata: {
          ...createOrderDto.metadata,
          // Store legacy fields in metadata for backward compatibility
          legacyProduct: createOrderDto.product,
          legacyColor: createOrderDto.color,
          legacyQuantity: createOrderDto.quantity,
          legacyFirstName: createOrderDto.firstName,
          legacyLastName: createOrderDto.lastName,
          legacyPaymentMethod: createOrderDto.paymentMethod,
        },
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

    // Calculate current paid amount from payments relation (getter)
    const currentPaid = order.paidAmount || 0;
    const newPaidAmount = currentPaid + amount;

    const updates: Partial<Order> = {};

    // Auto-update status based on payment thresholds
    // Use reserveAmount if set, otherwise use 50% of totalAmount
    const reserveThreshold = order.reserveAmount || order.totalAmount * 0.5;
    
    if (newPaidAmount >= reserveThreshold && order.status === OrderStatus.PENDING) {
      updates.status = OrderStatus.RESERVED;
    }
    if (newPaidAmount >= order.totalAmount) {
      updates.status = OrderStatus.CONFIRMED;
    }

    // Persist only the status change (payments should be stored in PaymentTransaction separately)
    // This method assumes PaymentTransaction entries are created elsewhere
    if (Object.keys(updates).length > 0) {
      await this.ordersRepository.update(id, updates);
    }

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

    // Sum completed payments from PaymentTransaction via payments relation
    const totalRevenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.payments', 'payment')
      .select('COALESCE(SUM(CASE WHEN payment.status = :completed THEN payment.amount ELSE 0 END), 0)', 'sum')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .setParameter('completed', 'completed')
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
      revenue: parseFloat(totalRevenueResult?.sum || '0'),
    };
  }
}
