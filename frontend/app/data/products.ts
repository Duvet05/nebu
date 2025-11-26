export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  colors: ProductColor[];
  category: "plushie" | "subscription" | "accessory";
  ageRange: string;
  features: string[];
  inStock: boolean;
  stockCount?: number;
  badge?: string;
  preOrder?: boolean;
  depositAmount?: number; // 50% deposit
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  gradient: string;
}

export const productColors: ProductColor[] = [
  { id: "aqua", name: "Aqua", hex: "#4ECDC4", gradient: "from-teal-400 to-cyan-500" },
  { id: "dusk", name: "Anochecer", hex: "#6366F1", gradient: "from-indigo-500 to-purple-600" },
  { id: "quartz", name: "Cuarzo", hex: "#EC4899", gradient: "from-pink-500 to-rose-600" },
  { id: "flare", name: "Destello", hex: "#F59E0B", gradient: "from-amber-500 to-orange-600" },
  { id: "forest", name: "Bosque", hex: "#10B981", gradient: "from-green-500 to-emerald-600" },
  { id: "lavender", name: "Lavanda", hex: "#A78BFA", gradient: "from-purple-400 to-violet-500" },
];

export const products: Product[] = [
  {
    id: "nebu-dino",
    name: "Nebu Dino",
    slug: "nebu-dino",
    description: "El primer compañero IoT que transforma el aprendizaje en aventuras sin pantallas. Nebu Dino es un adorable dinosaurio de peluche con inteligencia artificial que acompaña a los niños en su viaje de descubrimiento y aprendizaje.",
    shortDescription: "Dinosaurio inteligente con IA para niños de 4-9 años",
    price: 380,
    images: [
      "/assets/products/nebu-dino-main.jpg",
      "/assets/products/nebu-dino-side.jpg",
      "/assets/products/nebu-dino-detail.jpg",
    ],
    colors: productColors.slice(0, 4), // Aqua, Dusk, Quartz, Flare
    category: "plushie",
    ageRange: "4-9 años",
    features: [
      "Inteligencia Artificial conversacional",
      "Conexión WiFi y Bluetooth",
      "Batería recargable (8h de autonomía)",
      "Materiales hipoalergénicos certificados",
      "Control parental avanzado",
      "Actualizaciones de software gratuitas",
      "Garantía de 12 meses",
      "Certificación kidSAFE y COPPA",
    ],
    inStock: true,
    stockCount: 20,
    badge: "mostPopular",
    preOrder: true,
    depositAmount: 190, // 50% of 380
  },
  {
    id: "nebu-gato",
    name: "Nebu Gato",
    slug: "nebu-gato",
    description: "¡El nuevo integrante de la familia Nebu! Un adorable gatito con la misma inteligencia artificial y funcionalidades educativas que aman los niños. Perfecto para quienes prefieren los felinos.",
    shortDescription: "Gatito inteligente con IA, ideal para amantes de gatos",
    price: 380,
    images: [
      "/assets/products/nebu-gato-main.jpg",
      "/assets/products/nebu-gato-side.jpg",
      "/assets/products/nebu-gato-detail.jpg",
    ],
    colors: productColors.slice(0, 4), // Aqua, Dusk, Quartz, Flare
    category: "plushie",
    ageRange: "4-9 años",
    features: [
      "Misma IA avanzada que Nebu Dino",
      "Sonidos y personalidad de gatito",
      "Conexión WiFi y Bluetooth",
      "Batería recargable (8h de autonomía)",
      "Materiales hipoalergénicos certificados",
      "Control parental avanzado",
      "Actualizaciones de software gratuitas",
      "Garantía de 12 meses",
    ],
    inStock: false,
    badge: "comingSoon",
    preOrder: true,
    depositAmount: 190,
  },
  {
    id: "nebu-conejo",
    name: "Nebu Conejo",
    slug: "nebu-conejo",
    description: "¡Suave, tierno y súper inteligente! Nebu Conejo trae toda la magia del aprendizaje sin pantallas con un diseño encantador de conejito que los niños adorarán abrazar.",
    shortDescription: "Conejito inteligente perfecto para los más pequeños",
    price: 380,
    images: [
      "/assets/products/nebu-conejo-main.jpg",
      "/assets/products/nebu-conejo-side.jpg",
      "/assets/products/nebu-conejo-detail.jpg",
    ],
    colors: [productColors[0], productColors[2], productColors[4], productColors[5]], // Aqua, Quartz, Forest, Lavender
    category: "plushie",
    ageRange: "4-9 años",
    features: [
      "Diseño extra suave y abrazable",
      "IA conversacional educativa",
      "Conexión WiFi y Bluetooth",
      "Batería recargable (8h de autonomía)",
      "Materiales hipoalergénicos certificados",
      "Control parental avanzado",
      "Actualizaciones de software gratuitas",
      "Garantía de 12 meses",
    ],
    inStock: false,
    badge: "comingSoon",
    preOrder: true,
    depositAmount: 190,
  },
  {
    id: "nebu-oso",
    name: "Nebu Oso",
    slug: "nebu-oso",
    description: "El clásico osito de peluche reimaginado con tecnología de punta. Nebu Oso combina la nostalgia de un oso de peluche tradicional con las capacidades educativas más avanzadas.",
    shortDescription: "Osito clásico con inteligencia artificial moderna",
    price: 380,
    images: [
      "/assets/products/nebu-oso-main.jpg",
      "/assets/products/nebu-oso-side.jpg",
      "/assets/products/nebu-oso-detail.jpg",
    ],
    colors: [productColors[0], productColors[1], productColors[3], productColors[4]], // Aqua, Dusk, Flare, Forest
    category: "plushie",
    ageRange: "4-9 años",
    features: [
      "Diseño clásico atemporal",
      "IA educativa avanzada",
      "Conexión WiFi y Bluetooth",
      "Batería recargable (8h de autonomía)",
      "Materiales hipoalergénicos certificados",
      "Control parental avanzado",
      "Actualizaciones de software gratuitas",
      "Garantía de 12 meses",
    ],
    inStock: false,
    badge: "comingSoon",
    preOrder: true,
    depositAmount: 190,
  },
  {
    id: "nebu-dragon",
    name: "Nebu Dragón",
    slug: "nebu-dragon",
    description: "¡Para los pequeños aventureros! Nebu Dragón trae toda la emoción de las historias épicas con la misma tecnología educativa que caracteriza a la familia Nebu.",
    shortDescription: "Dragón mágico con IA para aventuras épicas",
    price: 380,
    images: [
      "/assets/products/nebu-dragon-main.jpg",
      "/assets/products/nebu-dragon-side.jpg",
      "/assets/products/nebu-dragon-detail.jpg",
    ],
    colors: [productColors[1], productColors[2], productColors[3], productColors[4]], // Dusk, Quartz, Flare, Forest
    category: "plushie",
    ageRange: "4-9 años",
    features: [
      "Diseño de dragón amigable",
      "Historias y aventuras interactivas",
      "Conexión WiFi y Bluetooth",
      "Batería recargable (8h de autonomía)",
      "Materiales hipoalergénicos certificados",
      "Control parental avanzado",
      "Actualizaciones de software gratuitas",
      "Garantía de 12 meses",
    ],
    inStock: false,
    badge: "comingSoon",
    preOrder: true,
    depositAmount: 190,
  },
];

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getAvailableProducts(): Product[] {
  return products.filter(p => p.inStock);
}

export function getPreOrderProducts(): Product[] {
  return products.filter(p => p.preOrder);
}

export function getProductsByCategory(category: Product["category"]): Product[] {
  return products.filter(p => p.category === category);
}
