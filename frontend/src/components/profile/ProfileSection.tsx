'use client';

import React, { useState, useRef } from 'react';
import { FiEdit2, FiSave, FiX, FiUpload, FiUser } from 'react-icons/fi';
import { useAuth } from '@/context/auth-context';

interface ProfileSectionProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export default function ProfileSection({ user }: ProfileSectionProps) {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setName(user.name);
                setEmail(user.email);
                setIsEditing(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="text-black hover:text-gray-700"
            >
              <FiSave className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-black hover:text-gray-700"
          >
            <FiEdit2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FiUser className="w-12 h-12" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            <FiUpload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            ) : (
              <p className="text-gray-900">{name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            ) : (
              <p className="text-gray-900">{email}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
