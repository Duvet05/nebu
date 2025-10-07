import type { LoaderFunctionArgs } from "@remix-run/node";

type SitemapEntry = {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const domain = new URL(request.url).origin;

  const pages: SitemapEntry[] = [
    {
      url: `${domain}/`,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      url: `${domain}/pre-order`,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      url: `${domain}/pricing`,
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      url: `${domain}/our-story`,
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      url: `${domain}/faq`,
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      url: `${domain}/contact`,
      changefreq: 'monthly',
      priority: 0.6,
    },
    {
      url: `${domain}/terms`,
      changefreq: 'yearly',
      priority: 0.3,
    },
    {
      url: `${domain}/privacy`,
      changefreq: 'yearly',
      priority: 0.3,
    },
    {
      url: `${domain}/returns`,
      changefreq: 'yearly',
      priority: 0.3,
    },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    ${page.changefreq ? `<changefreq>${page.changefreq}</changefreq>` : ''}
    ${page.priority ? `<priority>${page.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
