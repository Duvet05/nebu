import { useState, useEffect, type FormEvent } from "react";
import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  Star,
  Info
} from "lucide-react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { analytics } from "~/lib/analytics";

export const meta: MetaFunction = () => {
  return [
    { title: "Pre-orden Nebu S/300 - Envío Gratis | 33% Descuento" },
    {
      name: "description",
      content: "Pre-ordena Nebu ahora S/300 (antes S/450). Envío gratis a todo Perú. El compañero IoT que transforma el aprendizaje en aventuras sin pantallas. Entrega 6-8 semanas."
    },
    {
      name: "keywords",
      content: "pre-orden nebu, comprar nebu, nebu precio, nebu descuento, chatbot educativo comprar, nebu peru, envío gratis nebu",
    },

    // Open Graph
    { property: "og:title", content: "Pre-orden Nebu S/300 - 33% Descuento" },
    { property: "og:description", content: "Asegura tu Nebu con envío gratis. Precio especial de lanzamiento." },
    { property: "og:type", content: "product" },
    { property: "og:url", content: "https://flow-telligence.com/pre-order" },
    { property: "og:image", content: "https://flow-telligence.com/og-product.jpg" },
    { property: "product:price:amount", content: "300" },
    { property: "product:price:currency", content: "PEN" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Pre-orden Nebu - 33% OFF" },
    { name: "twitter:description", content: "S/300 con envío gratis. Compañero educativo sin pantallas." },
    { name: "twitter:image", content: "https://flow-telligence.com/og-product.jpg" },
  ];
};

interface ColorOption {
  id: string;
  name: string;
  color: string;
  gradient: string;
}

const colorOptions: ColorOption[] = [
  { id: "aqua", name: "Aqua", color: "#4ECDC4", gradient: "from-teal-400 to-cyan-500" },
  { id: "dusk", name: "Anochecer", color: "#6366F1", gradient: "from-indigo-500 to-purple-600" },
  { id: "quartz", name: "Cuarzo", color: "#EC4899", gradient: "from-pink-500 to-rose-600" },
  { id: "flare", name: "Destello", color: "#F59E0B", gradient: "from-amber-500 to-orange-600" }
];

export default function PreOrder() {
  const { t } = useTranslation("common");

  // Form state
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    agreeTerms: false,
    subscribeNewsletter: true
  });

  // Track page view on mount
  useEffect(() => {
    analytics.viewProduct("nebu-001", "Nebu IoT Companion");
  }, []);

  const basePrice = 300;
  const totalPrice = basePrice * quantity;
  const shippingPrice = 0; // Free shipping
  const finalPrice = totalPrice + shippingPrice;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 5) {
      setQuantity(newQuantity);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Track checkout initiation
    analytics.preOrderStart(selectedColor.id, quantity);

    try {
      // Send pre-order data to API
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("postalCode", formData.postalCode);
      formDataToSend.append("quantity", quantity.toString());
      formDataToSend.append("color", selectedColor.name);
      formDataToSend.append("totalPrice", finalPrice.toString());
      formDataToSend.append("paymentMethod", paymentMethod);

      const response = await fetch("/api/pre-order", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        // Track successful pre-order
        analytics.preOrderComplete(
          formData.email,
          quantity,
          selectedColor.id,
          finalPrice
        );

        // Track newsletter signup if checked
        if (formData.subscribeNewsletter) {
          analytics.newsletterSignup(formData.email, "pre-order-form");
        }

        // Show success message
        alert(t("preOrder.messages.successAlert"));

        // Reset form
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          address: "",
          city: "",
          postalCode: "",
          agreeTerms: false,
          subscribeNewsletter: true,
        });
        setQuantity(1);
      } else {
        throw new Error(data.error || "Error al procesar la pre-orden");
      }
    } catch (error) {
      console.error("Error processing pre-order:", error);
      alert(t("preOrder.messages.errorAlert"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nebu-bg">
      <Header />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Truck className="w-4 h-4" />
              {t("preOrder.subtitle")}
            </div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold font-heading mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t("preOrder.title")}
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t("preOrder.description")}
            </motion.p>
          </div>
        </section>

        {/* Pre-Order Form */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Product Configuration */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Product Preview */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="text-center mb-8">
                    <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${selectedColor.gradient} shadow-lg mb-4 flex items-center justify-center`}>
                      <span className="text-white font-bold text-4xl">N</span>
                    </div>
                    <h3 className="text-2xl font-bold font-heading">{t("preOrder.productName")} {selectedColor.name}</h3>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">({t("preOrder.reviewsCount")} {t("preOrder.reviews")})</span>
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">{t("preOrder.selectColor")}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedColor.id === color.id
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full shadow-sm"
                              style={{ backgroundColor: color.color }}
                            />
                            <span className="font-medium text-gray-900">{color.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">{t("preOrder.quantity")}</h4>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-2xl font-bold font-heading min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 5}
                        className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {t("preOrder.maxQuantity")}
                    </p>
                  </div>

                  {/* Features Highlights */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{t("preOrder.features.aiConversations")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{t("preOrder.features.noScreens")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{t("preOrder.features.parentApp")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{t("preOrder.features.updates")}</span>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h4 className="font-semibold text-gray-900 mb-6">{t("preOrder.orderSummary.title")}</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>{t("preOrder.productName")} {t("preOrder.productMultiplier")} {quantity}</span>
                      <span>{t("preOrder.currency")} {totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>{t("preOrder.orderSummary.shipping")}</span>
                      <span>{t("preOrder.orderSummary.free")}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>{t("preOrder.orderSummary.total")}</span>
                      <span>{t("preOrder.currency")} {finalPrice}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">{t("preOrder.orderSummary.guarantee")}</p>
                        <p>{t("preOrder.orderSummary.guaranteeText")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Order Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold font-heading mb-8">{t("preOrder.contactInfo")}</h3>
                  
                  {/* Contact Information */}
                  <div className="space-y-6 mb-8">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("preOrder.form.firstName")} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={t("preOrder.form.firstNamePlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("preOrder.form.lastName")} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={t("preOrder.form.lastNamePlaceholder")}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("preOrder.form.email")} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t("preOrder.form.emailPlaceholder")}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("preOrder.form.phone")} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t("preOrder.form.phonePlaceholder")}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("preOrder.form.address")} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t("preOrder.form.addressPlaceholder")}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("preOrder.form.city")} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={t("preOrder.form.cityPlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("preOrder.form.postalCode")}
                        </label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={t("preOrder.form.postalCodePlaceholder")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">{t("preOrder.paymentMethod")}</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={paymentMethod === "stripe"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary"
                        />
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{t("preOrder.cardPayment")}</span>
                        <span className="text-sm text-gray-500 ml-auto">{t("preOrder.paymentMethods.stripe")}</span>
                      </label>
                      
                      <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === "paypal"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary"
                        />
                        <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <span className="font-medium">{t("preOrder.paymentMethods.paypal")}</span>
                      </label>
                    </div>
                  </div>

                  {/* Terms and Newsletter */}
                  <div className="space-y-4 mb-8">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.agreeTerms}
                        onChange={(e) => handleInputChange("agreeTerms", e.target.checked)}
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
                        onChange={(e) => handleInputChange("subscribeNewsletter", e.target.checked)}
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
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 px-8 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {t("preOrder.form.submitting")}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        {t("preOrder.form.submit")} • {t("preOrder.currency")} {finalPrice}
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
            </div>
          </div>
        </section>
      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}
