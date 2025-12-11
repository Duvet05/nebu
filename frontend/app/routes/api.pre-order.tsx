import { data, type ActionFunctionArgs } from "@remix-run/node";
import { createCharge } from "~/lib/culqi.server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/api/v1";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();

    // Extract form data
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const postalCode = formData.get("postalCode") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const color = formData.get("color") as string;
    const totalPrice = parseFloat(formData.get("totalPrice") as string);
    const paymentMethod = formData.get("paymentMethod") as string;
    const productSlug = formData.get("productSlug") as string;
    const culqiToken = formData.get("culqiToken") as string | null;

    // Validate required fields
    if (!email || !firstName || !lastName || !phone || !address || !city) {
      return data({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Si el método de pago es Culqi, procesar el cargo
    let culqiChargeId: string | null = null;
    if (paymentMethod === "culqi" && culqiToken) {
      const chargeResult = await createCharge(culqiToken, {
        email,
        firstName,
        lastName,
        phone,
        address,
        city,
        postalCode,
        quantity,
        color,
        totalPrice,
      });

      if (!chargeResult.success) {
        return data(
          { 
            error: chargeResult.error || "Error al procesar el pago con tarjeta",
            errorCode: chargeResult.errorCode,
            retryable: chargeResult.retryable,
          },
          { status: 400 }
        );
      }

      culqiChargeId = chargeResult.data?.id;
      console.log("[Pre-Order] Culqi charge successful:", culqiChargeId);
    }

    // Save lead to backend first (HOT lead from pre-order)
    try {
      await fetch(`${BACKEND_URL}/leads/pre-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          productSlug,
          metadata: {
            color,
            quantity,
            totalPrice,
            address,
            city,
            postalCode,
            paymentMethod,
            source: "website_pre_order",
            userAgent: request.headers.get("user-agent"),
          },
        }),
      });
    } catch (error) {
      console.error("Failed to save pre-order lead to backend:", error);
      // Continue even if backend fails
    }

    // Save order to backend database (legacy orders endpoint)
    let orderId: string | null = null;
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          address,
          city,
          postalCode,
          product: "Nebu",
          color,
          quantity,
          totalPrice,
          paymentMethod,
          culqiChargeId,
          metadata: {
            source: "website",
            userAgent: request.headers.get("user-agent"),
            paymentStatus: culqiChargeId ? "paid" : "pending",
          },
        }),
      });

      if (backendResponse.ok) {
        const order = await backendResponse.json();
        orderId = order.id;
      } else {
        await backendResponse.text();
      }
    } catch {
      // Backend connection error, continue to send emails anyway
    }

    // Send confirmation email to customer via backend
    try {
      const customerEmailResponse = await fetch(`${BACKEND_URL}/email/public/pre-order-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          quantity,
          color,
          totalPrice,
        }),
      });

      const customerEmailResult = await customerEmailResponse.json();
      if (!customerEmailResult.success) {
        console.error("Failed to send customer email:", customerEmailResult.error);
      }
    } catch (error) {
      console.error("Failed to send customer email via backend:", error);
    }

    // Send notification email to internal team via backend
    try {
      const teamEmailResponse = await fetch(`${BACKEND_URL}/email/public/pre-order-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          address,
          city,
          postalCode,
          quantity,
          color,
          totalPrice,
          paymentMethod,
        }),
      });

      const teamEmailResult = await teamEmailResponse.json();
      if (!teamEmailResult.success) {
        console.error("Failed to send team notification:", teamEmailResult.error);
      }
    } catch (error) {
      console.error("Failed to send team notification via backend:", error);
    }

    // Return success even if emails fail (don't block the order)
    return data({
      success: true,
      message: "Pre-orden realizada exitosamente",
      orderId,
    });
  } catch (error) {
    console.error("Pre-order error:", error);
    return data(
      { error: "Error al procesar la pre-orden" },
      { status: 500 }
    );
  }
}
