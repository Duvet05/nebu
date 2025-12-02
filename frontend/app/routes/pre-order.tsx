import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { fetchPreOrderProducts, enrichProduct, defaultProductColors } from "~/lib/api/products";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { BUSINESS } from "~/config/constants";
import VersionFooter from "~/components/VersionFooter";

// Pre-Order Components
import PreOrderHero from "~/components/PreOrder/PreOrderHero";
import ProductConfigurationSection from "~/components/PreOrder/ProductConfigurationSection";
import OrderFormSection from "~/components/PreOrder/OrderFormSection";

// Hooks
import { usePreOrderForm } from "~/hooks/usePreOrderForm";

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

  // Use custom hook for all form logic
  const {
    quantity,
    selectedColor,
    paymentMethod,
    formData,
    loading,
    availableUnits,
    soldOut,
    basePrice,
    reservePercentage,
    totalPrice,
    reserveAmount,
    shippingPrice,
    finalPrice,
    handleQuantityChange,
    handleInputChange,
    handleSubmit,
    setSelectedColor,
    setPaymentMethod,
  } = usePreOrderForm(selectedProduct, productColors, t);

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
              />

              {/* Order Form */}
              <OrderFormSection
                formData={formData}
                paymentMethod={paymentMethod}
                reserveAmount={reserveAmount}
                loading={loading}
                soldOut={soldOut}
                onInputChange={handleInputChange}
                onPaymentMethodChange={setPaymentMethod}
                onSubmit={handleSubmit}
              />
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
