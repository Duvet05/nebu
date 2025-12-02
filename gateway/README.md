# 🚀 Traefik Gateway Configuration

> **Actualización (Dic 2025)**: El despliegue actual usa configuración basada en archivos YAML para mejor organización y mantenibilidad. Los middlewares y configuración estática están desacoplados del `docker-compose.yml`.

## 📁 Estructura del Directorio Gateway

```
gateway/
├── traefik.yml          # Configuración estática principal
├── dynamic/             # Configuración dinámica (hot-reload)
│   └── middlewares.yml  # Middlewares reutilizables
├── letsencrypt/
│   └── acme.json       # Certificados SSL de Let's Encrypt
└── README.md           # Este archivo
```

## ⚙️ Configuración

### `traefik.yml` (Configuración Estática)

Contiene configuración que **NO cambia** durante la ejecución:
- **Entrypoints**: web (80), websecure (443), traefik dashboard (9080)
- **Providers**: Docker + File provider para configuración dinámica
- **SSL/TLS**: Let's Encrypt con HTTP Challenge automático
- **Logging**: Logs estructurados en JSON
- **Metrics**: Prometheus habilitado
- **Redirects**: HTTP → HTTPS automático (301 permanent)

**Variables de entorno requeridas:**
- `ACME_EMAIL`: Email para Let's Encrypt
- `LOG_LEVEL`: Nivel de logs (DEBUG, INFO, WARN, ERROR)

### `dynamic/middlewares.yml` (Configuración Dinámica)

Middlewares reutilizables que **pueden cambiar sin reiniciar** Traefik:

#### Middlewares disponibles:

1. **`redirect-www-to-non-www`**
   - Redirecciona `www.domain.com` → `domain.com`
   - Redirect permanente (301)
   - **Resuelve errores SEO de redirects incorrectos**

2. **`security-headers`**
   - Headers de seguridad HTTP
   - HSTS con max-age de 1 año
   - X-Frame-Options, X-Content-Type-Options
   - Referrer-Policy, Permissions-Policy

3. **`rate-limit`**
   - Límite: 50 requests/minuto promedio
   - Burst: 100 peticiones
   - Ventana deslizante de 1 minuto

4. **`auth-basic`**
   - Autenticación básica para dashboard
   - Usuario: `admin` / Password: `admin123`
   - **⚠️ Cambiar en producción**

## 🌐 Redirects WWW → Non-WWW

La configuración implementa los siguientes redirects automáticos:

```
http://www.flow-telligence.com → https://flow-telligence.com (301 ✅)
https://www.flow-telligence.com → https://flow-telligence.com (301 ✅)
http://flow-telligence.com → https://flow-telligence.com (301 ✅)
```

Esto resuelve los **errores SEO** reportados por checkers:
- ✅ Redirect 2/3: `https://www` → `https://non-www`
- ✅ Redirect 4/3: `http://www` → `https://non-www`

## 🔧 Uso en Docker Compose

Para referenciar middlewares desde archivos en las labels:

```yaml
labels:
  # Usar middleware desde archivo dinámico
  - "traefik.http.routers.myrouter.middlewares=security-headers@file,rate-limit@file"
```

El sufijo `@file` indica que el middleware está definido en `dynamic/middlewares.yml`.

## 🚀 Servicios Expuestos

| Servicio          | URL                           | Descripción                  |
| ----------------- | ----------------------------- | ---------------------------- |
| Frontend          | `https://${DOMAIN}`           | Aplicación Remix principal   |
| Backend API       | `https://api.${DOMAIN}`       | API NestJS                   |
| Admin Panel       | `https://admin.${DOMAIN}`     | AdminJS Dashboard            |
| Traefik Dashboard | `https://traefik.${DOMAIN}`   | Panel de control de Traefik  |

##  Seguridad Implementada

### SSL/TLS
-  Certificados SSL automáticos con Let's Encrypt
-  Redirección HTTP → HTTPS automática
-  HSTS headers con max-age de 1 año
-  Solo TLS 1.2+ y cipher suites seguros

