import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import ConversationExamples from "~/components/Sections/ConversationExamples";
import BenefitsCarousel from "~/components/Sections/BenefitsCarousel";
import ProductCTA from "~/components/Sections/ProductCTA";
import { motion } from "framer-motion";
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
  <section className="h-[95vh] hero-gradient relative overflow-hidden flex items-center" aria-label="Hero section">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 text-primary px-6 py-3 rounded-full text-sm font-medium mb-6">
                  <span className="h-2 w-2 bg-primary rounded-full animate-pulse" aria-hidden="true"></span>
                  {t("hero.badge")}
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-bold font-gochi mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="uppercase text-[8rem] md:text-[12rem] lg:text-[16rem] block" style={{ color: '#2F4D5C' }}>Nebu</span>
                <span style={{ color: '#FF8C5A' }}>{t("hero.line1")}</span>
                <br />
                <span style={{ color: '#A89B7B' }}>{t("hero.line2")}</span><span style={{ color: '#6FB89F' }}>.</span>
                <br />
                <span style={{ color: '#5EBDB0' }}>{t("hero.line3")}</span>
                <br />
                <span style={{ color: '#A8D5A0' }}>{t("hero.line4")}</span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {t("hero.description")}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link 
                  to="/pre-order" 
                  className="btn-primary btn-lg group text-lg px-8 py-4"
                  onClick={() => handleCTAClick("pre_order_from_hero")}
                >
                  {t("hero.cta.primary")}
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            aria-hidden="true"
          >
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <span className="text-sm font-medium">Scroll para descubrir</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-1 h-3 bg-gray-400 rounded-full mt-2"
                />
              </motion.div>
            </div>
          </motion.div>
        </section>

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
