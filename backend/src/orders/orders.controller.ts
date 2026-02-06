import { Controller, Get, Post, Body, Param, Patch, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateCheckoutOrderDto } from './dto/create-checkout-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { DuplicateRequestGuard } from '../common/guards/duplicate-request.guard';
import { PreventDuplicateRequest } from '../common/decorators/duplicate-request.decorator';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, DuplicateRequestGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create order (legacy endpoint - used by pre-order form)
   * Public endpoint for anonymous orders
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @PreventDuplicateRequest({ ttl: 30, fields: ['email', 'totalPrice', 'product'], message: 'Orden duplicada detectada. Espere 30 segundos antes de reintentar.' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  /**
   * Create order from checkout flow
   * Public endpoint for anonymous checkout
   */
  @Public()
  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @PreventDuplicateRequest({ ttl: 30, fields: ['email', 'total', 'items'], message: 'Checkout duplicado detectado. Espere 30 segundos antes de reintentar.' })
  async createFromCheckout(@Body() dto: CreateCheckoutOrderDto): Promise<Order> {
    return this.ordersService.createFromCheckout(dto);
  }

  @Get()
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/payment')
  async addPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ): Promise<Order> {
    return this.ordersService.updatePaidAmount(id, amount);
  }
}
