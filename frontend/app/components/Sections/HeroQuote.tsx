import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function HeroQuote() {
  const { t } = useTranslation("common");

  return (
    <section className="py-16 bg-nebu-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center italic text-2xl md:text-3xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-gochi"
        >
          "{t("hero.description")}"
        </motion.blockquote>
      </div>
    </section>
  );
}
