# Análisis de Compatibilidad: Módulo Toys - Backend ↔ App Móvil Flutter

**Fecha:** 04/11/2025
**Estado:** 🔴 REQUIERE CAMBIOS CRÍTICOS

---

## 📋 Resumen Ejecutivo

El módulo de toys del backend **NO es totalmente compatible** con la app móvil Flutter. Se requieren cambios significativos en DTOs, endpoints y lógica de servicio.

### Estado Actual vs Requerido

| Componente | Estado Actual | Requerido | ¿Compatible? |
|------------|---------------|-----------|--------------|
| Entidad Toy | iotDeviceId requerido | macAddress directo | ❌ |
| CreateToyDto | iotDeviceId + userId requeridos | macAddress requerido, userId opcional | ❌ |
| AssignToyDto | toyId | macAddress | ❌ |
| Endpoint GET /toys | ❌ No existe | ✅ Con paginación | ❌ |
| Endpoint GET /toys/:id | ❌ No existe | ✅ Requerido | ❌ |
| Endpoint PATCH /toys/:id | ❌ No existe | ✅ Requerido | ❌ |
| Endpoint DELETE /toys/:id | ❌ No existe | ✅ Requerido | ❌ |
| Endpoint GET /toys/mac/:macAddress | ❌ No existe | ✅ Requerido | ❌ |
| Endpoint GET /toys/statistics | ❌ No existe | ✅ Requerido (admin) | ❌ |
| Getters (isActive, etc.) | Métodos normales | Getters con `get` | ⚠️ Funciona pero no ideal |

---

## 🔴 Problemas Críticos Encontrados

### 1. CreateToyDto usa iotDeviceId, app móvil envía macAddress

**Problema:**
```typescript
// Backend actual
export class CreateToyDto {
  @IsNotEmpty()
  @IsUUID()
  iotDeviceId: string;  // ❌ Backend espera iotDeviceId

  @IsNotEmpty()
  @IsUUID()
  userId: string;  // ❌ Backend requiere userId en body
}
```

**App móvil envía:**
```dart
{
  "macAddress": "AA:BB:CC:DD:EE:FF",  // ✅ App envía macAddress
  "name": "Mi Robot",
  // NO envía userId (se espera del JWT)
}
```

**Impacto:** ❌ POST /toys fallará siempre

---

### 2. AssignToyDto usa toyId, app móvil envía macAddress

**Problema:**
```typescript
// Backend actual
export class AssignToyDto {
  @IsUUID()
  toyId: string;  // ❌ Backend espera toyId

  @IsOptional()
  @IsUUID()
  userId?: string;  // ✅ Correcto
}
```

**App móvil envía:**
```dart
{
  "macAddress": "AA:BB:CC:DD:EE:FF",  // ✅ App envía macAddress
  "userId": "user-uuid",
  "toyName": "Nuevo nombre"  // Opcional
}
```

**Impacto:** ❌ POST /toys/assign fallará siempre

---

### 3. Endpoints Faltantes

El controller actual solo tiene 4 endpoints:
```typescript
POST   /toys
GET    /toys/my-toys
POST   /toys/assign
PATCH  /toys/connection/:macAddress
```

**Faltan:**
```typescript
GET    /toys                  ❌ (con paginación y filtros)
GET    /toys/:id              ❌
GET    /toys/mac/:macAddress  ❌
PATCH  /toys/:id              ❌
DELETE /toys/:id              ❌
GET    /toys/statistics       ❌ (admin only)
```

**Impacto:** La app móvil no puede:
- Listar todos los toys con paginación
- Buscar toy por ID
- Buscar toy por MAC address
- Actualizar toy por ID
- Eliminar toy
- Ver estadísticas (admin)

---

### 4. Entidad Toy: userId es NOT NULL

**Problema:**
```typescript
// toy.entity.ts línea 95
@ManyToOne(() => User, user => user.toys, { nullable: false, onDelete: 'CASCADE' })
@JoinColumn({ name: 'userId' })
user: User;

@Column({ type: 'uuid' })
userId: string;  // ❌ NOT NULL
```

**App móvil espera:**
- Poder crear toys sin userId (se asigna después con POST /toys/assign)
- userId debe ser opcional

