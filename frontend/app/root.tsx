import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useChangeLanguage } from "remix-i18next/react";
import type { ReactNode } from "react";
import i18next from "~/lib/i18next.server";
import { WhatsAppButton } from "~/components/WhatsAppButton";
import { AnalyticsProvider } from "~/components/AnalyticsProvider";
import { CartProvider } from "~/contexts/CartContext";
import { CartSidebar } from "~/components/Cart";

import stylesheet from "~/styles/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "alternate icon", href: "/favicon.svg" },
  { rel: "apple-touch-icon", href: "/favicon.svg" },
  // Preconnect para Google Fonts - mejora LCP
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com"
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // Preload de fuentes críticas para mejorar LCP
  {
    rel: "preload",
    as: "style",
    href: "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&family=Fredoka:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&display=swap",
  },
  // Cargar fuentes con display=swap para evitar FOIT
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Fredoka:wght@400;600;700&family=Quicksand:wght@400;600;700&display=swap",
    // Reducir variantes de fuentes para cargar más rápido
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  return {
    locale,
    culqiPublicKey: process.env.CULQI_PUBLIC_KEY || "",
    facebookPixelId: process.env.FACEBOOK_PIXEL_ID || "",
    // Structured data for BuiltWith and search engines
    organizationData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Flow-Telligence",
      legalName: "FLOW SACS",
      url: "https://flow-telligence.com",
      logo: "https://flow-telligence.com/assets/logo.png",
      foundingDate: "2024",
      founders: [
        {
          "@type": "Person",
          name: "Flow-Telligence Team"
        }
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Lima",
        addressLocality: "Lima",
        addressCountry: "PE"
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+51-945-012-824",
          contactType: "customer service",
          areaServed: "PE",
          availableLanguage: ["Spanish", "English"]
        },
        {
          "@type": "ContactPoint",
          email: "contacto@flow-telligence.com",
          contactType: "customer service"
        }
      ],
      sameAs: [
        "https://www.facebook.com/flowtelligence",
        "https://www.instagram.com/flowtelligence",
        "https://www.tiktok.com/@flowtelligence",
        "https://twitter.com/flowtelligence",
        "https://www.youtube.com/@flowtelligence"
      ],
      taxID: "10703363135",
      vatID: "10703363135"
    }
  };
}

export function Layout({ children }: { children: ReactNode }) {
  // Usar optional chaining y garantizar un valor por defecto
  const loaderData = useLoaderData<typeof loader>() ?? {
    locale: "es",
    culqiPublicKey: "",
    organizationData: null
  };
  const locale = loaderData.locale || "es";

  useChangeLanguage(locale);

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Organization Structured Data for SEO and BuiltWith */}
        {loaderData.organizationData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(loaderData.organizationData),
            }}
          />
        )}

        {/* Additional meta tags for better indexing */}
        <meta name="author" content="Flow-Telligence" />
        <meta name="company" content="FLOW SACS" />
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />
        <meta name="revisit-after" content="7 days" />
        <meta name="classification" content="Business" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Worldwide" />

        {/* Business information */}
        <meta property="business:contact_data:street_address" content="Lima, Perú" />
        <meta property="business:contact_data:locality" content="Lima" />
        <meta property="business:contact_data:country_name" content="Peru" />
        <meta property="business:contact_data:email" content="contacto@flow-telligence.com" />
        <meta property="business:contact_data:phone_number" content="+51945012824" />

        <Meta />
        <Links />

        {/* Facebook Pixel */}
        {loaderData.facebookPixelId && (
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
                  fbq('init', '${loaderData.facebookPixelId}');
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
                src={`https://www.facebook.com/tr?id=${loaderData.facebookPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded">
          Skip to main content
        </a>
        {children}
        <WhatsAppButton />
        <ScrollRestoration />
        <Scripts />

        {/* Google Analytics 4 - Loaded after hydration */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XHR2FBL4Z3"
          suppressHydrationWarning
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XHR2FBL4Z3', {
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

        {/* Culqi.js - Loaded after hydration */}
        <script src="https://checkout.culqi.com/js/v4" suppressHydrationWarning />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.CULQI_PUBLIC_KEY = "${loaderData.culqiPublicKey || ""}";
            `,
          }}
          suppressHydrationWarning
        />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AnalyticsProvider>
      <CartProvider>
        <Outlet />
        <CartSidebar />
      </CartProvider>
    </AnalyticsProvider>
  );
}

// Agregar HydrateFallback para manejar errores de hidratación
export function HydrateFallback() {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Cargando... | Nebu</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Cargando...</h1>
          <p>Por favor espera mientras se carga la aplicación.</p>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

// Agregar ErrorBoundary para manejar errores
export function ErrorBoundary() {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error | Nebu</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>¡Oops! Algo salió mal</h1>
          <p>Lo sentimos, ha ocurrido un error inesperado.</p>
          <a href="/" style={{ color: '#8B5CF6', textDecoration: 'underline' }}>
            Volver al inicio
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
