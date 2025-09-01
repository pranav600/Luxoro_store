"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiHome,
  FiBriefcase,
  FiPhone,
  FiCreditCard,
  FiTruck,
  FiArrowLeft,
} from "react-icons/fi";
import { useAuth } from "../../context/auth-context";
import { useCart } from "../../context/cart-context";

type AddressType = "home" | "work" | "other";

interface Address {
  id: string;
  type: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}


export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [promoData, setPromoData] = useState<any>(null);

  // Get user-specific localStorage key
  const getStorageKey = () => {
    return user?._id ? `addresses_${user._id}` : 'addresses';
  };

  // Load addresses and promo data from localStorage
  const loadAddresses = () => {
    if (!user?._id) return;

    try {
      const storageKey = getStorageKey();
      const storedAddresses = localStorage.getItem(storageKey);
      if (storedAddresses) {
        const addressList = JSON.parse(storedAddresses);
        setAddresses(addressList);
        // Auto-select default address
        const defaultAddress = addressList.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }

      // Load promo data
      const promoStorageKey = `checkout_promo_${user._id}`;
      const storedPromoData = localStorage.getItem(promoStorageKey);
      if (storedPromoData) {
        setPromoData(JSON.parse(storedPromoData));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // Save addresses to localStorage
  const saveAddresses = (addressList: Address[]) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(addressList));
    } catch (err) {
      console.error('Error saving addresses:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (cart.length === 0) {
      router.push('/cart');
      return;
    }
    loadAddresses();
  }, [user, cart, router]);


  // Place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Calculate total with promo
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discountAmount = promoData ? promoData.discountAmount : 0;
      const shipping = subtotal >= 1000 ? 0 : 50;
      const total = subtotal - discountAmount + shipping;

      // Create order object
      const order = {
        id: Date.now().toString(),
        userId: user?._id,
        items: cart,
        address: selectedAddress,
        paymentMethod: "COD",
        total: total,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Save order to localStorage (you can replace this with API call later)
      const existingOrders = JSON.parse(localStorage.getItem(`orders_${user?._id}`) || '[]');
      existingOrders.push(order);
      localStorage.setItem(`orders_${user?._id}`, JSON.stringify(existingOrders));

      // Clear cart and promo data
      clearCart();
      if (user?._id) {
        localStorage.removeItem(`checkout_promo_${user._id}`);
        localStorage.removeItem(`cart_promo_${user._id}`);
      }

      // Show success animation
      setShowSuccessAnimation(true);
      
      // Redirect to home page after animation
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const getAddressIcon = (type: AddressType) =>
    type === "home" ? (
      <FiHome className="w-5 h-5 text-gray-500" />
    ) : type === "work" ? (
      <FiBriefcase className="w-5 h-5 text-gray-500" />
    ) : (
      <FiMapPin className="w-5 h-5 text-gray-500" />
    );

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = promoData ? promoData.discountAmount : 0;
  const shipping = subtotal >= 1000 ? 0 : 50;
  const finalTotal = subtotal - discountAmount + shipping;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-25">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl transform animate-bounce">
            <div className="text-6xl mb-4 animate-pulse">✅</div>
            <h2 className="text-2xl font-bold font-mono text-gray-800 mb-2">Order Placed!</h2>
            <p className="text-gray-600 font-mono">Redirecting to home page...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center font-mono text-gray-600 hover:text-black mr-4 cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold font-mono text-gray-800 flex items-center">
                  <FiMapPin className="w-5 h-5 mr-2" />
                  Select Delivery Address
                </h2>
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center font-mono text-blue-600 hover:text-blue-800 text-sm"
                >
                  <FiPlus className="w-4 h-4 mr-1" />
                  Manage Addresses
                </button>
              </div>

              {/* Address List */}
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiMapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-mono">No addresses found</p>
                  <button
                    onClick={() => router.push("/profile")}
                    className="mt-2 font-mono text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Add address in Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 font-mono cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getAddressIcon(address.type)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-800">
                                {address.fullName}
                              </p>
                              {address.isDefault && (
                                <span className="px-2 py-1 text-xs bg-black text-white rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">
                              {address.addressLine1}
                              {address.addressLine2 &&
                                `, ${address.addressLine2}`}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {address.city}, {address.state}{" "}
                              {address.postalCode}
                            </p>
                            <p className="text-gray-600 text-sm flex items-center mt-1">
                              <FiPhone className="w-4 h-4 mr-1" />
                              {address.phone}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={selectedAddress?.id === address.id}
                          onChange={() => setSelectedAddress(address)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold font-mono text-gray-800 flex items-center mb-4">
                <FiCreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </h2>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FiTruck className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium font-mono text-gray-800">
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-sm font-mono text-gray-600">
                      Pay when your order is delivered
                    </p>
                  </div>
                  <input
                    type="radio"
                    checked={true}
                    readOnly
                    className="ml-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold font-mono text-gray-800 mb-4">
              Order Summary
            </h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium font-mono text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs font-mono text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium font-mono text-gray-600">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm font-mono text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {promoData && promoData.appliedPromo && (
                <div className="flex justify-between text-sm font-mono text-green-600">
                  <span>Discount ({promoData.appliedPromo})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-mono text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </span>
              </div>
              {shipping === 0 && (
                <div className="text-xs text-green-600">
                  🎉 Free shipping on orders above ₹1000
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2 font-mono text-gray-600">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!selectedAddress || isPlacingOrder}
              className="w-full bg-black text-white font-mono py-3 px-6 rounded-lg font-medium transition-colors mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
