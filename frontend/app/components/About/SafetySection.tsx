import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

export default function SafetySection() {
  const { t } = useTranslation();

  return (
    <motion.div
      className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <div className="inline-flex items-center justify-center gap-2 bg-primary/10 rounded-full px-5 py-2.5 mb-4">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <span className="font-bold text-primary text-sm">{t("about.safety.title")}</span>
      </div>

      <p className="text-gray-700 max-w-2xl mx-auto mb-6 leading-relaxed">
        {t("about.safety.description")}
      </p>

      <button className="inline-flex items-center justify-center gap-2 font-semibold text-base px-6 py-3 rounded-full bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200 ease-out">
        <span>{t("about.safety.learnMore")}</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </motion.div>
  );
}
