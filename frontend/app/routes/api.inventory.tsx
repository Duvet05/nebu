import { json, type LoaderFunctionArgs } from "@remix-run/node";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const product = url.searchParams.get("product") || "Nebu Dino";

    const response = await fetch(`${BACKEND_URL}/inventory/${encodeURIComponent(product)}`);

    if (!response.ok) {
      return json({ availableUnits: 20 }, { status: 200 }); // Fallback
    }

    const inventory = await response.json();

    return json({
      product: inventory.product,
      availableUnits: inventory.availableUnits,
      totalUnits: inventory.totalUnits,
      reservedUnits: inventory.reservedUnits,
      soldUnits: inventory.soldUnits,
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    // Return fallback data if backend is down
    return json({ availableUnits: 20 }, { status: 200 });
  }
}
