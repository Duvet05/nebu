import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import { Star, Sparkles, ShieldCheck, Award } from 'lucide-react';
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

  const values = [
    {
      title: t("about.values.play.title"),
      description: t("about.values.play.description"),
      icon: <Sparkles className="w-6 h-6 text-primary" />
    },
    {
      title: t("about.values.purpose.title"),
      description: t("about.values.purpose.description"),
      icon: <Star className="w-6 h-6 text-primary" />
    },
    {
      title: t("about.values.trust.title"),
      description: t("about.values.trust.description"),
      icon: <ShieldCheck className="w-6 h-6 text-primary" />
    },
    {
      title: t("about.values.design.title"),
      description: t("about.values.design.description"),
      icon: <Award className="w-6 h-6 text-primary" />
    }
  ];

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Icons: remove gradient shape, keep simple icon */}
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-nebu-dark/10 bg-white">
                      {/* ensure icon uses brand color */}
                      {value.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-nebu-dark">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Video Section */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-center mb-8 font-gochi text-nebu-dark">
                {t("about.videos.title")}
              </h2>

              <div className="flex justify-center">
                {/* Facebook Reel */}
                <div className="bg-gray-50 rounded-2xl p-4 shadow-lg max-w-md w-full">
                  <div className="relative overflow-hidden rounded-xl" style={{ paddingBottom: '177.78%' }}>
                    <iframe
                      title="Video de presentación de Nebu"
                      src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1538072024288534&show_text=false&width=267&t=0"
                      className="absolute top-0 left-0 w-full h-full"
                      style={{ border: 'none', overflow: 'hidden' }}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen={true}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

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

              <button className="relative inline-flex items-center justify-center gap-2 font-gochi font-bold text-lg px-6 py-4 rounded-full w-auto self-center min-w-[200px] md:min-w-[240px] bg-primary text-white shadow-[0_6px_20px_rgba(255,181,74,0.3)] hover:shadow-[0_10px_30px_rgba(255,181,74,0.45)] transition-all duration-200 ease-out">
                {t("about.safety.learnMore")}
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}
