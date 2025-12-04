import { useState, useEffect, type FormEvent } from "react";
import { analytics } from "~/lib/analytics";
import type { ProductColor } from "~/lib/api/products";
import { useCulqi } from "~/hooks/useCulqi";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stockCount: number;
  colors?: ProductColor[];
  [key: string]: any;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  agreeTerms: boolean;
  subscribeNewsletter: boolean;
}

export function usePreOrderForm(
  selectedProduct: Product,
  productColors: ProductColor[],
  t: (key: string) => string
) {
  // Culqi integration
  const culqi = useCulqi();

  // Form state
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(productColors[0]);
  const [paymentMethod, setPaymentMethod] = useState("yape");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    agreeTerms: false,
    subscribeNewsletter: true
  });

  // Inventory management
  const [availableUnits, setAvailableUnits] = useState(selectedProduct.stockCount || 0);
  const soldOut = availableUnits <= 0;

  // Track page view and fetch inventory on mount
  useEffect(() => {
    analytics.viewProduct(selectedProduct.id, selectedProduct.name);

    // Fetch inventory from backend using product ID (UUID)
    fetch(`/api/inventory?productId=${encodeURIComponent(selectedProduct.id)}`)
      .then(res => res.json())
      .then(data => {
        if (data.availableUnits !== undefined) {
          setAvailableUnits(data.availableUnits);
        }
      })
      .catch(err => {
        console.error("Failed to fetch inventory:", err);
      });
  }, [selectedProduct]);

  // Update selected color when product changes
  useEffect(() => {
    const colors = selectedProduct?.colors || productColors;
    setSelectedColor(colors[0]);
  }, [selectedProduct, productColors]);

  // Price calculations
  const basePrice = selectedProduct.price;
  const reservePercentage = 0.5; // 50% de adelanto
  const totalPrice = basePrice * quantity;
  const reserveAmount = totalPrice * reservePercentage;
  const shippingPrice = 0; // Free shipping
  const finalPrice = totalPrice + shippingPrice;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 5) {
      setQuantity(newQuantity);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Track checkout initiation
    analytics.preOrderStart(selectedColor.id, quantity);

    try {
      // Si el método de pago es Culqi, abrir modal de pago
      if (paymentMethod === "culqi") {
        if (!culqi.isReady) {
          throw new Error("Sistema de pagos no disponible");
        }

        // Abrir modal de Culqi
        culqi.openCheckout(
          {
            title: `Pre-orden Nebu - ${selectedProduct.name}`,
            currency: "PEN",
            amount: Math.round(reserveAmount * 100), // Monto en centavos
            description: `Pre-orden ${selectedProduct.name} - ${selectedColor.name}`,
          },
          async (token) => {
            // Token generado exitosamente, procesar el pago
            try {
              await processPreOrder(token.id);
            } catch (error) {
              console.error("Error processing pre-order with Culqi:", error);
              alert(t("preOrder.messages.errorAlert"));
            } finally {
              culqi.resetProcessing();
              setLoading(false);
            }
          },
          (error) => {
            // Error al generar token
            console.error("Culqi token error:", error);
            alert(error.user_message || t("preOrder.messages.errorAlert"));
            culqi.resetProcessing();
            setLoading(false);
          }
        );
        return; // No continuar, esperamos el callback de Culqi
      }

      // Para otros métodos de pago (Yape), procesar directamente
      await processPreOrder();
    } catch (error) {
      console.error("Error processing pre-order:", error);
      alert(t("preOrder.messages.errorAlert"));
      setLoading(false);
    }
  };

  // Función auxiliar para procesar la pre-orden
  const processPreOrder = async (culqiToken?: string) => {
    // Send pre-order data to API
    const formDataToSend = new FormData();
    formDataToSend.append("product", selectedProduct.name);
    formDataToSend.append("productId", selectedProduct.id);
    formDataToSend.append("productSlug", selectedProduct.slug);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("city", formData.city);
    formDataToSend.append("postalCode", formData.postalCode);
    formDataToSend.append("quantity", quantity.toString());
    formDataToSend.append("color", selectedColor.name);
    formDataToSend.append("totalPrice", reserveAmount.toString());
    formDataToSend.append("paymentMethod", paymentMethod);
    
    if (culqiToken) {
      formDataToSend.append("culqiToken", culqiToken);
    }

    const response = await fetch("/api/pre-order", {
      method: "POST",
      body: formDataToSend,
    });

    const data = await response.json();

    if (response.ok) {
      // Track successful pre-order
      analytics.preOrderComplete(
        formData.email,
        quantity,
        selectedColor.id,
        finalPrice
      );

      // Track newsletter signup if checked
      if (formData.subscribeNewsletter) {
        analytics.newsletterSignup(formData.email, "pre-order-form");
      }

      // Show success message
      alert(t("preOrder.messages.successAlert"));

      // Reset form
      setFormData({
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
      setQuantity(1);
      setLoading(false);
    } else {
      throw new Error(data.error || "Error al procesar la pre-orden");
    }
  };

  return {
    // State
    quantity,
    selectedColor,
    paymentMethod,
    loading,
    formData,
    availableUnits,
    soldOut,
    
    // Calculated values
    basePrice,
    reservePercentage,
    totalPrice,
    reserveAmount,
    shippingPrice,
    finalPrice,
    
    // Handlers
    handleQuantityChange,
    handleInputChange,
    handleSubmit,
    setSelectedColor,
    setPaymentMethod,
  };
}
