/**
 * Facebook Pixel tracking utilities
 * Provides type-safe methods to track events in the Facebook Pixel
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export type FacebookPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration';

/**
 * Track a standard Facebook Pixel event
 */
export function trackEvent(
  eventName: FacebookPixelEvent,
  data?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && window.fbq) {
    if (data) {
      window.fbq('track', eventName, data);
    } else {
      window.fbq('track', eventName);
    }
  }
}

/**
 * Track a custom Facebook Pixel event
 */
export function trackCustomEvent(
  eventName: string,
  data?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && window.fbq) {
    if (data) {
      window.fbq('trackCustom', eventName, data);
    } else {
      window.fbq('trackCustom', eventName);
    }
  }
}

/**
 * Track product view event
 */
export function trackProductView(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}): void {
  trackEvent('ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'PEN',
    content_category: product.category || 'Educational Toys',
  });
}

/**
 * Track add to cart event
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  trackEvent('AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * product.quantity,
    currency: 'PEN',
  });
}

/**
 * Track initiate checkout event
 */
export function trackInitiateCheckout(data: {
  value: number;
  num_items: number;
  content_ids?: string[];
}): void {
  trackEvent('InitiateCheckout', {
    value: data.value,
    currency: 'PEN',
    num_items: data.num_items,
    content_ids: data.content_ids || [],
    content_type: 'product',
  });
}

/**
 * Track purchase event
 */
export function trackPurchase(data: {
  value: number;
  orderId: string;
  num_items: number;
  content_ids?: string[];
}): void {
  trackEvent('Purchase', {
    value: data.value,
    currency: 'PEN',
    content_ids: data.content_ids || [],
    content_type: 'product',
    num_items: data.num_items,
  });
}

/**
 * Track lead event (newsletter signup, contact form, etc.)
 */
export function trackLead(data?: {
  content_name?: string;
  value?: number;
}): void {
  trackEvent('Lead', {
    content_name: data?.content_name || 'Lead',
    value: data?.value || 0,
    currency: 'PEN',
  });
}
