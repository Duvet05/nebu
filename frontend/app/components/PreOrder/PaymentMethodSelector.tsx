import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  reserveAmount: number;
}

/**
 * PaymentMethodSelector - Selector de método de pago
 */
export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
  reserveAmount
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation("common");

  return (
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">{t("preOrder.paymentMethod")}</h4>
      
      <div className="space-y-3">
        {/* Yape */}
        <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
          paymentMethod === "yape" ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-primary"
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="yape"
            checked={paymentMethod === "yape"}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="text-purple-600"
          />
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Y</span>
          </div>
          <div className="flex-1">
            <span className="font-medium">Yape</span>
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recomendado</span>
            <p className="text-xs text-gray-500 mt-1">Pago rápido y seguro • Sin comisiones</p>
          </div>
        </label>

        {/* Stripe */}
        <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
          paymentMethod === "stripe" ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={paymentMethod === "stripe"}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="text-primary"
          />
          <CreditCard className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <span className="font-medium">{t("preOrder.cardPayment")}</span>
            <p className="text-xs text-gray-500 mt-1">{t("preOrder.paymentMethods.stripe")}</p>
          </div>
        </label>

        {/* PayPal */}
        <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
          paymentMethod === "paypal" ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-primary"
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={paymentMethod === "paypal"}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="text-primary"
          />
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="font-medium">{t("preOrder.paymentMethods.paypal")}</span>
        </label>
      </div>

      {/* Yape Instructions */}
      {paymentMethod === "yape" && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-900 font-medium mb-2">📱 Pasos para pagar con Yape:</p>
          <ol className="text-xs text-purple-800 space-y-1 ml-4 list-decimal">
            <li>Completa el formulario y haz clic en "Reservar ahora"</li>
            <li>Te enviaremos un correo con el QR de Yape</li>
            <li>Escanea el QR y paga S/ {reserveAmount}</li>
            <li>¡Listo! Tu reserva queda confirmada</li>
          </ol>
        </div>
      )}
    </div>
  );
}
