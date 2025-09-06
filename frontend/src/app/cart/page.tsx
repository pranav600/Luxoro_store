"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "../../context/cart-context";
import { useAuth } from "../../context/auth-context";
import { FiShoppingCart, FiLogIn, FiFrown } from "react-icons/fi";
import { useRouter } from "next/navigation";

// Skeleton Components
const CartItemSkeleton = () => (
  <div className="grid grid-cols-12 gap-2 px-6 py-4 items-center border-b border-gray-300 animate-pulse">
    <div className="col-span-5 flex items-center gap-3">
      <div className="w-14 h-20 bg-gray-200 rounded-md"></div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    <div className="col-span-2 text-center">
      <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
    </div>
    <div className="col-span-2 flex justify-center items-center gap-2">
      <div className="w-7 h-7 bg-gray-200 rounded"></div>
      <div className="w-12 h-7 bg-gray-200 rounded"></div>
      <div className="w-7 h-7 bg-gray-200 rounded"></div>
    </div>
    <div className="col-span-2 text-center">
      <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
    </div>
    <div className="col-span-1 text-center">
      <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
    </div>
  </div>
);

const SummarySkeleton = () => (
  <div className="w-full md:w-96 bg-white rounded-lg shadow p-6 h-max flex flex-col gap-4 animate-pulse">
    <div className="flex items-center gap-2">
      <div className="flex-1 h-10 bg-gray-200 rounded"></div>
      <div className="w-20 h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-4 bg-gray-200 rounded w-12"></div>
    </div>
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-8"></div>
    </div>
    <div className="flex justify-between border-t pt-2">
      <div className="h-5 bg-gray-200 rounded w-12"></div>
      <div className="h-5 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
  </div>
);
export default function CartPage() {
  const { cart, totalItems, removeFromCart, updateQuantity } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isCartLoading, setIsCartLoading] = useState(true);
  
  const handleCheckout = () => {
    if (!user) {
      // Redirect to login page with a return URL
      router.push('/login?redirect=/cart');
      return;
    }
    
    // Save promo code data to localStorage for checkout
    const promoData = {
      appliedPromo,
      discountPercentage,
      discountAmount
    };
    localStorage.setItem(`checkout_promo_${user._id}`, JSON.stringify(promoData));
    
    // Proceed to checkout
    router.push('/checkout');
  };
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoError, setPromoError] = useState("");

  // Load promo code from localStorage on component mount
  useEffect(() => {
    if (user?._id) {
      const savedPromo = localStorage.getItem(`cart_promo_${user._id}`);
      if (savedPromo) {
        setAppliedPromo(savedPromo);
      }
    }
  }, [user]);

  // Clear promo code when cart becomes empty
  useEffect(() => {
    if (cart.length === 0 && appliedPromo) {
      setAppliedPromo("");
      setPromoError("");
      if (user?._id) {
        localStorage.removeItem(`cart_promo_${user._id}`);
      }
    }
  }, [cart.length, appliedPromo, user]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCartLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate shipping cost (0 when cart is empty)
  const shippingCost = cart.length === 0 ? 0 : (totalAmount < 5000 ? 250 : 0);
  
  // Calculate discount
  const discountPercentage = appliedPromo === "LUXORO10" ? 10 : 0;
  const discountAmount = (totalAmount * discountPercentage) / 100;
  
  // Calculate final total
  const finalTotal = totalAmount - discountAmount + shippingCost;
  
  // Handle promo code submission
  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    
    if (promoCode.toUpperCase() === "LUXORO10") {
      setAppliedPromo("LUXORO10");
      setPromoCode("");
      // Save to localStorage for persistence
      if (user?._id) {
        localStorage.setItem(`cart_promo_${user._id}`, "LUXORO10");
      }
    } else if (promoCode.trim() !== "") {
      setPromoError("Invalid promo code");
    }
  };
  
  // Remove applied promo
  const removePromo = () => {
    setAppliedPromo("");
    setPromoError("");
    // Remove from localStorage
    if (user?._id) {
      localStorage.removeItem(`cart_promo_${user._id}`);
    }
  };

  // Show skeleton loading state
  if (isCartLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col md:flex-row gap-8 pt-25">
        {/* Cart Table Skeleton */}
        <div className="flex-1 bg-white shadow rounded-lg p-10">
          <h2 className="text-4xl font-bold border-b py-2 border-gray-300 text-black text-center font-mono">
            <FiShoppingCart className="inline-block mr-2" />
            Cart
          </h2>
          <div>
            <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-gray-300 text-gray-600 text-xs font-mono">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Each</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
              <div className="col-span-1"></div>
            </div>
            {[...Array(3)].map((_, index) => (
              <CartItemSkeleton key={index} />
            ))}
            <div className="flex justify-between items-center px-6 py-4 text-sm font-mono text-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
        {/* Summary Skeleton */}
        <SummarySkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row gap-8 pt-25">
      {/* Cart Table */}
      <div className="flex-1 bg-white shadow rounded-lg p-10">
        <h2 className="text-4xl font-bold border-b py-2 border-gray-300 text-black text-center font-mono">
          <FiShoppingCart className="inline-block mr-2" />
          Cart
        </h2>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <FiFrown className="text-7xl mb-6 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 font-mono">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-8 text-center max-w-md font-mono">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold font-mono hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-gray-300 text-gray-600 text-xs font-mono">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Each</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
              <div className="col-span-1"></div>
            </div>
            {cart.map((item) => (
              <div
                key={item.id + (item.size || "")}
                className="grid grid-cols-12 gap-2 px-6 py-4 items-center border-b border-gray-300 hover:bg-gray-50 transition"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-20 object-cover rounded-md border"
                  />
                  <div>
                    <div className="font-semibold text-sm text-gray-600 leading-tight">
                      {item.name}
                    </div>
                    {item.size && (
                      <div className="text-xs text-gray-400 mt-1">
                        Size: {item.size}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-center text-gray-600 font-mono">
                  ₹{item.price}
                </div>
                <div className="col-span-2 flex justify-center items-center gap-2">
                  <button
                    className="w-7 h-7 border rounded text-gray-500 text-lg font-bold cursor-pointer"
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                  >
                    -
                  </button>
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, Number(e.target.value))
                    }
                    className="border rounded text-gray-500 px-1 py-0.5 text-sm cursor-pointer font-mono"
                  >
                    {[...Array(5).keys()].map((i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    className="w-7 h-7 border rounded text-gray-500 text-lg font-bold cursor-pointer"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="col-span-2 text-center font-semibold text-gray-600 font-mono">
                  ₹{item.price * item.quantity}
                </div>
                <div className="col-span-1 text-center">
                  <button
                    className="text-xs text-red-500 hover:underline cursor-pointer font-mono"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center px-6 py-4 text-sm font-mono text-gray-700">
              <div>
                {cart.length} Item{cart.length !== 1 && "s"}
              </div>
              <div className="font-semibold">₹{totalAmount}</div>
            </div>
          </div>
        )}
      </div>
      {/* Summary */}
      <div className="w-full md:w-96 bg-white rounded-lg shadow p-6 h-max flex flex-col gap-4">
        {cart.length > 0 && (
          <>
            <form className="flex items-center gap-2" onSubmit={handlePromoSubmit}>
              <input
                type="text"
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 border rounded text-gray-500 border-gray-300 px-3 py-2 text-sm outline-none font-mono"
                disabled={appliedPromo !== ""}
              />
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded font-semibold text-sm cursor-pointer font-mono hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={appliedPromo !== "" || promoCode.trim() === ""}
              >
                Submit
              </button>
            </form>
            
            {/* Promo code status */}
            {appliedPromo && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                <span className="text-green-700 text-sm font-mono">
                   "{appliedPromo}"
                </span>
                <button
                  onClick={removePromo}
                  className="text-red-500 text-xs hover:underline font-mono cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
            
            {promoError && (
              <div className="bg-red-50 border border-red-200 rounded px-3 py-2">
                <span className="text-red-700 text-sm font-mono">{promoError}</span>
              </div>
            )}
          </>
        )}
        {cart.length > 0 && (
          <>
            <div className="flex justify-between text-sm font-mono text-gray-600">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm font-mono text-green-600">
                <span>Discount ({discountPercentage}%)</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm font-mono text-gray-600">
              <span>Shipping cost</span>
              <span>{shippingCost > 0 ? `₹${shippingCost}` : '₹0'}</span>
            </div>
            
            {totalAmount >= 5000 && (
              <div className="text-xs text-green-600 font-mono">
                🎉 Hurry up! You get free shipping.
              </div>
            )}

            <div className="flex justify-between text-lg font-mono font-bold mt-2 text-gray-600 border-t pt-2">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </>
        )}
        {user ? (
          <button
            onClick={handleCheckout}
            className="w-full bg-black text-white font-mono py-3 px-6 rounded-lg font-medium transition-colors cursor-pointer"
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </button>
        ) : (
          <button
            onClick={handleCheckout}
            className="w-full flex items-center justify-center font-mono gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <FiLogIn className="text-lg" />
            Login to Checkout
          </button>
        )}
      </div>
    </div>
  );
}
