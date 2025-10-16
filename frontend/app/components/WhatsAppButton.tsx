import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { analytics } from "~/lib/analytics";

interface WhatsAppButtonProps {
  className?: string;
  phoneNumber?: string;
  message?: string;
}

export function WhatsAppButton({
  className = "",
  phoneNumber = "+51970116770", // Número de Flow-telligence Peru
  message
}: WhatsAppButtonProps) {
  const { t } = useTranslation("common");
  const defaultMessage = t("whatsapp.defaultMessage", "¡Hola! Me interesa conocer más sobre Nebu");

  const handleWhatsAppClick = () => {
    // Track WhatsApp click
    analytics.whatsappClick("floating-button");

    const finalMessage = message || defaultMessage;
    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`fixed bottom-6 left-6 z-50 ${className}`}>
      {/* Floating Animation Ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-green-500/20 -z-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.1, 0.4]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* WhatsApp Button */}
      <motion.button
        onClick={handleWhatsAppClick}
        className="relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center group overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
      >
        {/* WhatsApp Icon */}
        <motion.div
          className="relative z-10"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/assets/icons/whatsapp-icon.svg" 
            alt="WhatsApp" 
             className="w-7 h-7 filter brightness-0 invert"
             role="img"
             aria-label="WhatsApp Icon"
          />
        </motion.div>

        {/* Hover Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Pulse Effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-green-400"
          animate={{
            scale: [1, 1.4],
            opacity: [0.5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.button>

      {/* Tooltip */}
      <motion.div
        className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        initial={{ x: -10, opacity: 0 }}
        whileHover={{ x: 0, opacity: 1 }}
        aria-hidden="true"
      >
        <span>{t("whatsapp.tooltip", "Chatea por WhatsApp")}</span>
        {/* Arrow */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
      </motion.div>
    </div>
  );
}
