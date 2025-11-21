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
import { json } from "@remix-run/node";
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
import { GoogleAnalytics, FacebookPixel, CulqiScript } from "~/components/Analytics";
import { LoadingSkeleton } from "~/components/LoadingSkeleton";
import { LoadingSpinner } from "~/components/LoadingSpinner";
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
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://checkout.culqi.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com https://api.culqi.com https://graph.facebook.com",
    "frame-src 'self' https://checkout.culqi.com",
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
  
  // Preload critical assets
  {
    rel: "preload",
    as: "image",
    href: "/assets/logo.webp",
    type: "image/webp",
  },
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
  
  return json<LoaderData>({
    locale,
    culqiPublicKey,
    facebookPixelId,
    organizationData,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PUBLIC_URL: process.env.PUBLIC_URL || 'https://flow-telligence.com',
    },
  });
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
        <Meta />
        
        {/* Meta tags adicionales */}
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
        
        <Meta />
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
        {/* Skip navigation for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg transition-all"
        >
          Saltar al contenido principal
        </a>
        
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
            <div className="w-32 h-32 mb-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-pulse"></div>
            
            {/* Loading spinner */}
            <LoadingSpinner size="lg" message="Preparando tu experiencia..." />
            
            {/* Progress bar */}
            <div className="w-64 h-2 mt-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-loading-bar"></div>
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

// ErrorBoundary mejorado con logging y mejor UX
export function ErrorBoundary() {
  const error = useRouteError();
  const isDev = process.env.NODE_ENV === 'development';
  
  // Log error to monitoring service (e.g., Sentry)
  if (!isDev && error) {
    console.error('Application Error:', error);
    // TODO: Enviar a servicio de monitoreo
    // logErrorToService(error);
  }
  
  // Determinar tipo de error
  let errorMessage = "Ha ocurrido un error inesperado";
  let errorStatus = 500;
  let errorDetails: string | null = null;
  
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || errorMessage;
    
    if (errorStatus === 404) {
      errorMessage = "Página no encontrada";
    } else if (errorStatus === 401) {
      errorMessage = "No autorizado";
    } else if (errorStatus === 403) {
      errorMessage = "Acceso denegado";
    }
  } else if (error instanceof Error) {
    errorMessage = "Error de aplicación";
    errorDetails = isDev ? error.stack || error.message : null;
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
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Error icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            {/* Error code */}
            <div className="text-6xl font-bold text-gray-800 mb-2">{errorStatus}</div>
            
            {/* Error message */}
            <h1 className="text-2xl font-semibold text-gray-700 mb-4">
              {errorMessage}
            </h1>
            
            {/* Error description */}
            <p className="text-gray-600 mb-6">
              Lo sentimos, pero algo no salió como esperábamos. 
              Por favor, intenta de nuevo o contacta con soporte si el problema persiste.
            </p>
            
            {/* Error details for development */}
            {errorDetails && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalles técnicos
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                  {errorDetails}
                </pre>
              </details>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Volver atrás
              </button>
              <a
                href="/"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Ir al inicio
              </a>
            </div>
            
            {/* Support link */}
            <p className="mt-6 text-sm text-gray-500">
              ¿Necesitas ayuda? {' '}
              <a href="mailto:soporte@flow-telligence.com" className="text-purple-600 hover:underline">
                Contacta con soporte
              </a>
            </p>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}