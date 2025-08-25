'use client';

import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiUser, FiPackage, FiMapPin, FiLogOut, FiArrowLeft } from "react-icons/fi";
import ProfileSection from "../../components/profile/ProfileSection";
import OrdersSection from "../../components/profile/OrdersSection";
import AddressesSection from "../../components/profile/AddressesSection";

type ProfileTab = 'profile' | 'orders' | 'addresses';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="mr-2" /> Back to Home
        </button>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-black text-white p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="text-gray-500 text-2xl" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-300">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'profile' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FiUser className="mr-2" /> Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'orders' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FiPackage className="mr-2" /> My Orders
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'addresses' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FiMapPin className="mr-2" /> Addresses
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && <ProfileSection user={user} />}
            {activeTab === 'orders' && <OrdersSection />}
            {activeTab === 'addresses' && <AddressesSection />}
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center text-red-600 hover:text-red-800"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
