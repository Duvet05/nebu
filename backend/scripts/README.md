# Scripts de Gestión de Productos

Scripts SQL para gestionar el catálogo de productos en la base de datos PostgreSQL.

## Archivos

- **`seed-products.sql`** - Limpia y carga los 13 productos iniciales
- **`verify-products.sql`** - Verifica y muestra estadísticas de los productos
- **`README.md`** - Este archivo

## Comandos

### Cargar/Recargar Datos
Limpia la tabla y carga los 13 productos iniciales:

```bash
docker exec -i nebu-postgres-prod psql -U nebu_user -d nebu_db < backend/scripts/seed-products.sql
```

### Verificar Datos
Muestra estadísticas y validaciones:

```bash
docker exec -i nebu-postgres-prod psql -U nebu_user -d nebu_db < backend/scripts/verify-products.sql
```

## Formato de Datos

La entidad `ProductCatalog` usa diferentes tipos de columnas de TypeORM:

| Campo | Tipo TypeORM | Tipo PostgreSQL | Formato |
|-------|--------------|-----------------|---------|
| `images` | `simple-array` | `text` | Separado por comas: `'img1.jpg,img2.jpg'` o `''` |
| `features` | `simple-array` | `text` | Separado por comas: `'Feature 1,Feature 2'` |
| `colors` | `jsonb` | `jsonb` | Array JSON: `'["#FF0000","#00FF00"]'` |
| `originalCharacter` | `varchar` | `varchar(200)` | Texto: `'Nebu Original'` |

### Ejemplo de INSERT

```sql
INSERT INTO product_catalog (
  slug, name, concept, "originalCharacter", description,
  price, "depositAmount", "inStock", "preOrder",
  images, colors, features, category, badge, active
) VALUES (
  'my-product',
  'Mi Producto',
  '✨ Concepto',
  'Nebu Original',
  'Descripción del producto',
  380.00,
  190.00,
  false,
  true,
  '',  -- simple-array vacío
  '["#FF0000","#00FF00"]',  -- jsonb
  'Feature 1,Feature 2',  -- simple-array
  'categoria',
  'new',
  true
);
```

## Productos Incluidos

13 productos distribuidos en 6 categorías:
- **space-adventure** (3): Star Hunters, Kosmik, Sunny Pup
- **fantasy-creatures** (3): Chaos Cat, Purple Bunny, Dark Bunny
- **cute-companions** (3): Sky Pup, Sleepy Kitty, Sweet Bunny
- **funny-friends** (2): Gruñoncito, Long Arms
- **ocean-buddies** (1): Sawbite
- **gaming-heroes** (1): Pixel Jester

Badges: `new` (5), `hot` (5), `exclusive` (3)
