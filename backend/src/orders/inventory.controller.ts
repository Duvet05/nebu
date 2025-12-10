import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getAllInventory() {
    return this.inventoryService.getAllInventory();
  }

  @Get(':product')
  async getInventory(@Param('product') product: string) {
    return this.inventoryService.getInventory(product);
  }

  @Post('initialize/nebu-dino')
  async initializeNebuDino() {
    return this.inventoryService.initializeNebuDino();
  }

  @Post()
  async createOrUpdate(
    @Body('product') product: string,
    @Body('totalUnits') totalUnits: number,
    @Body('description') description?: string,
  ) {
    return this.inventoryService.createOrUpdateInventory(product, totalUnits, description);
  }

  @Patch(':product/reserve')
  async reserve(
    @Param('product') product: string,
    @Body('quantity') quantity: number,
  ) {
    return this.inventoryService.reserveUnits(product, quantity);
  }

  @Patch(':product/confirm')
  async confirm(
    @Param('product') product: string,
    @Body('quantity') quantity: number,
  ) {
    return this.inventoryService.confirmSale(product, quantity);
  }

  @Patch(':product/cancel')
  async cancel(
    @Param('product') product: string,
    @Body('quantity') quantity: number,
  ) {
    return this.inventoryService.cancelReservation(product, quantity);
  }
}
