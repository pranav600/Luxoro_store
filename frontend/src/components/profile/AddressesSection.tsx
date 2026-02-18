"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiHome,
  FiBriefcase,
  FiX,
  FiPhone,
} from "react-icons/fi";
import { useAuth } from "../../context/auth-context";

// Skeleton Components
const AddressSkeleton = () => (
  <div className="relative p-4 border border-gray-200 rounded-lg animate-pulse">
    <div className="absolute top-2 right-2 w-12 h-4 bg-gray-200 rounded-full"></div>
    <div className="flex items-start space-x-2">
      <div className="w-5 h-5 bg-gray-200 rounded mt-1"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-48 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-40 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-36 mb-3"></div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
    <div className="flex space-x-3 mt-3">
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const AddressesSkeletonLoader = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <AddressSkeleton key={index} />
      ))}
    </div>
  </div>
);

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

interface FormErrors {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface AddressFormData
  extends Omit<Address, "id"> {
  lastName?: string;
}

const initialFormData: AddressFormData = {
  type: "home",
  fullName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  isDefault: false,
};

export default function AddressesSection() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Get user-specific localStorage key
  const getStorageKey = () => {
    return user?._id ? `addresses_${user._id}` : 'addresses';
  };

  // Load addresses from localStorage
  const loadAddresses = () => {
    if (!user?._id) {
      setIsLoading(false);
      return;
    }

    try {
      const storageKey = getStorageKey();
      const storedAddresses = localStorage.getItem(storageKey);
      if (storedAddresses) {
        setAddresses(JSON.parse(storedAddresses));
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save addresses to localStorage
  const saveAddresses = (addressList: Address[]) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(addressList));
    } catch (err) {
      console.error('Error saving addresses:', err);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user?._id]);

