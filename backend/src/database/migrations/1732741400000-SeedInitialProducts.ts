import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Seed de productos iniciales
 *
 * NOTA: Esta migration reemplaza el archivo seed-products.sql
 * Solo debe ejecutarse UNA VEZ en cada ambiente (dev, staging, prod)
 *
 * Si necesitas re-ejecutar en desarrollo:
 * 1. DELETE FROM migrations_history WHERE name LIKE '%SeedInitialProducts%';
 * 2. npm run migration:run
 *
 * Author: Claude
 * Date: 2025-11-27
 */
export class SeedInitialProducts1732741400000 implements MigrationInterface {
  name = 'SeedInitialProducts1732741400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si ya hay productos (prevenir duplicados)
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

    console.log('🌱 Insertando 13 productos iniciales...');

    // Insertar todos los productos
    await queryRunner.query(`
      INSERT INTO product_catalog (
        slug, name, concept, "originalCharacter", description,
        price, "depositAmount", "inStock", "preOrder",
        images, colors, features, category, badge, active
      ) VALUES
      ('star-hunters', 'Star Hunters', '🌟 Cazadores de Estrellas', 'Nebu Original', 'Aventureros cósmicos que viajan entre galaxias', 380.00, 190.00, false, true, '', '["#FF6B9D","#4A90E2","#FFD700"]', 'Traje espacial con luces LED,Mochila de propulsión removible', 'space-adventure', 'new', true),
      ('chaos-cat', 'Chaos Cat', '🐱 Gato del Caos', 'Nebu Original', 'Un felino travieso del multiverso', 380.00, 190.00, false, true, '', '["#9B59B6","#E74C3C","#F39C12"]', 'Pelaje suave con detalles holográficos,Ojos con brillo nocturno', 'fantasy-creatures', 'hot', true),
      ('kosmik', 'Kosmik', '🌌 Guardián Cósmico', 'Nebu Original', 'Protector de las dimensiones', 380.00, 190.00, false, true, '', '["#6C5CE7","#A29BFE","#74B9FF"]', 'Alas con efecto holográfico,Cuerpo con acabado metalizado', 'space-adventure', 'exclusive', true),
      ('sky-pup', 'Sky Pup', '🐕 Cachorro Volador', 'Nebu Original', 'Un adorable cachorro con alas esponjosas', 380.00, 190.00, false, true, '', '["#87CEEB","#FFB6C1","#FFFFFF"]', 'Alas de peluche extra suaves,Collar con campana sonora', 'cute-companions', 'new', true),
      ('grunoncito', 'Gruñoncito', '😾 Pequeño Gruñón', 'Nebu Original', 'Este pequeño tiene cara de pocos amigos', 380.00, 190.00, false, true, '', '["#8B7355","#D2691E","#F5DEB3"]', 'Expresión facial única,Pelaje texturizado realista', 'funny-friends', 'hot', true),
      ('long-arms', 'Long Arms', '🦾 Brazos Largos', 'Nebu Original', 'Criatura peculiar con extremidades extensibles', 380.00, 190.00, false, true, '', '["#20B2AA","#48D1CC","#E0FFFF"]', 'Brazos articulados,Manos con dedos flexibles', 'funny-friends', 'new', true),
      ('sleepy-kitty', 'Sleepy Kitty', '😴 Gatito Somnoliento', 'Nebu Original', 'Un adorable gatito en busca del lugar perfecto', 380.00, 190.00, false, true, '', '["#FFB6C1","#E6E6FA","#FFFFFF"]', 'Incluye almohada,Ojos semicerrados', 'cute-companions', 'hot', true),
      ('sunny-pup', 'Sunny Pup', '☀️ Cachorro Solar', 'Nebu Original', 'Un cachorro radiante que lleva el sol', 380.00, 190.00, false, true, '', '["#FFD700","#FFA500","#FF6347"]', 'Pelaje con efecto brillante,Rayos solares removibles', 'space-adventure', 'exclusive', true),
      ('pixel-jester', 'Pixel Jester', '🎮 Bufón de Píxeles', 'Nebu Original', 'Personaje saltado de un videojuego retro', 380.00, 190.00, false, true, '', '["#FF00FF","#00FFFF","#FFFF00"]', 'Diseño inspirado en gráficos retro,Detalles pixelados', 'gaming-heroes', 'new', true),
      ('purple-bunny', 'Purple Bunny', '🐰 Conejito Púrpura', 'Nebu Original', 'Un conejo místico de un bosque encantado', 380.00, 190.00, false, true, '', '["#9370DB","#BA55D3","#DDA0DD"]', 'Orejas extra largas,Pelaje con brillo nacarado', 'fantasy-creatures', 'hot', true),
      ('sawbite', 'Sawbite', '🦷 Mordisco Aserrado', 'Nebu Original', 'Una criatura marina con dientes afilados', 380.00, 190.00, false, true, '', '["#4682B4","#5F9EA0","#B0C4DE"]', 'Mandíbula articulada,Dientes de goma suave', 'ocean-buddies', 'exclusive', true),
      ('dark-bunny', 'Dark Bunny', '🌑 Conejito Oscuro', 'Nebu Original', 'El hermano misterioso del Purple Bunny', 380.00, 190.00, false, true, '', '["#2F4F4F","#36454F","#708090"]', 'Pelaje negro aterciopelado,Ojos con brillo rojo', 'fantasy-creatures', 'new', true),
      ('sweet-bunny', 'Sweet Bunny', '🍬 Conejito Dulce', 'Nebu Original', 'Un conejito hecho de algodón de azúcar', 380.00, 190.00, false, true, '', '["#FFB6D9","#FFC0CB","#FFDDF4"]', 'Textura de algodón de azúcar,Aroma a vainilla', 'cute-companions', 'hot', true);
    `);

    console.log('✅ 13 productos insertados exitosamente');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: eliminar solo los productos insertados por esta migration
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

    await queryRunner.query(`
      DELETE FROM product_catalog
      WHERE slug IN (${slugs.map((s) => `'${s}'`).join(', ')});
    `);

    console.log('✅ Productos iniciales eliminados (rollback)');
  }
}
