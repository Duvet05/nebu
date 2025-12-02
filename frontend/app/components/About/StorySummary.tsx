import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function StorySummary() {
  const { t } = useTranslation();

  return (
    <motion.div
      className="mb-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6 font-gochi text-primary">
        {t("about.story.title")}
      </h2>
      <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
        {t("about.story.problem.content")}
      </p>
    </motion.div>
  );
}
