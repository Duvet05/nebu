import { data, type ActionFunctionArgs } from "@remix-run/node";
import { createCharge } from "~/lib/culqi.server";
import { apiClient } from "~/lib/api-client";
import { z } from "zod";

// Schema for pre-order validation
const PreOrderRequestSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres"),
  phone: z.string().min(9, "Teléfono inválido"),
  address: z.string().min(10, "Dirección debe tener al menos 10 caracteres"),
  city: z.string().min(2, "Ciudad es requerida"),
  postalCode: z.string().optional(),
  quantity: z.number().int().positive().max(5),
  color: z.string().min(1),
  totalPrice: z.number().positive(),
  paymentMethod: z.enum(["culqi", "yape", "transfer"]),
  productSlug: z.string().min(1),
  culqiToken: z.string().nullable().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();

    // Extract and parse form data
    const rawData = {
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
      quantity: parseInt(formData.get("quantity") as string),
      color: formData.get("color") as string,
      totalPrice: parseFloat(formData.get("totalPrice") as string),
      paymentMethod: formData.get("paymentMethod") as string,
      productSlug: formData.get("productSlug") as string,
      culqiToken: formData.get("culqiToken") as string | null,
    };

    // Validate with Zod
    const validatedData = PreOrderRequestSchema.parse(rawData);

    // Si el método de pago es Culqi, procesar el cargo
    let culqiChargeId: string | null = null;
    if (validatedData.paymentMethod === "culqi" && validatedData.culqiToken) {
      const chargeResult = await createCharge(validatedData.culqiToken, {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        postalCode: validatedData.postalCode || "",
        quantity: validatedData.quantity,
        color: validatedData.color,
        totalPrice: validatedData.totalPrice,
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
      await apiClient.post('/leads/pre-order', {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        productSlug: validatedData.productSlug,
        metadata: {
          color: validatedData.color,
          quantity: validatedData.quantity,
          totalPrice: validatedData.totalPrice,
          address: validatedData.address,
          city: validatedData.city,
          postalCode: validatedData.postalCode,
          paymentMethod: validatedData.paymentMethod,
          source: "website_pre_order",
          userAgent: request.headers.get("user-agent"),
        },
      });
    } catch (error) {
      console.error("Failed to save pre-order lead to backend:", error);
      // Continue even if backend fails
    }

    // Save order to backend database
    let orderId: string | null = null;
    try {
      const order = await apiClient.post<{ id: string; orderNumber?: string }>('/orders', {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        postalCode: validatedData.postalCode,
        product: "Nebu",
        color: validatedData.color,
        quantity: validatedData.quantity,
        totalPrice: validatedData.totalPrice,
        paymentMethod: validatedData.paymentMethod,
        culqiChargeId,
        metadata: {
          source: "website",
          userAgent: request.headers.get("user-agent"),
          paymentStatus: culqiChargeId ? "paid" : "pending",
        },
      });
      
      orderId = order.id;
    } catch (error) {
      console.error("Failed to save order to backend:", error);
      // Backend connection error, continue to send emails anyway
    }

    // Send confirmation email to customer via backend
    try {
      await apiClient.post('/email/public/pre-order-confirmation', {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        quantity: validatedData.quantity,
        color: validatedData.color,
        totalPrice: validatedData.totalPrice,
      });
    } catch (error) {
      console.error("Failed to send customer email via backend:", error);
    }

    // Send notification email to internal team via backend
    try {
      await apiClient.post('/email/public/pre-order-notification', {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        postalCode: validatedData.postalCode,
        quantity: validatedData.quantity,
        color: validatedData.color,
        totalPrice: validatedData.totalPrice,
        paymentMethod: validatedData.paymentMethod,
      });
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
    
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return data(
        { error: `${firstError.path.join('.')}: ${firstError.message}` },
        { status: 400 }
      );
    }

    return data(
      { error: "Error al procesar la pre-orden" },
      { status: 500 }
    );
  }
}
