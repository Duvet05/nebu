import { useTranslation } from "react-i18next";
import type { ProductColor } from "~/lib/api/products";

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: ProductColor;
  onColorChange: (color: ProductColor) => void;
}

/**
 * ColorSelector - Selector de colores del producto
 */
export default function ColorSelector({ colors, selectedColor, onColorChange }: ColorSelectorProps) {
  const { t } = useTranslation("common");

  return (
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">{t("preOrder.selectColor")}</h4>
      <div className="grid grid-cols-2 gap-3">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorChange(color)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedColor.id === color.id
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <span className="font-medium text-gray-900">{color.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
