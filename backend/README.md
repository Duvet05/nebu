# Nebu Backend

Backend NestJS para Nebu Mobile - IoT y Voice Agent Platform con sistema de migrations TypeORM.

## Arquitectura de Base de Datos

Este proyecto usa **TypeORM Migrations** para gestionar tanto la estructura (DDL) como los datos iniciales (DML) en una sola migration unificada.

```
backend/
├── ormconfig.ts                    # Configuración TypeORM
├── startup.sh                      # Script de inicio (ejecuta migrations)
├── src/
│   ├── database/
│   │   └── migrations/
│   │       └── 1732741000000-InitialProductCatalog.ts  # Migration unificada
│   └── toys/
│       ├── entities/
│       │   └── product-catalog.entity.ts
│       ├── services/
│       │   └── product-catalog.service.ts
│       └── controllers/
│           └── product-catalog.controller.ts
└── package.json
```

## Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ver migrations pendientes
npm run migration:show

# Ejecutar migrations
npm run migration:run

# Iniciar en modo desarrollo
npm run start:dev
```

### Producción con Docker

```bash
# Build y deploy
docker-compose up -d --build

# Las migrations se ejecutan automáticamente en startup.sh
```

## Comandos de Migrations

| Comando | Descripción |
|---------|-------------|
| `npm run migration:show` | Ver estado de migrations |
| `npm run migration:run` | Ejecutar migrations pendientes |
| `npm run migration:revert` | Revertir última migration |
| `npm run migration:generate src/database/migrations/Name` | Generar migration desde entidades |
| `npm run migration:create src/database/migrations/Name` | Crear migration vacía |

### Ejecutar en Docker

```bash
# Ver estado
docker exec -it nebu-backend npm run migration:show

# Ejecutar migrations
docker exec -it nebu-backend npm run migration:run

# Revertir última migration
docker exec -it nebu-backend npm run migration:revert
```

## Endpoints Internos

Endpoints disponibles en `/internal` para gestión de migrations:

```bash
# Ejecutar migrations
curl -X POST http://localhost:3001/internal/run-migrations

# Ver estado
curl -X POST http://localhost:3001/internal/migrations-status

# Revertir última migration (usar con precaución)
curl -X POST http://localhost:3001/internal/revert-migration
```

## Migration Actual

### InitialProductCatalog (1732741000000)

Migration **híbrida** que combina lo mejor de TypeORM y SQL manual:

**1. CREATE TABLE (generado style de TypeORM)**
- Estructura basada exactamente en [ProductCatalog entity](src/toys/entities/product-catalog.entity.ts)
- 22 columnas con tipos que mapean 1:1 con la entidad
- Si modificas la entidad, puedes regenerar con `npm run migration:generate`

**2. Índices Automáticos (desde decorators @Index)**
- `@Index(['slug'], { unique: true })` → `CREATE UNIQUE INDEX`
- `@Index(['active'])` → `CREATE INDEX`
- `@Index(['inStock'])` → `CREATE INDEX`

**3. Índices Custom de Performance (manual)**
- 5 índices parciales optimizados para queries específicas
- `WHERE active = true` para filtros comunes

**4. Constraints de Validación (manual)**
- 5 constraints CHECK para integridad de datos
- Validaciones a nivel de base de datos

**5. Seed de 13 Productos (manual)**
- Datos estructurados en TypeScript
- Prepared statements para seguridad
- shortDescriptions incluidas

**Categorías de productos**:
- space-adventure (3)
- fantasy-creatures (3)
- cute-companions (3)
- funny-friends (2)
- ocean-buddies (1)
- gaming-heroes (1)

**Ventajas del enfoque híbrido**:
- ✅ Entidad es la fuente de verdad para estructura
- ✅ TypeORM puede regenerar DDL si cambias la entidad
- ✅ Control manual de optimizaciones (índices, constraints)
- ✅ Rollback completo con `DROP TABLE CASCADE`
- ✅ Prepared statements previenen SQL injection

## Entidad vs Migration: ¿Quién Crea la Tabla?

### TL;DR: La Migration Crea, la Entidad Consulta

```typescript
// ❌ INCORRECTO: synchronize: true en producción
{
  synchronize: true,  // TypeORM crea/modifica tablas automáticamente
  entities: ['src/**/*.entity.ts'],
}

// ✅ CORRECTO: Migrations en producción
{
  synchronize: false,  // Migrations crean las tablas
  entities: ['src/**/*.entity.ts'],  // Solo para queries/inserts
  migrations: ['src/database/migrations/*.ts'],
}
```

### Flujo de Trabajo

1. **Defines la estructura en la Entidad** (fuente de verdad)
   ```typescript
   @Entity('product_catalog')
   export class ProductCatalog {
     @Column({ length: 100 })
     slug: string;
   }
   ```

2. **TypeORM puede generar la migration automáticamente**
   ```bash
   npm run migration:generate src/database/migrations/AddNewField
   # TypeORM compara entity vs DB actual y genera SQL
   ```

3. **O escribes la migration manualmente** (para optimizaciones)
   ```typescript
   // Incluye CREATE TABLE + índices custom + constraints + seed
   await queryRunner.query(`CREATE TABLE ...`);
   ```

4. **La entidad NO crea nada, solo mapea para queries**
   ```typescript
   // En runtime, TypeORM usa la entidad para queries:
   await repository.find({ where: { slug: 'star-hunters' } });
   // Genera: SELECT * FROM product_catalog WHERE slug = 'star-hunters'
   ```

### ¿Por qué este enfoque?

| Aspecto | `synchronize: true` | Migrations |
|---------|---------------------|------------|
| Desarrollo | ✅ Rápido | ⚠️ Manual |
| Producción | ❌ Peligroso | ✅ Seguro |
| Rollback | ❌ No | ✅ Sí |
| Historial | ❌ No | ✅ Sí |
| Control | ❌ Automático | ✅ Total |

## Flujo de Deployment

### 1. Deployment Inicial (Primera vez)

```bash
# Deployment automático
docker-compose up -d --build

