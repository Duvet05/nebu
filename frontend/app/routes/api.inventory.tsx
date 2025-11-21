import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const product = url.searchParams.get("product") || "Nebu Dino";

    const response = await fetch(`${BACKEND_URL}/inventory/${encodeURIComponent(product)}`);

    if (!response.ok) {
      return data({ availableUnits: 20 }, { status: 200 }); // Fallback
    }

    const inventory = await response.json();

    return data({
      product: inventory.product,
      availableUnits: inventory.availableUnits,
      totalUnits: inventory.totalUnits,
      reservedUnits: inventory.reservedUnits,
      soldUnits: inventory.soldUnits,
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    // Return fallback data if backend is down
    return data({ availableUnits: 20 }, { status: 200 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const productId = formData.get("productId") as string;
    const productName = formData.get("productName") as string;

    if (!email || !productId || !productName) {
      return data({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return data({ error: "Email inválido" }, { status: 400 });
    }

    // Send to backend
    const response = await fetch(`${BACKEND_URL}/inventory/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        productId,
        productName,
      }),
    });

    if (!response.ok) {
      // If backend fails, we could store locally or log
      console.error("Failed to register back-in-stock notification", await response.text());
      // Still return success to user - we'll handle it manually if needed
    }

    return data({
      success: true,
      message: `¡Perfecto! Te notificaremos a ${email} cuando ${productName} esté disponible.`,
    });
  } catch (error) {
    console.error("Back in stock notification error:", error);
    return data(
      { error: "Error al registrar la notificación. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}
