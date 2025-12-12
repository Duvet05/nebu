/**
 * Product Prefetching Utility
 * Prefetches related products for better perceived performance
 */

import type { Product } from '~/lib/api/products';
import { prefetchImages } from '~/components/OptimizedImage';

/**
 * Prefetch product data and images
 */
export async function prefetchProduct(productSlug: string): Promise<void> {
  try {
    // Prefetch product data (will be cached by service worker or browser)
    fetch(`/api/products/slug/${productSlug}`, {
      priority: 'low',
    } as RequestInit);
  } catch (error) {
    console.warn('Failed to prefetch product:', productSlug, error);
  }
}

/**
 * Prefetch multiple products
 */
export async function prefetchProducts(productSlugs: string[]): Promise<void> {
  await Promise.all(productSlugs.map(prefetchProduct));
}

/**
 * Prefetch related products based on current product
 */
export async function prefetchRelatedProducts(currentProduct: Product, allProducts: Product[]): Promise<void> {
  // Find related products (same category, exclude current)
  const relatedProducts = allProducts
    .filter((p) => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, 3); // Limit to 3 related products

  // Prefetch related product slugs
  await prefetchProducts(relatedProducts.map((p) => p.slug));

  // Prefetch first image of each related product
  const imagesToPrefetch = relatedProducts
    .map((p) => p.images[0])
    .filter(Boolean);

  await prefetchImages(imagesToPrefetch);
}

/**
 * Prefetch on hover (for desktop)
 */
export function setupHoverPrefetch(element: HTMLElement, productSlug: string): () => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  const handleMouseEnter = () => {
    // Delay prefetch slightly to avoid prefetching on accidental hovers
    timeoutId = setTimeout(() => {
      prefetchProduct(productSlug);
    }, 100);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup function
  return () => {
    clearTimeout(timeoutId);
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * Prefetch on viewport intersection (for mobile)
 */
export function setupIntersectionPrefetch(element: HTMLElement, productSlug: string): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          prefetchProduct(productSlug);
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: '100px', // Prefetch when 100px away from viewport
    }
  );

  observer.observe(element);

  // Cleanup function
  return () => {
    observer.disconnect();
  };
}