  // ------------------ Form Validation ------------------
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.addressLine1.trim())
      errors.addressLine1 = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.postalCode.trim())
      errors.postalCode = "Postal code is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ------------------ Handlers ------------------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: checked !== undefined ? checked : value,
    }));
  };

  const resetForm = () => setFormData(initialFormData);

  const handleAddAddress = () => {
    if (!validateForm()) return;

    const newAddress: Address = {
      id: Date.now().toString(),
      type: formData.type,
      fullName: formData.fullName,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || "",
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      isDefault: formData.isDefault || addresses.length === 0,
    };

    let updatedAddresses = [...addresses];

    // If this is set as default, make all other addresses non-default
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    updatedAddresses.push(newAddress);
    setAddresses(updatedAddresses);
    saveAddresses(updatedAddresses);
    resetForm();
    setIsAdding(false);
  };

  const handleUpdateAddress = () => {
    if (!validateForm() || !editingAddress) return;

    let updatedAddresses = addresses.map(addr => {
      if (addr.id === editingAddress.id) {
        return {
          ...addr,
          type: formData.type,
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || "",
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          isDefault: formData.isDefault,
        };
      }
      return addr;
    });

    // If this is set as default, make all other addresses non-default
    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === editingAddress.id ? true : false
      }));
    }

    setAddresses(updatedAddresses);
    saveAddresses(updatedAddresses);
    resetForm();
    setEditingAddress(null);
    setIsAdding(false);
  };

  const handleDeleteAddress = (addressId: string) => {
    const addressToDeleteObj = addresses.find(addr => addr.id === addressId);
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);

    // If we deleted the default address and there are other addresses, make the first one default
    if (addressToDeleteObj?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    setAddresses(updatedAddresses);
    saveAddresses(updatedAddresses);
    setAddressToDelete(null);
  };

  const handleEditAddress = (address: Address) => {
    setFormData({
      type: address.type,
      fullName: address.fullName,
      lastName: "",
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setIsAdding(true);
  };

  const getAddressIcon = (type: AddressType) =>
    type === "home" ? (
      <FiHome className="w-5 h-5 text-gray-500 " />
    ) : type === "work" ? (
      <FiBriefcase className="w-5 h-5 text-gray-500" />
    ) : (
      <FiMapPin className="w-5 h-5 text-gray-500" />
    );

  // ------------------ Render ------------------
  if (isLoading) {
    return <AddressesSkeletonLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Address Modal */}
      <AnimatePresence>
        {(isAdding || editingAddress) && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsAdding(false);
              setEditingAddress(null);
            }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingAddress(null);
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FiX size={20} />
              </button>

              {/* Header */}
              <h3 className="text-lg font-bold mb-4 font-mono text-gray-800">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>

              {/* Form */}
              <div className="space-y-4">
                {/* Address Type Selector */}
                <div className="grid grid-cols-3 gap-3 font-mono">
                  {[
                    { type: "home", label: "Home", icon: <FiHome /> },
                    { type: "work", label: "Work", icon: <FiBriefcase /> },
                    { type: "other", label: "Other", icon: <FiMapPin /> },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          type: item.type as AddressType,
                        }))
                      }
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors cursor-pointer ${
                        formData.type === item.type
                          ? "border-black bg-gray-50 text-black"
                          : "border-gray-200 hover:border-gray-300 text-gray-400"
                      }`}
                    >
                      <span className="mb-1">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 font-mono text-gray-700 rounded"
                  placeholder="Full Name"
                />
                {formErrors.fullName && (
                  <p className="text-sm text-red-600 font-mono">{formErrors.fullName}</p>
                )}

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 font-mono text-gray-700 rounded"
                  placeholder="Phone"
                />

                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 font-mono text-gray-700 rounded"
                  placeholder="Address Line 1"
                />
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 font-mono text-gray-700 rounded"
                  placeholder="Address Line 2 (Optional)"
                />

                <div className="grid grid-cols-3 gap-3 font-mono">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="border px-3 py-2 font-mono text-gray-700 rounded"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="border px-3 py-2 font-mono text-gray-700 rounded"
                    placeholder="State"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="border px-3 py-2 font-mono text-gray-700 rounded"
                    placeholder="Postal Code"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="isDefault" className="text-gray-600 font-mono">
                    Set as default address
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingAddress(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 cursor-pointer font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    editingAddress ? handleUpdateAddress : handleAddAddress
                  }
                  className="px-4 py-2 rounded-lg font-mono bg-black text-white cursor-pointer"
                >
                  {editingAddress ? "Update" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {addressToDelete && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddressToDelete(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 relative"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setAddressToDelete(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FiX size={20} />
              </button>

              {/* Content */}
              <h2 className="text-lg font-bold mb-2 font-mono text-gray-800">
                Delete Address
              </h2>
              <p className="text-gray-600 font-mono mb-6">
                Are you sure you want to delete this address?
              </p>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAddressToDelete(null)}
                  className="px-4 py-2 rounded-lg font-mono border border-gray-300 text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAddress(addressToDelete.id)}
                  className="px-4 py-2 rounded-lg font-mono bg-red-600 text-white cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-gray-700 font-semibold font-mono">My Addresses</h2>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="flex items-center px-4 py-2 font-mono bg-black text-white rounded-lg cursor-pointer"
        >
          <FiPlus className="mr-2" /> Add New Address
        </button>
      </div>

      {/* Address List */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`relative p-4 border rounded-lg ${
                address.isDefault ? "border-black" : "border-gray-300"
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 px-2 text-xs font-mono bg-black text-white rounded-full">
                  Default
                </span>
              )}
              <div className="flex items-start space-x-2 text-gray-600">
                {getAddressIcon(address.type)}
                <div>
                  <p className="font-medium font-mono">{address.fullName}</p>
                  <p className="font-mono">{address.addressLine1}</p>
                  {address.addressLine2 && <p className="font-mono">{address.addressLine2}</p>}
                  <p className="font-mono">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="mt-2 flex items-center font-mono">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {address.phone}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="text-sm text-black cursor-pointer"
                >
                  <FiEdit2 className="inline w-5 h-5 mr-1" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddressToDelete(address);
                  }}
                  className="text-sm text-red-600 cursor-pointer"
                >
                  <FiTrash2 className="inline w-5 h-5 mr-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
