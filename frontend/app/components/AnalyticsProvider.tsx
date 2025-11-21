import { useEffect, type ReactNode } from "react";
import { useLocation } from "@remix-run/react";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    // Solo enviar eventos adicionales, NO re-inicializar Analytics
    if (typeof window !== "undefined" && window.gtag) {
      // Analytics ya está configurado en root.tsx
      // Solo enviamos eventos complementarios
      
      setTimeout(() => {
        window.gtag!('event', 'page_load_complete', {
          page_path: location.pathname,
          timestamp: new Date().toISOString()
        });
        
        window.gtag!('event', 'website_visit', {
          source: 'direct_or_organic',
          medium: 'website',
          campaign: 'nebu_launch'
        });
      }, 1000);
    }
  }, [location.pathname]);

  // Track cambios de ruta
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
        content_group1: getPageCategory(location.pathname)
      });

      // Evento de navegación
      window.gtag("event", "navigation", {
        page_from: sessionStorage.getItem('last_page') || 'direct',
        page_to: location.pathname
      });

      // Guardar página actual para próxima navegación
      sessionStorage.setItem('last_page', location.pathname);
    }
  }, [location]);

  return <>{children}</>;
}

function getPageCategory(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.includes('pre-order')) return 'ecommerce';
  if (pathname.includes('contact')) return 'contact';
  if (pathname.includes('faq')) return 'support';
  if (pathname.includes('our-story')) return 'about';
  return 'other';
}

// Hook para usar analytics en componentes
export function useAnalytics() {
  const sendEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        timestamp: new Date().toISOString(),
        user_engagement: true,
        ...parameters
      });
    }
  };

  const trackUserAction = (action: string, category: string, label?: string) => {
    sendEvent("user_action", {
      event_category: category,
      event_label: label,
      action_type: action,
      interaction_time: Date.now()
    });
  };

  const trackConversion = (conversionName: string, value?: number) => {
    sendEvent("conversion", {
      conversion_name: conversionName,
      conversion_value: value,
      currency: "PEN"
    });
  };

  return {
    sendEvent,
    trackUserAction,
    trackConversion
  };
}

export default AnalyticsProvider;
