import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MonitorOff,
  Bot,
  Shield,
  Users,
  Truck,
  Lock,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import NebuModel3D from '../NebuModel3D';
import CTAButton from './CTAButton';

const ProductDetails: React.FC = () => {
  const { t } = useTranslation('common');
  const [showWaitlist, setShowWaitlist] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const fadeInUp = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, ease: 'easeOut' as const },
      };

  const floatingAnimation = prefersReducedMotion
    ? {}
    : {
        animate: { y: [-10, 10, -10] },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
      };

  const features = [
    { icon: MonitorOff, color: 'green' as const, label: t('productCTA.product.features.screenFree') },
    { icon: Bot, color: 'blue' as const, label: t('productCTA.product.features.personalizedAI') },
    { icon: Shield, color: 'purple' as const, label: t('productCTA.product.features.safePrivate') },
    { icon: Users, color: 'orange' as const, label: t('productCTA.product.features.ages') },
  ];

  const trustBadges = [
    { icon: Truck, label: t('productCTA.product.badges.freeShipping') },
    { icon: Lock, label: t('productCTA.product.badges.securePayment') },
    { icon: RotateCcw, label: t('productCTA.product.badges.guarantee') },
  ];

  const colorMap: Record<string, string> = {
    green: 'bg-green-100 group-hover:bg-green-200',
    blue: 'bg-blue-100 group-hover:bg-blue-200',
    purple: 'bg-purple-100 group-hover:bg-purple-200',
    orange: 'bg-orange-100 group-hover:bg-orange-200',
  };

  const dotColorMap: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <section className="py-20 px-4 bg-nebu-bg">
      <motion.div {...fadeInUp} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 md:px-12">
            <div className="relative order-2 lg:order-1">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="aspect-square rounded-3xl shadow-xl relative">
                  <NebuModel3D color="#4ECDC4" />
                </div>

                <motion.div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-gold to-primary rounded-full shadow-lg" {...floatingAnimation} aria-hidden="true" />
                <motion.div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-full shadow-lg" animate={{ y: [10, -10, 10] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.5 }} aria-hidden="true" />
              </motion.div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div>
                <h2 className="text-5xl lg:text-6xl font-bold font-heading text-gray-900 mb-6">
                  <span className="block mb-3 text-xl md:text-2xl font-normal text-nebu-dark/70">Conoce a:</span>
                  <img src="/assets/logos/logo-nebu.svg" alt="Nebu" className="h-16 lg:h-20 mb-4" />
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex flex-wrap items-baseline gap-4">
                    <span className="text-5xl md:text-6xl font-bold text-primary">{t('productCTA.product.price')}</span>
                    <span className="text-2xl md:text-3xl text-gray-400 line-through font-medium">{t('productCTA.product.originalPrice')}</span>
                  </div>
                </div>

                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">{t('productCTA.product.description')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex items-center gap-3 group cursor-default">
                      <div className={`w-10 h-10 ${colorMap[feature.color]} rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm`}>
                        <Icon className={`w-5 h-5 ${dotColorMap[feature.color].replace('bg-', 'text-')}`} />
                      </div>
                      <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{feature.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-4 pt-4">
                <CTAButton to="/pre-order" ariaLabel={t('productCTA.product.preOrderButton')} fullWidth>
                  {t('productCTA.product.preOrderButton')}
                </CTAButton>

                <CTAButton variant="outline" onClick={() => setShowWaitlist(!showWaitlist)} ariaLabel={t('productCTA.product.waitlistButton')} fullWidth showSparkles={false}>
                  <span className="flex items-center gap-2">{t('productCTA.product.waitlistButton')}<ChevronRight className="w-5 h-5" /></span>
                </CTAButton>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-gray-200">
                {trustBadges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-default">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ProductDetails;
