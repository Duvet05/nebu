import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { analytics } from "~/lib/analytics";

/**
 * WaitlistSection - Formulario de waitlist para productos próximos
 */
export default function WaitlistSection() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const formData = new FormData();
      formData.append("email", email);

      const response = await fetch("/api/newsletter", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Track newsletter signup in GA4 with waitlist context
        analytics.newsletterSignup(email, "waitlist");

        setStatus("success");
        setMessage(data.message || t('waitlist.success'));
        setEmail("");

        // Clear success message after 5 seconds
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setMessage(data.error || t('waitlist.error'));
      }
    } catch (error) {
      console.error("Waitlist error:", error);
      setStatus("error");
      setMessage(t('waitlist.connectionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">
        {t('waitlist.title')}
      </h3>
      <p className="text-gray-600 mb-6">
        {t('waitlist.description')} <span className="font-bold text-purple-600">{t('waitlist.discount')}</span> {t('waitlist.onPreOrder')}
      </p>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('waitlist.emailPlaceholder')}
          required
          className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('waitlist.joining') : t('waitlist.join')}
        </button>
      </form>

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-4 p-4 rounded-lg flex items-center justify-center gap-2 ${
              status === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-gray-500 mt-4">
        {t('waitlist.alreadySubscribed')}
      </p>
    </div>
  );
}
