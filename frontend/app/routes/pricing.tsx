import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { 
  Check, 
  X,
  Zap, 
  Shield, 
  Users, 
  Crown,
  Sparkles
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Precios y Planes - Nebu | Desde Gratis hasta Premium" },
    {
      name: "description",
      content: "Planes de Nebu: Explorer gratuito, Family S/19/mes, Premium S/39/mes. Pre-orden con descuento especial. Transforma la educación de tu familia.",
    },
    {
      name: "keywords",
      content: "precio nebu, planes nebu, nebu gratis, nebu familiar, nebu premium, chatbot educativo precio, pre-orden nebu descuento",
    },

    // Open Graph
    { property: "og:title", content: "Precios y Planes - Nebu | Desde Gratis" },
    { property: "og:description", content: "Planes desde gratis hasta premium. Pre-orden con descuento especial de lanzamiento." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://flow-telligence.com/pricing" },
    { property: "og:image", content: "https://flow-telligence.com/og-pricing.jpg" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Precios - Nebu" },
    { name: "twitter:description", content: "Planes desde gratis hasta premium. Pre-orden con descuento de lanzamiento." },
    { name: "twitter:image", content: "https://flow-telligence.com/og-pricing.jpg" },
  ];
};

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  period: string;
  popular?: boolean;
  icon: LucideIcon;
  features: string[];
  limitations?: string[];
  ctaText: string;
  highlight?: boolean;
}

export default function PricingPage() {
  const { t } = useTranslation("common");

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: t('pricing.plans.basic.name'),
      description: t('pricing.plans.basic.description'),
      price: 'Gratis',
      period: t('pricing.plans.basic.period'),
      icon: Users,
      features: [
        t('pricing.plans.basic.features.conversations'),
        t('pricing.plans.basic.features.basicSubjects'),
        t('pricing.plans.basic.features.dailyLimit'),
        t('pricing.plans.basic.features.communitySupport'),
      ],
      limitations: [
        t('pricing.plans.basic.limitations.limitedQuestions'),
        t('pricing.plans.basic.limitations.noOfflineMode'),
      ],
      ctaText: t('pricing.plans.basic.cta'),
    },
    {
      id: 'family',
      name: t('pricing.plans.family.name'),
      description: t('pricing.plans.family.description'),
      price: '$19',
      originalPrice: '$29',
      period: t('pricing.plans.family.period'),
      popular: true,
      highlight: true,
      icon: Shield,
      features: [
        t('pricing.plans.family.features.unlimitedConversations'),
        t('pricing.plans.family.features.allSubjects'),
        t('pricing.plans.family.features.multipleProfiles'),
        t('pricing.plans.family.features.progressTracking'),
        t('pricing.plans.family.features.parentalControls'),
        t('pricing.plans.family.features.offlineMode'),
        t('pricing.plans.family.features.prioritySupport'),
      ],
      ctaText: t('pricing.plans.family.cta'),
    },
    {
      id: 'premium',
      name: t('pricing.plans.premium.name'),
      description: t('pricing.plans.premium.description'),
      price: '$49',
      period: t('pricing.plans.premium.period'),
      icon: Crown,
      features: [
        t('pricing.plans.premium.features.everything'),
        t('pricing.plans.premium.features.advancedAI'),
        t('pricing.plans.premium.features.customCurriculum'),
        t('pricing.plans.premium.features.detailedAnalytics'),
        t('pricing.plans.premium.features.expertTutoring'),
        t('pricing.plans.premium.features.earlyAccess'),
        t('pricing.plans.premium.features.dedicatedSupport'),
      ],
      ctaText: t('pricing.plans.premium.cta'),
    },
  ];

  return (
    <div className="min-h-screen bg-nebu-bg relative">
      <Header />
      
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, #6366f115 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, #6366f110 1px, transparent 1px),
            radial-gradient(circle at 20% 80%, #6366f120 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, #6366f115 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 90px 90px, 70px 70px, 80px 80px',
          backgroundPosition: '0 0, 40px 40px, 20px 20px, 60px 60px'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 text-primary px-6 py-3 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="font-mono">{t('pricing.launchOffer')}</span>
              </div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold font-heading mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {t('pricing.title')}
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {t('pricing.subtitle')}
              </motion.p>

              <motion.div
                className="flex items-center justify-center gap-4 text-sm text-gray-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('pricing.benefits.noSetupFee')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('pricing.benefits.cancelAnytime')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('pricing.benefits.freeTrial')}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => {
                const IconComponent = plan.icon;
                
                return (
                  <motion.div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                      plan.highlight 
                        ? 'border-primary shadow-primary/20 ring-4 ring-primary/10' 
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-full text-sm font-semibold">
                          {t('pricing.mostPopular')}
                        </div>
                      </div>
                    )}

                    <div className="p-8">
                      {/* Header */}
                      <div className="text-center mb-8">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                          plan.highlight 
                            ? 'bg-gradient-to-br from-primary to-accent text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {plan.name}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-6">
                          {plan.description}
                        </p>

                        <div className="mb-6">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            {plan.originalPrice && (
                              <span className="text-xl text-gray-400 line-through">
                                {plan.originalPrice}
                              </span>
                            )}
                            <span className={`text-4xl font-bold ${
                              plan.highlight ? 'text-primary' : 'text-gray-900'
                            }`}>
                              {plan.price}
                            </span>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {plan.period}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-4 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                        
                        {plan.limitations?.map((limitation, limitationIndex) => (
                          <div key={limitationIndex} className="flex items-start gap-3">
                            <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-500 text-sm">{limitation}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button
                        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                          plan.highlight
                            ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-primary/30'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {plan.ctaText}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('pricing.faq.title')}
              </h2>
              <p className="text-gray-600 text-lg">
                {t('pricing.faq.subtitle')}
              </p>
            </motion.div>

            <div className="grid gap-6 md:gap-8">
              {[1, 2, 3, 4].map((item) => (
                <motion.div
                  key={item}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: item * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t(`pricing.faq.questions.q${item}.question`)}
                  </h3>
                  <p className="text-gray-600">
                    {t(`pricing.faq.questions.q${item}.answer`)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 text-center text-white"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Zap className="w-16 h-16 mx-auto mb-6 text-white/80" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('pricing.cta.title')}
              </h2>
              <p className="text-lg mb-8 text-white/90">
                {t('pricing.cta.subtitle')}
              </p>
              <button className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                {t('pricing.cta.button')}
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}
