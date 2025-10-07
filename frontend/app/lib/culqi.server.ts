// Culqi API service using fetch (no SDK needed)
const CULQI_API_URL = "https://api.culqi.com/v2";
const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY || "";

export interface PreOrderData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  quantity: number;
  color: string;
  totalPrice: number;
}

/**
 * Create a Culqi charge
 * @param tokenId - Token ID from Culqi.js (frontend)
 * @param data - Pre-order data
 */
export async function createCharge(tokenId: string, data: PreOrderData) {
  try {
    const response = await fetch(`${CULQI_API_URL}/charges`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CULQI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: data.totalPrice * 100, // Amount in cents (S/ 300 = 30000 cents)
        currency_code: "PEN",
        email: data.email,
        source_id: tokenId,
        description: `Pre-orden Nebu - ${data.quantity}x ${data.color}`,
        metadata: {
          order_type: "pre-order",
          product: "Nebu IoT Companion",
          color: data.color,
          quantity: data.quantity.toString(),
          customer_name: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postal_code: data.postalCode,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.user_message || result.merchant_message || "Error al procesar el pago",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error creating Culqi charge:", error);
    return {
      success: false,
      error: error.message || "Error al procesar el pago",
    };
  }
}

/**
 * Get charge information
 */
export async function getCharge(chargeId: string) {
  try {
    const response = await fetch(`${CULQI_API_URL}/charges/${chargeId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${CULQI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.user_message || result.merchant_message || "Error al obtener información del pago",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error getting charge:", error);
    return {
      success: false,
      error: error.message || "Error al obtener información del pago",
    };
  }
}

/**
 * Refund a charge
 */
export async function refundCharge(chargeId: string, amount: number, reason: string) {
  try {
    const response = await fetch(`${CULQI_API_URL}/refunds`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CULQI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Amount in cents
        charge_id: chargeId,
        reason,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.user_message || result.merchant_message || "Error al procesar el reembolso",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error creating refund:", error);
    return {
      success: false,
      error: error.message || "Error al procesar el reembolso",
    };
  }
}

/**
 * Process Culqi webhook event
 */
export async function processWebhook(event: any) {
  try {
    const { object, data } = event;

    switch (object) {
      case "event.charge.succeeded":
        // Payment successful
        return {
          success: true,
          type: "charge_succeeded",
          data: {
            chargeId: data.id,
            amount: data.amount / 100,
            email: data.email,
            metadata: data.metadata,
          },
        };

      case "event.charge.failed":
        // Payment failed
        return {
          success: true,
          type: "charge_failed",
          data: {
            chargeId: data.id,
            email: data.email,
            reason: data.outcome?.user_message || "Payment failed",
          },
        };

      case "event.order.expired":
        // Order expired
        return {
          success: true,
          type: "order_expired",
          data: {
            orderId: data.id,
            orderNumber: data.order_number,
          },
        };

      default:
        return {
          success: true,
          type: "unknown",
          data: null,
        };
    }
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return {
      success: false,
      error: error.message || "Error procesando webhook",
    };
  }
}
