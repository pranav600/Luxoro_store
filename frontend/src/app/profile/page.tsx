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

// Dynamically import sections (no SSR)
const ProfileSection = dynamic(
  () => import("../../components/profile/ProfileSection"),
  { ssr: false }
);
const OrdersSection = dynamic(
  () => import("../../components/profile/OrdersSection"),
  { ssr: false }
);
const AddressesSection = dynamic(
  () => import("../../components/profile/AddressesSection"),
  { ssr: false }
);

type ProfileTab = "profile" | "orders" | "addresses";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !isLoggingOut) {
      router.push("/login?redirect=/profile");
    }
  }, [user, router, isLoading, isLoggingOut]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="font-mono">Loading your profile...</p>
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
            {activeTab === "profile" && <ProfileSection user={user} />}
            {activeTab === "orders" && <OrdersSection />}
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
