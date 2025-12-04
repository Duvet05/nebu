import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface HelpCardProps {
  index?: number;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

/**
 * HelpCard Component
 *
 * Displays a help/assistance card with a gradient background and call-to-action buttons.
 * This is the "Don't know which one to choose?" state.
 *
 * Can be configured with custom text and links, or will use default translations.
 */
export function HelpCard({
  index = 0,
  title,
  description,
  primaryButtonText,
  primaryButtonLink = "/contact",
  secondaryButtonText,
  secondaryButtonLink = "/faq",
}: HelpCardProps) {
  const { t } = useTranslation("common");

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Header with gradient background */}
      <div className="relative h-64 bg-gradient-to-br from-primary/10 via-accent/10 to-purple/10 overflow-hidden flex items-center justify-center">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center px-6">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Star className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {title || t("products.helpSection.title")}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600">
            {description || t("products.helpSection.description")}
          </p>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="p-6 flex flex-col gap-3 mt-auto">
        {/* Primary Button */}
        <Link
          to={primaryButtonLink}
          className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          {primaryButtonText || t("products.helpSection.talkToAdvisor")}
        </Link>

        {/* Secondary Button */}
        <Link
          to={secondaryButtonLink}
          className="w-full bg-white border-2 border-gray-300 text-gray-900 py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:border-primary hover:text-primary flex items-center justify-center gap-2"
        >
          {secondaryButtonText || t("products.helpSection.viewFAQ")}
        </Link>
      </div>
    </motion.div>
  );
}
