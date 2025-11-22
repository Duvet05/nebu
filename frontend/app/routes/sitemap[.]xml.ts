import type { LoaderFunctionArgs } from "@remix-run/node";

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export async function loader({ request: _request }: LoaderFunctionArgs) {
  const baseUrl = 'https://flow-telligence.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const routes: SitemapEntry[] = [
    // Páginas principales
    {
      url: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/productos`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pre-order`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/our-story`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/libro-reclamaciones`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos-condiciones`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/politica-privacidad`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/politica-envios`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/politica-devoluciones`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6,
    },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${routes
  .map((route) => `  <url>
    <loc>${route.url}</loc>
    ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ''}
    ${route.changefreq ? `<changefreq>${route.changefreq}</changefreq>` : ''}
    ${route.priority ? `<priority>${route.priority}</priority>` : ''}
  </url>`)
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'all',
    },
  });
}
