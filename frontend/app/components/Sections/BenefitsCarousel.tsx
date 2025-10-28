import React from 'react';
import { motion } from 'framer-motion';
import { Star, Brain, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BenefitsCarousel() {
  const { t } = useTranslation("common");

  const benefits = [
    {
      id: 1,
      iconType: 'svg',
      iconPath: '/assets/images/Screentimeb268.svg',
      title: t("benefits.reduceScreenTime.title"),
      description: t("benefits.reduceScreenTime.description"),
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      iconType: 'svg',
      iconPath: '/assets/images/Imagination-1ed0d.svg',
      title: t("benefits.nurtureImagination.title"),
      description: t("benefits.nurtureImagination.description"),
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      iconType: 'lucide',
      icon: Star,
      title: t("benefits.buildConfidence.title"),
      description: t("benefits.buildConfidence.description"),
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 4,
      iconType: 'svg',
      iconPath: '/assets/images/Microphoone6492.svg',
      title: t("benefits.developEmpathy.title"),
      description: t("benefits.developEmpathy.description"),
      color: "from-red-500 to-rose-500"
    },
    {
      id: 5,
      iconType: 'lucide',
      icon: Brain,
      title: t("benefits.stimulateLearning.title"),
      description: t("benefits.stimulateLearning.description"),
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 6,
      iconType: 'lucide',
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
          <h2 id="benefits-title" className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 text-primary">
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
                      {benefit.iconType === 'svg' ? (
                        <img 
                          src={benefit.iconPath} 
                          alt="" 
                          className="w-8 h-8"
                          aria-hidden="true"
                        />
                      ) : (
                        benefit.icon && <benefit.icon className="w-8 h-8 text-white" />
                      )}
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

        {/* Quote destacada */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 text-center italic text-3xl md:text-4xl lg:text-5xl text-gray-700 max-w-5xl mx-auto leading-relaxed font-gochi px-4"
        >
          "{t("hero.description")}"
        </motion.blockquote>
      </div>
    </section>
  );
}
