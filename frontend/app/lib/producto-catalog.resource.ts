// Archivo para funciones de recursos relacionados con productos

export async function fetchProductInventory(productName: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/inventory?product=${encodeURIComponent(productName)}`);
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