# Las migrations se ejecutan automáticamente
# Verifica los logs
docker logs nebu-backend -f
```

### 2. Agregar Nuevos Productos (Después de deployment inicial)

```bash
# Crear nueva migration de datos
npm run migration:create src/database/migrations/AddNewProducts

# Editar el archivo generado
# Implementar usando prepared statements:
await queryRunner.query(
  `INSERT INTO product_catalog (...) VALUES ($1, $2, ...)`,
  [value1, value2, ...]
);

# Commit y deploy
git add src/database/migrations/
git commit -m "feat: add new products"
docker-compose up -d --build
```

### 3. Modificar Estructura de Tabla

```bash
# 1. Modificar entidad
# src/toys/entities/product-catalog.entity.ts
@Column({ nullable: true })
newField: string;

# 2. Generar migration automática
npm run migration:generate src/database/migrations/AddNewField

# 3. Revisar migration generada
# 4. Commit y deploy
git add src/database/migrations/
git commit -m "feat: add new field to products"
docker-compose up -d --build
```

## Troubleshooting

### Resetear migrations en desarrollo

```bash
# 1. Conectar a base de datos
docker exec -it nebu-postgres-prod psql -U nebu_user -d nebu_db

# 2. Limpiar tabla de migrations
DELETE FROM migrations_history;

# 3. Eliminar tabla (opcional)
DROP TABLE product_catalog CASCADE;

# 4. Salir
\q

# 5. Re-ejecutar migrations
docker exec -it nebu-backend npm run migration:run
```

### Ver migrations ejecutadas

```bash
docker exec -it nebu-postgres-prod psql -U nebu_user -d nebu_db \
  -c "SELECT * FROM migrations_history ORDER BY id;"
```

### Error: "Table already exists"

Si la tabla ya existe pero no hay registro en migrations_history:

```bash
# Marcar migration como ejecutada sin correrla
docker exec -it nebu-postgres-prod psql -U nebu_user -d nebu_db -c \
  "INSERT INTO migrations_history (timestamp, name) \
   VALUES (1732741000000, 'InitialProductCatalog1732741000000');"
```

## Tipos de Datos Importantes

| Campo | Tipo TypeORM | Tipo PostgreSQL | Formato en Migration |
|-------|--------------|-----------------|---------------------|
| `images` | `simple-array` | `text` | `''` o `'img1.jpg,img2.jpg'` |
| `features` | `simple-array` | `text` | `'Feature 1,Feature 2'` |
| `colors` | `jsonb` | `jsonb` | `JSON.stringify(['#FF0000','#00FF00'])` |
| `originalCharacter` | `varchar(200)` | `varchar(200)` | `'Nebu Original'` |

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run build` | Compilar proyecto |
| `npm run start` | Iniciar en producción |
| `npm run start:dev` | Iniciar en desarrollo (watch mode) |
| `npm run start:prod` | Iniciar aplicación compilada |
| `npm run lint` | Ejecutar linter |
| `npm run clean` | Limpiar carpeta dist |

## Configuración de Base de Datos

Variables de entorno requeridas (en `.env` o `docker-compose.yml`):

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=nebu_user
DATABASE_PASSWORD=nebu_password_2024!
DATABASE_NAME=nebu_db
```

## Best Practices Implementadas

1. ✅ **Migration unificada**: Una sola migration para setup inicial completo
2. ✅ **Prepared statements**: Prevención de SQL injection
3. ✅ **Rollback completo**: `DROP TABLE CASCADE` revierte todo
4. ✅ **Índices optimizados**: 8 índices para queries comunes
5. ✅ **Constraints en DB**: Validación a nivel de base de datos
6. ✅ **Datos estructurados**: Array de objetos en vez de SQL hardcodeado
7. ✅ **Tipos correctos**: JSONB para JSON, simple-array para strings separados por comas

## Tecnologías

- **Framework**: NestJS 10.x
- **ORM**: TypeORM 0.3.x
- **Base de Datos**: PostgreSQL 15
- **Lenguaje**: TypeScript 5.x
- **Runtime**: Node.js 18+

## Estructura del Proyecto

```
src/
├── common/              # Módulos compartidos
│   └── controllers/
│       └── internal.controller.ts  # Endpoints de migrations
├── database/
│   └── migrations/      # TypeORM migrations (1 archivo)
├── toys/                # Módulo de productos
│   ├── entities/
│   ├── services/
│   ├── controllers/
│   └── dto/
├── users/               # Módulo de usuarios
├── auth/                # Autenticación
└── main.ts             # Entry point
```

## Contribuir

1. Crear branch de feature
2. Hacer cambios y agregar migrations si es necesario
3. Commit con mensaje descriptivo
4. Push y crear Pull Request
5. Las migrations se ejecutan automáticamente en cada ambiente

## Licencia

MIT