**Impacto:** No se pueden crear toys "huérfanos" para asignar después

---

### 5. Métodos helper no son getters

**Problema:**
```typescript
// toy.entity.ts
isActive(): boolean { ... }       // ❌ Método
isConnected(): boolean { ... }    // ❌ Método
needsAttention(): boolean { ... } // ❌ Método
```

**Debería ser:**
```typescript
get isActive(): boolean { ... }       // ✅ Getter
get isConnected(): boolean { ... }    // ✅ Getter
get needsAttention(): boolean { ... } // ✅ Getter
```

**Impacto:** ⚠️ Funciona, pero no se serializan automáticamente en las respuestas sin mapeo manual

---

## ✅ Aspectos Correctos

1. ✅ ToyStatus enum está completo
2. ✅ Campos de la entidad (batteryLevel, signalStrength, lastSeenAt, etc.)
3. ✅ Endpoint PATCH /toys/connection/:macAddress (para IoT)
4. ✅ Endpoint GET /toys/my-toys
5. ✅ ToyResponseDto tiene todos los campos necesarios
6. ✅ Validación y normalización de macAddress en el service
7. ✅ ToyListResponseDto para paginación (estructura lista, solo falta endpoint)

---

## 🔧 Cambios Requeridos

### Cambio 1: Modificar CreateToyDto

**Archivo:** `backend/src/toys/dto/create-toy.dto.ts`

```typescript
export class CreateToyDto {
  // CAMBIO: Reemplazar iotDeviceId por macAddress
  @ApiProperty({
    description: 'MAC address del dispositivo IoT',
    example: 'AA:BB:CC:DD:EE:FF',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, {
    message: 'MAC address debe tener formato XX:XX:XX:XX:XX:XX o XX-XX-XX-XX-XX-XX'
  })
  macAddress: string;

  @ApiProperty({
    description: 'Nombre del juguete',
    example: 'Mi Robot Azul',
  })
  @IsString()
  @Length(1, 100)
  name: string;

  // ... resto de campos opcionales ...

  // REMOVER: userId (se obtiene del JWT en el controller)
}
```

### Cambio 2: Crear nuevo UpdateConnectionStatusDto

**Archivo:** `backend/src/toys/dto/update-connection-status.dto.ts` (NUEVO)

```typescript
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToyStatus } from '../entities/toy.entity';

export class UpdateConnectionStatusDto {
  @ApiProperty({
    description: 'Estado actual del juguete',
    enum: ToyStatus,
    example: ToyStatus.CONNECTED,
  })
  @IsEnum(ToyStatus)
  status: ToyStatus;

  @ApiPropertyOptional({
    description: 'Nivel de batería',
    example: '85%',
  })
  @IsOptional()
  @IsString()
  batteryLevel?: string;

  @ApiPropertyOptional({
    description: 'Fuerza de señal WiFi',
    example: '-45dBm',
  })
  @IsOptional()
  @IsString()
  signalStrength?: string;
}
```

### Cambio 3: Modificar AssignToyDto

**Archivo:** `backend/src/toys/dto/assign-toy.dto.ts`

```typescript
export class AssignToyDto {
  // CAMBIO: Reemplazar toyId por macAddress
  @ApiProperty({
    description: 'MAC address del juguete a asignar',
    example: 'AA:BB:CC:DD:EE:FF',
  })
  @IsString()
  @IsNotEmpty()
  macAddress: string;

  @ApiProperty({
    description: 'ID del usuario al que asignar el juguete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Nombre opcional del juguete',
    example: 'Mi Robot Personalizado',
  })
  @IsOptional()
  @IsString()
  toyName?: string;
}
```

### Cambio 4: Modificar Toy Entity - Cambiar a getters

**Archivo:** `backend/src/toys/entities/toy.entity.ts`

