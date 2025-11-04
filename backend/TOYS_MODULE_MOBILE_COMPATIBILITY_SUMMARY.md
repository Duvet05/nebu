# Toys Module - Mobile App Compatibility Summary

## Fecha: 2025-11-04

## Resumen Ejecutivo

Se realizaron modificaciones completas al módulo de juguetes (toys) del backend para asegurar compatibilidad con la aplicación móvil Flutter. Los cambios principales incluyen el uso de `macAddress` en lugar de `iotDeviceId`, la extracción de `userId` desde JWT, campos opcionales, y la adición de endpoints REST completos.

---

## Cambios Realizados

### 1. DTOs (Data Transfer Objects)

#### ✅ CreateToyDto (`src/toys/dto/create-toy.dto.ts`)
**Cambios:**
- ❌ Eliminado: `iotDeviceId` (UUID)
- ❌ Eliminado: `userId` (UUID)
- ✅ Agregado: `macAddress` (string con validación de formato MAC)

**Antes:**
```typescript
@IsUUID()
iotDeviceId: string;

@IsUUID()
userId: string;
```

**Después:**
```typescript
@IsString()
@Matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, {
  message: 'MAC address debe tener formato válido (XX:XX:XX:XX:XX:XX)',
})
macAddress: string;
// userId se obtiene automáticamente del JWT
```

**Impacto:**
- La app móvil ahora envía el MAC address del dispositivo directamente
- El backend crea o busca el IoTDevice automáticamente por MAC
- El userId se extrae del token JWT del usuario autenticado

---

#### ✅ AssignToyDto (`src/toys/dto/assign-toy.dto.ts`)
**Cambios:**
- ❌ Eliminado: `toyId` (UUID)
- ✅ Agregado: `macAddress` (string, requerido)
- ✅ Agregado: `toyName` (string, opcional) - permite renombrar durante asignación

**Antes:**
```typescript
@IsUUID()
toyId: string;

@IsUUID()
userId: string;
```

**Después:**
```typescript
@IsString()
@IsNotEmpty()
macAddress: string;

@IsOptional()
@IsString()
toyName?: string;

userId?: string; // Se llena desde el controlador con JWT
```

**Impacto:**
- La app móvil puede asignar juguetes escaneando el código QR (MAC address)
- No necesita conocer el UUID del juguete
- Puede personalizar el nombre durante la asignación

---

#### ✅ UpdateConnectionStatusDto (NUEVO)
**Archivo:** `src/toys/dto/update-connection-status.dto.ts`

**Propósito:**
- DTO especializado para actualizaciones de estado desde dispositivos IoT
- Valida estados, nivel de batería y fuerza de señal

```typescript
export class UpdateConnectionStatusDto {
  @IsEnum(ToyStatus)
  status: ToyStatus;

  @IsOptional()
  @IsString()
  batteryLevel?: string;

  @IsOptional()
  @IsString()
  signalStrength?: string;
}
```

---

### 2. Entidad Toy (`src/toys/entities/toy.entity.ts`)

#### ✅ Campos Opcionales
**Cambios:**
```typescript
// ANTES
@Column({ type: 'uuid' })
userId: string;

@Column({ type: 'uuid' })
iotDeviceId: string;

// DESPUÉS
@Column({ type: 'uuid', nullable: true })
userId?: string;

@Column({ type: 'uuid', nullable: true })
iotDeviceId?: string;
```

**Impacto:**
- Permite "orphan toys" (juguetes sin usuario asignado)
- Juguetes pueden existir antes de ser emparejados con dispositivos IoT

---

#### ✅ Métodos Convertidos a Getters
**Cambios:**
```typescript
// ANTES
isActive(): boolean {
  return this.status === ToyStatus.ACTIVE || this.status === ToyStatus.CONNECTED;
}

// DESPUÉS
get isActive(): boolean {
  return this.status === ToyStatus.ACTIVE || this.status === ToyStatus.CONNECTED;
}
```

**Métodos convertidos:**
- `isActive()` → `get isActive`
- `isConnected()` → `get isConnected`
- `needsAttention()` → `get needsAttention`

**Impacto:**
- Los getters se serializan automáticamente en respuestas JSON
- La app móvil recibe estos campos calculados sin lógica adicional

---

#### ✅ Relaciones Actualizadas
```typescript
@ManyToOne(() => User, user => user.toys, {
  nullable: true,        // ← Ahora opcional
  onDelete: 'SET NULL'   // ← Cambio de CASCADE a SET NULL
})
user?: User;

@OneToOne('IoTDevice', 'toy', {
  nullable: true,        // ← Ahora opcional
  onDelete: 'SET NULL'   // ← Cambio de CASCADE a SET NULL
})
iotDevice?: IoTDevice;
```

