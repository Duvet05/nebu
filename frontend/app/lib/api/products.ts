/**
 * API Client for Product Catalog
 * Connects to backend NestJS API
 */

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  gradient: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  concept?: string;
  originalCharacter?: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  depositAmount?: number;
  preOrder: boolean;
  inStock: boolean;
  stockCount: number;
  images: string[];
  colors?: ProductColor[];
  ageRange?: string;
  features: string[];
  category: string;
  badge?: string;
  active: boolean;
  viewCount: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * Fetch all active products
 */
export async function fetchProducts(includeInactive = false): Promise<Product[]> {
  try {
    const url = `${API_BASE_URL}/products${includeInactive ? '?includeInactive=true' : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Fetch products currently in stock
 */
export async function fetchInStockProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/in-stock`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch in-stock products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching in-stock products:', error);
    throw error;
  }
}

/**
 * Fetch pre-order products
 */
export async function fetchPreOrderProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/pre-orders`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pre-order products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pre-order products:', error);
    throw error;
  }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch a single product by slug (increments view count)
 */
export async function fetchProductBySlug(slug: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/slug/${slug}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    throw error;
  }
}

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
 * Transform API product to include default colors if needed
 */
export function enrichProduct(product: Product): Product {
  return {
    ...product,
    colors: product.colors && product.colors.length > 0 
      ? product.colors 
      : defaultProductColors.slice(0, 4),
    features: Array.isArray(product.features) ? product.features : [],
    images: Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ['/assets/products/placeholder.jpg'],
  };
}
