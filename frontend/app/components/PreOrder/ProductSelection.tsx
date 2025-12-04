import { Link } from "@remix-run/react";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product, ProductColor } from "~/lib/api/products";

interface ProductSelectionProps {
  products: Product[];
  selectedProduct: Product;
  selectedColor: ProductColor;
  productColors: ProductColor[];
  quantity: number;
  availableUnits: number;
  maxQuantity?: number;
  soldOut: boolean;
  onColorChange: (color: ProductColor) => void;
  onQuantityChange: (delta: number) => void;
}

/**
 * ProductSelection - Componente unificado que combina:
 * - Selector de productos
 * - Preview del producto (video, nombre, rating)
 * - Selector de colores
 * - Selector de cantidad
 */
export default function ProductSelection({ 
  products, 
  selectedProduct, 
  selectedColor,
  productColors,
  quantity,
  availableUnits,
  maxQuantity = 5,
  soldOut,
  onColorChange,
  onQuantityChange
}: ProductSelectionProps) {
  const { t } = useTranslation("common");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
      {/* Selector de Productos y Cantidad */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl md:text-3xl font-bold font-heading text-gray-900">
            {t("preOrder.selectYourNebu")}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${availableUnits <= 5 ? 'text-red-600' : 'text-green-600'}`}>
              {availableUnits} {t("preOrder.available")}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {products.slice(0, 6).map((product) => {
            // Extract emoji from concept field or use default based on slug
            const getEmoji = (product: Product) => {
              if (product.concept) {
                const emojiMatch = product.concept.match(/[\p{Emoji}]/u);
                if (emojiMatch) return emojiMatch[0];
              }
              // Fallback based on slug
              if (product.slug.includes('dino')) return '🦕';
              if (product.slug.includes('capibara')) return '🦦';
              if (product.slug.includes('gato') || product.slug.includes('cat')) return '🐱';
              if (product.slug.includes('conejo') || product.slug.includes('bunny')) return '🐰';
              if (product.slug.includes('oso')) return '🐻';
              if (product.slug.includes('dragon')) return '🐉';
              return '🎁';
            };

            return (
              <Link
                key={product.id}
                to={`/pre-order?product=${product.slug}`}
                className={`p-2.5 rounded-lg border-2 transition-all duration-200 text-center ${
                  selectedProduct.id === product.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <div className="text-xl mb-0.5">
                  {getEmoji(product)}
                </div>
                <span className="text-xs font-medium text-gray-900 block truncate">
                  {product.name.replace("Nebu ", "")}
                </span>
                {!product.inStock && (
                  <div className="text-xs text-gray-500 mt-0.5">{t("preOrder.preOrderBadge")}</div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Selector de Cantidad Integrado */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-900">
            {t("preOrder.quantity")}:
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1 || soldOut}
              className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <span className="text-xl font-bold font-heading min-w-[2.5rem] text-center">
              {quantity}
            </span>
            
            <button
              type="button"
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= maxQuantity || quantity >= availableUnits || soldOut}
              className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-100 mb-6"></div>

      {/* Preview del Producto */}
      <div className="mb-6">
        <div className="mb-4">
          {/* Imagen del producto en lugar del video */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            {selectedProduct.images && selectedProduct.images.length > 0 ? (
              <img 
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-center p-8">
                <p className="text-sm">No hay video disponible</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-bold font-heading">
            {selectedProduct.name} -
          </h3>
          <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
            {selectedProduct.shortDescription}
          </p>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-100 mb-6"></div>

      {/* Selector de Colores */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          {t("preOrder.selectColor")}
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          {productColors.map((color) => (
            <button
              key={color.id}
              onClick={() => onColorChange(color)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedColor.id === color.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full shadow-sm border-2 border-white"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="font-medium text-gray-900 text-sm">{color.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
