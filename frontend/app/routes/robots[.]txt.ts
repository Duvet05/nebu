export async function loader() {
  const robotText = `
# Robots.txt for Flow-Telligence / Nebu
User-agent: *
Allow: /

# Sitemap
Sitemap: https://flow-telligence.com/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow administrative areas
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$

# Allow specific bots
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: dotbot
Disallow: /
`.trim();

  return new Response(robotText, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
