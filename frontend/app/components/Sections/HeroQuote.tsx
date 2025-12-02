import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function HeroQuote() {
  const { t } = useTranslation("common");

  return (
    <section className="py-20 md:py-24 bg-nebu-bg relative overflow-hidden">
      {/* Decoración izquierda */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-24 md:w-36 lg:w-48 pointer-events-none"
      >
        <img
          src="/assets/images/decoration-shape-organic-orange.png"
          alt=""
          className="w-full h-auto opacity-20"
          aria-hidden="true"
        />
      </motion.div>

      {/* Decoración derecha (volteada) */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-24 md:w-36 lg:w-48 pointer-events-none"
      >
        <img
          src="/assets/images/decoration-shape-organic-orange.png"
          alt=""
          className="w-full h-auto opacity-20 scale-x-[-1]"
          aria-hidden="true"
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center italic text-xl md:text-2xl lg:text-3xl text-gray-700 max-w-5xl mx-auto leading-relaxed font-gochi px-4"
        >
          "{t("hero.description")}"
        </motion.blockquote>
      </div>
    </section>
  );
}
