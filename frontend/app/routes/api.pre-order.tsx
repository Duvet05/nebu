import { json, type ActionFunctionArgs } from "@remix-run/node";
import {
  sendPreOrderConfirmation,
  sendPreOrderNotification,
} from "~/lib/resend.server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
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
    const totalPrice = parseInt(formData.get("totalPrice") as string);
    const paymentMethod = formData.get("paymentMethod") as string;

    // Validate required fields
    if (!email || !firstName || !lastName || !phone || !address || !city) {
      return json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Save order to backend database
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
          product: "Nebu Dino",
          color,
          quantity,
          totalPrice,
          paymentMethod,
          metadata: {
            source: "website",
            userAgent: request.headers.get("user-agent"),
          },
        }),
      });

      if (backendResponse.ok) {
        const order = await backendResponse.json();
        orderId = order.id;
        // Order saved successfully to backend
      } else {
        // Backend failed, but continue to send emails
        await backendResponse.text();
      }
    } catch {
      // Backend connection error, continue to send emails anyway
    }

    // Send confirmation email to customer
    const customerEmail = await sendPreOrderConfirmation({
      email,
      firstName,
      lastName,
      quantity,
      color,
      totalPrice,
    });

    if (!customerEmail.success) {
      console.error("Failed to send customer email:", customerEmail.error);
    }

    // Send notification email to internal team
    const teamEmail = await sendPreOrderNotification({
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
    });

    if (!teamEmail.success) {
      console.error("Failed to send team notification:", teamEmail.error);
    }

    // Return success even if emails fail (don't block the order)
    return json({
      success: true,
      message: "Pre-orden realizada exitosamente",
      orderId,
    });
  } catch (error) {
    console.error("Pre-order error:", error);
    return json(
      { error: "Error al procesar la pre-orden" },
      { status: 500 }
    );
  }
}
