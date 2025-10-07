import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createCharge } from "~/lib/culqi.server";
import {
  sendPreOrderConfirmation,
  sendPreOrderNotification,
} from "~/lib/resend.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();

    // Extract Culqi token
    const culqiToken = formData.get("token") as string;

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

    // Validate required fields
    if (!culqiToken || !email || !firstName || !lastName || !phone || !address || !city) {
      return json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Create Culqi charge
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
      return json(
        { error: chargeResult.error || "Error al procesar el pago" },
        { status: 400 }
      );
    }

    const charge = chargeResult.data;

    // Send confirmation email to customer
    await sendPreOrderConfirmation({
      email,
      firstName,
      lastName,
      quantity,
      color,
      totalPrice,
    });

    // Send notification email to internal team
    await sendPreOrderNotification({
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
      paymentMethod: "Culqi - Tarjeta",
    });

    return json({
      success: true,
      chargeId: charge.id,
      message: "Pago procesado exitosamente",
    });
  } catch (error) {
    console.error("Payment error:", error);
    return json(
      { error: "Error al procesar el pago" },
      { status: 500 }
    );
  }
}
