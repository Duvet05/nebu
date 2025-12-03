// Archivo para funciones de recursos relacionados con productos

export async function fetchProductInventory(productId: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/inventory?productId=${encodeURIComponent(productId)}`);
    const data = await res.json();
    if (data.availableUnits !== undefined) {
      return data.availableUnits;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch inventory:", err);
    return null;
  }
}
