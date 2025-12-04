import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import { useCart } from "~/contexts/CartContext";
import { useState, useEffect } from "react";
import { trackEvent } from "~/lib/facebook-pixel";
import { ProductComparison } from "~/components/ProductComparison";
import { Divider } from "~/components/Divider";
import { BUSINESS } from "~/config/constants";
import { fetchProducts, enrichProduct } from "~/lib/api/products";
import { ProductCard } from "~/components/ProductCard";
import { HelpCard } from "~/components/HelpCard";

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
    
    return { 
      products: enrichedProducts,
      error: null 
    };
  } catch (error) {
    console.error('Error loading products:', error);
    // Return empty array on error - fallback to client-side handling
    return { 
      products: [],
      error: 'Failed to load products' 
    };
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
              {/* Regular Products - Using ProductCard component */}
              {products.filter(p => p != null).map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onAddToCart={handleAddToCart}
                />
              ))}

              {/* Help Card - "Don't know which one to choose?" state */}
              <HelpCard index={products.length} />
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
