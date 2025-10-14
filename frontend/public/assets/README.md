# Assets Estáticos

Esta carpeta contiene todos los recursos estáticos del frontend (iconos, logos, imágenes, etc.).

## Estructura

```
assets/
├── icons/       # Iconos SVG y otros formatos
├── logos/       # Logos de la aplicación
└── images/      # Imágenes generales
```

## Uso

Los archivos en esta carpeta son accesibles desde la raíz de la aplicación:

```tsx
// Ejemplo en componentes
<img src="/assets/icons/whatsapp-icon.svg" alt="WhatsApp" />
<img src="/assets/logos/nebu-logo.png" alt="Nebu" />
```

## Recomendaciones

- Usa **SVG** para iconos siempre que sea posible (mejor escalabilidad)
- Optimiza las imágenes antes de subirlas (usa herramientas como ImageOptim, TinyPNG, etc.)
- Usa nombres descriptivos y consistentes para los archivos
- Para iconos, considera usar una librería como `lucide-react` o `react-icons` cuando sea apropiado
