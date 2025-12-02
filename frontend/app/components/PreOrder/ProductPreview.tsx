import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProductVideoPlayer from "~/components/ProductVideoPlayer";
import type { Product, ProductColor } from "~/lib/api/products";

interface ProductPreviewProps {
  product: Product;
  selectedColor: ProductColor;
}

/**
 * ProductPreview - Muestra el video del producto, nombre, descripción y rating
 */
export default function ProductPreview({ product, selectedColor }: ProductPreviewProps) {
  const { t } = useTranslation("common");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="mb-8">
        <ProductVideoPlayer 
          playbackId={product.videoPlaybackId}
          videoProvider={product.videoProvider}
          thumbnailUrl={product.videoThumbnail}
        />
      </div>
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold font-heading">
          {product.name} - {selectedColor.name}
        </h3>
        <p className="text-sm text-gray-600 mt-2">{product.shortDescription}</p>
        
        <div className="flex items-center justify-center gap-1 mt-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-sm text-gray-500 ml-2">
            (5.0 · 180 {t("preOrder.reviews")})
          </span>
        </div>
      </div>
    </div>
  );
}
