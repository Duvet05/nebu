import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuantitySelectorProps {
  quantity: number;
  availableUnits: number;
  maxQuantity?: number;
  soldOut: boolean;
  onQuantityChange: (delta: number) => void;
}

/**
 * QuantitySelector - Control de cantidad con validación de stock
 */
export default function QuantitySelector({
  quantity,
  availableUnits,
  maxQuantity = 5,
  soldOut,
  onQuantityChange
}: QuantitySelectorProps) {
  const { t } = useTranslation("common");

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">{t("preOrder.quantity")}</h4>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${availableUnits <= 5 ? 'text-red-600' : 'text-green-600'}`}>
            {availableUnits} disponibles
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onQuantityChange(-1)}
          disabled={quantity <= 1 || soldOut}
          className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="text-2xl font-bold font-heading min-w-[3rem] text-center">
          {quantity}
        </span>
        
        <button
          type="button"
          onClick={() => onQuantityChange(1)}
          disabled={quantity >= maxQuantity || quantity >= availableUnits || soldOut}
          className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        {soldOut ? t("preOrder.soldOut") : t("preOrder.maxQuantity")}
      </p>
    </div>
  );
}
