import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, ProductColor } from '~/lib/api/products';
import { trackAddToCart } from '~/lib/facebook-pixel';

export interface CartItem {
  product: Product;
  color: ProductColor;
  quantity: number;
  isPreOrder?: boolean; // Flag para identificar productos de pre-orden
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, color: ProductColor, quantity?: number, isPreOrder?: boolean) => void;
  removeItem: (productId: string, colorId: string) => void;
  updateQuantity: (productId: string, colorId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nebu-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('nebu-cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = (product: Product, color: ProductColor, quantity: number = 1, isPreOrder: boolean = false) => {
    // Check stock availability before adding (skip for pre-orders)
    if (!isPreOrder && product.inStock && product.stockCount !== undefined) {
      // Get current quantity in cart for this product/color
      const existingItem = items.find(
        item => item.product.id === product.id && item.color.id === color.id
      );
      const currentQuantityInCart = existingItem?.quantity || 0;
      const newTotalQuantity = currentQuantityInCart + quantity;

      // Check if we have enough stock
      if (newTotalQuantity > product.stockCount) {
        const available = product.stockCount - currentQuantityInCart;
        if (available <= 0) {
          alert(`No hay más stock disponible de ${product.name}`);
          return;
        }
        alert(`Solo ${available} unidades disponibles de ${product.name}. Se agregará ${available} al carrito.`);
        quantity = available;
      }
    }

    setItems(currentItems => {
      // Check if item already exists
      const existingItemIndex = currentItems.findIndex(
        item => item.product.id === product.id && item.color.id === color.id
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        // Add new item
        return [...currentItems, { product, color, quantity, isPreOrder }];
      }
    });

    // Track AddToCart event in Facebook Pixel
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });

    // Show cart briefly when adding item
    setIsOpen(true);
    setTimeout(() => setIsOpen(false), 3000);
  };

  const removeItem = (productId: string, colorId: string) => {
    setItems(currentItems =>
      currentItems.filter(
        item => !(item.product.id === productId && item.color.id === colorId)
      )
    );
  };

  const updateQuantity = (productId: string, colorId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, colorId);
      return;
    }

    // Find the item to check stock
    const item = items.find(
      i => i.product.id === productId && i.color.id === colorId
    );

    if (item && item.product.inStock && item.product.stockCount !== undefined) {
      // Check if requested quantity exceeds stock
      if (quantity > item.product.stockCount) {
        alert(`Solo hay ${item.product.stockCount} unidades disponibles de ${item.product.name}`);
        quantity = item.product.stockCount;
      }
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId && item.color.id === colorId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Evitar hydration mismatch: no mostrar totalItems hasta que esté hidratado
  const totalItems = isHydrated ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const totalPrice = isHydrated ? items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) : 0;

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(prev => !prev);

  return (
    <CartContext.Provider
      value={{
        items: isHydrated ? items : [],
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartProvider;
