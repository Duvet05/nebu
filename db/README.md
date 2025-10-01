# 🗄️ Database Initialization

Este directorio contiene los scripts de inicialización de bases de datos para el proyecto Nebu.

## 📁 Estructura

```
db/
├── init/
│   ├── 01-init-database.sql      # Inicialización principal de la base de datos
│   ├── 02-init-n8n-database.sql  # Inicialización de la base de datos de N8N
│   └── 03-init-n8n-database.sql  # Script alternativo para N8N
├── backups/                      # Backups de bases de datos
└── README.md                     # Este archivo
```

##  Inicialización Automática

Los scripts se ejecutan automáticamente cuando se inicia PostgreSQL por primera vez. Los archivos en `db/init/` se montan en `/docker-entrypoint-initdb.d/custom/` y se ejecutan en orden alfabético.

## Comandos Disponibles

### Usando Makefile (Recomendado)

```bash
# Inicializar todas las bases de datos
make db-init

# Crear solo la base de datos de N8N
make db-create-n8n

# Ver estado de los contenedores
make status
```

### Usando Docker directamente

```bash
# Crear base de datos N8N manualmente
docker exec nebu-academy-postgres psql -U nebu_academy -d nebu_academy_dev -c "CREATE DATABASE n8n_db;"

# Verificar que existe
docker exec nebu-academy-postgres psql -U nebu_academy -d nebu_academy_dev -c "\l" | grep n8n
```

## 🐛 Solución de Problemas

### N8N no puede conectarse a la base de datos

Si N8N muestra el error `database "n8n_db" does not exist`:

1. **Verificar que PostgreSQL esté funcionando:**
   ```bash
   docker ps | grep postgres
   ```

2. **Crear la base de datos manualmente:**
   ```bash
   make db-create-n8n
   ```

3. **Reiniciar N8N:**
   ```bash
   docker restart nebu-academy-n8n
   ```

### Verificar estado de las bases de datos

```bash
# Listar todas las bases de datos
docker exec nebu-academy-postgres psql -U nebu_academy -d nebu_academy_dev -c "\l"

# Verificar conexión a N8N
docker exec nebu-academy-postgres psql -U nebu_academy -d n8n_db -c "SELECT 1;"
```

## 📝 Notas Importantes

- Los scripts de inicialización solo se ejecutan cuando se crea un nuevo volumen de PostgreSQL
- Si ya existe un volumen con datos, los scripts no se ejecutarán automáticamente
- Para forzar la re-inicialización, elimina el volumen: `docker volume rm theme-nebu-academy_postgres_data`
- La base de datos de N8N se crea con las extensiones `uuid-ossp` y `pgcrypto`

## 🔄 Flujo de Inicialización

1. **PostgreSQL inicia** y ejecuta scripts en `/docker-entrypoint-initdb.d/`
2. **Script 01** crea la base de datos principal y extensiones
3. **Script 02/03** crea la base de datos de N8N
4. **N8N inicia** y se conecta a su base de datos
5. **Sistema listo** para usar

## 🆘 Soporte

Si tienes problemas con la inicialización:

1. Revisa los logs: `docker logs nebu-academy-postgres`
2. Verifica la configuración: `docker-compose config`
3. Ejecuta el script manualmente: `make db-init`