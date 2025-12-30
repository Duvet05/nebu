// app/config/constants.ts
// Constantes centralizadas de la aplicación

/**
 * Información de contacto de la empresa
 */
export const CONTACT = {
  email: {
    main: 'contacto@flow-telligence.com',
    support: 'soporte@flow-telligence.com',
    sales: 'ventas@flow-telligence.com',
    returns: 'devoluciones@flow-telligence.com',
    privacy: 'privacidad@flow-telligence.com',
    admin: 'admin@flow-telligence.com',
    billing: 'facturacion@flow-telligence.com',
    info: 'info@flow-telligence.com',
  },
  phone: '+51945012824',
  phoneAlt: '+51970116770', // Número alternativo
  whatsapp: {
    number: '+51945012824',
    display: '+51 945 012 824',
    url: 'https://wa.me/51945012824?text=Hola!%20Estoy%20interesado%20en%20Nebu',
  },
  social: {
    twitter: 'https://twitter.com/flowtelligence',
    instagram: 'https://www.instagram.com/flow_.ia/',
    facebook: 'https://www.facebook.com/flowtelligence',
    tiktok: 'https://www.tiktok.com/@flow_.ia/video/7563090924025203976',
    youtube: 'https://www.youtube.com/@flowtelligence',
    linkedin: 'https://pe.linkedin.com/in/galvezc',
  },
  socialHandles: {
    twitter: '@flowtelligence',
    instagram: '@flow_.ia',
    tiktok: '@flow_.ia',
  },
} as const;

/**
 * Información del negocio
 */
export const BUSINESS = {
  name: 'Flow-Telligence',
  legalName: 'FLOW S.A.C.S.',
  ruc: '20615226093',
  website: 'https://flow-telligence.com',
  address: {
    city: 'Lima',
    country: 'PE',
    countryName: 'Peru',
    full: 'Lima, Perú',
  },
} as const;

/**
 * Configuración de animaciones con Framer Motion
 */
export const ANIMATIONS = {
  durations: {
    instant: 0.15,
    fast: 0.3,
    normal: 0.6,
    slow: 1.0,
    verySlow: 1.5,
  },
  delays: {
    none: 0,
    short: 0.1,
    medium: 0.2,
    long: 0.3,
    veryLong: 0.5,
  },
  easing: {
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
} as const;

/**
 * Colores del tema (sincronizados con Tailwind)
 */
export const COLORS = {
  primary: '#FFB54A',
  accent: '#60BFB2',
  background: '#FFF7F0',
  // Colores para efectos de fondo
  backgroundEffect: {
    primary: '#6366f115',
    secondary: '#6366f110',
  },
} as const;

/**
 * Configuración de productos
 */
export const PRODUCTS = {
  currency: 'S/',
  shipping: {
    free: true,
    estimatedWeeks: '6-8',
  },
  deposit: {
    percentage: 50,
  },
  warranty: {
    months: 12,
    days: 30, // Garantía de satisfacción
  },
  maxQuantityPerOrder: 5,
} as const;

/**
 * Rutas de la aplicación
 */
export const ROUTES = {
  home: '/',
  products: '/productos',
  preOrder: '/pre-order',
  ourStory: '/our-story',
  faq: '/faq',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  returns: '/returns',
  pricing: '/pricing',
  libroReclamaciones: '/libro-reclamaciones',
} as const;

/**
 * Assets y recursos
 */
export const ASSETS = {
  logos: {
    nebu: '/assets/logos/logo-nebu.svg',
  },
} as const;

/**
 * Límites y validaciones
 */
export const LIMITS = {
  form: {
    name: {
      min: 2,
      max: 50,
    },
    email: {
      max: 100,
    },
    phone: {
      min: 9,
      max: 15,
    },
    address: {
      min: 10,
      max: 200,
    },
    message: {
      min: 10,
      max: 1000,
    },
    complaint: {
      min: 50,
      max: 2000,
    },
  },
  products: {
    minAge: 4,
    maxAge: 12,
  },
} as const;

/**
 * Timeouts y delays
 */
export const TIMEOUTS = {
  notification: 5000, // 5 segundos
  debounce: 300, // 300ms
  toast: 3000, // 3 segundos
} as const;

/**
 * Mensajes comunes
 */
export const MESSAGES = {
  errors: {
    generic: 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.',
    network: 'Error de conexión. Verifica tu internet.',
    validation: 'Por favor, corrige los errores en el formulario.',
  },
  success: {
    generic: '¡Operación exitosa!',
    saved: 'Cambios guardados correctamente.',
  },
} as const;
