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
    >
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
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
          className={`w-full py-4 px-8 rounded-full font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            soldOut
              ? "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white cursor-not-allowed opacity-90 animate-pulse"
              : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          }`}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" message="" className="!mb-0" />
              <span className="ml-2">{t("preOrder.form.submitting")}</span>
            </>
          ) : soldOut ? (
            <>
              {t("preOrder.form.soldOut")}
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {t("preOrder.form.reserveNow")} • {t("preOrder.currency")} {reserveAmount}
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
