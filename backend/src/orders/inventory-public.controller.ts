import { Controller, Get, Post, Body, Param, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('inventory-public')
@Controller('inventory')
export class InventoryPublicController {
  private readonly logger = new Logger(InventoryPublicController.name);

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

  /**
   * Public endpoint to register back-in-stock notifications
   * Users can subscribe to be notified when a product is available again
   */
  @Public()
  @Post('notifications')
  @ApiOperation({ summary: 'Register back-in-stock notification (public)' })
  @ApiResponse({
    status: 201,
    description: 'Notification registered successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        productId: { type: 'string' },
        email: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async registerNotification(
    @Body('email') email: string,
    @Body('productId') productId: string,
    @Body('productName') productName?: string,
  ) {
    // Validate required fields
    if (!email || !productId) {
      throw new BadRequestException('Email and productId are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Log the notification request
    this.logger.log(`Back-in-stock notification registered: ${email} for product ${productId} (${productName || 'N/A'})`);

    // TODO: Implement actual notification storage and email sending
    // For now, just log it. You can:
    // 1. Store in a database table (BackInStockNotification entity)
    // 2. Send email when inventory.availableUnits changes from 0 to > 0
    // 3. Use a queue (Bull/Redis) to process notifications asynchronously

    return {
      success: true,
      message: `You will be notified at ${email} when ${productName || 'the product'} is back in stock`,
      productId,
      email
    };
  }
}
