# Nebu Backend

Backend NestJS para Nebu Mobile - IoT y Voice Agent Platform con sistema de migrations TypeORM.

## Características Principales

- **Sistema de Juguetes Inteligentes**: Gestión completa de juguetes IoT con control de inventario
- **Integración IoT**: Control y monitoreo de dispositivos ESP32 conectados
- **Logging de Actividades**: Registro completo de interacciones y eventos del usuario
- **Setup Wizard**: Configuración inicial del usuario con preferencias y ajustes
- **Autenticación JWT**: Sistema seguro de autenticación y autorización
- **Migraciones Automáticas**: TypeORM migrations para gestión de base de datos
- **API REST Completa**: Endpoints documentados con Swagger/OpenAPI

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

# La API estará disponible en http://localhost:3001
# Documentación Swagger en http://localhost:3001/api
```

### Producción con Docker

```bash
# Build y deploy
docker-compose up -d --build

# Las migrations se ejecutan automáticamente en startup.sh
```

## API Endpoints

### Autenticación

- `POST /auth/register` - Registro de nuevos usuarios
- `POST /auth/login` - Inicio de sesión
- `POST /auth/refresh` - Refrescar token JWT

### Usuarios

- `GET /users` - Listar usuarios (Admin)
- `GET /users/:id` - Obtener usuario por ID
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### Setup Wizard

- `POST /users/:userId/setup` - Guardar configuración completa del wizard (transaccional)
- `GET /users/:userId/setup` - Obtener configuración guardada
- `PATCH /users/:userId/preferences` - Actualizar preferencias parcialmente

### Juguetes (Toys)

- `GET /toys` - Listar todos los juguetes
- `GET /toys/:id` - Obtener juguete por ID
- `POST /toys` - Crear nuevo juguete
- `PATCH /toys/:id` - Actualizar juguete
- `DELETE /toys/:id` - Eliminar juguete
- `POST /toys/:id/assign` - Asignar juguete a usuario (auto-activa)
- `POST /toys/:id/unassign` - Liberar juguete de usuario
- `GET /toys/user/:userId` - Obtener juguetes de un usuario

### Catálogo de Productos

- `GET /product-catalog` - Listar productos disponibles
- `GET /product-catalog/:slug` - Obtener producto por slug
- `GET /product-catalog/active` - Productos activos y en stock

### Dispositivos IoT

- `GET /iot/devices` - Listar todos los dispositivos IoT
- `GET /iot/devices/user/:userId` - Dispositivos de un usuario
- `GET /iot/devices/:id` - Obtener dispositivo por ID
- `POST /iot/devices` - Registrar nuevo dispositivo (auto-registro ESP32)
- `PATCH /iot/devices/:id` - Actualizar dispositivo
- `DELETE /iot/devices/:id` - Eliminar dispositivo (valida asignación a Toy)

### Actividades (Activity Log)

- `POST /activities` - Crear registro de actividad
- `GET /activities` - Obtener actividades con filtros y paginación
  - Query params: `userId` (requerido), `toyId`, `type`, `startDate`, `endDate`, `limit`, `page`
- `POST /activities/migrate` - Migrar actividades de usuario local a autenticado
- `GET /activities/stats/:userId` - Obtener estadísticas de actividades

### Pagos (Culqi)

- `POST /payments/charge` - Procesar pago con Culqi
- `POST /payments/refund` - Procesar reembolso
- `GET /payments/:chargeId` - Obtener detalles de cargo

Ver documentación completa en [ENDPOINTS_IMPLEMENTADOS.md](ENDPOINTS_IMPLEMENTADOS.md)

## Documentación Adicional

- **[ENDPOINTS_IMPLEMENTADOS.md](ENDPOINTS_IMPLEMENTADOS.md)** - Referencia completa de todos los endpoints con ejemplos de request/response
- **[ACTIVITY_MIGRATION.md](ACTIVITY_MIGRATION.md)** - Documentación detallada del sistema de migración de actividades
- **[scripts/test-toy-relations.http](scripts/test-toy-relations.http)** - Tests HTTP para relaciones Toy ↔ IoT
- **[scripts/test-new-endpoints.http](scripts/test-new-endpoints.http)** - Tests HTTP para Setup Wizard y Activities
- **[scripts/test-activity-migration.http](scripts/test-activity-migration.http)** - Tests HTTP para migración de actividades

## Testing con HTTP Files

El proyecto incluye archivos `.http` para testing manual de endpoints:

```bash
# Instalar extensión REST Client en VSCode
# Abrir cualquier archivo .http en scripts/
# Hacer clic en "Send Request" sobre cada endpoint
```

Archivos de test disponibles:
- `test-toy-relations.http` - Tests de asignación/desasignación de juguetes
- `test-new-endpoints.http` - Tests de Setup y Activities
- `test-activity-migration.http` - Tests de migración con casos edge

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

## Características Técnicas Destacadas

### Relación Toy ↔ IoT Device (1:1)

Implementación de relación uno-a-uno entre juguetes y dispositivos IoT:
- UNIQUE constraint en `toys.iotDeviceId` con índice parcial
- Validación automática al asignar/desasignar dispositivos
- Prevención de duplicados a nivel de base de datos
- Auto-activación de juguetes al asignar a usuario

```typescript
// Ejemplo de asignación
POST /toys/:id/assign
{
  "userId": "uuid-del-usuario",
  "iotDeviceId": "uuid-del-dispositivo"
}
```

### Activity Migration (Pre-auth → Authenticated)

Sistema de migración de actividades para usuarios que usan la app antes de registrarse:
- Migración transaccional y atómica
- Manejo de casos edge (IDs idénticos, sin actividades)
- Operación idempotente (puede ejecutarse múltiples veces)
- Logging detallado del proceso

```typescript
// Ejemplo de migración
POST /activities/migrate
{
  "localUserId": "uuid-temporal-generado-por-app",
  "newUserId": "uuid-usuario-autenticado"
}
```

Ver documentación completa en [ACTIVITY_MIGRATION.md](ACTIVITY_MIGRATION.md)

### Setup Wizard Transaccional

Configuración inicial del usuario con garantía de atomicidad:
- Guardado completo en una sola transacción
- Rollback automático en caso de error
- Soporte para perfil, preferencias, notificaciones y ajustes de voz
- Validación exhaustiva con DTOs

### Activity Log con Retención Automática

Sistema completo de logging de actividades:
- Paginación eficiente (default 50, max 100)
- Filtros múltiples: usuario, juguete, tipo, rango de fechas
- Índices compuestos para performance
- Cron job diario para limpieza (retención de 90 días)
- 9 tipos de actividades: voice_command, connection, interaction, update, error, play, sleep, wake, chat

### Validaciones de Integridad

- No se puede eliminar un IoT Device si está asignado a un Toy activo
- No se puede asignar el mismo IoT Device a múltiples Toys
- Auto-activación de Toys al asignar a usuario
- Validación de ownership en operaciones de desasignación

## Tecnologías

- **Framework**: NestJS 10.x
- **ORM**: TypeORM 0.3.x
- **Base de Datos**: PostgreSQL 15
- **Lenguaje**: TypeScript 5.x
- **Runtime**: Node.js 18+
- **Autenticación**: JWT con Passport
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI
- **Pagos**: Culqi API Integration
- **Scheduling**: @nestjs/schedule (Cron jobs)

## Estructura del Proyecto

```
src/
├── common/                          # Módulos compartidos
│   ├── controllers/
│   │   ├── internal.controller.ts  # Endpoints de migrations
│   │   └── activity.controller.ts  # Activity logging
│   ├── services/
│   │   └── activity.service.ts     # Activity service con cron jobs
│   ├── entities/
│   │   ├── location.entity.ts
│   │   └── activity.entity.ts      # Activity logs con índices
│   └── dto/
│       └── activity.dto.ts         # DTOs incluyendo migration
├── database/
│   ├── migrations/                  # TypeORM migrations
│   └── config/
│       └── database.config.ts      # Configuración (synchronize en dev)
├── toys/                            # Módulo de juguetes
│   ├── entities/
│   │   ├── toy.entity.ts           # 1:1 con IoTDevice, UNIQUE constraint
│   │   └── product-catalog.entity.ts
│   ├── services/
│   │   ├── toys.service.ts         # Assign/Unassign con validaciones
│   │   └── product-catalog.service.ts
│   ├── controllers/
│   │   ├── toys.controller.ts      # Endpoints de toys
│   │   └── product-catalog.controller.ts
│   └── dto/
├── users/                           # Módulo de usuarios
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── person.entity.ts
│   │   └── user-setup.entity.ts    # Setup wizard config
│   ├── services/
│   │   ├── users.service.ts
│   │   └── user-setup.service.ts   # Setup transaccional
│   ├── controllers/
│   │   ├── users.controller.ts
│   │   └── user-setup.controller.ts
│   └── dto/
│       └── user-setup.dto.ts       # DTOs con validaciones completas
├── iot/                             # Módulo IoT
│   ├── entities/
│   │   └── iot-device.entity.ts    # Dispositivos ESP32
│   ├── services/
│   │   └── iot.service.ts          # DELETE con validación Toy
│   ├── controllers/
│   │   └── iot.controller.ts
│   └── dto/
├── auth/                            # Autenticación JWT
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   └── auth.controller.ts
├── payments/                        # Integración Culqi
│   ├── services/
│   │   └── culqi.service.ts
│   └── controllers/
│       └── payments.controller.ts
└── main.ts                          # Entry point
```

## Contribuir

1. Crear branch de feature
2. Hacer cambios y agregar migrations si es necesario
3. Commit con mensaje descriptivo
4. Push y crear Pull Request
5. Las migrations se ejecutan automáticamente en cada ambiente

## Licencia

MIT
