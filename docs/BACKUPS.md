# 🗄️ Sistema de Backups - NEBU PostgreSQL

Sistema automatizado de backups para la base de datos PostgreSQL de NEBU.

## 📋 Características

- ✅ Backups automáticos programados (diarios a las 2:00 AM por defecto)
- ✅ Compresión gzip para ahorrar espacio
- ✅ Retención automática (7 días por defecto)
- ✅ Validación de integridad
- ✅ Scripts de backup y restauración
- ✅ Timestamps en nombres de archivos
- ✅ Logging detallado

## 📁 Ubicación de Backups

Los backups se almacenan en:
```
/root/nebu/backups/postgres/
```

Formato de nombre:
```
nebu_db_backup_YYYYMMDD_HHMMSS.sql.gz
```

Ejemplo:
```
nebu_db_backup_20251213_031648.sql.gz
```

## 🚀 Uso Rápido

### Backup Manual

Para crear un backup inmediato:

```bash
bash /root/nebu/scripts/backup-postgres.sh
```

### Restaurar Backup

Para restaurar desde un backup:

```bash
# Listar backups disponibles
ls -lh /root/nebu/backups/postgres/

# Restaurar un backup específico
bash /root/nebu/scripts/restore-postgres.sh nebu_db_backup_20251213_031648.sql.gz
```

**⚠️ ADVERTENCIA:** La restauración eliminará todos los datos actuales.

## 🔄 Backups Automáticos

### Opción 1: Servicio Docker (Recomendado)

Iniciar el servicio de backup automático:

```bash
cd /root/nebu
docker compose -f docker-compose.yml -f docker-compose.backup.yml up -d postgres-backup
```

Verificar estado:
```bash
docker logs nebu-postgres-backup
```

Detener servicio:
```bash
docker compose -f docker-compose.backup.yml down postgres-backup
```

### Opción 2: Crontab del Sistema

Agregar a crontab:

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2:00 AM
0 2 * * * /root/nebu/scripts/backup-postgres.sh >> /var/log/nebu-backup.log 2>&1
```

## ⚙️ Configuración

### Variables de Entorno

Puedes personalizar el comportamiento editando `.env`:

```bash
# Días de retención de backups
BACKUP_RETENTION_DAYS=7

# Programación de backups (formato cron)
# Por defecto: 2:00 AM todos los días
BACKUP_SCHEDULE=0 2 * * *
```

### Modificar Programación

Ejemplos de programación cron:

```bash
# Cada 6 horas
BACKUP_SCHEDULE=0 */6 * * *

# Dos veces al día (2 AM y 2 PM)
BACKUP_SCHEDULE=0 2,14 * * *

# Solo de lunes a viernes a las 3 AM
BACKUP_SCHEDULE=0 3 * * 1-5

# Cada hora
BACKUP_SCHEDULE=0 * * * *
```

## 📊 Monitoreo

### Ver Backups Disponibles

```bash
ls -lh /root/nebu/backups/postgres/
```

### Verificar Tamaño Total de Backups

```bash
du -sh /root/nebu/backups/postgres/
```

### Ver Logs del Servicio de Backup

```bash
docker logs nebu-postgres-backup --tail 100 -f
```

## 🔍 Verificación de Integridad

El script de backup valida automáticamente cada backup. Para verificar manualmente:

```bash
# Probar descompresión
gunzip -t /root/nebu/backups/postgres/nebu_db_backup_20251213_031648.sql.gz

