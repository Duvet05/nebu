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
      className="relative overflow-hidden bg-nebu-bg"
      aria-labelledby="product-cta-title"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-40" aria-hidden="true">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Contenido */}
          <motion.div className="order-2 md:order-1 text-center md:text-left" {...fadeInUp}>
            {/* Title */}
            <h2 id="product-cta-title" className="text-3xl md:text-5xl lg:text-6xl font-bold font-gochi mb-6 leading-tight text-nebu-dark">
              <span className="block mb-3 text-xl md:text-2xl font-normal text-nebu-dark/70">Conoce a:</span>
              <img src="/assets/logos/logo-nebu.svg" alt="Nebu" className="h-16 md:h-20 lg:h-24 mb-4" />
            </h2>

            {/* Price */}
            <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-primary/10 shadow-lg">
              <p className="text-sm md:text-base mb-3 text-nebu-dark/60 font-medium uppercase tracking-wide">{t('productCTA.hero.price')}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap mb-4">
                <span className="text-5xl md:text-6xl font-bold text-primary">{t('productCTA.product.price')}</span>
                <div className="flex flex-col items-start">
                  <span className="text-lg md:text-xl text-nebu-dark/40 line-through">{t('productCTA.product.originalPrice')}</span>
                  <span className="bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-full text-sm md:text-base font-bold shadow-md">
                    Ahorra 50%
                  </span>
                </div>
              </div>
              <p className="text-sm md:text-base text-nebu-dark/70 leading-relaxed">{t('productCTA.hero.shippingInfo')}</p>
            </div>

            {/* CTA Button */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <CTAButton to="/pre-order" ariaLabel={t('productCTA.hero.ctaButton')}>
                {t('productCTA.hero.ctaButton')}
              </CTAButton>
            </div>
          </motion.div>

          {/* Imagen del producto */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2 flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl"></div>
              <img
                src="/assets/images/61KUrjx-ybL._SX679_.jpg"
                alt="Nebu Dino"
                className="relative w-full max-w-md rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroCTA;
