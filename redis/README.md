#  Redis Configuration

##  Estructura del Directorio Redis

```
redis/
├── redis.conf           # Configuración principal de Redis
├── redis-manager.sh     # Script de gestión (ejecutable)
└── README.md           # Esta documentación
```

## ️ Configuración Optimizada

###  **Gestión de Memoria**
```bash
# Variables de entorno configurables:
REDIS_MAX_MEMORY=256mb                    # Límite de memoria
REDIS_EVICTION_POLICY=allkeys-lru         # Política de expulsión
```

**Políticas de Expulsión Disponibles:**
- `allkeys-lru`: Expulsa las claves menos usadas recientemente (recomendado para cache)
- `allkeys-lfu`: Expulsa las claves menos frecuentemente usadas
- `volatile-lru`: Solo expulsa claves con TTL, usando LRU
- `volatile-lfu`: Solo expulsa claves con TTL, usando LFU
- `allkeys-random`: Expulsa claves aleatorias
- `volatile-random`: Expulsa claves con TTL aleatorias
- `volatile-ttl`: Expulsa claves con TTL más cercano a expirar
- `noeviction`: No expulsa, devuelve error cuando se alcanza el límite

###  **Persistencia Optimizada**
- **RDB**: Snapshots automáticos en intervalos configurados
- **AOF**: Log de append para máxima durabilidad
- **Híbrido**: RDB + AOF para mejor performance y durabilidad

###  **Seguridad**
-  Autenticación con password
-  Configuración de network binding
-  Protección contra comandos peligrosos

###  **Monitoreo**
-  Health checks con timeout personalizado
-  Slow query log habilitado
-  Latency monitoring
-  Métricas de memoria y performance

##  **Variables de Entorno Completas**

```bash
# Configuración básica
REDIS_PASSWORD=your_strong_redis_password_here
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# Configuración de memoria
REDIS_MAX_MEMORY=256mb
REDIS_EVICTION_POLICY=allkeys-lru
REDIS_DATABASES=16

# Configuración de cache
REDIS_KEY_PREFIX=nebu:
REDIS_TTL=300

# Configuración de conexión (backend)
REDIS_MAX_RETRIES_PER_REQUEST=3
REDIS_RETRY_DELAY_ON_FAILOVER=100
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
```

## ️ **Script de Gestión**

### **Uso del Script**
```bash
cd redis/
./redis-manager.sh <comando>
```

### **Comandos Disponibles**

#### **Información y Monitoreo**
```bash
./redis-manager.sh info      # Información general
./redis-manager.sh stats     # Estadísticas en tiempo real
./redis-manager.sh config    # Configuración actual
./redis-manager.sh monitor   # Monitoreo de comandos
```

#### **Gestión de Datos**
```bash
./redis-manager.sh keys                # Lista todas las claves
./redis-manager.sh keys "nebu:*"   # Lista claves con patrón
./redis-manager.sh flush 0             # Limpia base de datos 0
```

#### **Testing y Benchmark**
```bash
./redis-manager.sh test                    # Prueba conexión
./redis-manager.sh benchmark               # Benchmark básico
./redis-manager.sh benchmark SET,GET 5000 25  # Benchmark personalizado
```

##  **Optimizaciones Implementadas**

### **1. Memoria**
- Límite de memoria configurable (256MB por defecto)
- Política LRU para cache automático
- Compresión RDB habilitada
- Configuración optimizada de hash tables

### **2. Persistencia**
- AOF con fsync cada segundo (balance durabilidad/performance)
- RDB con snapshots inteligentes
- Reescritura automática de AOF
- Compresión y checksums habilitados

### **3. Performance**
- TCP keepalive optimizado
- Buffer de salida configurado para diferentes tipos de clientes
- Hash rehashing activo
- Configuración optimizada para diferentes estructuras de datos

### **4. Monitoreo**
- Slow log para queries >10ms
- Latency monitoring habilitado
- Health checks mejorados
- Logs estructurados

##  **Casos de Uso por Configuración**

### **Para Cache de Aplicación (Actual)**
```bash
REDIS_MAX_MEMORY=256mb
REDIS_EVICTION_POLICY=allkeys-lru
REDIS_TTL=300  # 5 minutos
```

### **Para Sesiones de Usuario**
```bash
REDIS_MAX_MEMORY=512mb
REDIS_EVICTION_POLICY=volatile-lru
REDIS_TTL=3600  # 1 hora
```

### **Para Cola de Trabajos**
```bash
REDIS_MAX_MEMORY=1gb
REDIS_EVICTION_POLICY=noeviction
# Sin TTL automático
```

##  **Alertas y Monitoreo**

### **Métricas Importantes**
- `used_memory_peak`: Pico de memoria usado
- `instantaneous_ops_per_sec`: Operaciones por segundo
- `total_commands_processed`: Total de comandos procesados
- `keyspace_hits/misses`: Ratio de aciertos/fallos

### **Comandos de Diagnóstico**
```bash
# Memoria
redis-cli INFO memory

# Performance
redis-cli INFO stats

# Configuración
redis-cli CONFIG GET "*memory*"

# Slow queries
redis-cli SLOWLOG GET 10
```

## **Troubleshooting**

### **Memoria Alta**
1. Verificar `used_memory_human`
2. Revisar política de expulsión
3. Analizar tipos de datos: `redis-cli --bigkeys`
4. Considerar aumentar `REDIS_MAX_MEMORY`

### **Performance Baja**
1. Revisar slow log: `SLOWLOG GET`
2. Verificar network latency
3. Analizar comandos complejos
4. Considerar sharding para datasets grandes

### **Conexiones**
1. Verificar autenticación
2. Comprobar network connectivity
3. Revisar timeouts de conexión
4. Verificar límites de conexiones concurrentes
