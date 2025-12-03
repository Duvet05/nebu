// app/config/api.server.ts
import { env } from './env.server';

/**
 * Configuración centralizada de la API del backend
 * Este archivo SOLO debe importarse en código del servidor (loaders, actions)
 */

// URL base del backend con el prefijo /api/v1
export const API_BASE_URL = env.BACKEND_URL;

// Helper para construir URLs de la API
export function getApiUrl(path: string): string {
  // Asegurarse que el path comience con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

// URLs específicas de endpoints comunes
export const API_ENDPOINTS = {
  // Products
  products: {
    list: (includeInactive = false) => getApiUrl(`/products${includeInactive ? '?includeInactive=true' : ''}`),
    preOrders: () => getApiUrl('/products/pre-orders'),
    inStock: () => getApiUrl('/products/in-stock'),
    bySlug: (slug: string) => getApiUrl(`/products/slug/${slug}`),
    byId: (id: string) => getApiUrl(`/products/${id}`),
  },
  
  // Orders
  orders: {
    create: () => getApiUrl('/orders'),
    checkout: () => getApiUrl('/orders/checkout'),
    byId: (id: string) => getApiUrl(`/orders/${id}`),
  },
  
  // Leads
  leads: {
    newsletter: () => getApiUrl('/leads/newsletter'),
    preOrder: () => getApiUrl('/leads/pre-order'),
  },
  
  // Inventory
  inventory: {
    byProduct: (product: string) => getApiUrl(`/inventory/${product}`),
    notifications: () => getApiUrl('/inventory/notifications'),
  },
} as const;
