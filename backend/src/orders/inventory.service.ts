import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async getInventory(productId: string): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({
      where: { productId },
      relations: ['product']
    });
  }

  async getInventoryByProductName(productName: string): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({
      where: { product: { name: productName } },
      relations: ['product']
    });
  }

  async getAllInventory(): Promise<Inventory[]> {
    return this.inventoryRepository.find();
  }

  async createOrUpdateInventory(
    productId: string,
    totalUnits: number,
    description?: string,
  ): Promise<Inventory> {
    const inventory = await this.getInventory(productId);

    if (inventory) {
      inventory.totalUnits = totalUnits;
      inventory.availableUnits = totalUnits - inventory.reservedUnits - inventory.soldUnits;
      if (description) {
        inventory.description = description;
      }
      return this.inventoryRepository.save(inventory);
    } else {
      // Create new inventory entry for existing product
      const newInventory = this.inventoryRepository.create({
        productId,
        totalUnits,
        availableUnits: totalUnits,
        reservedUnits: 0,
        soldUnits: 0,
        description,
      });
      return this.inventoryRepository.save(newInventory);
    }
  }

  async reserveUnits(productId: string, quantity: number): Promise<Inventory> {
    const inventory = await this.getInventory(productId);

    if (!inventory) {
      throw new BadRequestException(`Product ${productId} not found in inventory`);
    }

    if (inventory.availableUnits < quantity) {
      throw new BadRequestException(
        `Not enough units available. Available: ${inventory.availableUnits}, Requested: ${quantity}`,
      );
    }

    inventory.reservedUnits += quantity;
    inventory.availableUnits -= quantity;

    this.logger.log(`Reserved ${quantity} units of product ${productId}. Available: ${inventory.availableUnits}`);

    return this.inventoryRepository.save(inventory);
  }

  async reserveUnitsByProductName(productName: string, quantity: number): Promise<Inventory> {
    const inventory = await this.getInventoryByProductName(productName);

    if (!inventory) {
      throw new BadRequestException(`Product '${productName}' not found in inventory`);
    }

    return this.reserveUnits(inventory.productId, quantity);
  }

  async confirmSale(productId: string, quantity: number): Promise<Inventory> {
    const inventory = await this.getInventory(productId);

    if (!inventory) {
      throw new BadRequestException(`Product ${productId} not found in inventory`);
    }

    if (inventory.reservedUnits < quantity) {
      throw new BadRequestException(
        `Not enough reserved units. Reserved: ${inventory.reservedUnits}, Requested: ${quantity}`,
      );
    }

    inventory.reservedUnits -= quantity;
    inventory.soldUnits += quantity;

    this.logger.log(`Confirmed sale of ${quantity} units of product ${productId}. Sold: ${inventory.soldUnits}`);

    return this.inventoryRepository.save(inventory);
  }

  async cancelReservation(productId: string, quantity: number): Promise<Inventory> {
    const inventory = await this.getInventory(productId);

    if (!inventory) {
      throw new BadRequestException(`Product ${productId} not found in inventory`);
    }

    inventory.reservedUnits -= quantity;
    inventory.availableUnits += quantity;

    this.logger.log(`Cancelled reservation of ${quantity} units of product ${productId}. Available: ${inventory.availableUnits}`);

    return this.inventoryRepository.save(inventory);
  }

  async initializeNebuDino(): Promise<Inventory> {
    // This is a legacy method - should be updated to use ProductCatalog lookup
    // For now, keeping it for backward compatibility but logging warning
    this.logger.warn('initializeNebuDino() is deprecated. Use createOrUpdateInventory(productId, units) instead.');
    throw new BadRequestException('This method requires ProductCatalog integration. Use createOrUpdateInventory(productId, units) instead.');
  }
}