```typescript
export class Toy {
  // ... campos existentes ...

  // CAMBIO: Convertir métodos a getters
  get isActive(): boolean {
    return this.status === ToyStatus.ACTIVE || this.status === ToyStatus.CONNECTED;
  }

  get isConnected(): boolean {
    return this.status === ToyStatus.CONNECTED;
  }

  get needsAttention(): boolean {
    return [
      ToyStatus.ERROR,
      ToyStatus.MAINTENANCE,
      ToyStatus.BLOCKED,
    ].includes(this.status);
  }

  // CAMBIO: También hacer userId nullable
  @ManyToOne(() => User, user => user.toys, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  // CAMBIO: Hacer iotDeviceId nullable también (se crea automáticamente)
  @Column({ type: 'uuid', nullable: true })
  iotDeviceId?: string;
}
```

### Cambio 5: Modificar ToysService.create()

**Archivo:** `backend/src/toys/services/toys.service.ts`

```typescript
async create(createToyDto: CreateToyDto, userId?: string): Promise<ToyResponseDto> {
  const normalizedMacAddress = this.normalizeMacAddress(createToyDto.macAddress);

  // 1. Buscar o crear IoTDevice por MAC address
  let iotDevice = await this.iotDeviceRepository.findOne({
    where: { macAddress: normalizedMacAddress },
  });

  if (!iotDevice) {
    // Crear nuevo IoTDevice si no existe
    iotDevice = this.iotDeviceRepository.create({
      name: createToyDto.name,
      macAddress: normalizedMacAddress,
      deviceType: 'controller',  // Tipo por defecto para juguetes
      status: 'offline',
      userId: userId || null,
    });
    iotDevice = await this.iotDeviceRepository.save(iotDevice);
  }

  // 2. Verificar si ya existe un toy con este IoTDevice
  const existingToy = await this.toyRepository.findOne({
    where: { iotDeviceId: iotDevice.id },
  });

  if (existingToy) {
    throw new ConflictException(
      `Ya existe un juguete registrado con MAC address ${normalizedMacAddress}`
    );
  }

  // 3. Verificar usuario si se proporciona
  if (userId) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
  }

  // 4. Crear el juguete
  const toy = this.toyRepository.create({
    name: createToyDto.name,
    model: createToyDto.model,
    manufacturer: createToyDto.manufacturer,
    status: createToyDto.status || ToyStatus.INACTIVE,
    firmwareVersion: createToyDto.firmwareVersion,
    capabilities: createToyDto.capabilities,
    settings: createToyDto.settings,
    notes: createToyDto.notes,
    iotDeviceId: iotDevice.id,
    userId: userId || null,
    activatedAt: createToyDto.status === ToyStatus.ACTIVE ? new Date() : null,
  });

  const savedToy = await this.toyRepository.save(toy);
  return this.mapToyToResponseDto(await this.toyRepository.findOne({
    where: { id: savedToy.id },
    relations: ['user', 'iotDevice'],
  }));
}
```

### Cambio 6: Modificar ToysService.assignToy()

**Archivo:** `backend/src/toys/services/toys.service.ts`

```typescript
async assignToy(assignToyDto: AssignToyDto): Promise<AssignToyResponseDto> {
  const normalizedMacAddress = this.normalizeMacAddress(assignToyDto.macAddress);

  // Buscar toy por MAC address
  const toy = await this.toyRepository.findOne({
    where: {
      iotDevice: { macAddress: normalizedMacAddress }
    },
    relations: ['user', 'iotDevice'],
  });

  if (!toy) {
    throw new NotFoundException(
      `Juguete con MAC address ${normalizedMacAddress} no encontrado`
    );
  }

  // Verificar que el usuario existe
  const user = await this.userRepository.findOne({
    where: { id: assignToyDto.userId },
  });

  if (!user) {
    throw new NotFoundException(`Usuario con ID ${assignToyDto.userId} no encontrado`);
  }

  // Actualizar el toy
  toy.userId = assignToyDto.userId;
  if (assignToyDto.toyName) {
    toy.name = assignToyDto.toyName;
  }

  await this.toyRepository.save(toy);

  return {
    success: true,
    message: 'Juguete asignado exitosamente al usuario',
    toy: this.mapToyToResponseDto(toy),
  };
}
```

### Cambio 7: Agregar Endpoints Faltantes en ToysController

**Archivo:** `backend/src/toys/controllers/toys.controller.ts`

