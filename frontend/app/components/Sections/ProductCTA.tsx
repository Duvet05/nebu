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
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const ProductCTA = () => {
  const { t } = useTranslation("common");
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Configuración de animaciones que respeta preferencias de usuario
  const fadeInUp = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  const floatingAnimation = prefersReducedMotion ? {} : {
    animate: { y: [-10, 10, -10] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
  };

  // Características del producto
  const features = [
    { icon: MonitorOff, color: 'green' as const, label: t("productCTA.product.features.screenFree") },
    { icon: Bot, color: 'blue' as const, label: t("productCTA.product.features.personalizedAI") },
    { icon: Shield, color: 'purple' as const, label: t("productCTA.product.features.safePrivate") },
    { icon: Users, color: 'orange' as const, label: t("productCTA.product.features.ages") }
  ];

  const trustBadges = [
    { icon: Truck, label: t("productCTA.product.badges.freeShipping") },
    { icon: Lock, label: t("productCTA.product.badges.securePayment") },
    { icon: RotateCcw, label: t("productCTA.product.badges.guarantee") }
  ];

  const colorMap = {
    green: 'bg-green-100 group-hover:bg-green-200',
    blue: 'bg-blue-100 group-hover:bg-blue-200',
    purple: 'bg-purple-100 group-hover:bg-purple-200',
    orange: 'bg-orange-100 group-hover:bg-orange-200'
  };

  const dotColorMap = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-gray-50 to-white">
      {/* Hero CTA Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary/80 text-white"
        role="banner"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            {...fadeInUp}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/30"
            >
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
              <span className="font-medium text-sm md:text-base">{t("productCTA.hero.badge")}</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 leading-tight">
              {t("productCTA.hero.title")}
              <span className="block text-gold mt-2">{t("productCTA.hero.subtitle")}</span>
            </h1>

            <p className="text-xl md:text-2xl font-semibold mb-4 text-white/90">
              {t("productCTA.hero.price")} <span className="text-gold">{t("productCTA.product.price")}</span>
            </p>
            
            <p className="text-base md:text-lg opacity-90 mb-10 max-w-2xl mx-auto">
              {t("productCTA.hero.shippingInfo")}
            </p>
            
            <motion.button
              className="bg-white text-gray-900 font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg inline-flex items-center gap-3 group hover:bg-gold hover:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={t("productCTA.hero.ctaButton")}
            >
              {t("productCTA.hero.ctaButton")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </motion.button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </section>

      {/* Product Details Section */}
      <section className="py-20 px-4">
        <motion.div
          {...fadeInUp}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-white rounded-3xl p-6 md:p-12 lg:p-16 shadow-2xl border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Product Image */}
              <div className="relative order-2 lg:order-1">
                <motion.div
                  className="relative"
                  onHoverStart={() => setIsHoveringImage(true)}
                  onHoverEnd={() => setIsHoveringImage(false)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="aspect-square bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl p-8 shadow-xl overflow-hidden relative">
                    {/* Product placeholder - reemplazar con imagen real */}
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                      <motion.div
                        className="filter drop-shadow-2xl"
                        animate={isHoveringImage ? { rotate: [0, -5, 5, 0], scale: 1.1 } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Bot className="w-40 h-40 text-primary" strokeWidth={1.5} />
                      </motion.div>

                      <div className="absolute inset-0 bg-gradient-to-t from-accent/30 to-transparent"></div>

                      {/* Hover overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHoveringImage ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  
                  {/* Floating decorative elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-gold to-primary rounded-full shadow-lg"
                    {...floatingAnimation}
                    aria-hidden="true"
                  />
                  <motion.div
                    className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-full shadow-lg"
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const, delay: 1.5 }}
                    aria-hidden="true"
                  />
                </motion.div>
              </div>

              {/* Product Information */}
              <div className="space-y-8 order-1 lg:order-2">
                {/* Status badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 bg-accent/10 text-accent font-medium px-4 py-2 rounded-full border border-accent/20"
                >
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  {t("productCTA.product.badge")}
                </motion.div>

                {/* Product title */}
                <div>
                  <h2 className="text-5xl lg:text-6xl font-bold font-heading text-gray-900 mb-4">
                    {t("productCTA.product.name")}
                  </h2>

                  {/* Pricing */}
                  <div className="flex flex-wrap items-baseline gap-4 mb-6">
                    <span className="text-4xl md:text-5xl font-bold text-gray-900">{t("productCTA.product.price")}</span>
                    <span className="text-lg md:text-xl text-gray-500 line-through">{t("productCTA.product.originalPrice")}</span>
                    <span className="bg-gradient-to-r from-primary to-gold text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      {t("productCTA.product.discount")}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                    {t("productCTA.product.description")}
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 group cursor-default"
                      >
                        <div className={`w-10 h-10 ${colorMap[feature.color]} rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm`}>
                          <Icon className={`w-5 h-5 ${dotColorMap[feature.color].replace('bg-', 'text-')}`} />
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                          {feature.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                  <motion.button
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-5 px-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-lg group relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={t("productCTA.product.preOrderButton")}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {t("productCTA.product.preOrderButton")}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>

                  <motion.button
                    className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-5 px-8 rounded-2xl hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowWaitlist(!showWaitlist)}
                    aria-label={t("productCTA.product.waitlistButton")}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {t("productCTA.product.waitlistButton")}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-gray-200">
                  {trustBadges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <div 
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-default"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{badge.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ProductCTA;
