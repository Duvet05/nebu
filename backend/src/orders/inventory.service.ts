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

  async getInventory(product: string): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({ where: { product } });
  }

  async getAllInventory(): Promise<Inventory[]> {
    return this.inventoryRepository.find();
  }

  async createOrUpdateInventory(
    product: string,
    totalUnits: number,
    description?: string,
  ): Promise<Inventory> {
    let inventory = await this.getInventory(product);

    if (inventory) {
      inventory.totalUnits = totalUnits;
      inventory.availableUnits = totalUnits - inventory.reservedUnits - inventory.soldUnits;
      if (description) {
        inventory.description = description;
      }
    } else {
      inventory = this.inventoryRepository.create({
        product,
        totalUnits,
        reservedUnits: 0,
        soldUnits: 0,
        availableUnits: totalUnits,
        description,
      });
    }

    return this.inventoryRepository.save(inventory);
  }

  async reserveUnits(product: string, quantity: number): Promise<Inventory> {
    const inventory = await this.getInventory(product);

    if (!inventory) {
      throw new BadRequestException(`Product ${product} not found in inventory`);
    }

    if (inventory.availableUnits < quantity) {
      throw new BadRequestException(
        `Not enough units available. Available: ${inventory.availableUnits}, Requested: ${quantity}`,
      );
    }

    inventory.reservedUnits += quantity;
    inventory.availableUnits -= quantity;

    this.logger.log(`Reserved ${quantity} units of ${product}. Available: ${inventory.availableUnits}`);

    return this.inventoryRepository.save(inventory);
  }

  async confirmSale(product: string, quantity: number): Promise<Inventory> {
    const inventory = await this.getInventory(product);

    if (!inventory) {
      throw new BadRequestException(`Product ${product} not found in inventory`);
    }

    if (inventory.reservedUnits < quantity) {
      throw new BadRequestException(
        `Not enough reserved units. Reserved: ${inventory.reservedUnits}, Requested: ${quantity}`,
      );
    }

    inventory.reservedUnits -= quantity;
    inventory.soldUnits += quantity;

    this.logger.log(`Confirmed sale of ${quantity} units of ${product}. Sold: ${inventory.soldUnits}`);

    return this.inventoryRepository.save(inventory);
  }

  async cancelReservation(product: string, quantity: number): Promise<Inventory> {
    const inventory = await this.getInventory(product);

    if (!inventory) {
      throw new BadRequestException(`Product ${product} not found in inventory`);
    }

    inventory.reservedUnits -= quantity;
    inventory.availableUnits += quantity;

    this.logger.log(`Cancelled reservation of ${quantity} units of ${product}. Available: ${inventory.availableUnits}`);

    return this.inventoryRepository.save(inventory);
  }

  async initializeNebuDino(): Promise<Inventory> {
    return this.createOrUpdateInventory(
      'Nebu Dino',
      20,
      'Peluche Nebu Dino - Edición Limitada',
    );
  }
}
