import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('inventory-public')
@Controller('inventory')
export class InventoryPublicController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Public endpoint to check product availability
   * Used by frontend to show stock status without authentication
   */
  @Public()
  @Get(':productId/available')
  @ApiOperation({ summary: 'Get product availability (public)' })
  @ApiResponse({
    status: 200,
    description: 'Returns available units for the product',
    schema: {
      properties: {
        productId: { type: 'string' },
        availableUnits: { type: 'number' },
        totalUnits: { type: 'number' },
        isAvailable: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Product not found in inventory' })
  async getAvailability(@Param('productId') productId: string) {
    const inventory = await this.inventoryService.getInventory(productId);

    if (!inventory) {
      throw new NotFoundException(`Product ${productId} not found in inventory`);
    }

    return {
      productId: inventory.productId,
      availableUnits: inventory.availableUnits,
      totalUnits: inventory.totalUnits,
      isAvailable: inventory.availableUnits > 0
    };
  }
}
