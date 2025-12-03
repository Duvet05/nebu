// app/root.tsx - Versión Optimizada
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, HeadersFunction } from "@remix-run/node";
import { useChangeLanguage } from "remix-i18next/react";
import type { ReactNode } from "react";
import { Suspense, lazy } from "react";
import i18next from "~/lib/i18next.server";

// Lazy load components para mejor performance
const WhatsAppButton = lazy(() => import("~/components/WhatsAppButton"));
const AnalyticsProvider = lazy(() => import("~/components/AnalyticsProvider"));
const CartProvider = lazy(() => import("~/contexts/CartContext"));
const CartSidebar = lazy(() => import("~/components/Cart"));

// Importar configuraciones modularizadas
import { getMetaTags, getStructuredData } from "~/config/metadata";
import { getFontLinks } from "~/config/fonts";
import { validatePublicKey, sanitizeId } from "~/utils/security";
import { BUSINESS } from "~/config/constants";
import { GoogleAnalytics, FacebookPixel, CulqiScript } from "~/components/Analytics";
import { LoadingSkeleton } from "~/components/LoadingSkeleton";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { ErrorLayout, ErrorContent } from "~/components/ErrorLayout";
import stylesheet from "~/styles/tailwind.css?url";

// Tipos estrictos
interface LoaderData {
  locale: string;
  culqiPublicKey: string;
  facebookPixelId: string;
  organizationData: ReturnType<typeof getStructuredData> | null;
  env: {
    NODE_ENV: string;
    PUBLIC_URL: string;
  };
}

// Content Security Policy Headers
export const headers: HeadersFunction = () => ({
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://checkout.culqi.com https://static.cloudflareinsights.com https://www.tiktok.com https://embed.cloudflarestream.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com https://api.culqi.com https://graph.facebook.com https://cloudflareinsights.com",
    "frame-src 'self' https://checkout.culqi.com https://www.facebook.com https://web.facebook.com https://www.tiktok.com https://customer-6wol0f3dx3u8wuhd.cloudflarestream.com https://iframe.cloudflarestream.com",
  ].join("; "),
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
});

// Optimized links function
export const links: LinksFunction = () => [
  // Critical CSS
  { 
    rel: "stylesheet", 
    href: stylesheet,
    as: "style",
    crossOrigin: "anonymous",
  },
  
  // Favicons optimizados
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "alternate icon", href: "/favicon.ico" },
  { 
    rel: "apple-touch-icon", 
    href: "/apple-touch-icon.png",
    sizes: "180x180" 
  },
  
  // Fonts optimizadas (solo las variantes necesarias)
  ...getFontLinks(),
  
  // Preconnect para recursos externos
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { 
    rel: "preconnect", 
    href: "https://fonts.gstatic.com", 
    crossOrigin: "anonymous" 
  },
  { rel: "dns-prefetch", href: "https://www.googletagmanager.com" },
  { rel: "dns-prefetch", href: "https://connect.facebook.net" },
];

// Loader optimizado con validación
export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  
  // Validar y sanitizar variables de entorno
  const culqiPublicKey = validatePublicKey(process.env.CULQI_PUBLIC_KEY);
  const facebookPixelId = sanitizeId(process.env.FACEBOOK_PIXEL_ID);
  
  // Solo incluir datos de organización en producción
  const organizationData = process.env.NODE_ENV === 'production' 
    ? getStructuredData()
    : null;
  
  // Retornar objeto directamente (nueva API de Remix)
  return {
    locale,
    culqiPublicKey,
    facebookPixelId,
    organizationData,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PUBLIC_URL: process.env.PUBLIC_URL || BUSINESS.website,
    },
  };
}

// Layout component optimizado
export function Layout({ children }: { children: ReactNode }) {
  const loaderData = useLoaderData<LoaderData>();
  const locale = loaderData?.locale || "es";

  useChangeLanguage(locale);

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Meta tags de la ruta actual (incluye title, description, canonical, og:*, twitter:*) */}
        <Meta />
        
        {/* Meta tags globales adicionales (author, robots, business info) */}
        {getMetaTags(locale).map((tag: any, index: number) => (
          <meta key={index} {...tag} />
        ))}
        
        {/* Structured Data for SEO */}
        {loaderData?.organizationData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(loaderData.organizationData),
            }}
          />
        )}
        
        <Links />
        
        {/* Analytics solo en producción */}
        {loaderData?.env.NODE_ENV === 'production' && (
          <>
            {loaderData.facebookPixelId && (
              <FacebookPixel pixelId={loaderData.facebookPixelId} />
            )}
            <GoogleAnalytics measurementId="G-XHR2FBL4Z3" />
          </>
        )}
      </head>
      <body>

        {children}
        
        <ScrollRestoration />
        <Scripts />
        
        {/* Culqi script con lazy loading */}
        {loaderData?.culqiPublicKey && (
          <CulqiScript publicKey={loaderData.culqiPublicKey} />
        )}
      </body>
    </html>
  );
}

// App component con Suspense boundaries
export default function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AnalyticsProvider>
        <CartProvider>
          <Outlet />
          <CartSidebar />
          <WhatsAppButton />
        </CartProvider>
      </AnalyticsProvider>
    </Suspense>
  );
}

// HydrateFallback mejorado con skeleton UI
export function HydrateFallback() {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Cargando... | Flow-Telligence</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          <div className="flex flex-col items-center justify-center min-h-screen px-4">
            {/* Logo skeleton */}
            <div className="w-32 h-32 mb-8 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
            
            {/* Loading spinner */}
            <LoadingSpinner size="lg" message="Preparando tu experiencia..." />
            
            {/* Progress bar */}
            <div className="w-64 h-2 mt-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-loading-bar"></div>
            </div>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading-bar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          .animate-loading-bar {
            animation: loading-bar 2s ease-in-out infinite;
          }
        `}} />
        
        <Scripts />
      </body>
    </html>
  );
}

// ErrorBoundary mejorado - usa ErrorLayout component
export function ErrorBoundary() {
  const error = useRouteError();
  const isDev = process.env.NODE_ENV === 'development';
  
  // Log error to monitoring service (e.g., Sentry)
  if (!isDev && error) {
    console.error('Application Error:', error);
    // TODO: Enviar a servicio de monitoreo
    // logErrorToService(error);
  }
  
  // Determine error status and details
  let errorStatus = 500;
  
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
  }
  
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`Error ${errorStatus} | Flow-Telligence`}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorLayout>
          <ErrorContent 
            error={error}
            statusCode={errorStatus}
            showDetails={isDev}
          />
        </ErrorLayout>
        <Scripts />
      </body>
    </html>
  );
}