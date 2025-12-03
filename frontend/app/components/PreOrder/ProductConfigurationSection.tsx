import { motion } from "framer-motion";
import ProductSelection from "./ProductSelection";
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
      className="space-y-6 h-full flex flex-col"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Selector Unificado: Producto + Cantidad + Preview + Color */}
      <ProductSelection
        products={products}
        selectedProduct={selectedProduct}
        selectedColor={selectedColor}
        productColors={productColors}
        quantity={quantity}
        availableUnits={availableUnits}
        soldOut={soldOut}
        onColorChange={onColorChange}
        onQuantityChange={onQuantityChange}
      />

      {/* Resumen de Precio */}
      <PriceSummary
        quantity={quantity}
        basePrice={basePrice}
        reservePercentage={reservePercentage}
      />
    </motion.div>
  );
}
