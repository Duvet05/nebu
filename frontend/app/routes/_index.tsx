import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import ConversationExamples from "~/components/Sections/ConversationExamples";
import BenefitsCarousel from "~/components/Sections/BenefitsCarousel";
import HeroCTA from "~/components/Sections/HeroCTA";
import ProductDetails from "~/components/Sections/ProductDetails";
import { HeroSection } from "~/components/Sections/HeroSection";
import { Divider } from "~/components/Divider";
import { useEffect } from "react";
import { analytics } from "~/lib/analytics";
import { useAnalytics } from "~/components/AnalyticsProvider";
import { products } from "~/data/products";

export async function loader({ request }: LoaderFunctionArgs) {
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
          "url": `https://flow-telligence.com/productos/${product.slug}`,
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
    "url": "https://flow-telligence.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://flow-telligence.com/productos?search={search_term_string}",
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
  return [
    { title: "Nebu - Aventuras infinitas sin pantallas | Flow-telligence" },
    {
      name: "description",
      content:
        "Nebu: el compañero IoT que enseña sin pantallas. Historias interactivas, IA personalizada y aventuras infinitas para niños de 4-9 años.",
    },
    { name: "keywords", content: "nebu, iot, educación, niños, juguete inteligente, sin pantallas, inteligencia artificial, aprendizaje" },
    { property: "og:title", content: "Nebu - Aventuras infinitas sin pantallas" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://flow-telligence.com" },
    { property: "og:site_name", content: "Flow-Telligence" },
    { property: "product:price:currency", content: "PEN" },
    { property: "product:price:amount", content: "380.00" },
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

      <div className="min-h-screen bg-nebu-bg">
        <Header />

      {/* Hero Section - 95% Screen Height */}
      <main id="main-content">
        <HeroSection onCTAClick={handleCTAClick} />

  {/* Product CTA Section split into Hero + Details */}
  <HeroCTA />
  <ProductDetails />

        <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

        {/* Conversation Examples Section */}
        <ConversationExamples />

        <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

        {/* Benefits Carousel Section */}
        <BenefitsCarousel />

        <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

        <Newsletter />
      </main>

      <Footer />
      </div>
    </>
  );
}
