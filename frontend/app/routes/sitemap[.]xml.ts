import type { LoaderFunctionArgs } from "@remix-run/node";
import { BUSINESS } from "~/config/constants";

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: {
    lang: string;
    url: string;
  }[];
}

export async function loader({ request: _request }: LoaderFunctionArgs) {
  const baseUrl = BUSINESS.website;
  const currentDate = new Date().toISOString().split('T')[0];

  // Helper para crear alternates multiidioma
  const createAlternates = (path: string) => [
    { lang: 'es', url: `${baseUrl}${path}` },
    { lang: 'en', url: `${baseUrl}/en${path}` },
    { lang: 'x-default', url: `${baseUrl}${path}` }, // Default para idioma no especificado
  ];

  const routes: SitemapEntry[] = [
    // Páginas principales
    {
      url: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0,
      alternates: createAlternates(''),
    },
    {
      url: `${baseUrl}/productos`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.9,
      alternates: createAlternates('/productos'),
    },
    {
      url: `${baseUrl}/pre-order`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9,
      alternates: createAlternates('/pre-order'),
    },
    {
      url: `${baseUrl}/our-story`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8,
      alternates: createAlternates('/our-story'),
    },
    {
      url: `${baseUrl}/faq`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.7,
      alternates: createAlternates('/faq'),
    },
    {
      url: `${baseUrl}/contact`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7,
      alternates: createAlternates('/contact'),
    },

    // Páginas adicionales (faltaban en versión anterior)
    {
      url: `${baseUrl}/pricing`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8,
      alternates: createAlternates('/pricing'),
    },
    {
      url: `${baseUrl}/returns`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6,
      alternates: createAlternates('/returns'),
    },

    // Páginas legales
    {
      url: `${baseUrl}/libro-reclamaciones`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5,
      alternates: createAlternates('/libro-reclamaciones'),
    },
    {
      url: `${baseUrl}/terms`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.4,
      alternates: createAlternates('/terms'),
    },
    {
      url: `${baseUrl}/privacy`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.4,
      alternates: createAlternates('/privacy'),
    },
  ];

  // Generar XML con soporte hreflang
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${routes
  .map((route) => {
    const alternateLinks = route.alternates
      ? route.alternates
          .map(
            (alt) =>
              `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.url}" />`
          )
          .join('\n')
      : '';

    return `  <url>
    <loc>${route.url}</loc>${route.lastmod ? `
    <lastmod>${route.lastmod}</lastmod>` : ''}${route.changefreq ? `
    <changefreq>${route.changefreq}</changefreq>` : ''}${route.priority !== undefined ? `
    <priority>${route.priority.toFixed(1)}</priority>` : ''}${alternateLinks ? `\n${alternateLinks}` : ''}
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      'X-Robots-Tag': 'all',
    },
  });
}
