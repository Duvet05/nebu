import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FeatureHighlightsProps {
  className?: string;
}

/**
 * FeatureHighlights - Lista de características destacadas del producto
 */
export default function FeatureHighlights({ className = "" }: FeatureHighlightsProps) {
  const { t } = useTranslation("common");

  const features = [
    t("preOrder.features.aiConversations"),
    t("preOrder.features.noScreens"),
    t("preOrder.features.parentApp"),
    t("preOrder.features.updates"),
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>{feature}</span>
        </div>
      ))}
    </div>
  );
}
