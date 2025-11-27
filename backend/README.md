# Nebu Backend

Backend NestJS para Nebu Mobile - IoT y Voice Agent Platform con sistema de migrations TypeORM.

## Arquitectura de Base de Datos

Este proyecto usa **TypeORM Migrations** para gestionar tanto la estructura (DDL) como los datos iniciales (DML).

```
backend/
├── ormconfig.ts                    # Configuración TypeORM
├── startup.sh                      # Script de inicio (ejecuta migrations)
├── src/
│   ├── database/
│   │   └── migrations/            # Migrations versionadas
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

## Migrations Actuales

### 1. AddProductCatalogIndexesAndConstraints (1732741200000)
- **Índices**: 5 índices para optimizar queries
- **Constraints**: 7 validaciones de datos

### 2. PopulateShortDescriptions (1732741300000)
- Agrega descripciones cortas a productos existentes

### 3. SeedInitialProducts (1732741400000)
- Carga inicial de 13 productos del catálogo
- Previene duplicados
- Rollback completo disponible

Ver [MIGRATIONS.md](./MIGRATIONS.md) para documentación completa.

## Flujo de Deployment

### Cambios en la Base de Datos

1. **Modificar entidades**
   ```typescript
   // src/toys/entities/product-catalog.entity.ts
   @Column({ nullable: true })
   newField: string;
   ```

2. **Generar migration**
   ```bash
   npm run migration:generate src/database/migrations/AddNewField
   ```

3. **Revisar migration generada**
   ```typescript
   // src/database/migrations/TIMESTAMP-AddNewField.ts
   public async up(queryRunner: QueryRunner): Promise<void> {
     // Revisar cambios
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
     // Implementar rollback
   }
   ```

4. **Commit y push**
   ```bash
   git add src/database/migrations/
   git commit -m "feat: add new field to products"
   git push
   ```

5. **Deploy**
   ```bash
   docker-compose down
   docker-compose up -d --build
   # Migrations se ejecutan automáticamente
   ```

### Agregar Datos Iniciales

1. **Crear data migration**
   ```bash
   npm run migration:create src/database/migrations/SeedNewProducts
   ```

2. **Implementar insert con prevención de duplicados**
   ```typescript
   public async up(queryRunner: QueryRunner): Promise<void> {
     const result = await queryRunner.query(
       `SELECT COUNT(*) as count FROM product_catalog WHERE slug = 'new-product'`,
     );

     if (parseInt(result[0].count) > 0) {
       console.log('⚠️  Product already exists. Skipping.');
       return;
     }

     await queryRunner.query(`
       INSERT INTO product_catalog (slug, name, ...) VALUES ('new-product', 'New Product', ...);
     `);
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.query(`DELETE FROM product_catalog WHERE slug = 'new-product';`);
   }
   ```

3. **Deploy** (igual que arriba)

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

## Troubleshooting

### Resetear migrations en desarrollo

```bash
# Conectar a base de datos
docker exec -it nebu-postgres-prod psql -U nebu_user -d nebu_db

# Limpiar historial
DELETE FROM migrations_history;

# Limpiar datos (opcional)
TRUNCATE product_catalog CASCADE;

# Salir
\q

# Re-ejecutar migrations
docker exec -it nebu-backend npm run migration:run
```

### Ver migrations ejecutadas

```bash
docker exec -it nebu-postgres-prod psql -U nebu_user -d nebu_db \
  -c "SELECT * FROM migrations_history ORDER BY id;"
```

### Migration ya ejecutada

```bash
# Eliminar registro específico
docker exec -it nebu-postgres-prod psql -U nebu_user -d nebu_db \
  -c "DELETE FROM migrations_history WHERE name = 'NombreMigration';"
```

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
│   └── migrations/      # TypeORM migrations
├── toys/                # Módulo de productos
│   ├── entities/
│   ├── services/
│   ├── controllers/
│   └── dto/
├── users/               # Módulo de usuarios
├── auth/                # Autenticación
└── main.ts             # Entry point
```

## Documentación Adicional

- [MIGRATIONS.md](./MIGRATIONS.md) - Guía completa de migrations
- [API Swagger](http://localhost:3001/api) - Documentación de endpoints (en desarrollo)

## Contribuir

1. Crear branch de feature
2. Hacer cambios y agregar migrations si es necesario
3. Commit con mensaje descriptivo
4. Push y crear Pull Request
5. Las migrations se ejecutan automáticamente en cada ambiente

## Licencia

MIT
