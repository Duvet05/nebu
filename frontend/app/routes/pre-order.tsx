import { useState, useEffect, type FormEvent } from "react";
import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  Star,
  Info,
  AlertCircle
} from "lucide-react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { analytics } from "~/lib/analytics";
import NebuModel3D from "~/components/NebuModel3D";
import { products, getProductBySlug, type Product } from "~/data/products";
import { LoadingSpinner } from "~/components/LoadingSpinner";

export const meta: MetaFunction = () => {
  return [
    { title: "Pre-orden Nebu S/380 - Reserva con 50% | Envío Gratis" },
    {
      name: "description",
      content: "Pre-ordena Nebu ahora por S/380. Reserva con solo el 50% (S/190). Envío gratis a todo Perú. El compañero IoT que transforma el aprendizaje en aventuras sin pantallas. Solo 20 unidades disponibles."
    },
    {
      name: "keywords",
      content: "pre-orden nebu, comprar nebu, nebu precio, peluche dino, nebu peru, envío gratis nebu, yape nebu",
    },

    // Open Graph
    { property: "og:title", content: "Pre-orden Nebu S/380 - Reserva con 50%" },
    { property: "og:description", content: "Asegura tu Nebu con envío gratis. Reserva con solo S/190. Solo 20 unidades." },
    { property: "og:type", content: "product" },
    { property: "og:url", content: "https://flow-telligence.com/pre-order" },
    { property: "og:image", content: "https://flow-telligence.com/og-product.jpg" },
    { property: "product:price:amount", content: "380" },
    { property: "product:price:currency", content: "PEN" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Pre-orden Nebu - Reserva con 50%" },
    { name: "twitter:description", content: "S/380 con envío gratis. Reserva con S/190. Solo 20 unidades." },
    { name: "twitter:image", content: "https://flow-telligence.com/og-product.jpg" },
  ];
};

interface ColorOption {
  id: string;
  name: string;
  color: string;
  gradient: string;
}

const _colorOptions: ColorOption[] = [
  { id: "aqua", name: "Aqua", color: "#4ECDC4", gradient: "from-teal-400 to-cyan-500" },
  { id: "dusk", name: "Anochecer", color: "#6366F1", gradient: "from-indigo-500 to-purple-600" },
  { id: "quartz", name: "Cuarzo", color: "#EC4899", gradient: "from-pink-500 to-rose-600" },
  { id: "flare", name: "Destello", color: "#F59E0B", gradient: "from-amber-500 to-orange-600" }
];

function WaitlistForm() {
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
        analytics.newsletterSignup(email, "nebu-gato-waitlist");

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

export default function PreOrder() {
  const { t } = useTranslation("common");
  const [searchParams] = useSearchParams();

  // Get product from URL parameter or default to nebu-dino
  const productSlug = searchParams.get("product") || "nebu-dino";
  const selectedProduct: Product = getProductBySlug(productSlug) || products[0];

  // Form state
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(selectedProduct.colors[0]);
  const [paymentMethod, setPaymentMethod] = useState("yape");
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

  // Inventory management
  const [availableUnits, setAvailableUnits] = useState(selectedProduct.stockCount || 0);
  const soldOut = availableUnits <= 0;

  // Track page view and fetch inventory on mount
  useEffect(() => {
    analytics.viewProduct(selectedProduct.id, selectedProduct.name);

    // Fetch inventory from backend
    fetch(`/api/inventory?product=${encodeURIComponent(selectedProduct.name)}`)
      .then(res => res.json())
      .then(data => {
        if (data.availableUnits !== undefined) {
          setAvailableUnits(data.availableUnits);
        }
      })
      .catch(err => {
        console.error("Failed to fetch inventory:", err);
        // Keep default value
      });
  }, [selectedProduct]);

  // Update selected color when product changes
  useEffect(() => {
    setSelectedColor(selectedProduct.colors[0]);
  }, [selectedProduct]);

  const basePrice = selectedProduct.price;
  const reservePercentage = 0.5; // 50% de adelanto
  const totalPrice = basePrice * quantity;
  const reserveAmount = totalPrice * reservePercentage;
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
      formDataToSend.append("product", selectedProduct.name);
      formDataToSend.append("productId", selectedProduct.id);
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
              className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 flex items-center justify-center gap-3 text-primary leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img src="/assets/logos/logo-nebu.svg" alt="Nebu" className="h-12 md:h-16" />
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t("preOrder.description")}
            </motion.p>

            <motion.div
              className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              🔥 Solo {availableUnits} unidades disponibles
            </motion.div>
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
                {/* Product Selector */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-4">Selecciona tu Nebu</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {products.slice(0, 5).map((product) => (
                      <Link
                        key={product.id}
                        to={`/pre-order?product=${product.slug}`}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                          selectedProduct.id === product.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          {product.id === "nebu-dino" && "🦕"}
                          {product.id === "nebu-gato" && "🐱"}
                          {product.id === "nebu-conejo" && "🐰"}
                          {product.id === "nebu-oso" && "🐻"}
                          {product.id === "nebu-dragon" && "🐉"}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        {!product.inStock && (
                          <div className="text-xs text-gray-500 mt-1">Pre-orden</div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Product Preview */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="mb-8">
                    <NebuModel3D color={selectedColor.hex} />
                  </div>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold font-heading">{selectedProduct.name} - {selectedColor.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">{selectedProduct.shortDescription}</p>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">(5.0 · 180 {t("preOrder.reviews")})</span>
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">{t("preOrder.selectColor")}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProduct.colors.map((color) => (
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
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="font-medium text-gray-900">{color.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{t("preOrder.quantity")}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${availableUnits <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {availableUnits} disponibles
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1 || soldOut}
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
                        disabled={quantity >= 5 || quantity >= availableUnits || soldOut}
                        className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {soldOut ? "¡Agotado! Únete a la lista de espera." : t("preOrder.maxQuantity")}
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
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
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
                    <div className="flex justify-between text-lg">
                      <span>Total del pedido</span>
                      <span>{t("preOrder.currency")} {finalPrice}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-primary">
                      <span>Reserva ahora (50%)</span>
                      <span>{t("preOrder.currency")} {reserveAmount}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>• Paga S/ {reserveAmount} ahora para reservar</p>
                      <p>• El resto (S/ {totalPrice - reserveAmount}) se paga contra entrega</p>
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
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
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
                      <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "yape" ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-primary"
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="yape"
                          checked={paymentMethod === "yape"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-purple-600"
                        />
                        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Y</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">Yape</span>
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recomendado</span>
                          <p className="text-xs text-gray-500 mt-1">Pago rápido y seguro • Sin comisiones</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "stripe" ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={paymentMethod === "stripe"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary"
                        />
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <span className="font-medium">{t("preOrder.cardPayment")}</span>
                          <p className="text-xs text-gray-500 mt-1">{t("preOrder.paymentMethods.stripe")}</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "paypal" ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-primary"
                      }`}>
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
                    disabled={loading || soldOut}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 px-8 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" message="" className="!mb-0" />
                        <span className="ml-2">{t("preOrder.form.submitting")}</span>
                      </>
                    ) : soldOut ? (
                      <>¡Agotado!</>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Reservar ahora • {t("preOrder.currency")} {reserveAmount}
                      </>
                    )}
                  </button>

                  {paymentMethod === "yape" && !soldOut && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-900 font-medium mb-2">📱 Pasos para pagar con Yape:</p>
                      <ol className="text-xs text-purple-800 space-y-1 ml-4 list-decimal">
                        <li>Completa el formulario y haz clic en "Reservar ahora"</li>
                        <li>Te enviaremos un correo con el QR de Yape</li>
                        <li>Escanea el QR y paga S/ {reserveAmount}</li>
                        <li>¡Listo! Tu reserva queda confirmada</li>
                      </ol>
                    </div>
                  )}

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

        {/* Coming Soon - Nebu Gato */}
        <section className="py-20 px-4 bg-gradient-to-b from-white to-purple-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-200"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 p-12 text-center">
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 text-4xl animate-bounce">✨</div>
                <div className="absolute top-4 right-4 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
                <div className="absolute bottom-4 left-8 text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
                <div className="absolute bottom-4 right-8 text-3xl animate-bounce" style={{ animationDelay: '0.6s' }}>🌟</div>

                <motion.div
                  className="relative z-10"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {/* Placeholder para la imagen del gato */}
                  <div className="w-48 h-48 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
                    <span className="text-8xl">🐱</span>
                  </div>

                  <div className="inline-block bg-yellow-400 text-purple-900 px-6 py-2 rounded-full font-bold text-lg mb-4 shadow-lg transform -rotate-2">
                    PRÓXIMAMENTE
                  </div>

                  <h2 className="text-5xl md:text-6xl font-bold font-gochi text-white mb-4 drop-shadow-lg">
                    Nebu Gato
                  </h2>

                  <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                    ¡El nuevo amigo felino de Nebu está en camino! Suave, adorable y listo para ronronear aventuras.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center items-center text-white/80 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Material ultra suave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Diseño exclusivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Perfectos para coleccionar</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="p-8 bg-white">
                <WaitlistForm />
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}
