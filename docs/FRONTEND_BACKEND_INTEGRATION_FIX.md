# Fix: Integración Frontend-Backend

**Fecha:** 11 de Diciembre 2025
**Estado:** ✅ Completado

## Problema Identificado

El frontend intentaba acceder al endpoint de inventario sin autenticación, pero el backend lo tenía protegido con JWT Auth Guard.

### Error Principal

```typescript
// Backend: inventory.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard)  // ❌ Requería autenticación
@Roles(UserRole.ADMIN)
export class InventoryController { ... }

// Frontend: api.inventory.tsx
const response = await fetch(`${BACKEND_URL}/inventory/${productId}`);
// ❌ No enviaba token JWT → Fallaba con 401 Unauthorized
```

**Impacto:** El frontend usaba valores dummy (20 unidades) cuando el endpoint fallaba, ocultando el problema real.

---

## Cambios Realizados

### 1. ✅ Nuevo Endpoint Público de Inventario

**Archivo creado:** `backend/src/orders/inventory-public.controller.ts`

```typescript
@ApiTags('inventory-public')
@Controller('inventory')
export class InventoryPublicController {

  @Public()  // ✅ Acceso público sin autenticación
  @Get(':productId/available')
  async getAvailability(@Param('productId') productId: string) {
    const inventory = await this.inventoryService.getInventory(productId);

    if (!inventory) {
      throw new NotFoundException(`Product ${productId} not found in inventory`);
    }

    return {
      productId: inventory.productId,
      availableUnits: inventory.availableUnits,
      totalUnits: inventory.totalUnits,
      isAvailable: inventory.availableUnits > 0
    };
  }
}
```

**Registrado en:** `backend/src/orders/orders.module.ts`

```typescript
controllers: [OrdersController, InventoryController, InventoryPublicController],
```

### 2. ✅ Frontend Actualizado

**Archivo modificado:** `frontend/app/routes/api.inventory.tsx`

```typescript
// Antes: GET /inventory/{productId}  ❌ Endpoint protegido
// Ahora: GET /inventory/{productId}/available  ✅ Endpoint público

const response = await fetch(
  `${BACKEND_URL}/inventory/${encodeURIComponent(productId)}/available`
);
```

**Respuesta ajustada:**
```typescript
return data({
  productId: inventory.productId,
  availableUnits: inventory.availableUnits,
  totalUnits: inventory.totalUnits,
  isAvailable: inventory.isAvailable,
});
```

### 3. ✅ Variables de Entorno Sincronizadas

#### **frontend/.env**
```bash
# Agregado:
BACKEND_URL=http://localhost:3001/api/v1
```

#### **frontend/template.env**
```bash
# Actualizado con documentación:
# Backend API (para productos y otros recursos)
# En desarrollo local: http://localhost:3001/api/v1
# En Docker: http://backend:3001/api/v1
BACKEND_URL=http://localhost:3001/api/v1
```

#### **docker-compose.yml**
```yaml
# Ya estaba correcto:
environment:
  - BACKEND_URL=http://backend:3001/api/v1
```

### 4. ✅ Limpieza de Variables No Usadas

**Eliminado de:**
- `docker-compose.yml` (línea 100): `API_URL` del frontend
- `frontend/template.env`: `API_URL=https://62.169.30.44/api`

**Nota:** `API_URL` se mantiene en el backend (`application.config.ts`) como fallback para compatibilidad.

### 5. ✅ Configuración de CORS Ajustada para Producción

**Archivo modificado:** `.env`

```bash
# Antes:
ALLOW_LOCALHOST_CORS=true  # ❌ Inseguro en producción

# Ahora:
ALLOW_LOCALHOST_CORS=false  # ✅ Solo permite orígenes confiables

# Se mantiene para dispositivos IoT:
IOT_ALLOW_ALL_ORIGINS=true  # Para ESP32 con IPs dinámicas
```

