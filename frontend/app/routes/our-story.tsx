import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import { Star, Sparkles, ShieldCheck, Award } from 'lucide-react';
import i18next from "~/lib/i18next.server";

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
    { property: "og:url", content: "https://flow-telligence.com/our-story" },
    { property: "og:image", content: "https://flow-telligence.com/og-story.jpg" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Nuestra Historia - Nebu" },
    { name: "twitter:description", content: "Construyendo conexiones significativas sin pantallas a través del juego." },
    { name: "twitter:image", content: "https://flow-telligence.com/og-story.jpg" },
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

  const values = [
    {
      title: t("about.values.play.title"),
      description: t("about.values.play.description"),
      icon: <Sparkles className="w-6 h-6 text-white" />
    },
    {
      title: t("about.values.purpose.title"),
      description: t("about.values.purpose.description"),
      icon: <Star className="w-6 h-6 text-white" />
    },
    {
      title: t("about.values.trust.title"),
      description: t("about.values.trust.description"),
      icon: <ShieldCheck className="w-6 h-6 text-white" />
    },
    {
      title: t("about.values.design.title"),
      description: t("about.values.design.description"),
      icon: <Award className="w-6 h-6 text-white" />
    }
  ];

  return (
    <div className="min-h-screen bg-nebu-bg">
      <Header />
      
      <main className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="h1-hero font-gochi mb-6">
                {t("about.hero.title")}
              </h1>
              <p className="p-lead mx-auto mt-4 max-w-3xl leading-relaxed">
                {t("about.hero.subtitle")}
              </p>
            </motion.div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Safety Section */}
            <motion.div
              className="bg-gray-50 rounded-2xl p-8 text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{t("about.safety.title")}</h2>
              </div>

              <p className="text-gray-600 max-w-2xl mx-auto">
                {t("about.safety.description")}
              </p>

              <button className="btn btn-primary">
                {t("about.safety.learnMore")}
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}
