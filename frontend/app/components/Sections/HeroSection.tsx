import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import CTAButton from './CTAButton';

interface HeroSectionProps {
  onCTAClick: (action: string) => void;
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  const { t } = useTranslation("common");

  return (
    <section className="h-[95vh] hero-gradient relative overflow-hidden flex items-center" aria-label="Hero section">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      
      {/* Decorative Leaves - Bottom Left */}
      <motion.div 
        className="absolute bottom-0 left-0 pointer-events-none z-20"
        initial={{ opacity: 0, x: -50, y: 50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        aria-hidden="true"
      >
        <img 
          src="/assets/images/Leaf (2).png" 
          alt="" 
          className="h-64 w-auto"
          aria-hidden="true"
        />
      </motion.div>

      {/* Decorative Leaves - Bottom Right */}
      <motion.div 
        className="absolute bottom-0 right-0 pointer-events-none z-20"
        initial={{ opacity: 0, x: 50, y: 50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        aria-hidden="true"
      >
        <img 
          src="/assets/images/Leaf.png" 
          alt="" 
          className="h-64 w-auto"
          aria-hidden="true"
        />
      </motion.div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="flex flex-col items-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <img
              src="/assets/logos/logo-nebu.svg"
              alt="Nebu"
              className="w-96 md:w-[36rem] lg:w-[48rem] h-auto mb-8"
            />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-gochi leading-tight text-center">
              <span className="text-primary">{t("hero.line1")} {t("hero.line2")}.</span>
              <br />
              <span className="text-accent">{t("hero.line3")} {t("hero.line4")}.</span>
            </h1>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16 md:mt-20 mb-24 md:mb-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <CTAButton to="/pre-order" onClick={() => onCTAClick('pre_order_from_hero')} ariaLabel={t('hero.cta.primary')}>
              {t('hero.cta.primary')}
            </CTAButton>
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
