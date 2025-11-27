import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Poblar shortDescription en productos
 *
 * Cambios:
 * - Agregar descripciones cortas para todos los productos
 * - Mejora SEO y UX en cards/previews
 *
 * Author: Claude
 * Date: 2025-11-27
 */
export class PopulateShortDescriptions1732741300000
  implements MigrationInterface
{
  name = 'PopulateShortDescriptions1732741300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Actualizar shortDescription para cada producto
    const shortDescriptions = [
      {
        slug: 'star-hunters',
        desc: 'Aventureros cósmicos con traje espacial LED y mochila de propulsión',
      },
      {
        slug: 'chaos-cat',
        desc: 'Felino travieso del multiverso con detalles holográficos brillantes',
      },
      {
        slug: 'kosmik',
        desc: 'Guardián cósmico con alas holográficas y acabado metalizado',
      },
      {
        slug: 'sky-pup',
        desc: 'Adorable cachorro con alas extra suaves y collar con campana',
      },
      {
        slug: 'grunoncito',
        desc: 'Pequeño gruñón con expresión única y pelaje texturizado realista',
      },
      {
        slug: 'long-arms',
        desc: 'Criatura peculiar con brazos articulados y manos flexibles',
      },
      {
        slug: 'sleepy-kitty',
        desc: 'Gatito somnoliento con almohada incluida y ojos semicerrados',
      },
      {
        slug: 'sunny-pup',
        desc: 'Cachorro radiante con pelaje brillante y rayos solares removibles',
      },
      {
        slug: 'pixel-jester',
        desc: 'Bufón de píxeles retro con diseño inspirado en videojuegos clásicos',
      },
      {
        slug: 'purple-bunny',
        desc: 'Conejo místico con orejas extra largas y pelaje nacarado',
      },
      {
        slug: 'sawbite',
        desc: 'Criatura marina con mandíbula articulada y dientes de goma suave',
      },
      {
        slug: 'dark-bunny',
        desc: 'Conejito misterioso con pelaje aterciopelado y ojos con brillo rojo',
      },
      {
        slug: 'sweet-bunny',
        desc: 'Conejito de algodón de azúcar con textura suave y aroma a vainilla',
      },
    ];

    for (const product of shortDescriptions) {
      await queryRunner.query(
        `
        UPDATE "product_catalog"
        SET "shortDescription" = $1
        WHERE "slug" = $2;
      `,
        [product.desc, product.slug],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: limpiar shortDescription
    await queryRunner.query(`
      UPDATE "product_catalog"
      SET "shortDescription" = NULL;
    `);
  }
}
