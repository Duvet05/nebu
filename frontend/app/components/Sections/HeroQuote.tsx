import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function HeroQuote() {
  const { t } = useTranslation("common");

  return (
    <section className="py-16 bg-nebu-bg relative overflow-hidden">
      {/* Decoración izquierda */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-32 md:w-48 lg:w-64 pointer-events-none"
      >
        <img
          src="/assets/decoration-shape-organic-orange.png"
          alt=""
          className="w-full h-auto opacity-30"
          aria-hidden="true"
        />
      </motion.div>

      {/* Decoración derecha (volteada) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-32 md:w-48 lg:w-64 pointer-events-none"
      >
        <img
          src="/assets/decoration-shape-organic-orange.png"
          alt=""
          className="w-full h-auto opacity-30 scale-x-[-1]"
          aria-hidden="true"
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
