import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Mail } from "lucide-react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";

export function meta() {
  return [
    { title: "Página no encontrada - Nebu" },
    { name: "description", content: "La página que buscas no existe." },
    { name: "robots", content: "noindex" }
  ];
}

export default function NotFound() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-nebu-bg relative">
      <Header />
      
      <div className="relative z-10">
        {/* 404 Content */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Error Number */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-9xl md:text-[12rem] font-bold font-gochi text-primary leading-none">
                404
              </h1>
            </motion.div>

            {/* Error Message */}
            <motion.div
              className="mb-12 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
                {t("notFound.title")}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t("notFound.subtitle")}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                {t("notFound.goHome")}
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-full font-semibold border-2 border-gray-200 hover:border-primary hover:text-primary transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("notFound.goBack")}
              </button>
            </motion.div>

            {/* Helpful Links */}
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              
              <Link
                to="/our-story"
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("notFound.ourStoryTitle")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("notFound.ourStoryDescription")}
                </p>
              </Link>

              <Link
                to="/faq"
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Search className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("notFound.faqTitle")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("notFound.faqDescription")}
                </p>
              </Link>

              <Link
                to="/pre-order"
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Search className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("notFound.preOrderTitle")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("notFound.preOrderDescription")}
                </p>
              </Link>

              <Link
                to="/contact"
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                  <Mail className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("notFound.contactTitle")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("notFound.contactDescription")}
                </p>
              </Link>
            </motion.div>

            {/* Fun Element */}
            <motion.div
              className="mt-16 p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/20 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-gray-600 italic">
                "{t("notFound.quote")}"
              </p>
              <p className="text-primary font-semibold mt-2">
                - {t("notFound.quoteAuthor")}
              </p>
            </motion.div>

          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
