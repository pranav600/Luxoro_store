'use client';

import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiUser, FiPackage, FiMapPin, FiLogOut, FiArrowLeft } from "react-icons/fi";
import dynamic from 'next/dynamic';

// Dynamically import components with no SSR to avoid hydration issues
const ProfileSection = dynamic(
  () => import('../../components/profile/ProfileSection'),
  { ssr: false }
);

const OrdersSection = dynamic(
  () => import('../../components/profile/OrdersSection'),
  { ssr: false }
);

const AddressesSection = dynamic(
  () => import('../../components/profile/AddressesSection'),
  { ssr: false }
);

type ProfileTab = 'profile' | 'orders' | 'addresses';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  useEffect(() => {
    // Only attempt to redirect if we're done loading and there's no user
    if (!isLoading && !user) {
      console.log('No user found, redirecting to login');
      router.push('/login?redirect=/profile');
    }
  }, [user, router, isLoading]);

  // Show loading state while auth is initializing
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

  // If we're done loading but there's no user, return null (will be redirected by useEffect)
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
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name || 'User'} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <FiUser className={`text-gray-500 text-2xl ${user?.image ? 'hidden' : ''}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-mono">{user?.name || 'User'}</h1>
                <p className="text-gray-300 font-mono">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium font-mono flex items-center ${activeTab === 'profile' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
              >
                <FiUser className="mr-2" /> Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 text-sm font-medium font-mono flex items-center ${activeTab === 'orders' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
              >
                <FiPackage className="mr-2" /> My Orders
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`py-4 px-6 text-sm font-medium font-mono flex items-center ${activeTab === 'addresses' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
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
              className="flex items-center text-red-600 hover:text-red-800 font-mono cursor-pointer"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
