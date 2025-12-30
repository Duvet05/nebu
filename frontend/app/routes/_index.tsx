import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import ConversationExamples from "~/components/Sections/ConversationExamples";
import BenefitsCarousel from "~/components/Sections/BenefitsCarousel";
import HeroQuote from "~/components/Sections/HeroQuote";
import ProductDetails from "~/components/Sections/ProductDetails";
import HeroSection from "~/components/Sections/HeroSection";
import { Divider } from "~/components/Divider";
import { useEffect } from "react";
import { analytics } from "~/lib/analytics";
import { useAnalytics } from "~/components/AnalyticsProvider";
import { fetchProducts } from "~/lib/api/products";
import { BUSINESS } from "~/config/constants";

export async function loader() {
  const products = await fetchProducts();

  // Generar datos estructurados para los productos
  const productsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.images,
        "brand": {
          "@type": "Brand",
          "name": "Nebu"
        },
        "offers": {
          "@type": "Offer",
          "url": `${BUSINESS.website}/productos/${product.slug}`,
          "priceCurrency": "PEN",
          "price": product.price.toString(),
          "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          "priceValidUntil": "2025-12-31",
          "seller": {
            "@type": "Organization",
            "name": "Flow-Telligence"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "500",
          "bestRating": "5",
          "worstRating": "1"
        },
        "sku": product.id,
        "category": "Educational Toys & IoT Devices"
      }
    }))
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nebu - Flow-Telligence",
    "url": BUSINESS.website,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BUSINESS.website}/productos?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // Retornar objeto directamente (nueva API de Remix)
  return {
    productsStructuredData,
    websiteStructuredData
  };
}

export const meta: MetaFunction = () => {
  const siteUrl = BUSINESS.website;
  const ogImageUrl = `${siteUrl}/assets/images/nebu-og-image.jpg`;
  
  return [
    { title: "Nebu - Aventuras infinitas sin pantallas | Flow-telligence" },
    {
      name: "description",
      content:
        "Nebu: el compañero IoT que enseña sin pantallas. Historias interactivas, IA personalizada y aventuras infinitas para niños de 4-9 años.",
    },
    { name: "keywords", content: "nebu, iot, educación, niños, juguete inteligente, sin pantallas, inteligencia artificial, aprendizaje" },
    
    // Canonical URL
    { tagName: "link", rel: "canonical", href: siteUrl },
    
    // Open Graph Tags (Facebook, LinkedIn, WhatsApp)
    { property: "og:title", content: "Nebu - Tu compañero inteligente sin pantallas" },
    { property: "og:description", content: "Más que un peluche. Nebu transforma cada conversación en una aventura educativa. IA personalizada, multiidioma y sin pantallas para niños de 4-12 años." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "Flow-Telligence" },
    { property: "og:image", content: ogImageUrl },
    { property: "og:image:secure_url", content: ogImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Nebu - Peluche inteligente con IA para niños" },
    { property: "og:locale", content: "es_PE" },
    { property: "og:locale:alternate", content: "en_US" },
    
    // Twitter Card Tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@flowtelligence" },
    { name: "twitter:creator", content: "@flowtelligence" },
    { name: "twitter:title", content: "Nebu - Tu compañero inteligente sin pantallas" },
    { name: "twitter:description", content: "Peluche con IA que convierte cada conversación en una aventura educativa. Sin pantallas, multiidioma y seguro para niños de 4-12 años." },
    { name: "twitter:image", content: ogImageUrl },
    { name: "twitter:image:alt", content: "Nebu - Peluche inteligente con IA para niños" },
    
    // Product specific (para e-commerce)
    { property: "product:price:currency", content: "PEN" },
    { property: "product:price:amount", content: "190.00" },
    { property: "product:availability", content: "preorder" },
    { property: "product:condition", content: "new" },
    { property: "product:brand", content: "Nebu" },
    { property: "product:category", content: "Educational Toys" },
  ];
};

export default function Index() {
  const { sendEvent, trackUserAction, trackConversion } = useAnalytics();
  const { productsStructuredData, websiteStructuredData } = useLoaderData<typeof loader>();

  // Track page view
  useEffect(() => {
    analytics.pageView("/", "Nebu - Página Principal");
    analytics.viewProduct("nebu-001", "Nebu IoT Companion");

    // Eventos adicionales con el nuevo sistema
    sendEvent("home_page_loaded", {
      user_type: "visitor",
      page_category: "landing"
    });

    setTimeout(() => {
      trackUserAction("page_engagement", "home", "5_seconds_spent");
    }, 5000);
  }, [sendEvent, trackUserAction]);

  const handleCTAClick = (action: string) => {
    // Usar el nuevo sistema de analytics
    trackUserAction("cta_click", "home", action);
    trackConversion("cta_conversion", 1);

    // Mantener también el método anterior por compatibilidad
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "cta_click", {
        action,
        page: "home",
        section: "hero"
      });
    }
  };

  return (
    <>
      {/* Structured Data for Products and Website */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productsStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />

      <div className="min-h-screen bg-nebu-bg relative">
        <Header />

        {/* Decorative background elements - optimized for smooth scrolling */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" style={{ willChange: 'transform' }}>
          <img
            src="/assets/images/decoration-strokes-vertical.png"
            alt=""
            className="absolute top-20 right-10 w-32 h-auto opacity-15 object-contain"
            loading="lazy"
            decoding="async"
          />
          <img
            src="/assets/images/decoration-strokes-vertical.png"
            alt=""
            className="absolute bottom-32 left-20 w-28 h-auto opacity-20 object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>

      {/* Hero Section - 95% Screen Height */}
      <main id="main-content" className="relative z-10" style={{ isolation: 'isolate' }}>
        <HeroSection onCTAClick={handleCTAClick} />

  {/* Product Details Section */}
        <ProductDetails />

        <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

        {/* Benefits Carousel Section */}
        <BenefitsCarousel />
        
        <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

        {/* Educational Content & Conversation Examples Section - Combined */}
        <ConversationExamples />
        
        <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

        {/* Hero Quote Section */}
        <HeroQuote />

        <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

        <Newsletter />
      </main>

      <Footer />
      </div>
    </>
  );
}
