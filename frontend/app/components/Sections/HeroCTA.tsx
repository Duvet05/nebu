import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CTAButton from './CTAButton';

const HeroCTA: React.FC = () => {
  const { t } = useTranslation('common');
  const prefersReducedMotion = useReducedMotion();

  const fadeInUp = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, ease: 'easeOut' as const },
      };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#34c3f4] via-[#2cc0f4] to-[#8404dc] text-white"
      aria-labelledby="product-cta-title"
    >
      <div className="absolute inset-0 bg-black/5" aria-hidden="true"></div>

      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <motion.div className="max-w-4xl mx-auto text-center" {...fadeInUp}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/30"
          >
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" aria-hidden="true"></span>
            <span className="font-medium text-sm md:text-base">{t('productCTA.hero.badge')}</span>
          </motion.div>

          <h2 id="product-cta-title" className="text-4xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 leading-tight">
            {t('productCTA.hero.title')}
            <span className="block text-gold mt-2">{t('productCTA.hero.subtitle')}</span>
          </h2>

          <div className="mb-4">
            <p className="text-lg md:text-xl mb-2 text-white/80">{t('productCTA.hero.price')}</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-4xl md:text-5xl font-bold text-gold">{t('productCTA.product.price')}</span>
              <span className="text-xl md:text-2xl text-white/60 line-through">{t('productCTA.product.originalPrice')}</span>
              <span className="bg-gold text-primary px-4 py-2 rounded-full text-base md:text-lg font-bold shadow-lg">-50%</span>
            </div>
          </div>

          <p className="text-base md:text-lg opacity-90 mb-10 max-w-2xl mx-auto">{t('productCTA.hero.shippingInfo')}</p>

          <div className="flex items-center justify-center gap-4">
            <CTAButton to="/pre-order" ariaLabel={t('productCTA.hero.ctaButton')}>
              {t('productCTA.hero.ctaButton')}
            </CTAButton>
          </div>

        </motion.div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroCTA;
