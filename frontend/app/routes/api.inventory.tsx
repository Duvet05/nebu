import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { apiClient } from "~/lib/api-client";
import { InventorySchema } from "~/lib/api/schemas";
import { getCached, CACHE_TTL } from "~/lib/cache";
import { z } from "zod";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");

    if (!productId) {
      return data({ error: "Product ID is required" }, { status: 400 });
    }

    const cacheKey = `inventory:${productId}`;

    const inventory = await getCached(
      cacheKey,
      async () => {
        const response = await apiClient.get<unknown>(`/inventory/${encodeURIComponent(productId)}/available`);
        return InventorySchema.parse(response);
      },
      CACHE_TTL.SHORT // 5 seconds cache for inventory
    );

    return data({
      productId: inventory.productId,
      availableUnits: inventory.availableUnits,
      totalUnits: inventory.totalUnits,
      isAvailable: inventory.isAvailable,
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    // Return fallback data if backend is down
    return data({ availableUnits: 20 }, { status: 200 });
  }
}

// Schema for notification request
const NotificationRequestSchema = z.object({
  email: z.string().email("Email inválido"),
  productId: z.string().min(1, "Product ID es requerido"),
  productName: z.string().min(1, "Product name es requerido"),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    
    // Extract and validate data
    const requestData = {
      email: formData.get("email") as string,
      productId: formData.get("productId") as string,
      productName: formData.get("productName") as string,
    };

    // Validate with Zod
    const validatedData = NotificationRequestSchema.parse(requestData);

    // Send to backend
    await apiClient.post('/inventory/notifications', validatedData);

    return data({
      success: true,
      message: `¡Perfecto! Te notificaremos a ${validatedData.email} cuando ${validatedData.productName} esté disponible.`,
    });
  } catch (error) {
    console.error("Back in stock notification error:", error);
    
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return data(
        { error: firstError.message },
        { status: 400 }
      );
    }

    return data(
      { error: "Error al registrar la notificación. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}
