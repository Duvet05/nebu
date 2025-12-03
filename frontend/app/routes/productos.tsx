import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Check, Info } from "lucide-react";
import { useCart } from "~/contexts/CartContext";
import { useState, useEffect } from "react";
import { trackEvent } from "~/lib/facebook-pixel";
import { BackInStockNotify } from "~/components/BackInStockNotify";
import { ProductComparison } from "~/components/ProductComparison";
import { Divider } from "~/components/Divider";
import { BUSINESS } from "~/config/constants";
import { fetchProducts, enrichProduct } from "~/lib/api/products";
import { json } from "@remix-run/node";

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

/**
 * Loader to fetch products from backend API
 */
export async function loader(_args: LoaderFunctionArgs) {
  try {
    const products = await fetchProducts(false);
    const enrichedProducts = products.map(enrichProduct);
    
    return json({ 
      products: enrichedProducts,
      error: null 
    });
  } catch (error) {
    console.error('Error loading products:', error);
    // Return empty array on error - fallback to client-side handling
    return json({ 
      products: [],
      error: 'Failed to load products' 
    });
  }
}

export default function ProductosPage() {
  const { t } = useTranslation("common");
  const { addItem } = useCart();
  const { products } = useLoaderData<typeof loader>();
  const [selectedColors, _setSelectedColors] = useState<Record<string, string>>({});

  // Initialize selected colors when products load
  useEffect(() => {
    if (products.length > 0) {
      _setSelectedColors(
        products.reduce((acc, p) => {
          const colors = p?.colors || [];
          return { ...acc, [p?.id || '']: colors[0]?.id || 'default' };
        }, {} as Record<string, string>)
      );
    }
  }, [products]);

  // Track page view as a custom event
  useEffect(() => {
    if (products.length > 0) {
      trackEvent('ViewContent', {
        content_type: 'product_catalog',
        content_name: 'Nebu Product Catalog',
        num_items: products.length,
      });
    }
  }, [products]);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p?.id === productId);
    if (!product) return;

    const colorId = selectedColors[productId];
    const colors = product.colors || [];
    const color = colors.find(c => c?.id === colorId) || colors[0];
    
    if (!color) return;

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
              {/* Regular Products */}
              {products.filter(p => p != null).map((product, index) => {
                const colors = product.colors || [];
                return (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Product Image */}
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Placeholder - Replace with actual image */}
                      <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${colors[0]?.gradient || 'from-gray-200 to-gray-300'} opacity-50`}></div>
                      <div className="absolute text-6xl">
                        {product.slug.includes('dino') && "🦕"}
                        {product.slug.includes('gato') && "🐱"}
                        {product.slug.includes('conejo') && "🐰"}
                        {product.slug.includes('oso') && "�"}
                        {product.slug.includes('dragon') && "🐉"}
                        {product.slug.includes('star') && "⭐"}
                        {product.slug.includes('chaos') && "�"}
                        {product.slug.includes('kosmik') && "👾"}
                        {product.slug.includes('pup') && "🐶"}
                        {product.slug.includes('gruñon') && "👹"}
                        {product.slug.includes('arms') && "🤗"}
                        {product.slug.includes('kitty') && "😺"}
                        {product.slug.includes('bunny') && "🐰"}
                        {product.slug.includes('jester') && "🤡"}
                        {product.slug.includes('sawbite') && "🪚"}
                      </div>
                    </div>
                    {/* Stock indicator */}
                    {product.inStock && product.stockCount !== undefined && (
                      <div className="absolute top-4 right-4">
                        <div className={`backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold ${
                          product.stockCount > 10
                            ? 'bg-green-100/90 text-green-700'
                            : product.stockCount > 0
                            ? 'bg-yellow-100/90 text-yellow-700'
                            : 'bg-red-100/90 text-red-700'
                        }`}>
                          {product.stockCount > 10
                            ? 'En Stock'
                            : product.stockCount > 0
                            ? `Solo ${product.stockCount} disponibles`
                            : 'Agotado'}
                        </div>
                      </div>
                    )}
                    {!product.inStock && product.preOrder && (
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-blue-100/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-700">
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
                      {colors.slice(0, 4).map((color) => (
                        <div
                          key={color?.id || Math.random()}
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: color?.hex || '#ccc' }}
                          title={color?.name || ''}
                        />
                      ))}
                      {colors.length > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          +{colors.length - 4}
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
                      {product.inStock && product.stockCount > 0 ? (
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
                      ) : product.preOrder ? (
                        <Link
                          to={`/pre-order?product=${product.slug}`}
                          className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-center"
                        >
                          {t("products.cta.preOrder")}
                        </Link>
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
              );
              })}

              {/* Special Help Card - At the end */}
              <motion.div
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: products.length * 0.1 }}
              >
                {/* Header with gradient background */}
                <div className="relative h-64 bg-gradient-to-br from-primary/10 via-accent/10 to-purple/10 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
                  </div>

                  <div className="relative z-10 text-center px-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Star className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {t("products.helpSection.title")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("products.helpSection.description")}
                    </p>
                  </div>
                </div>

                {/* Buttons Section */}
                <div className="p-6 flex flex-col gap-3 mt-auto">
                  <Link
                    to="/contact"
                    className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {t("products.helpSection.talkToAdvisor")}
                  </Link>
                  <Link
                    to="/faq"
                    className="w-full bg-white border-2 border-gray-300 text-gray-900 py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:border-primary hover:text-primary flex items-center justify-center gap-2"
                  >
                    {t("products.helpSection.viewFAQ")}
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

        {/* Comparison Section */}
        <ProductComparison />

      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}
