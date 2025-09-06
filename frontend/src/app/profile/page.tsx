"use client";

import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiLogOut,
  FiArrowLeft,
  FiX,
} from "react-icons/fi";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import sections with loading fallbacks
const ProfileSection = dynamic(
  () => import("../../components/profile/ProfileSection"),
  { 
    ssr: false,
    loading: () => (
      <div className="font-mono max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="flex flex-col items-center mb-10">
            <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }
);
const OrdersSection = dynamic(
  () => import("../../components/profile/OrdersSection"),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-8">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="p-4 flex">
                <div className="h-20 w-14 bg-gray-200 rounded-md"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
);
const AddressesSection = dynamic(
  () => import("../../components/profile/AddressesSection"),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="relative p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="absolute top-2 right-2 w-12 h-4 bg-gray-200 rounded-full"></div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded mt-1"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
);

type ProfileTab = "profile" | "orders" | "addresses";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !isLoggingOut) {
      router.push("/login?redirect=/profile");
    }
  }, [user, router, isLoading, isLoggingOut]);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setOrdersLoading(true);
      try {
        const token = localStorage.getItem('token');
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://luxoro-store-backend.onrender.com";
        
        const response = await fetch(`${apiBaseUrl}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const ordersData = await response.json();
          console.log('Fetched orders:', ordersData);
          
          // Transform backend orders to match frontend interface
          const transformedOrders = ordersData.map((order: any) => ({
            id: order._id,
            date: order.createdAt,
            status: order.status === 'pending' ? 'processing' : order.status,
            total: order.total,
            items: order.items.map((item: any) => ({
              id: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image
            }))
          }));
          
          setOrders(transformedOrders);
        } else {
          console.error('Failed to fetch orders:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="font-mono text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const confirmLogout = () => {
    setIsLoggingOut(true);
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
        >
          <FiArrowLeft className="mr-2" /> Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-black text-white p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <FiUser
                  className={`text-gray-500 text-2xl ${
                    user?.image ? "hidden" : ""
                  }`}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-mono">
                  {user?.name || "User"}
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-6 text-sm font-medium font-mono flex items-center ${
                  activeTab === "profile"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                <FiUser className="mr-2" /> Profile
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-4 px-6 text-sm font-medium font-mono flex items-center ${
                  activeTab === "orders"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                <FiPackage className="mr-2" /> My Orders
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`py-4 px-6 text-sm font-medium font-mono flex items-center ${
                  activeTab === "addresses"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                <FiMapPin className="mr-2" /> Addresses
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" && <ProfileSection user={user} isLoading={false} />}
            {activeTab === "orders" && <OrdersSection orders={orders} isLoading={ordersLoading} />}
            {activeTab === "addresses" && <AddressesSection />}
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={() => setShowLogoutPopup(true)}
              className="flex items-center text-red-600 hover:text-red-800 font-mono cursor-pointer"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Popup */}
      <AnimatePresence>
        {showLogoutPopup && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 relative"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FiX size={20} />
              </button>
              <h2 className="text-lg font-bold mb-2 font-mono text-gray-700">
                Confirm Logout
              </h2>
              <p className="text-gray-600 font-mono mb-6">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutPopup(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-mono hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-mono hover:bg-red-700 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