---

### 3. Servicio ToysService (`src/toys/services/toys.service.ts`)

#### ✅ Método `create()`
**Cambios:**
```typescript
// ANTES
async create(createToyDto: CreateToyDto): Promise<ToyResponseDto>

// DESPUÉS
async create(createToyDto: CreateToyDto, userId?: string): Promise<ToyResponseDto>
```

**Nueva Lógica:**
1. Normaliza el MAC address (formato XX:XX:XX:XX:XX:XX)
2. Busca o crea IoTDevice por MAC address
3. Verifica que no exista toy con ese IoTDevice
4. Verifica usuario si se proporciona (JWT)
5. Crea el toy asociado al IoTDevice

**Ejemplo de flujo:**
```typescript
const normalizedMacAddress = this.normalizeMacAddress(createToyDto.macAddress);

// Buscar o crear IoTDevice
let iotDevice = await this.iotDeviceRepository.findOne({
  where: { macAddress: normalizedMacAddress },
});

if (!iotDevice) {
  iotDevice = this.iotDeviceRepository.create({
    name: createToyDto.name,
    macAddress: normalizedMacAddress,
    deviceType: 'controller',
    status: 'offline',
    userId: userId || null,
  });
  iotDevice = await this.iotDeviceRepository.save(iotDevice);
}

// Verificar que no exista toy con este device
const existingToy = await this.toyRepository.findOne({
  where: { iotDeviceId: iotDevice.id },
});

if (existingToy) {
  throw new ConflictException(
    `Ya existe un juguete registrado con MAC address ${normalizedMacAddress}`
  );
}

// Crear el toy...
```

---

#### ✅ Método `assignToy()`
**Cambios:**
```typescript
// ANTES
async assignToy(toyId: string, userId: string): Promise<AssignToyResponseDto>

// DESPUÉS
async assignToy(assignToyDto: AssignToyDto): Promise<AssignToyResponseDto>
```

**Nueva Lógica:**
1. Busca toy por MAC address en lugar de toyId
2. Verifica que el usuario existe
3. Asigna el toy al usuario
4. Permite renombrar el toy (opcional)

**Ejemplo:**
```typescript
const normalizedMacAddress = this.normalizeMacAddress(assignToyDto.macAddress);

const toy = await this.toyRepository.findOne({
  where: {
    iotDevice: { macAddress: normalizedMacAddress }
  },
  relations: ['user', 'iotDevice'],
});

// Asignar y opcionalmente renombrar
toy.userId = assignToyDto.userId;
if (assignToyDto.toyName) {
  toy.name = assignToyDto.toyName;
}

await this.toyRepository.save(toy);
```

---

### 4. Controlador ToysController (`src/toys/controllers/toys.controller.ts`)

