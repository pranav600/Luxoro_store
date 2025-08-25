'use client';

import { useState } from 'react';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiCheck } from 'react-icons/fi';

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

export default function OrdersSection() {
  // This is mock data - replace with actual data from your backend
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-12345',
      date: '2023-06-15',
      status: 'delivered',
      total: 249.98,
      items: [
        {
          id: 'item-1',
          name: 'Classic White T-Shirt',
          price: 29.99,
          quantity: 2,
          image: '/placeholder-product.jpg',
        },
        {
          id: 'item-2',
          name: 'Slim Fit Jeans',
          price: 59.99,
          quantity: 1,
          image: '/placeholder-product.jpg',
        },
      ],
    },
    {
      id: 'ORD-12344',
      date: '2023-06-10',
      status: 'shipped',
      total: 89.97,
      items: [
        {
          id: 'item-3',
          name: 'Cotton Socks (3-Pack)',
          price: 29.99,
          quantity: 1,
          image: '/placeholder-product.jpg',
        },
      ],
    },
  ]);

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

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't placed any orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">My Orders</h2>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-500">Order #{order.id}</span>
                <p className="text-xs text-gray-500">Placed on {formatDate(order.date)}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className="text-sm font-medium">
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.name}</h3>
                      <p className="ml-4">${item.price.toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <FiCheck className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium">
                  {order.status === 'delivered' 
                    ? 'Delivered on ' + formatDate(order.date)
                    : 'Order total'}
                </span>
              </div>
              <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
