import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Agregar índices y constraints al catálogo de productos
 *
 * Cambios:
 * - Índices para mejorar performance de queries
 * - Constraints para validar integridad de datos
 * - Índices parciales para queries filtradas por active
 *
 * Similar a Liquibase changeSet
 * Author: Claude
 * Date: 2025-11-27
 */
export class AddProductCatalogIndexesAndConstraints1732741200000
  implements MigrationInterface
{
  name = 'AddProductCatalogIndexesAndConstraints1732741200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // ÍNDICES DE PERFORMANCE
    // ============================================

    // Índice para filtrar por categoría (solo productos activos)
    await queryRunner.query(`
      CREATE INDEX "idx_product_catalog_category_active"
      ON "product_catalog" ("category")
      WHERE "active" = true;
    `);

    // Índice para filtrar por badge (solo productos activos)
    await queryRunner.query(`
      CREATE INDEX "idx_product_catalog_badge_active"
      ON "product_catalog" ("badge")
      WHERE "active" = true;
    `);

    // Índice para filtrar pre-órdenes (solo productos activos)
    await queryRunner.query(`
      CREATE INDEX "idx_product_catalog_preorder_active"
      ON "product_catalog" ("preOrder")
      WHERE "active" = true;
    `);

    // Índice para ordenar/filtrar por precio
    await queryRunner.query(`
      CREATE INDEX "idx_product_catalog_price"
      ON "product_catalog" ("price");
    `);

    // Índice compuesto para queries comunes
    await queryRunner.query(`
      CREATE INDEX "idx_product_catalog_active_category_created"
      ON "product_catalog" ("active", "category", "createdAt");
    `);

    // ============================================
    // CONSTRAINTS DE VALIDACIÓN
    // ============================================

    // Validar que el precio sea positivo
    await queryRunner.query(`
      ALTER TABLE "product_catalog"
      ADD CONSTRAINT "chk_product_catalog_price_positive"
      CHECK ("price" > 0);
    `);

    // Validar que el depósito sea no negativo
    await queryRunner.query(`
      ALTER TABLE "product_catalog"
      ADD CONSTRAINT "chk_product_catalog_deposit_positive"
      CHECK ("depositAmount" >= 0);
    `);

    // Validar que el depósito no sea mayor que el precio
    await queryRunner.query(`
      ALTER TABLE "product_catalog"
      ADD CONSTRAINT "chk_product_catalog_deposit_le_price"
      CHECK ("depositAmount" <= "price" OR "depositAmount" IS NULL);
    `);

    // Validar que stockCount sea no negativo
    await queryRunner.query(`
      ALTER TABLE "product_catalog"
      ADD CONSTRAINT "chk_product_catalog_stock_positive"
      CHECK ("stockCount" >= 0);
    `);

    // Validar categorías permitidas
    await queryRunner.query(`
      ALTER TABLE "product_catalog"
      ADD CONSTRAINT "chk_product_catalog_valid_category"
      CHECK ("category" IN (
        'space-adventure',
        'fantasy-creatures',
        'cute-companions',
        'funny-friends',
        'ocean-buddies',
        'gaming-heroes',
        'plushie'
      ));
    `);

    // Validar badges permitidos
    await queryRunner.query(`
      ALTER TABLE "product_catalog"
      ADD CONSTRAINT "chk_product_catalog_valid_badge"
      CHECK ("badge" IS NULL OR "badge" IN (
        'new',
        'hot',
        'exclusive',
        'limited',
        'bestseller'
      ));
    `);

    // Validar que viewCount y orderCount sean no negativos
    await queryRunner.query(`
      ALTER TABLE "product_catalog"
      ADD CONSTRAINT "chk_product_catalog_counts_positive"
      CHECK ("viewCount" >= 0 AND "orderCount" >= 0);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // ROLLBACK: Eliminar en orden inverso
    // ============================================

    // Eliminar constraints
    await queryRunner.query(`
      ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_counts_positive";
    `);
    await queryRunner.query(`
      ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_valid_badge";
    `);
    await queryRunner.query(`
      ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_valid_category";
    `);
    await queryRunner.query(`
      ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_stock_positive";
    `);
    await queryRunner.query(`
      ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_deposit_le_price";
    `);
    await queryRunner.query(`
      ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_deposit_positive";
    `);
    await queryRunner.query(`
      ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_price_positive";
    `);

    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_catalog_active_category_created";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_catalog_price";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_catalog_preorder_active";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_catalog_badge_active";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_catalog_category_active";`);
  }
}
