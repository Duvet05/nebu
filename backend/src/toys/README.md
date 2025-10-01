# Toys Module - Gestión de Juguetes IoT

Este módulo maneja la gestión completa de juguetes IoT con MAC address, estados de conexión y relaciones con usuarios.

## Características

-  **Gestión de MAC Address**: Validación y normalización automática
-  **Estados de Juguetes**: inactive, active, connected, disconnected, maintenance, error, blocked
-  **Relaciones con Usuarios**: Asignación opcional de juguetes a usuarios
-  **Monitoreo en Tiempo Real**: Actualización de estado de conexión, batería y señal
-  **API REST Completa**: CRUD completo con filtros y paginación
-  **Seguridad**: Autenticación JWT y control de roles
-  **Validación**: DTOs con validación completa de datos

## Entidad Toy

### Campos Principales
- `id`: UUID único
- `macAddress`: MAC address único (formato XX:XX:XX:XX:XX:XX)
- `name`: Nombre del juguete
- `model`: Modelo del juguete
- `manufacturer`: Fabricante
- `status`: Estado actual del juguete
- `firmwareVersion`: Versión del firmware
- `batteryLevel`: Nivel de batería
- `signalStrength`: Fuerza de señal WiFi
- `lastSeenAt`: Última conexión
- `activatedAt`: Fecha de activación
- `capabilities`: Capacidades del juguete (JSON)
- `settings`: Configuraciones (JSON)
- `notes`: Notas del usuario
- `userId`: ID del usuario propietario (opcional)

### Estados Disponibles
- `inactive`: Sin activar
- `active`: Activado
- `connected`: Conectado y en uso
- `disconnected`: Desconectado
- `maintenance`: En mantenimiento
- `error`: Con errores
- `blocked`: Bloqueado por seguridad

## Endpoints de la API

### 1. Crear Juguete
```http
POST /api/v1/toys
Content-Type: application/json
Authorization: Bearer <token>

{
  "macAddress": "00:1B:44:11:3A:B7",
  "name": "Mi Robot Azul",
  "model": "NebuBot Pro",
  "manufacturer": "Nebu Technologies",
  "status": "inactive",
  "capabilities": {
    "voice": true,
    "movement": true,
    "lights": true,
    "sensors": ["temperature", "proximity"],
    "aiFeatures": ["speech_recognition", "face_detection"]
  },
  "settings": {
    "volume": 70,
    "brightness": 80,
    "language": "es",
    "timezone": "America/Mexico_City"
  },
  "notes": "Regalo de cumpleaños"
}
```

### 2. Listar Juguetes (con filtros)
```http
GET /api/v1/toys?page=1&limit=10&status=active&search=robot
Authorization: Bearer <token>
```

### 3. Obtener Mis Juguetes
```http
GET /api/v1/toys/my-toys
Authorization: Bearer <token>
```

### 4. Obtener Juguete por ID
```http
GET /api/v1/toys/{id}
Authorization: Bearer <token>
```

### 5. Obtener Juguete por MAC Address
```http
GET /api/v1/toys/mac/{macAddress}
Authorization: Bearer <token>
```

### 6. Actualizar Juguete
```http
PATCH /api/v1/toys/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Robot Actualizado",
  "status": "active",
  "batteryLevel": "85%",
  "signalStrength": "-45dBm"
}
```

### 7. Asignar/Desasignar Juguete
```http
POST /api/v1/toys/assign
Content-Type: application/json
Authorization: Bearer <token>

{
  "toyId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "456e7890-e89b-12d3-a456-426614174001"
}
```

### 8. Actualizar Estado de Conexión (IoT)
```http
PATCH /api/v1/toys/connection/{macAddress}
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "connected",
  "batteryLevel": "85%",
  "signalStrength": "-45dBm"
}
```

### 9. Estadísticas (Solo Admin)
```http
GET /api/v1/toys/statistics
Authorization: Bearer <token>
```

### 10. Eliminar Juguete (Solo Admin)
```http
DELETE /api/v1/toys/{id}
Authorization: Bearer <token>
```

## Ejemplos de Respuesta

### Juguete Individual
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "macAddress": "00:1B:44:11:3A:B7",
  "name": "Mi Robot Azul",
  "model": "NebuBot Pro",
  "manufacturer": "Nebu Technologies",
  "status": "active",
  "statusText": "Activado",
  "statusColor": "green",
  "firmwareVersion": "1.2.3",
  "batteryLevel": "85%",
  "signalStrength": "-45dBm",
  "lastSeenAt": "2024-01-15T10:30:00Z",
  "activatedAt": "2024-01-15T10:30:00Z",
  "capabilities": {
    "voice": true,
    "movement": true,
    "lights": true,
    "sensors": ["temperature", "proximity"],
    "aiFeatures": ["speech_recognition", "face_detection"]
  },
  "settings": {
    "volume": 70,
    "brightness": 80,
    "language": "es",
    "timezone": "America/Mexico_City"
  },
  "notes": "Regalo de cumpleaños",
  "userId": "456e7890-e89b-12d3-a456-426614174001",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "isActive": true,
  "isConnected": false,
  "needsAttention": false
}
```

### Lista Paginada
```json
{
  "toys": [...],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### Estadísticas
```json
{
  "total": 25,
  "assigned": 20,
  "unassigned": 5,
  "byStatus": {
    "active": 15,
    "connected": 5,
    "inactive": 3,
    "error": 2
  }
}
```

## Validaciones

### MAC Address
- Formato: XX:XX:XX:XX:XX:XX o XX-XX-XX-XX-XX-XX
- Normalización automática a formato estándar
- Validación de unicidad en la base de datos

### Estados
- Validación enum estricta
- Transiciones de estado controladas
- Actualización automática de `activatedAt` al activar

### Relaciones
- Validación de existencia de usuario al asignar
- Relación opcional (puede existir sin usuario)
- Eliminación en cascada controlada

## Seguridad

- **Autenticación**: JWT requerido para todos los endpoints
- **Autorización**: 
  - Usuarios pueden ver/editar sus propios juguetes
  - Administradores tienen acceso completo
  - Endpoint de estadísticas solo para admins
- **Validación**: DTOs con validación completa
- **Sanitización**: Datos sanitizados antes de guardar

## Integración con IoT

Los dispositivos IoT pueden actualizar su estado usando el endpoint de conexión:

```bash
curl -X PATCH "https://api.nebu.com/api/v1/toys/connection/00:1B:44:11:3A:B7" \
  -H "Authorization: Bearer <device_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "connected",
    "batteryLevel": "85%",
    "signalStrength": "-45dBm"
  }'
```

## Métodos Helper

La entidad Toy incluye métodos helper:

- `isActive()`: Verifica si está activo
- `isConnected()`: Verifica si está conectado
- `needsAttention()`: Verifica si necesita atención
- `getStatusColor()`: Obtiene color para UI
- `getStatusText()`: Obtiene texto descriptivo del estado

## Relaciones con Usuario

La entidad User incluye propiedades virtuales:

- `toysCount`: Número total de juguetes
- `activeToysCount`: Número de juguetes activos

```typescript
// En el servicio de usuarios
const user = await this.userRepository.findOne({
  where: { id: userId },
  relations: ['toys']
});

console.log(`Usuario tiene ${user.toysCount} juguetes`);
console.log(`${user.activeToysCount} están activos`);
```
