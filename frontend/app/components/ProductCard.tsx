import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { ShoppingCart, Check, Info, Calendar } from "lucide-react";
import { Product } from "~/lib/api/products";
import { ProductImage } from "~/components/ProductImage";
import { BackInStockNotify } from "~/components/BackInStockNotify";
import { useTranslation } from "react-i18next";

export interface ProductCardProps {
  product: Product;
  index?: number;
  onAddToCart?: (productId: string) => void;
}

/**
 * ProductCard Component
 *
 * Displays a product card with three possible states:
 * 1. In Stock - Shows "Add to Cart" and "Pre-order Direct" buttons
 * 2. Pre-order Only - Shows "Pre-order" button
 * 3. Out of Stock - Shows "Back in Stock Notify" form
 */
export function ProductCard({ product, index = 0, onAddToCart }: ProductCardProps) {
  const { t } = useTranslation("common");
  const colors = product.colors || [];

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Product Image */}
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <ProductImage
          images={product.images}
          name={product.name}
          slug={product.slug}
          gradient={colors[0]?.gradient}
        />

        {/* Stock indicator */}
        {product.inStock && product.stockCount !== undefined && (
          <div className="absolute top-4 right-4">
            <div
              className={`backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold ${
                product.stockCount > 10
                  ? "bg-green-100/90 text-green-700"
                  : product.stockCount > 0
                  ? "bg-yellow-100/90 text-yellow-700"
                  : "bg-red-100/90 text-red-700"
              }`}
            >
              {product.stockCount > 10
                ? "En Stock"
                : product.stockCount > 0
                ? `Solo ${product.stockCount} disponibles`
                : "Agotado"}
            </div>
          </div>
        )}

        {/* Pre-order badge */}
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

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10 overflow-hidden">
          {product.shortDescription}
        </p>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex gap-2 mb-4">
            {colors.slice(0, 4).map((color) => (
              <div
                key={color?.id || Math.random()}
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color?.hex || "#ccc" }}
                title={color?.name || ""}
              />
            ))}
            {colors.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                +{colors.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Key Features - Always 3 lines to prevent layout shift */}
        <div className="space-y-2 mb-6 h-[72px]">
          {[0, 1, 2].map((idx) => {
            const feature = product.features?.[idx];
            return (
              <div key={idx} className="flex items-start gap-2 h-6">
                {feature ? (
                  <>
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600 line-clamp-1">{feature}</span>
                  </>
                ) : (
                  <div className="opacity-0">
                    <Check className="w-4 h-4" />
                    <span className="text-xs">&nbsp;</span>
                  </div>
                )}
              </div>
            );
          })}
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

        {/* Deposit info for pre-orders - Only show if NOT in stock */}
        {!product.inStock && product.preOrder && product.depositAmount ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800">
              <Info className="w-3 h-3 inline mr-1" />
              {t("products.pricing.reserveWith")}{" "}
              <strong>S/ {product.depositAmount}</strong>{" "}
              {t("products.pricing.reservePercentage")}
            </p>
          </div>
        ) : (
          <div className="h-[52px] mb-4" />
        )}

        {/* CTA Buttons - Three States */}
        <div className="space-y-2">
          {/* STATE 1: In Stock */}
          {product.inStock && product.stockCount > 0 ? (
            <>
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-white py-4 px-6 rounded-xl font-bold text-lg shadow-[0_8px_30px_rgba(255,107,53,0.3)] hover:shadow-[0_12px_40px_rgba(255,107,53,0.5)] transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-6 h-6" />
                {t("products.cta.addToCart")}
              </button>
            </>
          ) : product.preOrder ? (
            /* STATE 2: Pre-order Only */
            <Link
              to={`/pre-order?product=${product.slug}`}
              className="flex items-center justify-center gap-3 w-full bg-transparent border-2 border-primary text-primary py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:scale-[1.02]"
            >
              <Calendar className="w-6 h-6" />
              {t("products.cta.preOrder")}
            </Link>
          ) : (
            /* STATE 3: Out of Stock */
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
}
