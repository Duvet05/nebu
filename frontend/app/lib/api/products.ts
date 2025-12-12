/**
 * API Client for Product Catalog
 * Connects to backend NestJS API
 */

import { apiClient } from '~/lib/api-client';
import { ApiProductSchema, ApiProductsArraySchema, type ApiProduct, type Product, type ProductColor } from '~/lib/api/schemas';
import { getCached, CACHE_TTL } from '~/lib/cache';

// Re-export types
export type { Product, ProductColor } from '~/lib/api/schemas';
// Re-export cache utilities for product invalidation
export { invalidateCacheByPattern } from '~/lib/cache';


// Fallback dummy products (used only when backend is unreachable and in dev)
const dummyProducts: ApiProduct[] = [
  {
    id: 'nebu-dino',
    slug: 'nebu-dino',
    name: 'Nebu Dino',
    concept: 'Dinosaurio amigable',
    originalCharacter: 'dino',
    description: 'El compañero de aventuras sin pantallas.',
    shortDescription: 'Compañero de aprendizaje sin pantallas',
    price: '380',
    preOrder: true,
    inStock: false,
    stockCount: 20,
    images: ['/assets/products/nebu-dino/1.jpg'],
    videoPlaybackId: 'ed5516e7514f3ae7dd5ce4f7d49b52c8',
    videoProvider: 'cloudflare',
    videoThumbnail: null,
    colors: [],
    ageRange: '3-8',
    features: ['Conversaciones AI', 'Sin pantallas', 'App parental'],
    category: 'peluches',
    badge: 'Pre-orden',
    active: true,
    viewCount: 1200,
    orderCount: 85,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nebu-gato',
    slug: 'nebu-gato',
    name: 'Nebu Gato',
    concept: 'Gatito explorador',
    originalCharacter: 'gato',
    description: 'Suave y curioso.',
    shortDescription: 'Nuevo amigo felino',
    price: '420',
    preOrder: true,
    inStock: false,
    stockCount: 10,
    images: ['/assets/products/nebu-gato/1.jpg'],
    videoPlaybackId: null,
    videoProvider: null,
    videoThumbnail: null,
    colors: [],
    ageRange: '3-8',
    features: ['Ronroneos', 'Conexión parental'],
    category: 'peluches',
    badge: 'Próximamente',
    active: true,
    viewCount: 300,
    orderCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

/**
 * Default colors if product doesn't have custom colors
 */
export const defaultProductColors: ProductColor[] = [
  { id: "aqua", name: "Aqua", hex: "#4ECDC4", gradient: "from-teal-400 to-cyan-500" },
  { id: "dusk", name: "Anochecer", hex: "#6366F1", gradient: "from-indigo-500 to-purple-600" },
  { id: "quartz", name: "Cuarzo", hex: "#EC4899", gradient: "from-pink-500 to-rose-600" },
  { id: "flare", name: "Destello", hex: "#F59E0B", gradient: "from-amber-500 to-orange-600" },
  { id: "forest", name: "Bosque", hex: "#10B981", gradient: "from-green-500 to-emerald-600" },
  { id: "lavender", name: "Lavanda", hex: "#A78BFA", gradient: "from-purple-400 to-violet-500" },
];


/**
 * Transform API product (ApiProduct) to Domain Product (Product)
 * - Converts price strings to numbers
 * - Normalizes colors to ProductColor objects
 * - Adds default images if missing
 */
export function enrichProduct(product: ApiProduct): Product {
  // Transform colors: if they're just hex strings, convert to full color objects
  let enrichedColors: ProductColor[] = defaultProductColors.slice(0, 4);
  
  if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    // Check if colors are already objects or just strings
    const firstColor = product.colors[0];
    
    if (typeof firstColor === 'string') {
      // Convert hex strings to color objects
      enrichedColors = (product.colors as unknown as string[]).map((hex, index) => {
        const colorNames = ['Aqua', 'Anochecer', 'Cuarzo', 'Destello', 'Bosque', 'Lavanda'];
        return {
          id: `color-${index}`,
          name: colorNames[index] || `Color ${index + 1}`,
          hex: hex,
          gradient: `from-[${hex}] to-[${hex}]` // Simple gradient fallback
        };
      });
    } else {
      // Already in the right format (ProductColor objects from backend)
      enrichedColors = product.colors as ProductColor[];
    }
  }

  // Convert numeric strings to numbers
  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : undefined;
  const depositAmount = product.depositAmount ? parseFloat(product.depositAmount) : undefined;

  return {
    ...product,
    price: isNaN(price) ? 0 : price,
    originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : undefined,
    depositAmount: depositAmount && !isNaN(depositAmount) ? depositAmount : undefined,
    colors: enrichedColors,
    features: Array.isArray(product.features) ? product.features : [],
    images: Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ['/assets/products/placeholder.jpg'],
  };
}

/**
 * Fetch all active products (with cache)
 */
export async function fetchProducts(includeInactive = false): Promise<Product[]> {
  const cacheKey = `products:${includeInactive ? 'all' : 'active'}`;
  
  try {
    return await getCached(
      cacheKey,
      async () => {
        const endpoint = `/products${includeInactive ? '?includeInactive=true' : ''}`;
        const response = await apiClient.get<unknown>(endpoint);
        
        // Validate response with Zod (ApiProduct)
        const apiProducts = ApiProductsArraySchema.parse(response);
        
        // Transform to Domain Product
        return apiProducts.map(enrichProduct);
      },
      CACHE_TTL.LONG // 5 minutes cache
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.warn('Backend unreachable — returning dummy products for development');
      return dummyProducts.map(enrichProduct);
    }
    throw error;
  }
}

/**
 * Fetch products currently in stock (with cache)
 */
export async function fetchInStockProducts(): Promise<Product[]> {
  const cacheKey = 'products:inStock';
  
  try {
    return await getCached(
      cacheKey,
      async () => {
        const response = await apiClient.get<unknown>('/products/in-stock');
        const apiProducts = ApiProductsArraySchema.parse(response);
        return apiProducts.map(enrichProduct);
      },
      CACHE_TTL.LONG // 5 minutes cache
    );
  } catch (error) {
    console.error('Error fetching in-stock products:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.warn('Backend unreachable — returning dummy in-stock products for development');
      return dummyProducts.filter(p => p.inStock).map(enrichProduct);
    }
    throw error;
  }
}

/**
 * Fetch pre-order products
 */
export async function fetchPreOrderProducts(): Promise<Product[]> {
  try {
    const response = await apiClient.get<unknown>('/products/pre-orders');
    const apiProducts = ApiProductsArraySchema.parse(response);
    return apiProducts.map(enrichProduct);
  } catch (error) {
    console.error('Error fetching pre-order products:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.warn('Backend unreachable — returning dummy pre-order products for development');
      return dummyProducts.filter(p => p.preOrder).map(enrichProduct);
    }
    throw error;
  }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product> {
  try {
    const response = await apiClient.get<unknown>(`/products/${id}`);
    const apiProduct = ApiProductSchema.parse(response);
    return enrichProduct(apiProduct);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.warn(`Backend unreachable — returning dummy product ${id} for development`);
      const dummy = dummyProducts.find(p => p.id === id) || dummyProducts[0];
      return enrichProduct(dummy);
    }
    throw error;
  }
}

/**
 * Fetch a single product by slug (increments view count)
 */
export async function fetchProductBySlug(slug: string): Promise<Product> {
  try {
    const response = await apiClient.get<unknown>(`/products/slug/${slug}`);
    const apiProduct = ApiProductSchema.parse(response);
    return enrichProduct(apiProduct);
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.warn(`Backend unreachable — returning dummy product ${slug} for development`);
      const dummy = dummyProducts.find(p => p.slug === slug) || dummyProducts[0];
      return enrichProduct(dummy);
    }
    throw error;
  }
}
