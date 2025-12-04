import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useLoaderData, useSearchParams, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { fetchPreOrderProducts, enrichProduct, defaultProductColors } from "~/lib/api/products";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { Divider } from "~/components/Divider";
import { BUSINESS } from "~/config/constants";
import VersionFooter from "~/components/VersionFooter";
import { useCart } from "~/contexts/CartContext";

// Pre-Order Components
import PreOrderHero from "~/components/PreOrder/PreOrderHero";
import ProductConfigurationSection from "~/components/PreOrder/ProductConfigurationSection";

export async function loader({ request: _request }: LoaderFunctionArgs) {
  const products = await fetchPreOrderProducts();
  // Filtrar solo productos que estén disponibles en pre-orden
  const availablePreOrderProducts = products.filter(p => p.preOrder && p.inStock);
  return { products: availablePreOrderProducts.map(enrichProduct) };
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
  const navigate = useNavigate();
  const { addItem } = useCart();

  // Get product from URL parameter or default to nebu-dino
  const productSlug = searchParams.get("product") || "nebu-dino";
  const [currentProduct, setCurrentProduct] = useState(() => 
    products.find(p => p.slug === productSlug) || products[0]
  );
  
  const selectedProduct = currentProduct;
  const productColors = selectedProduct?.colors || defaultProductColors;
  
  // State simplificado - solo lo necesario
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(productColors[0]);
  const [availableUnits] = useState(selectedProduct?.stockCount || 20);
  
  // Handler para cambiar producto
  const handleProductChange = (product: typeof currentProduct) => {
    setCurrentProduct(product);
    const colors = product?.colors || defaultProductColors;
    setSelectedColor(colors[0]);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 5) {
      setQuantity(newQuantity);
    }
  };

  // Handler para agregar al carrito e ir a checkout
  const handleAddToCart = () => {
    // Agregar al carrito marcado como pre-order
    addItem(selectedProduct, selectedColor, quantity, true);
    
    // Redirigir a checkout
    navigate('/checkout');
  };

  const soldOut = availableUnits <= 0;
  const basePrice = selectedProduct.price;
  const reservePercentage = 0.5;

  return (
    <div className="min-h-screen bg-nebu-bg">
      <Header />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <PreOrderHero availableUnits={availableUnits} />

        {/* Pre-Order Form */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Product Configuration */}
              <ProductConfigurationSection
                products={products}
                selectedProduct={selectedProduct}
                selectedColor={selectedColor}
                quantity={quantity}
                availableUnits={availableUnits}
                soldOut={soldOut}
                productColors={productColors}
                basePrice={basePrice}
                reservePercentage={reservePercentage}
                onColorChange={setSelectedColor}
                onQuantityChange={handleQuantityChange}
                onProductChange={handleProductChange}
              />

              {/* Simple CTA - Solo agregar al carrito */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8">
                  <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi text-primary mb-6">
                    {t("preOrder.summary.title")}
                  </h2>

                  {/* Price Summary */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">{t("preOrder.summary.subtotal")}</span>
                      <span className="font-semibold">S/ {(basePrice * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">{t("preOrder.summary.shipping")}</span>
                      <span className="font-semibold text-green-600">{t("preOrder.summary.freeShipping")}</span>
                    </div>
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between text-2xl font-bold">
                        <span>{t("preOrder.summary.total")}</span>
                        <span className="text-primary">S/ {(basePrice * quantity).toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Pago inicial: <span className="font-semibold">S/ {((basePrice * quantity) * reservePercentage).toFixed(2)}</span> (50%)
                      </p>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={soldOut}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {soldOut ? t("preOrder.form.soldOut") : t("preOrder.form.addToCart")}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    {t("preOrder.summary.securePayment")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

      <Newsletter />
      <Footer />
      <VersionFooter />
    </div>
  );
}
