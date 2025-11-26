import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

export function ProductComparison() {
  const { t } = useTranslation("common");

  const features = [
    {
      key: "sameAI",
      bgColor: "bg-green-100",
      hoverBgColor: "group-hover:bg-green-200",
      iconColor: "text-green-600",
    },
    {
      key: "parentalControl",
      bgColor: "bg-blue-100",
      hoverBgColor: "group-hover:bg-blue-200",
      iconColor: "text-blue-600",
    },
    {
      key: "freeUpdates",
      bgColor: "bg-purple-100",
      hoverBgColor: "group-hover:bg-purple-200",
      iconColor: "text-purple-600",
    },
    {
      key: "warranty",
      bgColor: "bg-orange-100",
      hoverBgColor: "group-hover:bg-orange-200",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <section className="pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {t("products.comparison.title")}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.key} className="text-center group">
                <div
                  className={`w-16 h-16 mx-auto mb-4 ${feature.bgColor} rounded-2xl flex items-center justify-center transition-all duration-300 ${feature.hoverBgColor} group-hover:scale-110`}
                >
                  <Check className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {t(`products.comparison.features.${feature.key}.title`)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(`products.comparison.features.${feature.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
