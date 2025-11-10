import type { MetaFunction } from "@remix-run/node";
import { Link, useNavigate } from "@remix-run/react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { useCart } from "~/contexts/CartContext";
import { motion } from "framer-motion";
import { ShoppingBag, Truck, CreditCard, Shield, ArrowLeft, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Checkout - Carrito de Compras | Nebu" },
    { name: "description", content: "Completa tu compra de productos Nebu" },
    { name: "robots", content: "noindex, nofollow" }, // Don't index checkout pages
  ];
};

export default function CheckoutPage() {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
      };

      // Send to API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear cart and redirect to success
        clearCart();
        navigate(`/order-confirmation?orderId=${data.orderId}`);
      } else {
        throw new Error(data.error || "Error processing order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Hubo un error al procesar tu pedido. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-nebu-bg">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Agrega productos a tu carrito para continuar con la compra
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Ver Productos
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nebu-bg">
      <Header />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Seguir comprando
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Summary - Desktop Right, Mobile Top */}
            <div className="lg:col-span-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Resumen del Pedido
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.color.id}`}
                      className="flex gap-3 pb-4 border-b border-gray-200"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">
                          {item.product.id === "nebu-dino" && "🦕"}
                          {item.product.id === "nebu-gato" && "🐱"}
                          {item.product.id === "nebu-conejo" && "🐰"}
                          {item.product.id === "nebu-oso" && "🐻"}
                          {item.product.id === "nebu-dragon" && "🐉"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          <span className="text-xs text-gray-600">
                            {item.color.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600">
                            Cant: {item.quantity}
                          </span>
                          <span className="font-semibold text-sm">
                            S/ {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.color.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>S/ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío:</span>
                    <span className="text-green-600 font-semibold">GRATIS</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total:</span>
                    <span>S/ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pre-order Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                    Modalidad de Pre-orden
                  </h3>
                  <p className="text-xs text-blue-800 mb-2">
                    Reserva tu pedido con solo el 50% ahora
                  </p>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">A pagar hoy:</span>
                      <span className="text-xl font-bold text-primary">
                        S/ {reserveAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    El 50% restante se pagará al momento de la entrega
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                  <div className="flex flex-col items-center">
                    <Shield className="w-6 h-6 text-green-600 mb-1" />
                    <span className="text-xs text-gray-600">Compra Segura</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Truck className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="text-xs text-gray-600">Envío Gratis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-2 lg:order-1">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      1
                    </span>
                    Información de Contacto
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="+51 987 654 321"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Juan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Pérez"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      2
                    </span>
                    Dirección de Envío
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Av. Principal 123, Miraflores"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Lima"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="15001"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <div className="space-y-4 mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => handleInputChange("agreeTerms", e.target.checked)}
                        required
                        className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        Acepto los{" "}
                        <Link to="/terms" className="text-primary hover:underline" target="_blank">
                          Términos y Condiciones
                        </Link>{" "}
                        y la{" "}
                        <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                          Política de Privacidad
                        </Link>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.subscribeNewsletter}
                        onChange={(e) =>
                          handleInputChange("subscribeNewsletter", e.target.checked)
                        }
                        className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        Quiero recibir novedades y ofertas por correo electrónico
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 px-8 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Proceder al Pago (S/ {reserveAmount.toFixed(2)})
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Pago seguro procesado por Culqi. Tus datos están protegidos con encriptación SSL.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
