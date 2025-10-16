import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Lightbulb, Star, Heart, Brain, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BenefitsCarousel() {
  const { t } = useTranslation("common");

  const benefits = [
    {
      id: 1,
      icon: Monitor,
      title: t("benefits.reduceScreenTime.title"),
      description: t("benefits.reduceScreenTime.description"),
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      icon: Lightbulb,
      title: t("benefits.nurtureImagination.title"),
      description: t("benefits.nurtureImagination.description"),
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      icon: Star,
      title: t("benefits.buildConfidence.title"),
      description: t("benefits.buildConfidence.description"),
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 4,
      icon: Heart,
      title: t("benefits.developEmpathy.title"),
      description: t("benefits.developEmpathy.description"),
      color: "from-red-500 to-rose-500"
    },
    {
      id: 5,
      icon: Brain,
      title: t("benefits.stimulateLearning.title"),
      description: t("benefits.stimulateLearning.description"),
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 6,
      icon: Shield,
      title: t("benefits.safeAndPrivate.title"),
      description: t("benefits.safeAndPrivate.description"),
      color: "from-indigo-500 to-blue-500"
    }
  ];

  // Duplicamos los beneficios para crear el efecto infinito
  const extendedBenefits = [...benefits, ...benefits, ...benefits];
  return (
    <section 
      className="min-h-[80vh] py-24 overflow-hidden flex items-center" 
      style={{ backgroundColor: '#FFF7F0' }}
      aria-labelledby="benefits-title"
    >
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-7xl mx-auto"
        >
          <h2 id="benefits-title" className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 text-gray-900">
            {t("benefits.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("benefits.subtitle")}
          </p>
        </motion.div>

        {/* Horizontal Scrolling Carousel */}
        <div className="relative w-full" aria-label="Carousel de beneficios de Nebu">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              aria-live="polite"
              animate={{
                x: [0, -3600] // Más distancia para cards más grandes
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 50, // Aún más lento: 50 segundos para completar un ciclo
                  ease: "linear"
                }
              }}
            >
              {extendedBenefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={`${benefit.id}-${index}`}
                    className="flex-shrink-0 w-96 lg:w-[420px] bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
                    whileHover={{ 
                      scale: 1.02,
                      y: -5
                    }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {benefit.description}
                    </p>
                    
                    {/* Decorative gradient border */}
                    <div className={`h-1 bg-gradient-to-r ${benefit.color} rounded-full`}></div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
          
          {/* Gradient fade effects on the sides - usando el color FFF7F0 */}
          <div className="absolute left-0 top-0 bottom-0 w-40 pointer-events-none z-10" style={{ background: 'linear-gradient(to right, #FFF7F0, transparent)' }}></div>
          <div className="absolute right-0 top-0 bottom-0 w-40 pointer-events-none z-10" style={{ background: 'linear-gradient(to left, #FFF7F0, transparent)' }}></div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-7xl mx-auto"
        >
          <motion.div 
            className="p-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl font-bold text-primary mb-2">85%</div>
            <div className="text-gray-600">{t("benefits.stats.parentsScreenTime")}</div>
          </motion.div>
          <motion.div 
            className="p-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl font-bold text-accent mb-2">92%</div>
            <div className="text-gray-600">{t("benefits.stats.childrenSpeaking")}</div>
          </motion.div>
          <motion.div 
            className="p-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl font-bold text-gold mb-2">96%</div>
            <div className="text-gray-600">{t("benefits.stats.familiesRecommend")}</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
