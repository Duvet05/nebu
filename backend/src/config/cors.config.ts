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
    'https://nebu.com',
    'https://www.nebu.com',
    'https://api.nebu.com',
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
  return corsConfig[env];
}

export function getCorsRegexOrigins() {
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  return corsRegexConfig[env];
}
