// Localhost origins for hybrid development
const getLocalhostOrigins = () => {
  const allowLocalhost = process.env.ALLOW_LOCALHOST_CORS === 'true';
  
  if (!allowLocalhost) {
    return [];
  }
  
  return [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
  ];
};

export const corsConfig = {
  production: [
    process.env.FRONTEND_URL!,
    process.env.FRONTEND_URL?.replace('https://', 'https://www.'),
    process.env.DOMAIN ? `https://${process.env.DOMAIN}` : undefined,
    process.env.DOMAIN ? `https://www.${process.env.DOMAIN}` : undefined,
    process.env.DOMAIN ? `https://api.${process.env.DOMAIN}` : undefined,
    ...getLocalhostOrigins(), // Conditionally add localhost origins
  ].filter(Boolean),
  development: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'https://nebu.com',
    'http://nebu.com',
    'https://www.nebu.com',
    'http://www.nebu.com',
  ]
};

// Localhost regex patterns for hybrid development
const getLocalhostRegexPatterns = () => {
  const allowLocalhost = process.env.ALLOW_LOCALHOST_CORS === 'true';
  
  if (!allowLocalhost) {
    return [];
  }
  
  return [
    /^https?:\/\/localhost(:[0-9]+)?$/,
    /^https?:\/\/127\.0\.0\.1(:[0-9]+)?$/,
  ];
};

export const corsRegexConfig = {
  production: [
    /^https:\/\/.*\.nebu\.com$/,
    ...getLocalhostRegexPatterns(), // Conditionally add localhost patterns
  ],
  development: [
    /^https?:\/\/localhost(:[0-9]+)?$/,
    /^https?:\/\/127\.0\.0\.1(:[0-9]+)?$/,
    /^https?:\/\/.*\.localhost(:[0-9]+)?$/,
    /^https?:\/\/.*\.nebu\.com$/,
    /^https?:\/\/nebu\.com$/,
  ]
};

export function getCorsOrigins() {
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  
  // En producción, NO permitir todo (*) sino lista cerrada
  // EXCEPCIÓN: Si la variable IOT_ALLOW_ALL_ORIGINS=true, se permite para ESP32/IoT
  if (env === 'production') {
    const allowIotAll = process.env.IOT_ALLOW_ALL_ORIGINS === 'true';
    if (allowIotAll) {
      // Para dispositivos IoT que no manejan bien CORS o certificados autofirmados
      return true;
    }
    // Lista cerrada de dominios confiables en producción
    return corsConfig[env];
  }
  
  return corsConfig[env];
}

export function getCorsRegexOrigins() {
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  return corsRegexConfig[env];
}