**Implementación en `backend/src/config/cors.config.ts`:**
- Si `ALLOW_LOCALHOST_CORS=false` → Solo permite `FRONTEND_URL` y `DOMAIN`
- Si `ALLOW_LOCALHOST_CORS=true` → Agrega localhost (solo para debugging)
- Si `IOT_ALLOW_ALL_ORIGINS=true` → Permite todos los orígenes (para IoT)

---

## Endpoints de Inventario - Resumen

| Endpoint | Método | Auth | Uso |
|----------|--------|------|-----|
| `/inventory/:productId/available` | GET | 🔓 Público | Frontend - Consultar disponibilidad |
| `/inventory` | GET | 🔒 Admin | Dashboard - Ver todo el inventario |
| `/inventory/:product` | GET | 🔒 Admin | Dashboard - Ver inventario específico |
| `/inventory` | POST | 🔒 Admin | Crear/actualizar inventario |
| `/inventory/:product/reserve` | PATCH | 🔒 Admin | Reservar unidades |
| `/inventory/:product/confirm` | PATCH | 🔒 Admin | Confirmar venta |
| `/inventory/:product/cancel` | PATCH | 🔒 Admin | Cancelar reserva |

---

## Flujo Actualizado

### **Antes:**
```
[Frontend]
  → GET /inventory/{id}
  → ❌ 401 Unauthorized (sin JWT)
  → Fallback: 20 unidades (dummy)
```

### **Ahora:**
```
[Frontend]
  → GET /inventory/{id}/available
  → ✅ 200 OK (público)
  → Responde: { productId, availableUnits, totalUnits, isAvailable }
```

---

## Testing

### Probar el nuevo endpoint público:

```bash
# Obtener disponibilidad de un producto (sin autenticación)
curl http://localhost:3001/api/v1/inventory/{productId}/available

# Respuesta esperada:
{
  "productId": "uuid-del-producto",
  "availableUnits": 15,
  "totalUnits": 100,
  "isAvailable": true
}
```

### Verificar que endpoints protegidos siguen funcionando:

```bash
# Sin token → 401 Unauthorized
curl http://localhost:3001/api/v1/inventory

# Con token admin → 200 OK
curl -H "Authorization: Bearer {admin-token}" \
  http://localhost:3001/api/v1/inventory
```

---

## Checklist de Validación

- [x] Endpoint público creado y registrado
- [x] Frontend usa el nuevo endpoint
- [x] Variables de entorno sincronizadas
- [x] Variables no usadas eliminadas
- [x] CORS configurado para producción
- [x] Endpoints protegidos siguen requiriendo auth
- [x] Documentación actualizada

---

## Archivos Modificados

```
backend/src/orders/
  ├── inventory-public.controller.ts    [NUEVO]
  └── orders.module.ts                  [MODIFICADO]

frontend/
  ├── .env                              [MODIFICADO]
  ├── template.env                      [MODIFICADO]
  └── app/routes/api.inventory.tsx      [MODIFICADO]

.env                                    [MODIFICADO]
docker-compose.yml                      [MODIFICADO]
docs/FRONTEND_BACKEND_INTEGRATION_FIX.md [NUEVO]
```

---

## Notas de Seguridad

1. **CORS en Producción:**
   - `ALLOW_LOCALHOST_CORS=false` → Solo permite orígenes confiables
   - Si necesitas debug local, cambia temporalmente a `true`

2. **Separación de Endpoints:**
   - Públicos: `/products`, `/inventory/:id/available`, `/orders/checkout`
   - Protegidos: `/inventory` (admin), `/users` (admin), `/orders` (user/admin)

3. **IoT Exception:**
   - `IOT_ALLOW_ALL_ORIGINS=true` permite todos los orígenes
   - Solo para dispositivos ESP32 que no manejan bien CORS
   - Endpoints IoT deben validar tokens en el body/headers

---

## Próximos Pasos (Opcional)

1. **Rate Limiting:** Agregar limitador de requests al endpoint público
2. **Cache:** Cachear respuestas de inventario en Redis (TTL: 30s)
3. **Webhooks:** Notificar cuando availableUnits cambia
4. **Métricas:** Trackear consultas al endpoint público

---

**✅ Integración Frontend-Backend completada y validada**
