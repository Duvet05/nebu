import { motion } from "framer-motion";
import ProductSelector from "./ProductSelector";
import ProductPreview from "./ProductPreview";
import ColorSelector from "./ColorSelector";
import QuantitySelector from "./QuantitySelector";
import FeatureHighlights from "./FeatureHighlights";
import PriceSummary from "./PriceSummary";
import type { Product, ProductColor } from "~/lib/api/products";

interface ProductConfigurationSectionProps {
  products: Product[];
  selectedProduct: Product;
  selectedColor: ProductColor;
  quantity: number;
  availableUnits: number;
  soldOut: boolean;
  productColors: ProductColor[];
  basePrice: number;
  reservePercentage: number;
  onColorChange: (color: ProductColor) => void;
  onQuantityChange: (delta: number) => void;
}

export default function ProductConfigurationSection({
  products,
  selectedProduct,
  selectedColor,
  quantity,
  availableUnits,
  soldOut,
  productColors,
  basePrice,
  reservePercentage,
  onColorChange,
  onQuantityChange,
}: ProductConfigurationSectionProps) {
  return (
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
          onColorChange={onColorChange}
        />

        <QuantitySelector
          quantity={quantity}
          availableUnits={availableUnits}
          soldOut={soldOut}
          onQuantityChange={onQuantityChange}
        />

        <FeatureHighlights />
      </div>

      <PriceSummary
        quantity={quantity}
        basePrice={basePrice}
        reservePercentage={reservePercentage}
      />
    </motion.div>
  );
}
