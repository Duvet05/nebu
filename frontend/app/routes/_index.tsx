import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import ConversationExamples from "~/components/Sections/ConversationExamples";
import BenefitsCarousel from "~/components/Sections/BenefitsCarousel";
import ProductCTA from "~/components/Sections/ProductCTA";
import { HeroSection } from "~/components/Sections/HeroSection";
import { useEffect } from "react";
import { analytics } from "~/lib/analytics";
import { useAnalytics } from "~/components/AnalyticsProvider";

export const meta: MetaFunction = () => {
  return [
    { title: "Nebu - Aventuras infinitas sin pantallas | Flow-telligence" },
    {
      name: "description",
      content:
        "Nebu: el compañero IoT que enseña sin pantallas. Historias interactivas, IA personalizada y aventuras infinitas para niños de 4-9 años.",
    },
    { property: "og:title", content: "Nebu - Aventuras infinitas sin pantallas" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://flow-telligence.com" },
  ];
};

export default function Index() {
  const { t } = useTranslation("common");
  const { sendEvent, trackUserAction, trackConversion } = useAnalytics();

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
    <div className="min-h-screen bg-nebu-bg">
      <Header />

      {/* Hero Section - 95% Screen Height */}
      <main id="main-content">
        <HeroSection onCTAClick={handleCTAClick} />

        {/* Benefits Carousel Section */}
        <BenefitsCarousel />

        {/* Conversation Examples Section */}
        <ConversationExamples />

        {/* Product CTA Section */}
        <ProductCTA />

        <Newsletter />
      </main>
      
      <Footer />
    </div>
  );
}
