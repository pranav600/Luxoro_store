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
  clearCart: () => Promise<void>;
  clearCartCompletely: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  totalItems: number;
  syncCartWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// API Base URL
// Replace 'your-backend-app-name' with your actual Render service name
const API_BASE_URL = "https://luxoro-store-backend.onrender.com/api";

// API utility functions
const cartAPI = {
  async fetchCart(token: string): Promise<CartItem[]> {
    console.log(
      "🔍 Fetching cart with token:",
      token ? "Token present" : "No token"
    );
    console.log("🔍 API Base URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🔍 Cart fetch response status:", response.status);
    console.log("🔍 Cart fetch response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Cart fetch failed:", response.status, errorText);
      throw new Error(
        `Failed to fetch cart: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("🔍 Cart data received:", data);

    if (!data.items) {
      console.warn("⚠️ No items field in response, returning empty array");
      return [];
    }

    return data.items.map((item: any) => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      size: item.size, // Added size field that was missing
      quantity: item.quantity,
    }));
  },

  async saveCart(token: string, items: CartItem[]): Promise<void> {
    console.log("💾 Saving cart with", items.length, "items");

    const cartItems = items.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: item.size, // Include size field
      quantity: item.quantity,
    }));

    console.log("💾 Mapped cart items:", cartItems);

    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: cartItems }),
    });

    console.log("💾 Save cart response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Save cart failed:", response.status, errorText);
      throw new Error(`Failed to save cart: ${response.status} - ${errorText}`);
    }

    console.log("✅ Cart saved successfully");
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousUser, setPreviousUser] = useState<typeof user>(null);
  const [tokenState, setTokenState] = useState(token);

  // Detect logout and clear local cart only (preserve backend cart)
  useEffect(() => {
    const handleLogout = async () => {
      // Check if user just logged out (was logged in, now not)
      if (previousUser && !user) {
        console.log("🚪 User logged out, clearing local cart only...");

        // Clear local cart immediately (but preserve backend cart for next login)
        setCart([]);
        clearLocalCart();
        console.log("✅ Local cart cleared on logout (backend cart preserved)");
      }

      // Update previous user state
      setPreviousUser(user);
    };

    handleLogout();
  }, [user]);

  // Initialize cart based on user authentication state
  useEffect(() => {
    const initializeCart = async () => {
      console.log("🚀 Initializing cart...");
      console.log(
        "🔍 User:",
        user ? `${user.name} (${user.email})` : "Not logged in"
      );
      console.log(
        "🔍 Token:",
        token ? `${token.substring(0, 20)}...` : "No token"
      );

      if (user && token) {
        // User is logged in - fetch cart from backend
        try {
          console.log("🔄 Attempting to fetch cart from backend...");
          const backendCart = await cartAPI.fetchCart(token);
          setCart(backendCart);
          console.log(
            "✅ Cart loaded from backend:",
            backendCart.length,
            "items"
          );
        } catch (error) {
          console.error("❌ Failed to fetch cart from backend:", error);
          // Fallback to localStorage
          const localCart = loadCart();
          setCart(localCart);
          console.log(
            "⚠️ Fallback to localStorage cart:",
            localCart.length,
            "items"
          );

          // If we have local cart items, try to sync them to backend
          if (localCart.length > 0) {
            try {
              console.log("🔄 Attempting to sync local cart to backend...");
              await cartAPI.saveCart(token, localCart);
              console.log("✅ Local cart synced to backend");
            } catch (syncError) {
              console.error(
                "❌ Failed to sync local cart to backend:",
                syncError
              );
            }
          }
        }
      } else {
        // User is not logged in - load from localStorage
        const localCart = loadCart();
        setCart(localCart);
        console.log(
          "📱 Cart loaded from localStorage:",
          localCart.length,
          "items"
        );
      }
      setIsInitialized(true);
      console.log("✅ Cart initialization complete");
    };

    // Add a small delay to ensure auth context is fully initialized
    const timeoutId = setTimeout(initializeCart, 100);
    return () => clearTimeout(timeoutId);
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

  const clearCart = async () => {
    setCart([]);
    saveCart([]);

    // If user is authenticated, clear cart on backend
    if (user && token) {
      try {
        await cartAPI.clearCart(token);
      } catch (error) {
        console.error("Failed to clear cart on backend:", error);
        // Don't throw here to prevent UI issues
      }
    }
  };

  const clearCartCompletely = () => {
    setCart([]);
    clearLocalCart();
    // Also clear from backend if user is authenticated
    if (user && token) {
      cartAPI.clearCart(token).catch((error) => {
        console.error("Failed to clear cart from backend:", error);
      });
    }
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
        clearCartCompletely,
        updateQuantity,
        totalItems,
        syncCartWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
