import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Brain, Shield, Heart } from 'lucide-react';
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
      className="benefit-card flex-shrink-0 w-72 lg:w-80 bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 h-auto min-h-[180px] flex flex-col"
      style={{ borderLeftColor: benefit.color }}
    >
      {/* Icon and title in one row */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${benefit.color}15` }}
        >
          {benefit.iconType === 'svg' ? (
            <img
              src={benefit.iconPath}
              alt={`Icono de beneficio: ${benefit.title}`}
              className="w-5 h-5"
              aria-hidden="true"
              loading="lazy"
              style={{ filter: 'brightness(0.8)' }}
            />
          ) : (
            IconComponent && <IconComponent className="w-5 h-5" style={{ color: benefit.color }} />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">
            {benefit.title}
          </h3>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: `${benefit.color}20`,
              color: benefit.color
            }}
          >
            {benefit.category}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed">
        {benefit.description}
      </p>
    </div>
  );
});

interface Benefit {
  id: number;
  iconType: 'svg' | 'lucide';
  iconPath?: string;
  icon?: typeof Star | typeof Brain | typeof Shield | typeof Heart;
  title: string;
  description: string;
  color: string;
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
      color: "#3b82f6",
      category: t("benefits.reduceScreenTime.category")
    },
    {
      id: 2,
      iconType: 'svg',
      iconPath: '/assets/images/Imagination-1ed0d.svg',
      title: t("benefits.nurtureImagination.title"),
      description: t("benefits.nurtureImagination.description"),
      color: "#a855f7",
      category: t("benefits.nurtureImagination.category")
    },
    {
      id: 3,
      iconType: 'lucide',
      icon: Star,
      title: t("benefits.buildConfidence.title"),
      description: t("benefits.buildConfidence.description"),
      color: "#f59e0b",
      category: t("benefits.buildConfidence.category")
    },
    {
      id: 4,
      iconType: 'svg',
      iconPath: '/assets/images/Microphoone6492.svg',
      title: t("benefits.developEmpathy.title"),
      description: t("benefits.developEmpathy.description"),
      color: "#ec4899",
      category: t("benefits.developEmpathy.category")
    },
    {
      id: 5,
      iconType: 'lucide',
      icon: Brain,
      title: t("benefits.stimulateLearning.title"),
      description: t("benefits.stimulateLearning.description"),
      color: "#10b981",
      category: t("benefits.stimulateLearning.category")
    },
    {
      id: 6,
      iconType: 'lucide',
      icon: Shield,
      title: t("benefits.safeAndPrivate.title"),
      description: t("benefits.safeAndPrivate.description"),
      color: "#6366f1",
      category: t("benefits.safeAndPrivate.category")
    },
    {
      id: 7,
      iconType: 'lucide',
      icon: Heart,
      title: t("benefits.helpsADHD.title"),
      description: t("benefits.helpsADHD.description"),
      color: "#14b8a6",
      category: t("benefits.helpsADHD.category")
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
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin: 1rem 0;
        }

        .benefit-card:hover {
          transform: translateY(-4px);
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