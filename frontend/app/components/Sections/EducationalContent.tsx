import { Book, Brain, Heart, Shield, Sparkles, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EducationalContent() {
  const { t } = useTranslation("common");

  const features = [
    {
      icon: Brain,
      title: t("educationalContent.features.ai.title"),
      description: t("educationalContent.features.ai.description")
    },
    {
      icon: Book,
      title: t("educationalContent.features.screenFree.title"),
      description: t("educationalContent.features.screenFree.description")
    },
    {
      icon: Heart,
      title: t("educationalContent.features.emotional.title"),
      description: t("educationalContent.features.emotional.description")
    },
    {
      icon: Shield,
      title: t("educationalContent.features.safety.title"),
      description: t("educationalContent.features.safety.description")
    },
    {
      icon: Sparkles,
      title: t("educationalContent.features.stories.title"),
      description: t("educationalContent.features.stories.description")
    },
    {
      icon: Zap,
      title: t("educationalContent.features.multilingual.title"),
      description: t("educationalContent.features.multilingual.description")
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-gochi mb-4 text-primary">
            {t("educationalContent.title")}
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {t("educationalContent.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Educational Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <h3 className="text-3xl font-bold font-gochi mb-6 text-center text-primary">
            {t("educationalContent.howItWorks.title")}
          </h3>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t("educationalContent.howItWorks.paragraph1") }} />
            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t("educationalContent.howItWorks.paragraph2") }} />
            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t("educationalContent.howItWorks.paragraph3") }} />
            <p className="mb-0" dangerouslySetInnerHTML={{ __html: t("educationalContent.howItWorks.paragraph4") }} />
          </div>
        </div>
      </div>
    </section>
  );
}
