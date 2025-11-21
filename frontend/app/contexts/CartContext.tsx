import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, ProductColor } from '~/data/products';
import { trackAddToCart } from '~/lib/facebook-pixel';

export interface CartItem {
  product: Product;
  color: ProductColor;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, color: ProductColor, quantity?: number) => void;
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
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('nebu-cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nebu-cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (product: Product, color: ProductColor, quantity: number = 1) => {
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
        return [...currentItems, { product, color, quantity }];
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
        items,
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
