"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiMapPin,
  FiPlus,
  FiHome,
  FiBriefcase,
  FiPhone,
  FiCreditCard,
  FiTruck,
  FiArrowLeft,
} from "react-icons/fi";
import { useAuth } from "../../context/auth-context";
import { useCart } from "../../context/cart-context";

// 🟢 Address Type
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
  const [promoData, setPromoData] = useState<any>(null);
  const [orderPlaced, setOrderPlaced] = useState(false); // 🟢 NEW FLAG

  // ✅ Fetch addresses from localStorage
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (cart.length === 0 && !orderPlaced) {
      // 🟢 Only redirect if no order has been placed
      router.push("/cart");
      return;
    }

    try {
      const storageKey = user?._id ? `addresses_${user._id}` : "addresses";
      const storedAddresses = localStorage.getItem(storageKey);

      if (storedAddresses) {
        const parsed = JSON.parse(storedAddresses);
        setAddresses(parsed);

        // Auto-select default
        const defaultAddress = parsed.find((addr: Address) => addr.isDefault);
        if (defaultAddress) setSelectedAddress(defaultAddress);
      }

      const promoKey = `checkout_promo_${user._id}`;
      const storedPromo = localStorage.getItem(promoKey);
      if (storedPromo) setPromoData(JSON.parse(storedPromo));
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }, [user, cart, router, orderPlaced]); // 🟢 added orderPlaced

  // 🟢 Place Order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const discountAmount = promoData ? promoData.discountAmount : 0;
      const shipping = subtotal >= 1000 ? 0 : 50;
      const total = subtotal - discountAmount + shipping;

      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: selectedAddress,
        paymentMethod: "COD",
        subtotal,
        discount: {
          amount: discountAmount,
          promoCode: promoData?.appliedPromo || null,
        },
        shippingCost: shipping,
        total,
      };

      const token = localStorage.getItem("token");
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://luxoro-store-backend.onrender.com";

      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create order");
      }

      // ✅ Redirect to order-success
      if (result.order && result.order._id) {
        clearCart();
        if (user?._id) {
          localStorage.removeItem(`checkout_promo_${user._id}`);
          localStorage.removeItem(`cart_promo_${user._id}`);
        }
        setOrderPlaced(true); // 🟢 Prevent redirect to /cart
        router.push(`/order-success?orderId=${result.order._id}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(
        `Failed to place order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // 🟢 Helpers
  const getAddressIcon = (type: AddressType) =>
    type === "home" ? (
      <FiHome className="w-5 h-5 text-gray-500" />
    ) : type === "work" ? (
      <FiBriefcase className="w-5 h-5 text-gray-500" />
    ) : (
      <FiMapPin className="w-5 h-5 text-gray-500" />
    );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = promoData ? promoData.discountAmount : 0;
  const shipping = subtotal >= 1000 ? 0 : 50;
  const finalTotal = subtotal - discountAmount + shipping;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12">
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
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
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

            {/* Payment Method */}
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
                  <input type="radio" checked readOnly className="ml-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
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
