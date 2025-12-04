import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface PreOrderHeroProps {
  availableUnits: number;
}

export default function PreOrderHero({ availableUnits }: PreOrderHeroProps) {
  const { t } = useTranslation("common");

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          🔥 Solo {availableUnits} unidades disponibles
        </div>

        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 text-primary leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t("preOrder.hero.title")}
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t("preOrder.hero.subtitle")}
        </motion.p>
      </div>
    </section>
  );
}
