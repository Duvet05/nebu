import { useState, useEffect, type FormEvent } from "react";
import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { fetchPreOrderProducts, enrichProduct, defaultProductColors, type ProductColor } from "~/lib/api/products";
import { motion } from "framer-motion";
import { Truck, ShoppingCart, Shield } from "lucide-react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { analytics } from "~/lib/analytics";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { BUSINESS } from "~/config/constants";
import VersionFooter from "~/components/VersionFooter";

// Pre-Order Components
import ProductSelector from "~/components/PreOrder/ProductSelector";
import ProductPreview from "~/components/PreOrder/ProductPreview";
import ColorSelector from "~/components/PreOrder/ColorSelector";
import QuantitySelector from "~/components/PreOrder/QuantitySelector";
import FeatureHighlights from "~/components/PreOrder/FeatureHighlights";
import PriceSummary from "~/components/PreOrder/PriceSummary";
import ContactForm from "~/components/PreOrder/ContactForm";
import PaymentMethodSelector from "~/components/PreOrder/PaymentMethodSelector";

export async function loader({ request: _request }: LoaderFunctionArgs) {
  const products = await fetchPreOrderProducts();
  return json({ products: products.map(enrichProduct) });
}

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
    { property: "og:url", content: `${BUSINESS.website}/pre-order` },
    { property: "og:image", content: `${BUSINESS.website}/og-product.jpg` },
    { property: "product:price:amount", content: "380" },
    { property: "product:price:currency", content: "PEN" },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Pre-orden Nebu - Reserva con 50%" },
    { name: "twitter:description", content: "S/380 con envío gratis. Reserva con S/190. Solo 20 unidades." },
    { name: "twitter:image", content: `${BUSINESS.website}/og-product.jpg` },
  ];
};

export default function PreOrder() {
  const { products } = useLoaderData<typeof loader>();
  const { t } = useTranslation("common");
  const [searchParams] = useSearchParams();

  // Get product from URL parameter or default to nebu-dino
  const productSlug = searchParams.get("product") || "nebu-dino";
  const selectedProduct = products.find(p => p.slug === productSlug) || products[0];
  const productColors = selectedProduct?.colors || defaultProductColors;

  // Form state
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(productColors[0]);
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
      });
  }, [selectedProduct]);

  // Update selected color when product changes
  useEffect(() => {
    const colors = selectedProduct?.colors || defaultProductColors;
    setSelectedColor(colors[0]);
  }, [selectedProduct]);

  // Price calculations
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
                <ProductSelector 
                  products={products}
                  selectedProductId={selectedProduct.id}
                />

                <ProductPreview 
                  product={selectedProduct}
                  selectedColor={selectedColor}
                />

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <ColorSelector
                    colors={productColors}
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                  />

                  <QuantitySelector
                    quantity={quantity}
                    availableUnits={availableUnits}
                    soldOut={soldOut}
                    onQuantityChange={handleQuantityChange}
                  />

                  <FeatureHighlights />
                </div>

                <PriceSummary
                  quantity={quantity}
                  basePrice={basePrice}
                  reservePercentage={reservePercentage}
                />
              </motion.div>

              {/* Order Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold font-heading mb-8">{t("preOrder.contactInfo")}</h3>
                  
                  <ContactForm
                    formData={formData}
                    onInputChange={handleInputChange}
                  />

                  <PaymentMethodSelector
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    reserveAmount={reserveAmount}
                  />

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
      <VersionFooter />
    </div>
  );
}