```typescript
@Controller('toys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ToysController {
  constructor(private readonly toysService: ToysService) {}

  // NUEVO: GET /toys (con paginación y filtros)
  @Get()
  @ApiOperation({ summary: 'Listar todos los juguetes con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ToyStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ToyStatus,
    @Query('search') search?: string,
    @CurrentUser() user?: User,
  ): Promise<ToyListResponseDto> {
    return this.toysService.findAll(
      page ? +page : 1,
      limit ? +limit : 10,
      status,
      undefined, // userId - null para admin, si no es admin se filtra automáticamente
      search,
    );
  }

  // MODIFICADO: POST /toys (ahora extrae userId del JWT)
  @Post()
  @ApiOperation({ summary: 'Registrar nuevo juguete' })
  async create(
    @Body() createToyDto: CreateToyDto,
    @CurrentUser() user: User,
  ): Promise<ToyResponseDto> {
    return this.toysService.create(createToyDto, user.id);
  }

  // EXISTENTE: GET /toys/my-toys
  @Get('my-toys')
  async findMyToys(@CurrentUser() user: User): Promise<ToyResponseDto[]> {
    return this.toysService.findByUserId(user.id);
  }

  // NUEVO: GET /toys/statistics (admin only)
  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener estadísticas de juguetes' })
  async getStatistics() {
    return this.toysService.getStatistics();
  }

  // NUEVO: GET /toys/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener juguete por ID' })
  @ApiParam({ name: 'id', description: 'ID del juguete' })
  async findOne(@Param('id') id: string): Promise<ToyResponseDto> {
    return this.toysService.findOne(id);
  }

  // NUEVO: GET /toys/mac/:macAddress
  @Get('mac/:macAddress')
  @ApiOperation({ summary: 'Obtener juguete por MAC address' })
  @ApiParam({ name: 'macAddress', description: 'MAC address del juguete' })
  async findByMacAddress(
    @Param('macAddress') macAddress: string,
  ): Promise<ToyResponseDto> {
    return this.toysService.findByMacAddress(macAddress);
  }

  // NUEVO: PATCH /toys/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar juguete' })
  @ApiParam({ name: 'id', description: 'ID del juguete' })
  async update(
    @Param('id') id: string,
    @Body() updateToyDto: UpdateToyDto,
    @CurrentUser() user: User,
  ): Promise<ToyResponseDto> {
    // TODO: Verificar que el usuario es dueño del toy o es admin
    return this.toysService.update(id, updateToyDto);
  }

  // NUEVO: DELETE /toys/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar juguete' })
  @ApiParam({ name: 'id', description: 'ID del juguete' })
  @ApiResponse({ status: 204, description: 'Juguete eliminado exitosamente' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    // TODO: Verificar que el usuario es dueño del toy o es admin
    return this.toysService.remove(id);
  }

  // EXISTENTE: POST /toys/assign
  @Post('assign')
  async assignToy(
    @Body() assignToyDto: AssignToyDto,
  ): Promise<AssignToyResponseDto> {
    return this.toysService.assignToy(assignToyDto);
  }

  // MODIFICADO: PATCH /toys/connection/:macAddress (usar DTO)
  @Patch('connection/:macAddress')
  @ApiOperation({ summary: 'Actualizar estado del juguete' })
  @ApiParam({ name: 'macAddress', description: 'MAC address del juguete' })
  async updateConnectionStatus(
    @Param('macAddress') macAddress: string,
    @Body() dto: UpdateConnectionStatusDto,
  ): Promise<ToyResponseDto> {
    return this.toysService.updateConnectionStatus(
      macAddress,
      dto.status,
      dto.batteryLevel,
      dto.signalStrength,
    );
  }
}
```

### Cambio 8: Migración de Base de Datos

**Archivo:** `backend/src/migrations/update-toys-table.sql` (NUEVO)

