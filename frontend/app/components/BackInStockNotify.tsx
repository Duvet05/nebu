import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, AlertCircle, X } from "lucide-react";
import { trackLead } from "~/lib/facebook-pixel";
import { LoadingSpinner } from "./LoadingSpinner";

interface BackInStockNotifyProps {
  productId: string;
  productName: string;
}

export function BackInStockNotify({ productId, productName }: BackInStockNotifyProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("productId", productId);
      formData.append("productName", productName);

      const response = await fetch("/api/inventory", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Track Back in Stock notification as a Lead in Facebook Pixel
        trackLead({
          content_name: `Back in Stock Alert - ${productName}`,
          value: 0,
        });

        setStatus("success");
        setMessage(data.message || "¡Te notificaremos cuando esté disponible!");
        setEmail("");

        // Clear success message and close form after 3 seconds
        setTimeout(() => {
          setStatus("idle");
          setShowForm(false);
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Error al registrar notificación. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Back in Stock error:", error);
      setStatus("error");
      setMessage("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {!showForm ? (
        <motion.button
          onClick={() => setShowForm(true)}
          className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Bell className="w-5 h-5" />
          Notificarme cuando esté disponible
        </motion.button>
      ) : (
        <motion.div
          className="bg-white border-2 border-primary rounded-lg p-4 shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Notificación de Stock</h3>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Te enviaremos un email cuando <strong>{productName}</strong> esté disponible
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={isSubmitting || status === "success"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={isSubmitting || status === "success"}
              className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" message="" className="!mb-0" />
                  <span className="ml-2">Enviando...</span>
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  ¡Registrado!
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" />
                  Notificarme
                </>
              )}
            </button>
          </form>

          <AnimatePresence>
            {status === "success" && (
              <motion.div
                className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{message}</p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
