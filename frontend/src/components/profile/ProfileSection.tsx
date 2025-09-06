'use client';

import React, { useState, useRef } from 'react';
import { FiEdit2, FiSave, FiX, FiUpload, FiUser } from 'react-icons/fi';
import { useAuth } from '@/context/auth-context';

// Skeleton Components
const ProfileSkeleton = () => (
  <div className="font-mono max-w-2xl mx-auto p-6">
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>

      {/* Profile Picture Skeleton */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Profile Form Skeleton */}
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

interface ProfileSectionProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  isLoading?: boolean;
}

export default function ProfileSection({ user, isLoading = false }: ProfileSectionProps) {
  if (isLoading) {
    return <ProfileSkeleton />;
  }
  const { updateProfile, updateProfileImage } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [imagePreview, setImagePreview] = useState(user.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      updateProfileImage?.(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile?.({
        name,
        email,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="font-mono max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-light tracking-tight text-gray-900">
            Profile Settings
          </h2>
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setName(user.name);
                  setEmail(user.email);
                  setIsEditing(false);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label="Cancel"
              >
                <FiX className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 text-gray-900 hover:text-black transition-colors cursor-pointer"
                aria-label="Save changes"
              >
                <FiSave className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black transition-colors cursor-pointer"
              aria-label="Edit profile"
            >
              <FiEdit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-gray-100 overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <FiUser className="w-12 h-12" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors border border-gray-100 cursor-pointer"
              aria-label="Change profile picture"
            >
              <FiUpload className="w-4 h-4 text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 text-gray-500 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent font-mono text-sm"
              />
            ) : (
              <p className="text-gray-900 font-light text-lg py-1">{name}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-gray-500 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent font-mono text-sm"
              />
            ) : (
              <p className="text-gray-900 font-light text-sm py-1">{email}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
