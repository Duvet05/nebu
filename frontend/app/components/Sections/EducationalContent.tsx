import { Book, Brain, Heart, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EducationalContent() {
  const { t } = useTranslation("common");

  const features = [
    {
      icon: Brain,
      title: t("educationalContent.features.ai.title"),
      description: t("educationalContent.features.ai.description"),
      bgColor: "bg-primary"
    },
    {
      icon: Book,
      title: t("educationalContent.features.screenFree.title"),
      description: t("educationalContent.features.screenFree.description"),
      bgColor: "bg-primary"
    },
    {
      icon: Heart,
      title: t("educationalContent.features.emotional.title"),
      description: t("educationalContent.features.emotional.description"),
      bgColor: "bg-primary"
    },
    {
      icon: Shield,
      title: t("educationalContent.features.safety.title"),
      description: t("educationalContent.features.safety.description"),
      bgColor: "bg-gray-600"
    }
  ];

  return (
    <section className="py-20 px-4 bg-nebu-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-gochi mb-3 text-primary">
            {t("educationalContent.title")}
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {t("educationalContent.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <FeatureIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <a
            href="/our-story"
            className="inline-flex items-center justify-center gap-2 font-gochi font-bold text-lg px-8 py-4 rounded-full bg-primary text-white shadow-[0_6px_20px_rgba(255,181,74,0.3)] hover:shadow-[0_10px_30px_rgba(255,181,74,0.45)] transition-all duration-200 ease-out"
          >
            <span>{t("educationalContent.learnMore")}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
