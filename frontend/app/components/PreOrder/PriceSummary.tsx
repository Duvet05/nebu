import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PriceSummaryProps {
  quantity: number;
  basePrice: number;
  reservePercentage: number;
}

/**
 * PriceSummary - Resumen de precios y reserva
 */
export default function PriceSummary({ quantity, basePrice, reservePercentage }: PriceSummaryProps) {
  const { t } = useTranslation("common");

  const totalPrice = basePrice * quantity;
  const reserveAmount = totalPrice * reservePercentage;
  const shippingPrice = 0; // Free shipping
  const finalPrice = totalPrice + shippingPrice;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h4 className="font-semibold text-gray-900 mb-6">{t("preOrder.orderSummary.title")}</h4>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>{t("preOrder.productName")} {t("preOrder.productMultiplier")} {quantity}</span>
          <span>{t("preOrder.currency")} {totalPrice}</span>
        </div>
        
        <div className="flex justify-between text-green-600">
          <span>{t("preOrder.orderSummary.shipping")}</span>
          <span>{t("preOrder.orderSummary.free")}</span>
        </div>
        
        <hr className="border-gray-200" />
        
        <div className="flex justify-between text-lg">
          <span>Total del pedido</span>
          <span>{t("preOrder.currency")} {finalPrice}</span>
        </div>
        
        <div className="flex justify-between text-xl font-bold text-primary">
          <span>Reserva ahora (50%)</span>
          <span>{t("preOrder.currency")} {reserveAmount}</span>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>• Paga S/ {reserveAmount} ahora para reservar</p>
          <p>• El resto (S/ {totalPrice - reserveAmount}) se paga contra entrega</p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">{t("preOrder.orderSummary.guarantee")}</p>
            <p>{t("preOrder.orderSummary.guaranteeText")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