```sql
-- Migración: Hacer userId nullable en tabla toys
-- Fecha: 2025-11-04
-- Descripción: Permite crear toys sin usuario asignado inicialmente

-- Hacer userId nullable
ALTER TABLE toys
ALTER COLUMN "userId" DROP NOT NULL;

-- Actualizar constraint de foreign key
ALTER TABLE toys
DROP CONSTRAINT IF EXISTS "FK_toys_userId";

ALTER TABLE toys
ADD CONSTRAINT "FK_toys_userId"
FOREIGN KEY ("userId")
REFERENCES users(id)
ON DELETE SET NULL;

-- Hacer iotDeviceId nullable también (se crea automáticamente)
ALTER TABLE toys
ALTER COLUMN "iotDeviceId" DROP NOT NULL;

-- Comentarios
COMMENT ON COLUMN toys."userId" IS 'ID del usuario propietario (nullable para toys sin asignar)';
COMMENT ON COLUMN toys."iotDeviceId" IS 'ID del dispositivo IoT asociado (nullable, se crea automáticamente)';
```

---

## 🧪 Plan de Pruebas

### Test 1: Crear Toy con macAddress

```bash
POST /api/v1/toys
Authorization: Bearer {token}
Content-Type: application/json

{
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "name": "Mi Robot Nebu",
  "model": "Nebu Robot v1",
  "manufacturer": "Nebu",
  "status": "inactive"
}
```

**Esperado:** ✅ 201 Created con ToyResponseDto

### Test 2: Listar Toys con Paginación

```bash
GET /api/v1/toys?page=1&limit=10&status=active&search=robot
Authorization: Bearer {token}
```

**Esperado:** ✅ 200 OK con ToyListResponseDto

### Test 3: Asignar Toy por MAC

```bash
POST /api/v1/toys/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "userId": "user-uuid",
  "toyName": "Mi Robot Personalizado"
}
```

**Esperado:** ✅ 200 OK con AssignToyResponseDto

### Test 4: Buscar Toy por MAC

```bash
GET /api/v1/toys/mac/AA:BB:CC:DD:EE:FF
Authorization: Bearer {token}
```

**Esperado:** ✅ 200 OK con ToyResponseDto

### Test 5: Actualizar Toy

```bash
PATCH /api/v1/toys/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "status": "active"
}
```

**Esperado:** ✅ 200 OK con ToyResponseDto

### Test 6: Eliminar Toy

```bash
DELETE /api/v1/toys/{id}
Authorization: Bearer {token}
```

**Esperado:** ✅ 204 No Content

---

## 📦 Checklist de Implementación

### Alta Prioridad
- [ ] Modificar CreateToyDto (usar macAddress, remover userId)
- [ ] Crear UpdateConnectionStatusDto
- [ ] Modificar AssignToyDto (usar macAddress en lugar de toyId)
- [ ] Modificar Toy entity (userId y iotDeviceId nullable, getters)
- [ ] Modificar ToysService.create() (manejar macAddress)
- [ ] Modificar ToysService.assignToy() (usar macAddress)
- [ ] Agregar endpoint GET /toys
- [ ] Agregar endpoint GET /toys/:id
- [ ] Agregar endpoint GET /toys/mac/:macAddress
- [ ] Agregar endpoint PATCH /toys/:id
- [ ] Agregar endpoint DELETE /toys/:id
- [ ] Ejecutar migración de base de datos

### Media Prioridad
- [ ] Agregar endpoint GET /toys/statistics
- [ ] Implementar RolesGuard para endpoints admin
- [ ] Agregar validación de propiedad en UPDATE y DELETE
- [ ] Tests E2E para todos los endpoints

### Baja Prioridad
- [ ] Documentación en Swagger mejorada
- [ ] Agregar índice en lastConnected si no existe
- [ ] Logging de eventos de creación/asignación de toys

---

## 🎯 Resultado Esperado

Después de implementar todos los cambios:

✅ App móvil puede crear toys con solo macAddress
✅ App móvil puede asignar toys usando macAddress
✅ App móvil puede listar toys con paginación
✅ App móvil puede buscar toys por ID o MAC
✅ App móvil puede actualizar y eliminar toys
✅ Backend valida correctamente formato de macAddress
✅ Todas las respuestas incluyen campos calculados (isActive, etc.)
✅ Sistema soporta toys "huérfanos" (sin usuario asignado)

---

**Estado de Implementación:** 🔴 PENDIENTE
**Tiempo Estimado:** 2-3 horas
**Prioridad:** CRÍTICA - Sin estos cambios, la app móvil no puede funcionar
