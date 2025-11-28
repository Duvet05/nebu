# Database Management Modes

El backend soporta dos modos de gestión de base de datos controlados por **una bandera maestra**.

## 🎯 Bandera Maestra: `DB_USE_MIGRATIONS`

### Modo 1: Synchronize + Seeders (Default - Desarrollo)

**Configuración:**
```bash
DB_USE_MIGRATIONS=false  # o no definir (default)
AUTO_SEED=true           # opcional, ejecuta seeders automáticamente
```

**Comportamiento:**
- ✅ `synchronize: true` - TypeORM crea/actualiza tablas automáticamente
- ✅ `migrationsRun: false` - No ejecuta migrations
- ✅ Seeders se ejecutan automáticamente si `AUTO_SEED=true`
- ✅ Ideal para desarrollo rápido

**Cuando usar:**
- Desarrollo local
- Testing
- Prototipado rápido
- Primera configuración del proyecto

---

### Modo 2: Migrations (Producción)

**Configuración:**
```bash
DB_USE_MIGRATIONS=true
AUTO_SEED=false        # seeders se ejecutan manualmente
```

**Comportamiento:**
- ✅ `synchronize: false` - TypeORM NO modifica el schema
- ✅ `migrationsRun: true` - Ejecuta migrations automáticamente al iniciar
- ❌ Seeders NO se ejecutan automáticamente (control manual)
- ✅ Control total de cambios en la base de datos

**Cuando usar:**
- Producción
- Staging
- Cualquier ambiente donde necesites control de versiones del schema

---

## 📊 Tabla de Comparación

| Característica | Synchronize Mode | Migrations Mode |
|----------------|------------------|-----------------|
| Variable | `DB_USE_MIGRATIONS=false` | `DB_USE_MIGRATIONS=true` |
| Schema Updates | Automático | Manual (via migrations) |
| Seeders | Auto con `AUTO_SEED=true` | Manual |
| Velocidad | ⚡ Rápido | 🐢 Controlado |
| Seguridad | ⚠️ Baja | ✅ Alta |
| Reversibilidad | ❌ No | ✅ Sí (rollback) |
| Uso recomendado | Desarrollo | Producción |

---

## 🚀 Comandos según modo

### Synchronize Mode (Desarrollo)

```bash
# Levantar todo (auto-seed activado)
docker-compose up -d

# Verificar productos insertados
docker exec nebu-postgres-prod psql -U nebu_user -d nebu_db -c "SELECT COUNT(*) FROM product_catalog;"

# Re-ejecutar seeders manualmente
docker exec nebu-backend-prod npm run seed
```

### Migrations Mode (Producción)

```bash
# Configurar modo migrations
export DB_USE_MIGRATIONS=true
export AUTO_SEED=false

# Generar nueva migration
npm run migration:generate -- src/database/migrations/NombreDeLaMigracion

# Ejecutar migrations manualmente
npm run migration:run

# Revertir última migration
npm run migration:revert

# Ver estado de migrations
npm run migration:show

# Ejecutar seeders manualmente (solo cuando sea necesario)
docker exec nebu-backend-prod npm run seed
```

---

## ⚙️ Configuración en Docker Compose

Agrega estas variables al servicio `backend`:

```yaml
backend:
  environment:
    # Modo desarrollo (default)
    - DB_USE_MIGRATIONS=false
    - AUTO_SEED=true

    # Modo producción
    # - DB_USE_MIGRATIONS=true
    # - AUTO_SEED=false
```

---

## 🔄 Transición de Synchronize a Migrations

Cuando estés listo para pasar a producción:

1. **Crear snapshot inicial:**
   ```bash
   npm run migration:generate -- src/database/migrations/InitialSchema
   ```

2. **Revisar la migration generada:**
   ```bash
   cat src/database/migrations/*-InitialSchema.ts
   ```

3. **Cambiar modo:**
   ```bash
   export DB_USE_MIGRATIONS=true
   export AUTO_SEED=false
   ```

4. **Rebuild y redeploy:**
   ```bash
   docker-compose down
   docker-compose build backend
   docker-compose up -d
   ```

5. **Verificar:**
   ```bash
   npm run migration:show
   ```

---

## 📝 Notas Importantes

1. **NUNCA uses `synchronize: true` en producción**
   - Puede eliminar datos
   - Cambios irreversibles
   - Sin control de versiones

2. **Seeders son idempotentes**
   - Verifican si ya existen datos antes de insertar
   - Seguro ejecutarlos múltiples veces

3. **Migrations son unidireccionales en producción**
   - Solo hacer rollback en emergencias
   - Probar en staging primero

4. **Variables de entorno tienen precedencia**
   - `.env.local` > `.env`
   - Docker compose override values

---

## 🐛 Troubleshooting

### "relation already exists"
- Estás en migrations mode pero las tablas fueron creadas por synchronize
- Solución: Drop DB o crear migration vacía inicial

### "Seeders failed (data may already exist)"
- Normal, los seeders detectaron datos existentes
- No es un error, solo un warning

### "Cannot find migrations"
- Verificar `ormconfig.ts` tiene `migrations: []` cuando `DB_USE_MIGRATIONS=false`
- En migrations mode, asegúrate de tener al menos una migration

---

## 📚 Referencias

- [TypeORM Synchronize](https://typeorm.io/connection-options#synchronize)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [Database Seeding Best Practices](https://github.com/typeorm/typeorm/blob/master/docs/migrations.md)
