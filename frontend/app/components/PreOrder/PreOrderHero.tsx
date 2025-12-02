import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PreOrderHeroProps {
  availableUnits: number;
}

export default function PreOrderHero({ availableUnits }: PreOrderHeroProps) {
  const { t } = useTranslation("common");

  return (
    <section className="pt-32 pb-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Truck className="w-4 h-4" />
          {t("preOrder.subtitle")}
        </div>

        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 flex items-center justify-center gap-3 text-primary leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src="/assets/logos/logo-nebu.svg" alt="Nebu" className="h-12 md:h-16" />
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t("preOrder.description")}
        </motion.p>

        <motion.div
          className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          🔥 Solo {availableUnits} unidades disponibles
        </motion.div>
      </div>
    </section>
  );
}
