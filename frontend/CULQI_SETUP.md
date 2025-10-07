# Guía de Configuración de Culqi

## 🔐 Paso 1: Crear cuenta en Culqi

1. Ve a: https://culqi.com/
2. Click en **"Crear cuenta"**
3. Completa el registro con tus datos
4. Verifica tu email

---

## 🔑 Paso 2: Obtener credenciales

### Credenciales de Prueba (Test)

1. Ingresa al panel: https://panel.culqi.com/
2. Ve a **"Desarrollo" → "API Keys"**
3. Copia las credenciales de **TEST**:
   - **Public Key**: `pk_test_XXXXXXXXXX`
   - **Secret Key**: `sk_test_XXXXXXXXXX`

### Credenciales de Producción (Live)

1. En el panel, ve a **"Desarrollo" → "API Keys"**
2. Cambia a modo **"LIVE"**
3. Copia las credenciales de **LIVE**:
   - **Public Key**: `pk_live_XXXXXXXXXX`
   - **Secret Key**: `sk_live_XXXXXXXXXX`

---

## ⚙️ Paso 3: Configurar en tu proyecto

### Agregar al archivo .env

```bash
# Culqi Configuration
# Para pruebas (TEST)
CULQI_SECRET_KEY=sk_test_tu_secret_key_aqui
CULQI_PUBLIC_KEY=pk_test_tu_public_key_aqui

# Para producción, cambia a:
# CULQI_SECRET_KEY=sk_live_tu_secret_key_aqui
# CULQI_PUBLIC_KEY=pk_live_tu_public_key_aqui
```

---

## 🧪 Paso 4: Tarjetas de prueba

Para probar pagos en modo TEST, usa estas tarjetas:

### ✅ Tarjeta que APRUEBA (éxito)
```
Número: 4111 1111 1111 1111
CVV: 123
Fecha: 09/2025
Email: test@culqi.com
```

### ❌ Tarjeta que RECHAZA (fallo)
```
Número: 4000 0000 0000 0002
CVV: 123
Fecha: 09/2025
Email: test@culqi.com
```

### ⏳ Tarjeta que queda PENDIENTE
```
Número: 4000 0000 0000 0077
CVV: 123
Fecha: 09/2025
Email: test@culqi.com
```

---

## 🔔 Paso 5: Configurar Webhooks

1. En el panel de Culqi, ve a **"Desarrollo" → "Webhooks"**
2. Agrega nuevo webhook:
   - **URL**: `https://flow-telligence.com/api/webhooks/culqi`
   - **Eventos**: Selecciona todos
3. Guarda el webhook

---

## 💰 Paso 6: Configurar comisiones

Culqi cobra:
- **3.99% + S/ 0.30** por transacción exitosa
- No hay mensualidad
- Retiros instantáneos disponibles

Ejemplo:
- Venta: **S/ 300**
- Comisión: **S/ 12.27** (3.99% + 0.30)
- Recibes: **S/ 287.73**

---

## 🚀 Paso 7: Activar modo producción

Cuando estés listo para vender:

1. Completa tu **perfil de negocio** en Culqi
2. Sube documentación requerida (RUC, DNI)
3. Espera aprobación (1-3 días)
4. Cambia las credenciales en `.env` a modo LIVE
5. Actualiza la URL del webhook a producción

---

## 📊 Paso 8: Prueba el sistema

### En local (http://localhost:3002):

1. Ve a `/pre-order`
2. Llena el formulario
3. Click en "Pagar S/ 300"
4. Se abrirá el modal de Culqi
5. Usa una tarjeta de prueba
6. Verifica que llegue el email de confirmación

---

## 🛠️ Archivos implementados

- ✅ `/app/lib/culqi.server.ts` - Servicio backend de Culqi
- ✅ `/app/routes/api.payment.tsx` - API de procesamiento de pagos
- ✅ `/app/routes/api.webhooks.culqi.tsx` - Webhook para notificaciones
- ✅ `/app/root.tsx` - Script de Culqi.js cargado
- ✅ `.env.example` - Template con variables necesarias

---

## 📞 Soporte

- **Panel Culqi**: https://panel.culqi.com/
- **Documentación**: https://docs.culqi.com/
- **Soporte**: soporte@culqi.com

---

## ✅ Checklist de configuración

- [ ] Crear cuenta en Culqi
- [ ] Obtener credenciales de TEST
- [ ] Agregar credenciales a `.env`
- [ ] Probar con tarjeta de prueba
- [ ] Verificar email de confirmación
- [ ] Completar perfil de negocio
- [ ] Obtener credenciales de LIVE
- [ ] Configurar webhook en producción
- [ ] Cambiar a modo LIVE en `.env`

---

🎉 **Una vez completados estos pasos, tu sistema de pagos estará 100% funcional!**
