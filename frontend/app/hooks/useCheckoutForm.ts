import { useState, type FormEvent } from "react";
import { useNavigate } from "@remix-run/react";
import { useCart } from "~/contexts/CartContext";
import { useCulqi } from "./useCulqi";

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  address: string;
  apartment: string;
  city: string;
  region: string;
  postalCode: string;
  agreeTerms: boolean;
  subscribeNewsletter: boolean;
}

export function useCheckoutForm() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const culqi = useCulqi();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    region: "",
    postalCode: "",
    agreeTerms: false,
    subscribeNewsletter: true,
  });

  const reserveAmount = totalPrice * 0.5; // 50% deposit
  const shippingCost = 0; // Free shipping
  const finalTotal = totalPrice + shippingCost;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const processCheckout = async (culqiToken?: string) => {
    // Prepare order data
    const orderData = {
      ...formData,
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        colorId: item.color.id,
        colorName: item.color.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal: totalPrice,
      shipping: shippingCost,
      total: finalTotal,
      reserveAmount,
      country: "Perú",
      culqiToken,
    };

    // Send to API
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (response.ok) {
      // Prepare order data for confirmation page
      const orderParams = new URLSearchParams({
        orderId: data.orderId,
        total: finalTotal.toString(),
        numItems: items.reduce((sum, item) => sum + item.quantity, 0).toString(),
        productIds: items.map(item => item.product.id).join(','),
      });

      // Clear cart and redirect to success
      clearCart();
      navigate(`/order-confirmation?${orderParams.toString()}`);
    } else {
      throw new Error(data.error || "Error processing order");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Abrir modal de Culqi
      if (!culqi.isReady) {
        throw new Error("Sistema de pagos no disponible");
      }

      const productNames = items.map(i => i.product.name).join(", ");

      culqi.openCheckout(
        {
          title: "Compra Nebu",
          currency: "PEN",
          amount: Math.round(reserveAmount * 100), // Monto en centavos
          description: `Compra: ${productNames}`,
        },
        async (token) => {
          // Token generado exitosamente, procesar el pago
          setLoading(true);
          try {
            await processCheckout(token.id);
          } catch (error) {
            console.error("Error processing checkout with Culqi:", error);
            alert("Hubo un error al procesar tu pedido. Por favor intenta nuevamente.");
          } finally {
            culqi.resetProcessing();
            setLoading(false);
          }
        },
        (error) => {
          // Error al generar token
          console.error("Culqi token error:", error);
          alert(error.user_message || "Hubo un error con el pago. Por favor intenta nuevamente.");
          culqi.resetProcessing();
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Hubo un error al procesar tu pedido. Por favor intenta nuevamente.");
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    reserveAmount,
    shippingCost,
    finalTotal,
  };
}
