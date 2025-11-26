# 🧸 Nebu - Website Oficial

E-commerce y landing page para Nebu, el compañero de juego educativo con IA.

## 🚀 Stack Tecnológico

- **Framework**: [Remix](https://remix.run/) v2
- **Runtime**: Node.js
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion
- **3D**: Three.js + React Three Fiber
- **i18n**: remix-i18next (ES/EN)
- **Validación**: Zod
- **Pagos**: Culqi
- **Email**: Nodemailer v7

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Generar SESSION_SECRET
openssl rand -base64 32
```

## 🏃‍♂️ Desarrollo

```bash
# Modo desarrollo (http://localhost:3002)
npm run dev

# Build para producción
npm run build

# Preview build de producción
npm start

# Linting
npm run lint

# Tests
npm test
```

## 📁 Estructura del Proyecto

```
frontend/
├── app/
│   ├── routes/          # Páginas de Remix
│   ├── components/      # Componentes React
│   ├── config/          # Constantes y configuración
│   │   ├── constants.ts
│   │   └── env.server.ts
│   ├── schemas/         # Validación Zod
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilidades
│   └── styles/          # CSS global
├── public/
│   ├── locales/         # Traducciones i18n
│   ├── assets/          # Imágenes y recursos
│   └── models/          # Modelos 3D
└── docs/
    ├── VALIDATION_GUIDE.md
    └── SECURITY_AUDIT.md
```

## 🔒 Seguridad

**Estado actual**: 7 vulnerabilidades moderadas (0 altas)

Ver detalles completos en [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)

### Resumen
- ✅ **nodemailer** actualizado a v7.0.11 (SEGURO)
- ⚠️ **esbuild** ≤0.24.2 - Solo afecta desarrollo, no producción
- ⚠️ **estree-util-value-to-estree** - Dependencia de Remix, esperando update

### Mejores Prácticas
```bash
# ✅ Desarrollo seguro (solo localhost)
npm run dev

# ❌ NO exponer dev server públicamente
npm run dev -- --host 0.0.0.0  # NO HACER

# ✅ Producción (sin vulnerabilidades)
npm run build
npm start
```

## 🎨 Guía de Desarrollo

### Constantes y Configuración
Ver [VALIDATION_GUIDE.md](./VALIDATION_GUIDE.md) para:
- Uso de `constants.ts`
- Schemas de validación Zod
- Variables de entorno
- Custom hooks

### Ejemplo: Validación de Formulario
```typescript
import { useFormValidation } from '~/hooks/useFormValidation';
import { preOrderSchema } from '~/schemas';

function MyForm() {
  const { validate, errors } = useFormValidation(preOrderSchema);
  
  const handleSubmit = (data) => {
    const result = validate(data);
    if (result.success) {
      // Enviar datos validados
    }
  };
}
```

## 🌐 Variables de Entorno

Ver [.env.example](./.env.example) para la lista completa.

**Requeridas**:
- `BACKEND_URL` - URL del API de NestJS
- `VITE_CULQI_PUBLIC_KEY` - Clave pública de Culqi
- `SESSION_SECRET` - Secret para sesiones (mínimo 32 caracteres)

**Opcionales**:
- `VITE_GA_TRACKING_ID` - Google Analytics
- `VITE_FB_PIXEL_ID` - Facebook Pixel
- `SMTP_*` - Configuración de email

## 📝 Scripts Disponibles

| Script              | Descripción                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Inicia servidor de desarrollo |
| `npm run build`     | Build para producción         |
| `npm start`         | Servidor de producción        |
| `npm run lint`      | Ejecuta ESLint                |
| `npm run typecheck` | Verifica tipos TypeScript     |
| `npm test`          | Ejecuta tests                 |

## 🐛 Troubleshooting

### Puerto 3002 ocupado
```bash
# Linux/Mac
lsof -ti:3002 | xargs kill -9

# Windows
netstat -ano | findstr :3002
taskkill /PID [PID] /F
```

### Error de build
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problemas con nodemailer
Verifica que las variables de entorno estén configuradas:
```bash
echo $SMTP_HOST
echo $SMTP_USER
```

## 📚 Documentación

- [Remix Docs](https://remix.run/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod](https://zod.dev/)
- [Framer Motion](https://www.framer.com/motion/)

## 🤝 Contribuir

1. Crear branch: `git checkout -b feature/nueva-funcionalidad`
2. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
3. Push: `git push origin feature/nueva-funcionalidad`
4. Abrir Pull Request

## 📄 Licencia

Propietario: Flow-telligence  
Ver [LICENSE](./LICENSE)
