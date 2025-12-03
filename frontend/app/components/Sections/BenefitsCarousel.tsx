import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Brain, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Memoized card component to prevent unnecessary re-renders
const BenefitCard = memo(function BenefitCard({ 
  benefit, 
  index: _index 
}: { 
  benefit: Benefit; 
  index: number;
}) {
  const IconComponent = benefit.icon;
  
  return (
    <div
      className="benefit-card flex-shrink-0 w-80 lg:w-[380px] bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-[200px] flex flex-col"
    >
      {/* Icon container - simplified */}
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`w-11 h-11 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center`}
        >
          {benefit.iconType === 'svg' ? (
            <img
              src={benefit.iconPath}
              alt={`Icono de beneficio: ${benefit.title}`}
              className="w-6 h-6"
              aria-hidden="true"
              loading="lazy"
            />
          ) : (
            IconComponent && <IconComponent className="w-6 h-6 text-white" />
          )}
        </div>
        
        {/* Category badge */}
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide bg-gradient-to-r ${benefit.gradient} text-white`}>
          {benefit.category}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2.5 leading-tight">
        {benefit.title}
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
        {benefit.description}
      </p>
    </div>
  );
});

interface Benefit {
  id: number;
  iconType: 'svg' | 'lucide';
  iconPath?: string;
  icon?: typeof Star | typeof Brain | typeof Shield;
  title: string;
  description: string;
  gradient: string;
  category: string;
}

export default function BenefitsCarousel() {
  const { t } = useTranslation("common");

  // Memoize benefits array to prevent recreation on each render
  const benefits: Benefit[] = useMemo(() => [
    {
      id: 1,
      iconType: 'svg',
      iconPath: '/assets/images/Screentimeb268.svg',
      title: t("benefits.reduceScreenTime.title"),
      description: t("benefits.reduceScreenTime.description"),
      gradient: "from-sky-400 via-blue-500 to-indigo-500",
      category: t("benefits.reduceScreenTime.category")
    },
    {
      id: 2,
      iconType: 'svg',
      iconPath: '/assets/images/Imagination-1ed0d.svg',
      title: t("benefits.nurtureImagination.title"),
      description: t("benefits.nurtureImagination.description"),
      gradient: "from-pink-400 via-purple-500 to-indigo-500",
      category: t("benefits.nurtureImagination.category")
    },
    {
      id: 3,
      iconType: 'lucide',
      icon: Star,
      title: t("benefits.buildConfidence.title"),
      description: t("benefits.buildConfidence.description"),
      gradient: "from-amber-400 via-orange-500 to-red-500",
      category: t("benefits.buildConfidence.category")
    },
    {
      id: 4,
      iconType: 'svg',
      iconPath: '/assets/images/Microphoone6492.svg',
      title: t("benefits.developEmpathy.title"),
      description: t("benefits.developEmpathy.description"),
      gradient: "from-rose-400 via-pink-500 to-red-500",
      category: t("benefits.developEmpathy.category")
    },
    {
      id: 5,
      iconType: 'lucide',
      icon: Brain,
      title: t("benefits.stimulateLearning.title"),
      description: t("benefits.stimulateLearning.description"),
      gradient: "from-emerald-400 via-green-500 to-teal-500",
      category: t("benefits.stimulateLearning.category")
    },
    {
      id: 6,
      iconType: 'lucide',
      icon: Shield,
      title: t("benefits.safeAndPrivate.title"),
      description: t("benefits.safeAndPrivate.description"),
      gradient: "from-blue-400 via-indigo-500 to-purple-500",
      category: t("benefits.safeAndPrivate.category")
    }
  ], [t]);

  // Only duplicate once for seamless loop
  const extendedBenefits = useMemo(() => [...benefits, ...benefits], [benefits]);

  return (
    <>
      {/* CSS for performant animations - uses GPU acceleration */}
      <style>{`
        @keyframes scroll-carousel {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .carousel-track {
          animation: scroll-carousel 40s linear infinite;
          will-change: transform;
          transition: animation-duration 2s ease;
        }
        
        .carousel-track:hover {
          animation-play-state: paused;
        }
        
        .benefit-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          margin: 1rem 0;
        }
        
        .benefit-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px -3px rgba(0, 0, 0, 0.1);
          border-color: rgb(209 213 219);
        }
        
        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .carousel-track {
            animation: none;
          }
          .benefit-card:hover {
            transform: none;
          }
        }
      `}</style>

      <section
        className="py-16 overflow-hidden"
        style={{ backgroundColor: '#FFF7F0' }}
        aria-labelledby="benefits-title"
      >
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          {/* Header - keeping motion here is fine, it only runs once */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 max-w-7xl mx-auto"
          >
            <h2 
              id="benefits-title" 
              className="text-4xl md:text-5xl font-bold font-gochi mb-3 text-primary"
            >
              {t("benefits.title")}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t("benefits.subtitle")}
            </p>
          </motion.div>

          {/* Optimized Carousel using CSS animations */}
          <div 
            className="relative w-full" 
            aria-label="Carousel de beneficios de Nebu"
          >
            <div className="overflow-hidden" style={{ padding: '2rem 0' }}>
              <div 
                className="carousel-track flex gap-5"
                aria-live="polite"
              >
                {extendedBenefits.map((benefit, index) => (
                  <BenefitCard
                    key={`${benefit.id}-${index}`}
                    benefit={benefit}
                    index={index}
                  />
                ))}
              </div>
            </div>

            {/* Gradient fade effects */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-40 pointer-events-none z-10" 
              style={{ background: 'linear-gradient(to right, #FFF7F0, transparent)' }} 
            />
            <div 
              className="absolute right-0 top-0 bottom-0 w-40 pointer-events-none z-10" 
              style={{ background: 'linear-gradient(to left, #FFF7F0, transparent)' }} 
            />
          </div>
        </div>
      </section>
    </>
  );
}