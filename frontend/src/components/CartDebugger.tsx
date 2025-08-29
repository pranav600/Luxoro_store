"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';

export default function CartDebugger() {
  const { user, token, isLoading } = useAuth();
  const { cart, totalItems } = useCart();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        authLoading: isLoading,
        hasUser: !!user,
        hasToken: !!token,
        userEmail: user?.email,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
        cartItems: cart.length,
        totalItems,
        localStorage: {
          hasToken: !!localStorage.getItem('token'),
          hasUser: !!localStorage.getItem('user'),
          hasCart: !!localStorage.getItem('luxoro_cart'),
        }
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);
    return () => clearInterval(interval);
  }, [user, token, isLoading, cart, totalItems]);

  const testAddItem = () => {
    const testItem = {
      id: 'test-' + Date.now(),
      name: 'Test Product',
      price: 99.99,
      image: '/test-image.jpg',
      size: 'M',
      quantity: 1
    };
    // addToCart(testItem);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Cart Debug Info</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <button 
        onClick={testAddItem}
        className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs"
      >
        Add Test Item
      </button>
    </div>
  );
}
