"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiHome,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { useAuth } from "../../context/auth-context";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Address {
  id: string;
  type: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: Address;
  paymentMethod: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function OrderSuccessPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!orderId) {
      router.push('/');
      return;
    }

    // Load order from localStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem(`orders_${user._id}`) || '[]');
      const foundOrder = existingOrders.find((o: Order) => o.id === orderId);
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [user, orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your order. We'll send you a confirmation email shortly.</p>
          <p className="text-sm text-gray-500 mt-2">Order ID: #{order.id}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiPackage className="w-5 h-5 mr-2" />
              Order Details
            </h2>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-800">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{order.total - (order.total >= 1000 ? 0 : 50)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className={order.total >= 1000 ? "text-green-600" : ""}>
                  {order.total >= 1000 ? "Free" : "₹50"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiTruck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delivery Address */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiMapPin className="w-5 h-5 mr-2" />
              Delivery Address
            </h2>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FiHome className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">{order.address.fullName}</p>
                  <p className="text-gray-600 text-sm">{order.address.addressLine1}</p>
                  {order.address.addressLine2 && (
                    <p className="text-gray-600 text-sm">{order.address.addressLine2}</p>
                  )}
                  <p className="text-gray-600 text-sm">
                    {order.address.city}, {order.address.state} {order.address.postalCode}
                  </p>
                  <p className="text-gray-600 text-sm flex items-center mt-2">
                    <FiPhone className="w-4 h-4 mr-1" />
                    {order.address.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiTruck className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">Estimated Delivery</p>
                  <p className="text-sm text-gray-600">3-5 business days</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-8 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            View Orders
          </button>
        </motion.div>
      </div>
    </div>
  );
}
