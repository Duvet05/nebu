-- Script de verificación de productos

-- 1. Resumen general
SELECT
  COUNT(*) as total_productos,
  COUNT(CASE WHEN active = true THEN 1 END) as activos,
  COUNT(CASE WHEN "inStock" = true THEN 1 END) as en_stock,
  COUNT(CASE WHEN "preOrder" = true THEN 1 END) as pre_ordenes,
  COUNT(CASE WHEN badge IS NOT NULL THEN 1 END) as con_badge
FROM product_catalog;

-- 2. Productos por categoría
SELECT
  category,
  COUNT(*) as cantidad,
  COUNT(CASE WHEN active = true THEN 1 END) as activos
FROM product_catalog
GROUP BY category
ORDER BY cantidad DESC;

-- 3. Productos por badge
SELECT
  COALESCE(badge, 'sin badge') as badge,
  COUNT(*) as cantidad
FROM product_catalog
GROUP BY badge
ORDER BY cantidad DESC;

-- 4. Verificar tipos de datos
SELECT
  slug,
  name,
  pg_typeof(colors) as tipo_colors,
  pg_typeof(features) as tipo_features,
  pg_typeof(images) as tipo_images,
  pg_typeof("originalCharacter") as tipo_original_character
FROM product_catalog
LIMIT 1;

-- 5. Ver un producto completo
SELECT
  slug,
  name,
  concept,
  "originalCharacter",
  price,
  "depositAmount",
  colors,
  features,
  category,
  badge,
  active
FROM product_catalog
WHERE slug = 'star-hunters';
