import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Inventory } from '../../orders/entities/inventory.entity';
import { ProductCatalog } from '../../toys/entities/product-catalog.entity';

/**
 * Inventory Seeder
 *
 * Este seeder inserta inventario inicial para los productos principales.
 * Solo ejecuta si la tabla de inventario está vacía.
 *
 * Uso:
 *   npm run seed
 */
export async function seedInventory(dataSource: DataSource): Promise<void> {
  const logger = new Logger('InventorySeeder');
  const inventoryRepository = dataSource.getRepository(Inventory);
  const productRepository = dataSource.getRepository(ProductCatalog);

  // Verificar si ya hay inventario
  const count = await inventoryRepository.count();
  if (count > 0) {
    logger.warn(`Ya existen ${count} registros de inventario. Saltando seed inicial.`);
    return;
  }

  logger.log('🌱 Insertando inventario inicial...');

  // Buscar productos por slug
  const nebulaDino = await productRepository.findOne({ where: { slug: 'nebu-dino' } });
  const nebulaCapibara = await productRepository.findOne({ where: { slug: 'nebu-capibara' } });

  if (!nebulaDino) {
    logger.error('❌ No se encontró el producto "nebu-dino". Ejecuta primero el seeder de productos.');
    return;
  }

  if (!nebulaCapibara) {
    logger.error('❌ No se encontró el producto "nebu-capibara". Ejecuta primero el seeder de productos.');
    return;
  }

  // Crear inventario inicial
  const inventoryItems = [
    {
      productId: nebulaDino.id,
      totalUnits: 20,
      availableUnits: 20,
      reservedUnits: 0,
      soldUnits: 0,
      description: 'Inventario inicial - Nebu Dino',
    },
    {
      productId: nebulaCapibara.id,
      totalUnits: 5,
      availableUnits: 5,
      reservedUnits: 0,
      soldUnits: 0,
      description: 'Inventario inicial - Nebu Capibara',
    },
  ];

  // Insertar inventario
  const inventoryEntities = inventoryItems.map((data) => inventoryRepository.create(data));
  await inventoryRepository.save(inventoryEntities);

  logger.log(`✅ ${inventoryItems.length} registros de inventario insertados exitosamente`);
  logger.log(`   - Nebu Dino: 20 unidades`);
  logger.log(`   - Nebu Capibara: 5 unidades`);
}
