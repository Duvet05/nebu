import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';

export default function PressSection() {
  const { t } = useTranslation();

  return (
    <motion.div
      className="mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold font-gochi text-primary mb-3">
          {t("about.press.title")}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("about.press.subtitle")}
        </p>
      </div>

      <a 
        href="https://facultad-ciencias-ingenieria.pucp.edu.pe/2025/10/27/nebu-conoce-al-peluche-con-inteligencia-artificial-que-acompana-y-ensena-a-los-mas-pequenos/"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/40 transition-all duration-200 group"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-primary mb-1">
              {t("about.press.pucp.badge")} • {t("about.press.pucp.badgeSubtitle")}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-nebu-dark mb-2 group-hover:text-primary transition-colors">
              {t("about.press.pucp.title")}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {t("about.press.pucp.description")}
            </p>
            <div className="flex items-center gap-2 text-sm text-primary font-semibold">
              <span>{t("about.press.pucp.cta")}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
