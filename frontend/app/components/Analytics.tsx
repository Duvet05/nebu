// app/components/Analytics.tsx
// Componentes modulares para analytics y tracking

import { useEffect } from 'react';
import { useLocation } from '@remix-run/react';

/**
 * Google Analytics Component
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const location = useLocation();
  
  useEffect(() => {
    // Track page views on route change
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', measurementId, {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location, measurementId]);
  
  if (!measurementId) return null;
  
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        suppressHydrationWarning
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              page_title: document.title,
              send_page_view: true,
              anonymize_ip: false,
              allow_google_signals: true,
              allow_ad_personalization_signals: true
            });
          `,
        }}
        suppressHydrationWarning
      />
    </>
  );
}

/**
 * Facebook Pixel Component
 */
export function FacebookPixel({ pixelId }: { pixelId: string }) {
  const location = useLocation();
  
  useEffect(() => {
    // Track page views on route change
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);
  
  if (!pixelId) return null;
  
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
        suppressHydrationWarning
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Culqi Script Component
 */
export function CulqiScript({ publicKey }: { publicKey: string }) {
  useEffect(() => {
    // Set Culqi public key when component mounts
    if (typeof window !== 'undefined') {
      (window as any).CULQI_PUBLIC_KEY = publicKey;
      
      // Initialize Culqi if needed
      if ((window as any).Culqi) {
        (window as any).Culqi.publicKey = publicKey;
      }
    }
  }, [publicKey]);
  
  if (!publicKey) return null;
  
  return (
    <>
      <script 
        src="https://checkout.culqi.com/js/v4" 
        suppressHydrationWarning
        defer
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.CULQI_PUBLIC_KEY = "${publicKey}";
            // Configuración adicional de Culqi si es necesaria
            window.addEventListener('load', function() {
              if (window.Culqi) {
                window.Culqi.publicKey = window.CULQI_PUBLIC_KEY;
              }
            });
          `,
        }}
        suppressHydrationWarning
      />
    </>
  );
}

// Type declarations for window object
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    Culqi: {
      publicKey: string;
      [key: string]: any;
    };
    CULQI_PUBLIC_KEY: string;
    dataLayer: any[];
  }
}

/**
 * Analytics event tracker utility
 */
export class AnalyticsTracker {
  static trackEvent(eventName: string, parameters?: Record<string, any>) {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
    
    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, parameters);
    }
  }
  
  static trackPurchase(value: number, currency: string = 'PEN', items?: any[]) {
    this.trackEvent('purchase', {
      value,
      currency,
      items,
    });
  }
  
  static trackAddToCart(value: number, currency: string = 'PEN', items?: any[]) {
    this.trackEvent('add_to_cart', {
      value,
      currency,
      items,
    });
  }
  
  static trackViewItem(value: number, currency: string = 'PEN', items?: any[]) {
    this.trackEvent('view_item', {
      value,
      currency,
      items,
    });
  }
  
  static trackSearch(searchTerm: string) {
    this.trackEvent('search', {
      search_term: searchTerm,
    });
  }
  
  static trackSignUp(method: string) {
    this.trackEvent('sign_up', {
      method,
    });
  }
  
  static trackLogin(method: string) {
    this.trackEvent('login', {
      method,
    });
  }
}

export default AnalyticsTracker;