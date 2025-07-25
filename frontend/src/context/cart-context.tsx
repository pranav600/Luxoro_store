"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem, callback?: () => void) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  totalItems: number;
  syncCartWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// API Base URL
const API_BASE_URL = "http://localhost:8000/api";

// API utility functions
const cartAPI = {
  async fetchCart(token: string): Promise<CartItem[]> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch cart");
    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    }));
  },

  async saveCart(token: string, items: CartItem[]): Promise<void> {
    const cartItems = items.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    }));

    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: cartItems }),
    });
    if (!response.ok) throw new Error("Failed to save cart");
  },

  async clearCart(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to clear cart");
  },
};

// Utility for localStorage (fallback for non-authenticated users)
const CART_KEY = "luxoro_cart";
function saveCart(cart: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}
function loadCart(): CartItem[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) return JSON.parse(stored);
  }
  return [];
}
function clearLocalCart() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CART_KEY);
  }
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart based on user authentication state
  useEffect(() => {
    const initializeCart = async () => {
      if (user && token) {
        // User is logged in - fetch cart from backend
        try {
          const backendCart = await cartAPI.fetchCart(token);
          setCart(backendCart);
        } catch (error) {
          console.error("Failed to fetch cart from backend:", error);
          // Fallback to localStorage
          const localCart = loadCart();
          setCart(localCart);
        }
      } else {
        // User is not logged in - load from localStorage
        const localCart = loadCart();
        setCart(localCart);
      }
      setIsInitialized(true);
    };

    initializeCart();
  }, [user, token]);

  // Save cart to appropriate storage when cart changes
  useEffect(() => {
    if (!isInitialized) return;

    if (user && token) {
      // Save to backend for authenticated users
      cartAPI.saveCart(token, cart).catch((error) => {
        console.error("Failed to save cart to backend:", error);
        // Fallback to localStorage
        saveCart(cart);
      });
    } else {
      // Save to localStorage for non-authenticated users
      saveCart(cart);
    }
  }, [cart, user, token, isInitialized]);

  const addToCart = (item: CartItem, callback?: () => void) => {
    setCart((prev: CartItem[]) => {
      let updated: CartItem[];
      const existing = prev.find(
        (i: CartItem) => i.id === item.id && i.size === item.size
      );
      if (existing) {
        updated = prev.map((i: CartItem) =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        updated = [...prev, item];
      }
      return updated;
    });

    // Execute callback asynchronously to avoid setState during render
    if (callback) {
      setTimeout(callback, 0);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    // Clear from localStorage when user logs out
    clearLocalCart();
  };

  const syncCartWithBackend = async () => {
    if (!user || !token) {
      console.warn("Cannot sync cart: user not authenticated");
      return;
    }

    try {
      await cartAPI.saveCart(token, cart);
      console.log("Cart synced with backend successfully");
    } catch (error) {
      console.error("Failed to sync cart with backend:", error);
      throw error;
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        totalItems,
        syncCartWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
