import { motion } from "framer-motion";
import { ShoppingCart, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import ContactForm from "./ContactForm";
import PaymentMethodSelector from "./PaymentMethodSelector";
import type { FormEvent } from "react";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  agreeTerms: boolean;
  subscribeNewsletter: boolean;
}

interface OrderFormSectionProps {
  formData: FormData;
  paymentMethod: string;
  reserveAmount: number;
  loading: boolean;
  soldOut: boolean;
  onInputChange: (field: string, value: string | boolean) => void;
  onPaymentMethodChange: (method: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function OrderFormSection({
  formData,
  paymentMethod,
  reserveAmount,
  loading,
  soldOut,
  onInputChange,
  onPaymentMethodChange,
  onSubmit,
}: OrderFormSectionProps) {
  const { t } = useTranslation("common");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="h-full"
    >
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 h-full flex flex-col">
        <h3 className="text-2xl md:text-3xl font-bold font-heading mb-8 text-gray-900">
          {t("preOrder.contactInfo")}
        </h3>
        
        <ContactForm
          formData={formData}
          onInputChange={onInputChange}
        />

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onPaymentMethodChange={onPaymentMethodChange}
          reserveAmount={reserveAmount}
        />

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Terms and Newsletter */}
        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={formData.agreeTerms}
              onChange={(e) => onInputChange("agreeTerms", e.target.checked)}
              className="mt-1 text-primary"
            />
            <span className="text-sm text-gray-600">
              {t("preOrder.form.agreeTerms")} *
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.subscribeNewsletter}
              onChange={(e) => onInputChange("subscribeNewsletter", e.target.checked)}
              className="mt-1 text-primary"
            />
            <span className="text-sm text-gray-600">
              {t("preOrder.form.newsletter")}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || soldOut}
          className={`w-full py-4 px-8 rounded-full font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
            soldOut
              ? "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white cursor-not-allowed border-2 border-gray-300"
              : "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-pulse font-bold"
          }`}
          style={{ textShadow: soldOut ? 'none' : '0 2px 4px rgba(0,0,0,0.2)' }}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" message="" className="!mb-0" />
              <span className="ml-2">{t("preOrder.form.submitting")}</span>
            </>
          ) : soldOut ? (
            <>
              <span className="text-xl">✨</span>
              {t("preOrder.form.soldOut")}
              <span className="text-xl">✨</span>
            </>
          ) : (
            <>
              <span className="text-xl">✨</span>
              <ShoppingCart className="w-5 h-5" />
              {t("preOrder.form.reserveNow")} • $ {reserveAmount}
              <span className="text-xl">✨</span>
            </>
          )}
        </button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>{t("preOrder.form.securePayment")}</span>
        </div>
      </form>
    </motion.div>
  );
}
