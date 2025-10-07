import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { analytics } from "~/lib/analytics";
import { CheckCircle, AlertCircle } from "lucide-react";

export function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Track newsletter signup in GA4
        analytics.newsletterSignup(email, "footer-newsletter");

        setStatus("success");
        setMessage(data.message || "¡Suscripción exitosa!");
        setEmail("");

        // Clear success message after 5 seconds
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setMessage(data.error || "Error al suscribirse. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      setStatus("error");
      setMessage("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section 
      className="bg-gradient-to-r from-primary/10 to-accent/10 py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("newsletter.title")}
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("newsletter.description")}
          </motion.p>

          <motion.form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter.emailPlaceholder")}
              required
              className="flex-1 px-6 py-4 rounded-full border border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("newsletter.subscribing") : t("newsletter.subscribe")}
            </button>
          </motion.form>

          <AnimatePresence>
            {status !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
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

          <motion.p
            className="text-sm text-gray-500 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("newsletter.privacy")}
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
}
