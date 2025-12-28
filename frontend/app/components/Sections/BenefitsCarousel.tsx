import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Brain, Shield, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BenefitCard = memo(function BenefitCard({
  benefit,
  index: _index
}: {
  benefit: Benefit;
  index: number;
}) {
  const IconComponent = benefit.icon;

  return (
    <div className="benefit-card flex-shrink-0 w-[300px] lg:w-[330px] bg-white rounded-2xl p-5 border border-gray-200/80">
      {/* Category */}
      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-4 block">
        {benefit.category}
      </span>

      {/* Icon + Title row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: benefit.color }}
        >
          {benefit.iconType === 'svg' ? (
            <img
              src={benefit.iconPath}
              alt=""
              className="w-5 h-5 brightness-0 invert"
              aria-hidden="true"
              loading="lazy"
            />
          ) : (
            IconComponent && <IconComponent className="w-5 h-5 text-white" strokeWidth={2} />
          )}
        </div>

        <h3 className="text-base font-semibold text-gray-800 leading-snug">
          {benefit.title}
        </h3>
      </div>

      {/* Simple line */}
      <div className="w-12 h-[3px] rounded-full bg-gray-200 mb-3" />

      {/* Description */}
      <p className="text-gray-500 text-[13px] leading-relaxed">
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

  const extendedBenefits = useMemo(() => [...benefits, ...benefits], [benefits]);

  return (
    <>
      <style>{`
        @keyframes scroll-carousel {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .carousel-track {
          animation: scroll-carousel 40s linear infinite;
        }
        
        .carousel-track:hover {
          animation-play-state: paused;
        }
        
        .benefit-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .benefit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px -8px rgba(0,0,0,0.1);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .carousel-track { animation: none; }
          .benefit-card:hover { transform: none; }
        }
      `}</style>

      <section
        className="py-16 overflow-hidden"
        style={{ backgroundColor: '#FFF7F0' }}
        aria-labelledby="benefits-title"
      >
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 max-w-7xl mx-auto"
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

          <div className="relative w-full" aria-label="Carousel de beneficios de Nebu">
            <div className="overflow-hidden py-4">
              <div className="carousel-track flex gap-5" aria-live="polite">
                {extendedBenefits.map((benefit, index) => (
                  <BenefitCard
                    key={`${benefit.id}-${index}`}
                    benefit={benefit}
                    index={index}
                  />
                ))}
              </div>
            </div>

            {/* Fade edges */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none z-10"
              style={{ background: 'linear-gradient(to right, #FFF7F0, transparent)' }}
            />
            <div 
              className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-10"
              style={{ background: 'linear-gradient(to left, #FFF7F0, transparent)' }}
            />
          </div>
        </div>
      </section>
    </>
  );
}