#### ✅ Nuevos Endpoints Agregados

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/toys` | Listar todos los juguetes con paginación | ✅ NUEVO |
| GET | `/toys/statistics` | Obtener estadísticas de juguetes | ✅ NUEVO |
| GET | `/toys/my-toys` | Mis juguetes (ya existía) | ✅ MODIFICADO |
| GET | `/toys/mac/:macAddress` | Obtener toy por MAC address | ✅ NUEVO |
| GET | `/toys/:id` | Obtener toy por ID | ✅ NUEVO |
| POST | `/toys` | Crear nuevo juguete | ✅ MODIFICADO |
| POST | `/toys/assign` | Asignar toy a mi cuenta | ✅ MODIFICADO |
| PATCH | `/toys/:id` | Actualizar toy | ✅ NUEVO |
| PATCH | `/toys/connection/:macAddress` | Actualizar estado de conexión | ✅ MODIFICADO |
| DELETE | `/toys/:id` | Eliminar toy | ✅ NUEVO |

---

#### 📝 Detalles de Endpoints

##### **GET /toys**
```typescript
@Get()
async findAll(
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('status') status?: ToyStatus,
  @Query('userId') userId?: string,
  @Query('search') search?: string,
): Promise<ToyListResponseDto>
```

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)
- `status`: Filtrar por estado (opcional)
- `userId`: Filtrar por usuario (opcional)
- `search`: Buscar en nombre, modelo, fabricante, MAC (opcional)

**Respuesta:**
```json
{
  "toys": [...],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

##### **GET /toys/statistics**
```typescript
@Get('statistics')
async getStatistics()
```

**Respuesta:**
```json
{
  "total": 50,
  "assigned": 35,
  "unassigned": 15,
  "byStatus": {
    "active": 20,
    "inactive": 10,
    "connected": 15,
    "disconnected": 3,
    "error": 2
  }
}
```

---

##### **GET /toys/mac/:macAddress**
```typescript
@Get('mac/:macAddress')
async findByMacAddress(
  @Param('macAddress') macAddress: string
): Promise<ToyResponseDto>
```

**Ejemplo:**
```bash
GET /toys/mac/AA:BB:CC:DD:EE:FF
```

---

##### **POST /toys** (MODIFICADO)
```typescript
@Post()
async create(
  @Body() createToyDto: CreateToyDto,
  @CurrentUser() user: User,
): Promise<ToyResponseDto>
```

**IMPORTANTE:**
- ✅ `userId` se obtiene automáticamente del JWT
- ✅ `macAddress` se envía en el body en lugar de `iotDeviceId`
- ✅ Si el IoTDevice no existe, se crea automáticamente

**Request Body:**
```json
{
  "name": "Mi Robot Azul",
  "model": "NebuBot Pro",
  "manufacturer": "Nebu Technologies",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "firmwareVersion": "1.2.3",
  "capabilities": {
    "voice": true,
    "movement": true,
    "lights": true,
    "sensors": ["temperature", "distance"]
  }
}
```

---

##### **POST /toys/assign** (MODIFICADO)
```typescript
@Post('assign')
async assignToy(
  @Body() assignToyDto: AssignToyDto,
  @CurrentUser() user: User,
): Promise<AssignToyResponseDto>
```

**IMPORTANTE:**
- ✅ `userId` se obtiene automáticamente del JWT
- ✅ `macAddress` se envía en lugar de `toyId`
- ✅ Permite renombrar durante asignación

**Request Body:**
```json
{
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "toyName": "Mi Nuevo Robot" // Opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Juguete asignado exitosamente al usuario",
  "toy": { ... }
}
```

---

##### **PATCH /toys/connection/:macAddress** (MODIFICADO)
```typescript
@Patch('connection/:macAddress')
async updateConnectionStatus(
  @Param('macAddress') macAddress: string,
  @Body() updateStatusDto: UpdateConnectionStatusDto,
): Promise<ToyResponseDto>
```

**Request Body:**
```json
{
  "status": "connected",
  "batteryLevel": "85%",
  "signalStrength": "-45dBm"
}
```

---

### 5. Migraciones de Base de Datos

#### ✅ Archivos Creados

**TypeScript Migration:**
- `src/migrations/1730850000000-MakeToysUserAndDeviceNullable.ts`

**SQL Migration:**
- `src/migrations/make-toys-user-and-device-nullable.sql`

#### 📝 Cambios en la Base de Datos

**Operaciones:**
1. Eliminar foreign keys existentes
2. Modificar columnas `userId` y `iotDeviceId` → `NULL`
3. Recrear foreign keys con `ON DELETE SET NULL`

**SQL Ejecutado:**
```sql
-- Modificar columnas
ALTER TABLE "toys"
  ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "toys"
  ALTER COLUMN "iotDeviceId" DROP NOT NULL;

-- Recrear foreign keys
ALTER TABLE "toys"
  ADD CONSTRAINT "FK_toys_userId"
  FOREIGN KEY ("userId")
  REFERENCES "users"("id")
  ON DELETE SET NULL;

ALTER TABLE "toys"
  ADD CONSTRAINT "FK_toys_iotDeviceId"
  FOREIGN KEY ("iotDeviceId")
  REFERENCES "iot_devices"("id")
  ON DELETE SET NULL;
```

---

## Testing

### Ejecutar Migración
```bash
# Opción 1: TypeORM CLI
npm run typeorm migration:run

# Opción 2: Manual SQL
psql -U postgres -d nebu_db -f src/migrations/make-toys-user-and-device-nullable.sql
```

### Verificar Migración
```sql
-- Verificar estructura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'toys'
  AND column_name IN ('userId', 'iotDeviceId');

-- Debería retornar:
-- userId       | uuid | YES | NULL
-- iotDeviceId  | uuid | YES | NULL
```

---

## Endpoints de Prueba

### 1. Registrar Juguete
```bash
curl -X POST http://localhost:3000/api/toys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Robot Azul",
    "model": "NebuBot Pro",
    "manufacturer": "Nebu Technologies",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "firmwareVersion": "1.2.3",
    "capabilities": {
      "voice": true,
      "movement": true,
      "lights": true
    }
  }'
```

### 2. Listar Juguetes
```bash
curl -X GET "http://localhost:3000/api/toys?page=1&limit=10&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Obtener por MAC Address
```bash
curl -X GET http://localhost:3000/api/toys/mac/AA:BB:CC:DD:EE:FF \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Asignar Juguete
```bash
curl -X POST http://localhost:3000/api/toys/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "toyName": "Mi Robot Personalizado"
  }'
```

### 5. Actualizar Estado de Conexión
```bash
curl -X PATCH http://localhost:3000/api/toys/connection/AA:BB:CC:DD:EE:FF \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "connected",
    "batteryLevel": "85%",
    "signalStrength": "-45dBm"
  }'
```

### 6. Obtener Estadísticas
```bash
curl -X GET http://localhost:3000/api/toys/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Mis Juguetes
```bash
curl -X GET http://localhost:3000/api/toys/my-toys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Actualizar Juguete
```bash
curl -X PATCH http://localhost:3000/api/toys/JUGUETE_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Nombre",
    "status": "active",
    "batteryLevel": "90%"
  }'
```

### 9. Eliminar Juguete
```bash
curl -X DELETE http://localhost:3000/api/toys/JUGUETE_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Compatibilidad con App Móvil Flutter

### ✅ Cambios Cumplidos

| Requisito | Estado | Descripción |
|-----------|--------|-------------|
| macAddress en CreateToyDto | ✅ | Reemplaza iotDeviceId |
| macAddress en AssignToyDto | ✅ | Reemplaza toyId |
| userId desde JWT | ✅ | No se envía en body |
| Campos opcionales | ✅ | userId y iotDeviceId nullable |
| Métodos → Getters | ✅ | isActive, isConnected, needsAttention |
| GET /toys | ✅ | Con paginación y filtros |
| GET /toys/:id | ✅ | Buscar por UUID |
| GET /toys/mac/:macAddress | ✅ | Buscar por MAC |
| POST /toys | ✅ | Crea toy + IoTDevice |
| POST /toys/assign | ✅ | Asigna por MAC |
| PATCH /toys/:id | ✅ | Actualizar toy |
| PATCH /toys/connection/:macAddress | ✅ | Actualizar estado |
| DELETE /toys/:id | ✅ | Eliminar toy |
| GET /toys/statistics | ✅ | Estadísticas |
| Migración DB | ✅ | Campos nullable |

---

## Archivos Modificados

### Nuevos Archivos
- ✅ `src/toys/dto/update-connection-status.dto.ts`
- ✅ `src/migrations/1730850000000-MakeToysUserAndDeviceNullable.ts`
- ✅ `src/migrations/make-toys-user-and-device-nullable.sql`
- ✅ `TOYS_MODULE_MOBILE_COMPATIBILITY_SUMMARY.md` (este archivo)

### Archivos Modificados
- ✅ `src/toys/dto/create-toy.dto.ts`
- ✅ `src/toys/dto/assign-toy.dto.ts`
- ✅ `src/toys/entities/toy.entity.ts`
- ✅ `src/toys/services/toys.service.ts`
- ✅ `src/toys/controllers/toys.controller.ts`

---

## Próximos Pasos

### 1. Ejecutar Migración
```bash
cd backend
npm run typeorm migration:run
```

### 2. Reiniciar Backend
```bash
npm run start:dev
```

### 3. Probar Endpoints
- Usar Postman o curl para probar cada endpoint
- Verificar que JWT funciona correctamente
- Probar creación de toys con MAC address
- Probar asignación por MAC address

### 4. Integrar con App Móvil
- Actualizar servicios en Flutter para usar nuevos endpoints
- Probar flujo completo de registro → asignación → uso
- Verificar manejo de errores y validaciones

### 5. Documentación Swagger
- Acceder a: `http://localhost:3000/api/docs`
- Verificar que todos los endpoints estén documentados
- Probar desde Swagger UI

---

## Notas Importantes

### Seguridad
- ✅ Todos los endpoints requieren autenticación JWT
- ✅ userId se extrae del token, no del body (más seguro)
- ✅ Validación de formato MAC address
- ✅ Validación de ownership antes de operaciones

### Validaciones
- ✅ MAC address debe ser formato válido (XX:XX:XX:XX:XX:XX)
- ✅ No se pueden crear toys duplicados con mismo MAC
- ✅ No se pueden asignar toys que no existen
- ✅ Estado debe ser valor válido de ToyStatus enum

### Manejo de Errores
- `404 Not Found`: Toy o usuario no encontrado
- `409 Conflict`: Toy con MAC ya existe
- `400 Bad Request`: Datos inválidos (MAC, validaciones)
- `401 Unauthorized`: Token JWT inválido o expirado

---

## Soporte

Para preguntas o problemas:
1. Revisar logs del backend: `npm run start:dev`
2. Verificar Swagger docs: `http://localhost:3000/api/docs`
3. Probar endpoints con Postman
4. Revisar migraciones ejecutadas

---

**Autor:** Claude Code
**Fecha:** 2025-11-04
**Versión:** 1.0.0
**Estado:** ✅ Completado
