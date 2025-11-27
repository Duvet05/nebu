import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CrearProductos1764201916311 implements MigrationInterface {
  name = 'CrearProductos1764201916311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla product_catalog
    await queryRunner.createTable(
      new Table({
        name: 'product_catalog',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'concept',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'originalCharacter',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'shortDescription',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'originalPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'depositAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'preOrder',
            type: 'boolean',
            default: false,
          },
          {
            name: 'inStock',
            type: 'boolean',
            default: false,
          },
          {
            name: 'stockCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'images',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'colors',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ageRange',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'features',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            default: "'plushie'",
          },
          {
            name: 'badge',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'viewCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'orderCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear índices
    await queryRunner.createIndex(
      'product_catalog',
      new TableIndex({
        name: 'IDX_product_catalog_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'product_catalog',
      new TableIndex({
        name: 'IDX_product_catalog_active',
        columnNames: ['active'],
      }),
    );

    await queryRunner.createIndex(
      'product_catalog',
      new TableIndex({
        name: 'IDX_product_catalog_inStock',
        columnNames: ['inStock'],
      }),
    );

    await queryRunner.createIndex(
      'product_catalog',
      new TableIndex({
        name: 'IDX_product_catalog_category',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'product_catalog',
      new TableIndex({
        name: 'IDX_product_catalog_preOrder',
        columnNames: ['preOrder'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('product_catalog', 'IDX_product_catalog_preOrder');
    await queryRunner.dropIndex('product_catalog', 'IDX_product_catalog_category');
    await queryRunner.dropIndex('product_catalog', 'IDX_product_catalog_inStock');
    await queryRunner.dropIndex('product_catalog', 'IDX_product_catalog_active');
    await queryRunner.dropIndex('product_catalog', 'IDX_product_catalog_slug');

    // Eliminar tabla
    await queryRunner.dropTable('product_catalog');
  }
}
