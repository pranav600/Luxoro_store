'use client';

import { useState } from 'react';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiCheck } from 'react-icons/fi';

// Skeleton Components
const OrderSkeleton = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    
    <div className="divide-y divide-gray-200">
      {[...Array(2)].map((_, index) => (
        <div key={index} className="p-4 flex">
          <div className="h-20 w-14 bg-gray-200 rounded-md"></div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
    
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

const OrdersSkeletonLoader = () => (
  <div className="space-y-8">
    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
    <div className="space-y-6">
      {[...Array(3)].map((_, index) => (
        <OrderSkeleton key={index} />
      ))}
    </div>
  </div>
);

interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

interface OrdersSectionProps {
  orders?: Order[];
  isLoading?: boolean;
}

export default function OrdersSection({ orders = [], isLoading = false }: OrdersSectionProps) {

  if (isLoading) {
    return <OrdersSkeletonLoader />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <FiClock className="text-yellow-500" />;
      case 'shipped':
        return <FiTruck className="text-blue-500" />;
      case 'delivered':
        return <FiCheckCircle className="text-green-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <FiPackage className="mx-auto h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium font-mono text-gray-900">No orders yet</h3>
        <p className="mt-2 text-sm text-gray-500 font-mono max-w-md mx-auto">
          You haven't placed any orders yet. Start shopping to see your orders here.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 px-4 py-2 bg-black text-white text-sm font-medium font-mono rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black cursor-pointer"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl text-gray-600 font-semibold">My Orders</h2>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Order #{order.id}
                </span>
                <p className="text-xs text-gray-500">
                  Placed on {formatDate(order.date)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className="text-sm text-gray-600 font-medium">
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex">
                  <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.name}</h3>
                      <p className="ml-4">₹{item.price.toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <FiCheck className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600 font-medium">
                  {order.status === "delivered"
                    ? "Delivered on " + formatDate(order.date)
                    : "Order total"}
                </span>
              </div>
              <p className="text-lg text-gray-600 font-bold">
                ₹{order.total.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
