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
import { ChatBubble } from "~/components/ChatBubble";
import { WhatsAppButton } from "~/components/WhatsAppButton";
import { AnalyticsProvider } from "~/components/AnalyticsProvider";

import stylesheet from "~/styles/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "alternate icon", href: "/favicon.svg" },
  { rel: "apple-touch-icon", href: "/favicon.svg" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&family=Fredoka:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  return {
    locale,
    culqiPublicKey: process.env.CULQI_PUBLIC_KEY || "",
  };
}

export function Layout({ children }: { children: ReactNode }) {
  // Usar optional chaining y garantizar un valor por defecto
  const loaderData = useLoaderData<typeof loader>() ?? { locale: "es", culqiPublicKey: "" };
  const locale = loaderData.locale || "es";

  useChangeLanguage(locale);

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Google Analytics 4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XHR2FBL4Z3"
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
        />

        {/* Culqi.js */}
        <script src="https://checkout.culqi.com/js/v4"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.CULQI_PUBLIC_KEY = "${loaderData.culqiPublicKey || ""}";
            `,
          }}
        />

        <Meta />
        <Links />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded">
          Skip to main content
        </a>
        {children}
        <WhatsAppButton />
        <ChatBubble />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AnalyticsProvider>
      <Outlet />
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
