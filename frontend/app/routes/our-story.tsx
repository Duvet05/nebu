import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import ValuesGrid from "~/components/About/ValuesGrid";
import StorySummary from "~/components/About/StorySummary";
import TeamSection from "~/components/About/TeamSection";
import PressSection from "~/components/About/PressSection";
import VideoSection from "~/components/About/VideoSection";
import SafetySection from "~/components/About/SafetySection";
import i18next from "~/lib/i18next.server";
import { BUSINESS } from "~/config/constants";

export const meta: MetaFunction = () => {
  return [
    { title: "Nuestra Historia - Nebu | Más que un Juguete, una Conexión" },
    {
      name: "description",
      content: "Descubre cómo nació Nebu. Nuestra misión: construir conexiones significativas sin pantallas a través del juego, apoyando el desarrollo infantil con IA responsable.",
    },
    {
      name: "keywords",
      content: "historia nebu, misión flow-telligence, valores nebu, equipo nebu, educación sin pantallas, IA responsable niños",
    },

    // Open Graph
    { property: "og:title", content: "Nuestra Historia - Nebu | Flow-telligence" },
    { property: "og:description", content: "Conexiones significativas sin pantallas. Descubre la misión detrás de Nebu." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${BUSINESS.website}/our-story` },
    { property: "og:image", content: `${BUSINESS.website}/og-story.jpg` },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Nuestra Historia - Nebu" },
    { name: "twitter:description", content: "Construyendo conexiones significativas sin pantallas a través del juego." },
    { name: "twitter:image", content: `${BUSINESS.website}/og-story.jpg` },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  return ({
    locale,
  });
}

export default function OurStory() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-nebu-bg">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 flex items-center justify-center gap-3 text-primary leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t("about.hero.title")}
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t("about.hero.subtitle")}
            </motion.p>
          </div>
        </section>

        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Values Grid */}
            <ValuesGrid />

            {/* Story Summary */}
            <StorySummary />

            {/* Team Section */}
            <TeamSection />

            {/* Press Recognition Section */}
            <PressSection />

            {/* Video Section */}
            <VideoSection />

            {/* Safety Section */}
            <SafetySection />
          </div>
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}