# Ver contenido del backup
gunzip -c /root/nebu/backups/postgres/nebu_db_backup_20251213_031648.sql.gz | less
```

## 🚨 Restauración de Emergencia

### Proceso Completo de Restauración

1. **Detener el backend** (opcional pero recomendado):
   ```bash
   docker stop nebu-backend-prod
   ```

2. **Restaurar el backup**:
   ```bash
   bash /root/nebu/scripts/restore-postgres.sh nebu_db_backup_XXXXXXXX_XXXXXX.sql.gz
   ```

3. **Reiniciar el backend**:
   ```bash
   docker restart nebu-backend-prod
   ```

4. **Verificar la restauración**:
   ```bash
   curl -s http://localhost:3001/api/v1/health | jq .
   ```

## 📦 Backup Antes de Actualizaciones

Siempre crea un backup antes de actualizaciones importantes:

```bash
# Crear backup con nota en el nombre
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
bash /root/nebu/scripts/backup-postgres.sh
echo "Backup pre-actualización creado: nebu_db_backup_${TIMESTAMP}.sql.gz"
```

## 💾 Almacenamiento Externo

### Copiar Backups a Servidor Remoto

```bash
# Usando SCP
scp /root/nebu/backups/postgres/*.sql.gz user@remote:/backups/nebu/

# Usando rsync (solo nuevos/modificados)
rsync -avz /root/nebu/backups/postgres/ user@remote:/backups/nebu/
```

### Subir a S3 (AWS)

```bash
# Instalar AWS CLI si no está instalado
# pip install awscli

# Subir backups
aws s3 sync /root/nebu/backups/postgres/ s3://mi-bucket/nebu-backups/
```

## 🔐 Seguridad

### Encriptar Backups

Para mayor seguridad, puedes encriptar los backups:

```bash
# Crear backup encriptado
gunzip -c backup.sql.gz | gpg --encrypt --recipient admin@nebu.com > backup.sql.gpg

# Desencriptar
gpg --decrypt backup.sql.gpg | psql ...
```

### Permisos

Los backups contienen datos sensibles. Asegúrate de que solo root tenga acceso:

```bash
chmod 700 /root/nebu/backups/postgres/
chmod 600 /root/nebu/backups/postgres/*.sql.gz
```

## 📝 Mantenimiento

### Limpiar Backups Antiguos Manualmente

```bash
# Eliminar backups más antiguos que 7 días
find /root/nebu/backups/postgres/ -name "nebu_db_backup_*.sql.gz" -mtime +7 -delete

# Eliminar backups más antiguos que 30 días
find /root/nebu/backups/postgres/ -name "nebu_db_backup_*.sql.gz" -mtime +30 -delete
```

### Espacio en Disco

Monitorear espacio disponible:

```bash
df -h /root/nebu/backups/postgres/
```

## 🆘 Troubleshooting

### Error: "Contenedor no está corriendo"

```bash
# Verificar estado de PostgreSQL
docker ps | grep postgres

# Iniciar PostgreSQL si está detenido
docker start nebu-postgres-prod
```

### Error: "Permiso denegado"

```bash
# Dar permisos de ejecución a scripts
chmod +x /root/nebu/scripts/backup-postgres.sh
chmod +x /root/nebu/scripts/restore-postgres.sh
```

### Backup Muy Grande

Si los backups son muy grandes:

1. Revisar la retención (reducir `BACKUP_RETENTION_DAYS`)
2. Limpiar datos antiguos de la base de datos
3. Usar compresión adicional: `gzip -9` (máxima compresión)

## 📊 Estadísticas

Ver estadísticas de backups:

```bash
# Cantidad de backups
ls -1 /root/nebu/backups/postgres/*.sql.gz | wc -l

# Tamaño promedio
du -sh /root/nebu/backups/postgres/*.sql.gz | awk '{sum+=$1; count++} END {print sum/count}'

# Backup más antiguo y más reciente
ls -lt /root/nebu/backups/postgres/ | tail -2
ls -lt /root/nebu/backups/postgres/ | head -2
```

## ✅ Checklist de Backups

- [ ] Backups automáticos configurados
- [ ] Retención configurada apropiadamente
- [ ] Backups probados (al menos uno restaurado exitosamente)
- [ ] Almacenamiento externo configurado (opcional pero recomendado)
- [ ] Monitoreo de espacio en disco
- [ ] Documentación del proceso para el equipo
- [ ] Permisos de archivos correctos
- [ ] Logs revisados periódicamente

## 🔗 Enlaces Útiles

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Disaster Recovery Best Practices](https://www.postgresql.org/docs/current/backup-dump.html)

---

**Última actualización:** 2025-12-13
**Versión:** 1.0.0
