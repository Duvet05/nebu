import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Check, Info } from "lucide-react";
import { products } from "~/data/products";
import { useCart } from "~/contexts/CartContext";
import { useState, useEffect } from "react";
import { trackEvent } from "~/lib/facebook-pixel";
import { BackInStockNotify } from "~/components/BackInStockNotify";
import { BUSINESS } from "~/config/constants";

export const meta: MetaFunction = () => {
  return [
    { title: "Productos Nebu - Peluches Inteligentes con IA | Flow Telligence" },
    {
      name: "description",
      content: "Descubre la familia completa de Nebu: Dino, Gato, Conejo, Oso y Dragón. Peluches inteligentes con IA desde S/380. Envío gratis a todo Perú.",
    },
    {
      name: "keywords",
      content: "nebu productos, peluches inteligentes, nebu dino, nebu gato, nebu conejo, juguetes educativos peru, IA para niños",
    },
    // Open Graph
    { property: "og:title", content: "Productos Nebu - Peluches Inteligentes" },
    { property: "og:description", content: "5 modelos de peluches con IA. Desde S/380 con envío gratis." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${BUSINESS.website}/productos` },
  ];
};

export default function ProductosPage() {
  const { t } = useTranslation("common");
  const { addItem } = useCart();
  const [selectedColors, _setSelectedColors] = useState<Record<string, string>>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: p.colors[0].id }), {})
  );

  // Track page view as a custom event
  useEffect(() => {
    trackEvent('ViewContent', {
      content_type: 'product_catalog',
      content_name: 'Nebu Product Catalog',
      num_items: products.length,
    });
  }, []);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const colorId = selectedColors[productId];
    const color = product.colors.find(c => c.id === colorId) || product.colors[0];

    addItem(product, color, 1);
  };

  return (
    <div className="min-h-screen bg-nebu-bg relative">
      <Header />

      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, #6366f115 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, #6366f110 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 90px 90px',
          backgroundPosition: '0 0, 40px 40px'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 text-primary leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {t("products.title")}
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {t("products.subtitle")}
              </motion.p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        product.badge === "Más Popular"
                          ? "bg-gradient-to-r from-primary to-accent text-white"
                          : "bg-gray-900 text-white"
                      }`}>
                        {product.badge === "Más Popular" ? t("products.badges.mostPopular") : product.badge}
                      </div>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Placeholder - Replace with actual image */}
                      <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${product.colors[0].gradient} opacity-50`}></div>
                      <div className="absolute text-6xl">
                        {product.id === "nebu-dino" && "🦕"}
                        {product.id === "nebu-gato" && "🐱"}
                        {product.id === "nebu-conejo" && "🐰"}
                        {product.id === "nebu-oso" && "🐻"}
                        {product.id === "nebu-dragon" && "🐉"}
                      </div>
                    </div>

                    {/* Stock indicator */}
                    {!product.inStock && (
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                          {t("products.badges.preOrder")}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.shortDescription}
                    </p>

                    {/* Colors */}
                    <div className="flex gap-2 mb-4">
                      {product.colors.slice(0, 4).map((color) => (
                        <div
                          key={color.id}
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                      {product.colors.length > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          +{product.colors.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Key Features */}
                    <div className="space-y-2 mb-6">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-3xl font-bold text-primary">
                        S/ {product.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {t("products.pricing.freeShipping")}
                      </span>
                    </div>

                    {product.preOrder && product.depositAmount && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-800">
                          <Info className="w-3 h-3 inline mr-1" />
                          {t("products.pricing.reserveWith")} <strong>S/ {product.depositAmount}</strong> {t("products.pricing.reservePercentage")}
                        </p>
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="space-y-2">
                      {product.inStock ? (
                        <>
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            {t("products.cta.addToCart")}
                          </button>
                          <Link
                            to={`/pre-order?product=${product.slug}`}
                            className="block w-full bg-gray-100 text-gray-900 py-2 px-6 rounded-xl font-medium transition-all duration-300 hover:bg-gray-200 text-center"
                          >
                            {t("products.cta.preOrderDirect")}
                          </Link>
                        </>
                      ) : (
                        <BackInStockNotify
                          productId={product.id}
                          productName={product.name}
                        />
                      )}
                    </div>

                    {/* More Info Link */}
                    <Link
                      to={`/productos/${product.slug}`}
                      className="block text-center mt-3 text-sm text-primary hover:underline"
                    >
                      {t("products.cta.viewDetails")}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                {t("products.comparison.title")}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t("products.comparison.features.sameAI.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("products.comparison.features.sameAI.description")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t("products.comparison.features.parentalControl.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("products.comparison.features.parentalControl.description")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t("products.comparison.features.freeUpdates.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("products.comparison.features.freeUpdates.description")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t("products.comparison.features.warranty.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("products.comparison.features.warranty.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 text-center text-white"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Star className="w-16 h-16 mx-auto mb-6 text-white/80" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("products.helpSection.title")}
              </h2>
              <p className="text-lg mb-8 text-white/90">
                {t("products.helpSection.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  {t("products.helpSection.talkToAdvisor")}
                </Link>
                <Link
                  to="/faq"
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300"
                >
                  {t("products.helpSection.viewFAQ")}
                </Link>
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
