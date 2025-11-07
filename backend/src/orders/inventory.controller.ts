import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
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
