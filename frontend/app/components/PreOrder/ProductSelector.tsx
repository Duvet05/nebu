import { Link } from "@remix-run/react";
import type { Product } from "~/lib/api/products";

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
}

/**
 * ProductSelector - Grid de selección de productos
 * Permite al usuario elegir entre diferentes productos disponibles
 */
export default function ProductSelector({ products, selectedProductId }: ProductSelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h4 className="font-semibold text-gray-900 mb-4">Selecciona tu Nebu</h4>
      <div className="grid grid-cols-2 gap-3">
        {products.slice(0, 5).map((product) => (
          <Link
            key={product.id}
            to={`/pre-order?product=${product.slug}`}
            className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
              selectedProductId === product.id
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            <div className="text-2xl mb-1">
              {product.id === "nebu-dino" && "🦕"}
              {product.id === "nebu-gato" && "🐱"}
              {product.id === "nebu-conejo" && "🐰"}
              {product.id === "nebu-oso" && "🐻"}
              {product.id === "nebu-dragon" && "🐉"}
            </div>
            <span className="text-sm font-medium text-gray-900">{product.name}</span>
            {!product.inStock && (
              <div className="text-xs text-gray-500 mt-1">Pre-orden</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
