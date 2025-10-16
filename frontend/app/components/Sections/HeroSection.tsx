import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onCTAClick: (action: string) => void;
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  const { t } = useTranslation("common");

  return (
    <section className="h-[95vh] hero-gradient relative overflow-hidden flex items-center" aria-label="Hero section">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold font-gochi mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="uppercase text-[8rem] md:text-[12rem] lg:text-[16rem] block" style={{ color: '#2F4D5C' }}>Nebu</span>
            <span style={{ color: '#FF8C5A' }}>{t("hero.line1")} {t("hero.line2")}.</span>
            <br />
            <span style={{ color: '#5EBDB0' }}>{t("hero.line3")} {t("hero.line4")}.</span>
          </motion.h1>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16 md:mt-20 mb-24 md:mb-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link 
              to="/pre-order" 
              className="relative inline-flex items-center gap-3 bg-gradient-to-r from-primary via-[#FF7A4D] to-accent text-white font-gochi font-bold text-xl px-12 py-6 rounded-full shadow-[0_8px_30px_rgb(255,107,53,0.3)] hover:shadow-[0_12px_40px_rgb(255,107,53,0.4)] transform hover:scale-105 hover:-rotate-1 transition-all duration-300 group overflow-hidden"
              onClick={() => onCTAClick("pre_order_from_hero")}
            >
              {/* Sparkle decorations */}
              <span className="absolute top-1 left-4 text-yellow-300 text-2xl animate-pulse">✨</span>
              <span className="absolute bottom-1 right-4 text-yellow-300 text-xl animate-pulse delay-300">⭐</span>
              
              {/* Button text */}
              <span className="relative z-10">{t("hero.cta.primary")}</span>
              
              {/* Animated background shimmer */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-sm font-medium">{t("hero.scrollToDiscover")}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