### Headers de Seguridad
-  `X-Frame-Options: DENY`
-  `X-Content-Type-Options: nosniff`
-  `X-XSS-Protection: 1; mode=block`
-  `Strict-Transport-Security`
-  `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting
- ✅ 50 requests/minuto promedio
- ✅ Burst de hasta 100 requests
- ✅ Ventana deslizante de 1 minuto

## 📝 Modificar Configuración

### Cambios estáticos (requieren reinicio)
```bash
# Editar gateway/traefik.yml
vim gateway/traefik.yml

# Reiniciar Traefik
docker compose restart traefik
```

### Cambios dinámicos (sin reinicio)
```bash
# Editar gateway/dynamic/middlewares.yml
vim gateway/dynamic/middlewares.yml

# Traefik detecta automáticamente los cambios en ~2 segundos
# Ver logs para confirmar
docker logs nebu-traefik-prod --tail 20
```

## 📊 Monitoreo

### Dashboard de Traefik
Accesible en: `https://traefik.flow-telligence.com/dashboard/`

Credenciales por defecto:
- Usuario: `admin`
- Password: `admin123`

**⚠️ IMPORTANTE**: Cambiar la password en producción editando `dynamic/middlewares.yml`

Para generar nueva password:
```bash
htpasswd -nbB admin tu_nueva_password
```

### Logs
```bash
# Ver logs en tiempo real
docker logs -f nebu-traefik-prod

# Ver solo errores
docker logs nebu-traefik-prod 2>&1 | grep ERROR

# Ver access logs en JSON
docker logs nebu-traefik-prod | grep -E '"RouterName"' | jq
```

### Métricas Prometheus
- ✅ Métricas habilitadas en puerto 9080
- ✅ Labels por entrypoint, router, service
- ✅ Compatible con Grafana dashboards

## 🔍 Ventajas de esta Estructura

✅ **Desacoplamiento**: Configuración separada del docker-compose.yml
✅ **Reutilización**: Middlewares compartidos entre múltiples servicios
✅ **Legibilidad**: Archivos YAML más limpios que command arguments
✅ **Hot reload**: Cambios en `dynamic/` se aplican sin reiniciar
✅ **Versionamiento**: Fácil de versionar en Git
✅ **Testing**: Se puede validar la configuración antes de aplicar
✅ **Mantenibilidad**: Más fácil de debuggear y modificar

## 📋 Variables de Entorno Requeridas

```bash
# En .env
DOMAIN=flow-telligence.com
ACME_EMAIL=admin@flow-telligence.com
LOG_LEVEL=INFO
```

## ⚠️ Notas Importantes

1. **acme.json**: Permisos 600 (solo lectura/escritura propietario)
2. **Primer arranque**: Los certificados SSL se generan automáticamente
3. **Renovación**: Automática cada 60 días por Let's Encrypt
4. **Backup**: Incluir `gateway/letsencrypt/acme.json` en backups
5. **Password dashboard**: Cambiar `auth-basic` en producción

## 🔧 Troubleshooting

### Ver configuración activa
```bash
# Ver toda la configuración cargada
curl http://localhost:9080/api/rawdata | jq

# Ver solo middlewares
curl http://localhost:9080/api/http/middlewares | jq

# Ver routers
curl http://localhost:9080/api/http/routers | jq

# Ver servicios
curl http://localhost:9080/api/http/services | jq
```

### Verificar certificados SSL
```bash
# Ver logs de ACME/Let's Encrypt
docker logs nebu-traefik-prod | grep -i acme

# Ver certificados activos
curl http://localhost:9080/api/http/routers | jq '.[] | select(.tls != null)'

# Ver estado de certificados
docker exec nebu-traefik-prod cat /letsencrypt/acme.json | jq
```

### Verificar redirects WWW
```bash
# Test redirect www → non-www
curl -I https://www.flow-telligence.com

# Debe devolver: HTTP/1.1 301 Moved Permanently
# Location: https://flow-telligence.com/
```

### Validar configuración antes de aplicar
```bash
# Validar sintaxis YAML
docker run --rm -v $(pwd)/gateway:/config traefik:v3.5 \
  --configfile=/config/traefik.yml \
  --validateconfig
```
