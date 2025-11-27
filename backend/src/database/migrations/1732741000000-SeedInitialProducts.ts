import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Seed de productos iniciales + optimizaciones
 *
 * IMPORTANTE: Esta migration NO crea la tabla.
 * La tabla se crea automáticamente desde ProductCatalog entity (synchronize: true)
 *
 * Esta migration solo:
 * 1. Agrega índices custom de performance
 * 2. Agrega constraints de validación
 * 3. Inserta 13 productos iniciales
 *
 * Author: Nebu Team
 * Date: 2025-11-27
 */
export class SeedInitialProducts1732741000000 implements MigrationInterface {
  name = 'SeedInitialProducts1732741000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // 1. ÍNDICES CUSTOM DE PERFORMANCE
    // ============================================

    console.log('📊 Creando índices de performance...');

    // Índice parcial para filtrar por categoría (solo productos activos)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_catalog_category_active"
       ON "product_catalog" ("category")
       WHERE "active" = true`,
    );

    // Índice parcial para filtrar por badge (solo productos activos)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_catalog_badge_active"
       ON "product_catalog" ("badge")
       WHERE "active" = true AND "badge" IS NOT NULL`,
    );

    // Índice parcial para filtrar pre-órdenes (solo productos activos)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_catalog_preorder_active"
       ON "product_catalog" ("preOrder")
       WHERE "active" = true AND "preOrder" = true`,
    );

    // Índice para ordenar/filtrar por precio
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_catalog_price"
       ON "product_catalog" ("price")`,
    );

    // Índice compuesto para queries comunes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_catalog_active_category_created"
       ON "product_catalog" ("active", "category", "createdAt" DESC)`,
    );

    // ============================================
    // 2. CONSTRAINTS DE VALIDACIÓN
    // ============================================

    console.log('🔒 Creando constraints de validación...');

    // Validar que el precio sea positivo
    await queryRunner.query(
      `ALTER TABLE "product_catalog"
       ADD CONSTRAINT IF NOT EXISTS "chk_product_catalog_price_positive"
       CHECK ("price" > 0)`,
    );

    // Validar que el depósito sea no negativo
    await queryRunner.query(
      `ALTER TABLE "product_catalog"
       ADD CONSTRAINT IF NOT EXISTS "chk_product_catalog_deposit_positive"
       CHECK ("depositAmount" >= 0)`,
    );

    // Validar que el depósito no sea mayor que el precio
    await queryRunner.query(
      `ALTER TABLE "product_catalog"
       ADD CONSTRAINT IF NOT EXISTS "chk_product_catalog_deposit_le_price"
       CHECK ("depositAmount" <= "price" OR "depositAmount" IS NULL)`,
    );

    // Validar que stockCount sea no negativo
    await queryRunner.query(
      `ALTER TABLE "product_catalog"
       ADD CONSTRAINT IF NOT EXISTS "chk_product_catalog_stock_positive"
       CHECK ("stockCount" >= 0)`,
    );

    // Validar que viewCount y orderCount sean no negativos
    await queryRunner.query(
      `ALTER TABLE "product_catalog"
       ADD CONSTRAINT IF NOT EXISTS "chk_product_catalog_counts_positive"
       CHECK ("viewCount" >= 0 AND "orderCount" >= 0)`,
    );

    // ============================================
    // 3. SEED DE DATOS INICIALES
    // ============================================

    console.log('🌱 Insertando 13 productos iniciales...');

    // Verificar si ya hay productos
    const result = await queryRunner.query(
      `SELECT COUNT(*) as count FROM product_catalog`,
    );
    const count = parseInt(result[0].count);

    if (count > 0) {
      console.log(
        `⚠️  Ya existen ${count} productos. Saltando seed inicial.`,
      );
      return;
    }

    const products = [
      {
        slug: 'star-hunters',
        name: 'Star Hunters',
        concept: '🌟 Cazadores de Estrellas',
        originalCharacter: 'Nebu Original',
        description: 'Aventureros cósmicos que viajan entre galaxias',
        shortDescription:
          'Aventureros cósmicos con traje espacial LED y mochila de propulsión',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#FF6B9D', '#4A90E2', '#FFD700']),
        features: 'Traje espacial con luces LED,Mochila de propulsión removible',
        category: 'space-adventure',
        badge: 'new',
        active: true,
      },
      {
        slug: 'chaos-cat',
        name: 'Chaos Cat',
        concept: '🐱 Gato del Caos',
        originalCharacter: 'Nebu Original',
        description: 'Un felino travieso del multiverso',
        shortDescription:
          'Felino travieso del multiverso con detalles holográficos brillantes',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#9B59B6', '#E74C3C', '#F39C12']),
        features:
          'Pelaje suave con detalles holográficos,Ojos con brillo nocturno',
        category: 'fantasy-creatures',
        badge: 'hot',
        active: true,
      },
      {
        slug: 'kosmik',
        name: 'Kosmik',
        concept: '🌌 Guardián Cósmico',
        originalCharacter: 'Nebu Original',
        description: 'Protector de las dimensiones',
        shortDescription:
          'Guardián cósmico con alas holográficas y acabado metalizado',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#6C5CE7', '#A29BFE', '#74B9FF']),
        features: 'Alas con efecto holográfico,Cuerpo con acabado metalizado',
        category: 'space-adventure',
        badge: 'exclusive',
        active: true,
      },
      {
        slug: 'sky-pup',
        name: 'Sky Pup',
        concept: '🐕 Cachorro Volador',
        originalCharacter: 'Nebu Original',
        description: 'Un adorable cachorro con alas esponjosas',
        shortDescription:
          'Adorable cachorro con alas extra suaves y collar con campana',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#87CEEB', '#FFB6C1', '#FFFFFF']),
        features: 'Alas de peluche extra suaves,Collar con campana sonora',
        category: 'cute-companions',
        badge: 'new',
        active: true,
      },
      {
        slug: 'grunoncito',
        name: 'Gruñoncito',
        concept: '😾 Pequeño Gruñón',
        originalCharacter: 'Nebu Original',
        description: 'Este pequeño tiene cara de pocos amigos',
        shortDescription:
          'Pequeño gruñón con expresión única y pelaje texturizado realista',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#8B7355', '#D2691E', '#F5DEB3']),
        features: 'Expresión facial única,Pelaje texturizado realista',
        category: 'funny-friends',
        badge: 'hot',
        active: true,
      },
      {
        slug: 'long-arms',
        name: 'Long Arms',
        concept: '🦾 Brazos Largos',
        originalCharacter: 'Nebu Original',
        description: 'Criatura peculiar con extremidades extensibles',
        shortDescription:
          'Criatura peculiar con brazos articulados y manos flexibles',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#20B2AA', '#48D1CC', '#E0FFFF']),
        features: 'Brazos articulados,Manos con dedos flexibles',
        category: 'funny-friends',
        badge: 'new',
        active: true,
      },
      {
        slug: 'sleepy-kitty',
        name: 'Sleepy Kitty',
        concept: '😴 Gatito Somnoliento',
        originalCharacter: 'Nebu Original',
        description: 'Un adorable gatito en busca del lugar perfecto',
        shortDescription:
          'Gatito somnoliento con almohada incluida y ojos semicerrados',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#FFB6C1', '#E6E6FA', '#FFFFFF']),
        features: 'Incluye almohada,Ojos semicerrados',
        category: 'cute-companions',
        badge: 'hot',
        active: true,
      },
      {
        slug: 'sunny-pup',
        name: 'Sunny Pup',
        concept: '☀️ Cachorro Solar',
        originalCharacter: 'Nebu Original',
        description: 'Un cachorro radiante que lleva el sol',
        shortDescription:
          'Cachorro radiante con pelaje brillante y rayos solares removibles',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#FFD700', '#FFA500', '#FF6347']),
        features: 'Pelaje con efecto brillante,Rayos solares removibles',
        category: 'space-adventure',
        badge: 'exclusive',
        active: true,
      },
      {
        slug: 'pixel-jester',
        name: 'Pixel Jester',
        concept: '🎮 Bufón de Píxeles',
        originalCharacter: 'Nebu Original',
        description: 'Personaje saltado de un videojuego retro',
        shortDescription:
          'Bufón de píxeles retro con diseño inspirado en videojuegos clásicos',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#FF00FF', '#00FFFF', '#FFFF00']),
        features: 'Diseño inspirado en gráficos retro,Detalles pixelados',
        category: 'gaming-heroes',
        badge: 'new',
        active: true,
      },
      {
        slug: 'purple-bunny',
        name: 'Purple Bunny',
        concept: '🐰 Conejito Púrpura',
        originalCharacter: 'Nebu Original',
        description: 'Un conejo místico de un bosque encantado',
        shortDescription:
          'Conejo místico con orejas extra largas y pelaje nacarado',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#9370DB', '#BA55D3', '#DDA0DD']),
        features: 'Orejas extra largas,Pelaje con brillo nacarado',
        category: 'fantasy-creatures',
        badge: 'hot',
        active: true,
      },
      {
        slug: 'sawbite',
        name: 'Sawbite',
        concept: '🦷 Mordisco Aserrado',
        originalCharacter: 'Nebu Original',
        description: 'Una criatura marina con dientes afilados',
        shortDescription:
          'Criatura marina con mandíbula articulada y dientes de goma suave',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#4682B4', '#5F9EA0', '#B0C4DE']),
        features: 'Mandíbula articulada,Dientes de goma suave',
        category: 'ocean-buddies',
        badge: 'exclusive',
        active: true,
      },
      {
        slug: 'dark-bunny',
        name: 'Dark Bunny',
        concept: '🌑 Conejito Oscuro',
        originalCharacter: 'Nebu Original',
        description: 'El hermano misterioso del Purple Bunny',
        shortDescription:
          'Conejito misterioso con pelaje aterciopelado y ojos con brillo rojo',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#2F4F4F', '#36454F', '#708090']),
        features: 'Pelaje negro aterciopelado,Ojos con brillo rojo',
        category: 'fantasy-creatures',
        badge: 'new',
        active: true,
      },
      {
        slug: 'sweet-bunny',
        name: 'Sweet Bunny',
        concept: '🍬 Conejito Dulce',
        originalCharacter: 'Nebu Original',
        description: 'Un conejito hecho de algodón de azúcar',
        shortDescription:
          'Conejito de algodón de azúcar con textura suave y aroma a vainilla',
        price: 380.0,
        depositAmount: 190.0,
        inStock: false,
        preOrder: true,
        images: '',
        colors: JSON.stringify(['#FFB6D9', '#FFC0CB', '#FFDDF4']),
        features: 'Textura de algodón de azúcar,Aroma a vainilla',
        category: 'cute-companions',
        badge: 'hot',
        active: true,
      },
    ];

    // Insertar productos usando prepared statements
    for (const product of products) {
      await queryRunner.query(
        `INSERT INTO "product_catalog" (
          slug, name, concept, "originalCharacter", description, "shortDescription",
          price, "depositAmount", "inStock", "preOrder",
          images, colors, features, category, badge, active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          product.slug,
          product.name,
          product.concept,
          product.originalCharacter,
          product.description,
          product.shortDescription,
          product.price,
          product.depositAmount,
          product.inStock,
          product.preOrder,
          product.images,
          product.colors,
          product.features,
          product.category,
          product.badge,
          product.active,
        ],
      );
    }

    console.log('✅ 13 productos insertados exitosamente');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar datos
    const slugs = [
      'star-hunters',
      'chaos-cat',
      'kosmik',
      'sky-pup',
      'grunoncito',
      'long-arms',
      'sleepy-kitty',
      'sunny-pup',
      'pixel-jester',
      'purple-bunny',
      'sawbite',
      'dark-bunny',
      'sweet-bunny',
    ];

    await queryRunner.query(
      `DELETE FROM product_catalog WHERE slug = ANY($1)`,
      [slugs],
    );

    // Eliminar constraints
    await queryRunner.query(
      `ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_counts_positive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_stock_positive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_deposit_le_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_deposit_positive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_catalog" DROP CONSTRAINT IF EXISTS "chk_product_catalog_price_positive"`,
    );

    // Eliminar índices custom
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_product_catalog_active_category_created"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_product_catalog_price"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_product_catalog_preorder_active"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_product_catalog_badge_active"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_product_catalog_category_active"`,
    );

    console.log('✅ Rollback completado: datos, constraints e índices eliminados');
  }
}
